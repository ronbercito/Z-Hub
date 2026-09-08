"""
Archivo: backend/app/routers/clientes/services.py
Actualización: 2026-09-08 — servicios de Internet agrupados por cliente, con aprovisionamiento real en MikroTik y consulta de potencia óptica por servicio.
Función: CRUD de servicios adicionales sin alterar el servicio principal histórico guardado en `clients`.
Trabaja con: backend/app/models/client_service.py, clientes/router.py, integraciones/mikrotik/service.py, integraciones/olt/service.py y ClientServiceEditor.jsx.
"""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.integrations.mikrotik import service as mt
from app.integrations.olt import service as olt
from app.models.client import Client
from app.models.client_service import ClientService
from app.models.plan import Plan
from app.models.router import Router
from app.routers.clientes.router import _attach_plan_router, _get_visible_client
from app.routers.clientes.schemas import ClientServiceUpdate

router = APIRouter(prefix="/clients", tags=["Servicios de clientes"], dependencies=[Depends(get_current_user)])


def _service_payload(temp: Client) -> dict:
    fields = ("plan_id", "plan_name", "plan_price", "router_id", "router_name", "connection_type", "ipv4_network_id", "ip_address", "pppoe_user", "pppoe_password", "technology", "zone_id", "zone_name", "nap_box_id", "nap_box", "nap_port", "onu_sn", "optical_power_dbm", "installation_date", "monitoring_equipment_id", "monitoring_equipment_name", "antenna_type", "management_ip", "status")
    return {field: getattr(temp, field) for field in fields}


def _normalize(data: dict) -> dict:
    string_fields = ("plan_id", "router_id", "connection_type", "ipv4_network_id", "ip_address", "pppoe_user", "pppoe_password", "technology", "zone_id", "nap_box_id", "onu_sn", "installation_date", "monitoring_equipment_id", "antenna_type", "management_ip")
    for field in string_fields:
        if data.get(field) is None:
            data[field] = ""
    for field in ("id", "client_id", "created_at"):
        data.pop(field, None)
    return data


async def _prepare(db: AsyncSession, client_id: str, data: dict, current_service_id: Optional[str] = None) -> Client:
    client = await _get_visible_client(db, client_id, {})
    temp = Client(**_normalize(data))
    temp.id = ""
    temp.full_name = client.full_name
    temp.dni_ruc = client.dni_ruc
    await _attach_plan_router(db, temp)
    if temp.ip_address:
        q = select(ClientService.id).where(ClientService.client_id == client_id, ClientService.ip_address == temp.ip_address)
        if current_service_id:
            q = q.where(ClientService.id != current_service_id)
        if await db.scalar(q):
            raise HTTPException(status_code=422, detail="La IP seleccionada ya está asignada a otro servicio del cliente.")
    if temp.nap_box_id and temp.nap_port is not None:
        q = select(ClientService.id).where(ClientService.nap_box_id == temp.nap_box_id, ClientService.nap_port == temp.nap_port)
        if current_service_id:
            q = q.where(ClientService.id != current_service_id)
        if await db.scalar(q):
            raise HTTPException(status_code=422, detail=f"El puerto NAP {temp.nap_port} ya está ocupado por otro servicio.")
    return temp


async def _provision_service(row: ClientService, temp: Client, router_obj: Router, plan: Optional[Plan]) -> dict:
    """Aprovisiona un servicio adicional sin reutilizar el identificador global del cliente."""
    if not router_obj or router_obj.device_type != "mikrotik" or not router_obj.password:
        return {"ok": False, "message": "El servicio fue validado, pero el MikroTik no tiene credenciales API configuradas."}
    try:
        async with mt.connect(router_obj) as mikrotik:
            if row.connection_type == "PPPoE" and row.pppoe_user:
                profile = mt.plan_profile_name(plan) if plan else "default"
                if plan:
                    await mikrotik.upsert_ppp_profile(profile, mt.plan_rate_limit(plan))
                action = await mikrotik.upsert_ppp_secret(row.pppoe_user, row.pppoe_password or row.pppoe_user, profile, comment=f"{temp.full_name} | {temp.dni_ruc} | Servicio {row.id[:8]}", remote_address=row.ip_address, disabled=(row.status == "suspended"))
                return {"ok": True, "message": f"PPP secret '{row.pppoe_user}' {action} en {router_obj.name} (perfil {profile})."}
            if row.ip_address:
                max_limit = mt.plan_rate_limit(plan) if plan else "1M/1M"
                queue_name = f"svc-{row.id}"
                action = await mikrotik.upsert_simple_queue(queue_name, f"{row.ip_address}/32", max_limit.split(" ")[0], comment=f"{temp.full_name} | {row.plan_name} | Servicio {row.id[:8]}", burst_limit=plan.burst_limit if plan and "/" in (plan.burst_limit or "") else "")
                return {"ok": True, "message": f"Cola simple '{queue_name}' {action} en {router_obj.name} ({max_limit})."}
            return {"ok": False, "message": "El servicio no tiene usuario PPPoE ni IP para aprovisionar."}
    except mt.MikroTikError as exc:
        return {"ok": False, "message": f"MikroTik no respondió: {exc}"}


async def _refresh_optical_power(db: AsyncSession, rows: list[ClientService]) -> None:
    """Actualiza la potencia de las ONUs de los servicios de fibra cuando la OLT la expone."""
    fiber_rows = [row for row in rows if row.technology == "fiber" and row.onu_sn]
    if not fiber_rows:
        return
    olts = (await db.execute(select(Router).where(Router.device_type == "olt"))).scalars().all()
    if not olts:
        return
    changed = False
    for row in fiber_rows:
        for olt_router in olts:
            try:
                result = await olt.find_onu(olt_router, row.onu_sn)
                if result.get("found"):
                    power = result.get("optical_power_dbm")
                    if power is None:
                        power = result.get("power_dbm") or result.get("rx_power_dbm")
                    if power is not None:
                        row.optical_power_dbm = power
                        changed = True
                    break
            except Exception:
                continue
    if changed:
        await db.commit()


@router.get("/{client_id}/services")
async def list_client_services(client_id: str, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    client = await _get_visible_client(db, client_id, current_user)
    rows = (await db.execute(select(ClientService).where(ClientService.client_id == client_id).order_by(ClientService.created_at.asc()))).scalars().all()
    await _refresh_optical_power(db, rows)
    primary = client.to_dict(); primary.update({"service_id": "primary", "is_primary": True})
    result = [primary]
    for row in rows:
        item = row.to_dict(); item.update({"service_id": row.id, "is_primary": False}); result.append(item)
    return result


@router.post("/{client_id}/services")
async def create_client_service(client_id: str, payload: ClientServiceUpdate, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    await _get_visible_client(db, client_id, current_user)
    temp = await _prepare(db, client_id, payload.model_dump(exclude_unset=True))
    row = ClientService(client_id=client_id, **_service_payload(temp))
    db.add(row); await db.flush()
    router_obj = await db.get(Router, row.router_id) if row.router_id else None
    plan = await db.get(Plan, row.plan_id) if row.plan_id else None
    result = await _provision_service(row, temp, router_obj, plan)
    if not result["ok"]:
        await db.rollback(); raise HTTPException(status_code=502, detail=f"No se pudo crear el servicio en MikroTik: {result['message']}")
    await db.commit(); await db.refresh(row)
    return {**row.to_dict(), "service_id": row.id, "is_primary": False, "mikrotik": result}


@router.patch("/{client_id}/services/{service_id}")
async def update_client_service(client_id: str, service_id: str, payload: ClientServiceUpdate, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    await _get_visible_client(db, client_id, current_user)
    row = await db.get(ClientService, service_id)
    if not row or row.client_id != client_id:
        raise HTTPException(status_code=404, detail="Servicio no encontrado.")
    current = row.to_dict(); current.update(payload.model_dump(exclude_unset=True))
    temp = await _prepare(db, client_id, current, service_id)
    for field, value in _service_payload(temp).items(): setattr(row, field, value)
    await db.flush()
    router_obj = await db.get(Router, row.router_id) if row.router_id else None
    plan = await db.get(Plan, row.plan_id) if row.plan_id else None
    result = await _provision_service(row, temp, router_obj, plan)
    if not result["ok"]:
        await db.rollback(); raise HTTPException(status_code=502, detail=f"No se pudo actualizar el servicio en MikroTik: {result['message']}")
    await db.commit(); await db.refresh(row)
    return {**row.to_dict(), "service_id": row.id, "is_primary": False, "mikrotik": result}


@router.delete("/{client_id}/services/{service_id}")
async def delete_client_service(client_id: str, service_id: str, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    await _get_visible_client(db, client_id, current_user)
    row = await db.get(ClientService, service_id)
    if not row or row.client_id != client_id:
        raise HTTPException(status_code=404, detail="Servicio no encontrado.")
    router_obj = await db.get(Router, row.router_id) if row.router_id else None
    if router_obj and router_obj.device_type == "mikrotik" and router_obj.password:
        try:
            async with mt.connect(router_obj) as mikrotik:
                if row.pppoe_user:
                    await mikrotik.remove_ppp_secret(row.pppoe_user)
                if row.ip_address:
                    await mikrotik.remove_simple_queue(f"svc-{row.id}")
        except mt.MikroTikError as exc:
            raise HTTPException(status_code=502, detail=f"No se pudo eliminar el servicio de MikroTik: {exc}")
    await db.delete(row); await db.commit()
    return {"ok": True}


@router.get("/{client_id}/services/{service_id}")
async def get_client_service(client_id: str, service_id: str, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    await _get_visible_client(db, client_id, current_user)
    row = await db.get(ClientService, service_id)
    if not row or row.client_id != client_id:
        raise HTTPException(status_code=404, detail="Servicio no encontrado.")
    return {**row.to_dict(), "service_id": row.id, "is_primary": False}


@router.get("/{client_id}/services/{service_id}/onu-status")
async def client_service_onu_status(client_id: str, service_id: str, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Busca la ONU del servicio en las OLT y devuelve su potencia óptica."""
    await _get_visible_client(db, client_id, current_user)
    row = await db.get(ClientService, service_id)
    if not row or row.client_id != client_id:
        raise HTTPException(status_code=404, detail="Servicio no encontrado.")
    if not row.onu_sn:
        raise HTTPException(status_code=400, detail="El servicio no tiene ONU SN registrado.")
    olts = (await db.execute(select(Router).where(Router.device_type == "olt"))).scalars().all()
    if not olts:
        raise HTTPException(status_code=400, detail="No hay ninguna OLT registrada en Gestión de Red.")
    results = []
    for olt_router in olts:
        try:
            res = await olt.find_onu(olt_router, row.onu_sn)
            results.append(res)
            if res.get("found"):
                power = res.get("optical_power_dbm") or res.get("power_dbm") or res.get("rx_power_dbm")
                if power is not None:
                    row.optical_power_dbm = power
                await db.commit()
                return {"ok": True, "service_id": row.id, "onu_sn": row.onu_sn, "power_dbm": power, "result": res, "olt": olt_router.name}
        except Exception as exc:
            results.append({"found": False, "olt": olt_router.name, "error": str(exc)})
    return {"ok": False, "service_id": row.id, "onu_sn": row.onu_sn, "message": "ONU no encontrada en las OLT registradas.", "results": results}
