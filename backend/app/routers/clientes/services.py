"""
Archivo: backend/app/routers/clientes/services.py
Actualización: 2026-09-08 — servicios adicionales con aprovisionamiento MikroTik, recibo adelantado por servicio y consulta de potencia ONU optimizada.
Función: CRUD de servicios adicionales sin alterar el servicio principal histórico guardado en `clients`.
Trabaja con: backend/app/models/client_service.py, clientes/router.py, facturación, integraciones/mikrotik/service.py, integraciones/olt/service.py y ClientServiceEditor.jsx.
"""
import asyncio
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.utils import correlative, current_period
from app.integrations.mikrotik import service as mt
from app.integrations.olt import service as olt
from app.models.client import Client
from app.models.client_service import ClientService
from app.models.invoice import Invoice
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


def _clean_dni(value: str) -> str:
    import re
    return re.sub(r"[^A-Za-z0-9_-]", "", (value or "").strip()) or "SIN-DNI"


async def _service_number(db: AsyncSession, client_id: str, service_id: Optional[str] = None) -> int:
    """Devuelve 2 para el primer servicio adicional, 3 para el segundo, etc.; el principal es el servicio 1."""
    rows = (await db.execute(
        select(ClientService).where(ClientService.client_id == client_id).order_by(ClientService.created_at.asc(), ClientService.id.asc())
    )).scalars().all()
    if service_id:
        for index, row in enumerate(rows, start=2):
            if row.id == service_id:
                return index
    return len(rows) + 2


def _queue_comment(temp: Client, row: ClientService, service_number: int) -> str:
    return f"{temp.full_name} | {row.plan_name} | serv {service_number}"


def _queue_matches_service(queue: dict, dni: str, old_ip: str | None = None) -> bool:
    clean_dni = _clean_dni(dni)
    name = str(queue.get("name") or "")
    comment = str(queue.get("comment") or "")
    target = str(queue.get("target") or "")
    expected_target = f"{old_ip}/32" if old_ip else ""
    if expected_target and target != expected_target:
        return False
    return name == f"svc-{clean_dni}" or name.startswith(f"svc-{clean_dni}-") or clean_dni in comment


async def _queue_name_for_new_service(mikrotik, dni: str) -> str:
    """Usa svc-DNI para el primer servicio y un sufijo solo si el DNI ya existe."""
    base = f"svc-{_clean_dni(dni)}"
    existing = await mikrotik.simple_queues()
    names = {str(q.get("name") or "") for q in existing}
    if base not in names:
        return base
    index = 2
    while f"{base}-{index}" in names:
        index += 1
    return f"{base}-{index}"


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


async def _provision_service(row: ClientService, temp: Client, router_obj: Router, plan: Optional[Plan], service_number: int, previous_ip: Optional[str] = None, updating: bool = False) -> dict:
    """Aprovisiona el servicio y, al editar, modifica la cola existente en vez de crear otra."""
    if not router_obj or router_obj.device_type != "mikrotik" or not router_obj.password:
        return {"ok": False, "message": "El servicio fue validado, pero el MikroTik no tiene credenciales API configuradas."}
    try:
        async with mt.connect(router_obj) as mikrotik:
            comment = _queue_comment(temp, row, service_number)
            if row.connection_type == "PPPoE" and row.pppoe_user:
                profile = mt.plan_profile_name(plan) if plan else "default"
                if plan:
                    await mikrotik.upsert_ppp_profile(profile, mt.plan_rate_limit(plan))
                action = await mikrotik.upsert_ppp_secret(row.pppoe_user, row.pppoe_password or row.pppoe_user, profile, comment=comment, remote_address=row.ip_address, disabled=(row.status == "suspended"))
                return {"ok": True, "message": f"PPP secret '{row.pppoe_user}' {action} en {router_obj.name} (perfil {profile})."}
            if row.ip_address:
                max_limit = mt.plan_rate_limit(plan) if plan else "1M/1M"
                data = {"name": f"svc-{_clean_dni(temp.dni_ruc)}", "target": f"{row.ip_address}/32", "max-limit": max_limit.split(" ")[0], "comment": comment}
                if plan and "/" in (plan.burst_limit or ""):
                    data["burst-limit"] = plan.burst_limit
                if updating:
                    queues = await mikrotik.simple_queues()
                    old_queue = next((q for q in queues if _queue_matches_service(q, temp.dni_ruc, previous_ip)), None)
                    if old_queue is None and previous_ip:
                        legacy_name = f"svc-{_clean_dni(temp.dni_ruc)}-{previous_ip}"
                        old_queue = next((q for q in queues if q.get("name") == legacy_name), None)
                    if old_queue is not None:
                        desired_name = data["name"]
                        if any(q.get("name") == desired_name and q.get("id") != old_queue.get("id") for q in queues):
                            desired_name = await _queue_name_for_new_service(mikrotik, temp.dni_ruc)
                        data["name"] = desired_name
                        await mikrotik.set("queue", "simple", **{".id": old_queue["id"], **data})
                        return {"ok": True, "message": f"Cola simple '{desired_name}' actualizada en {router_obj.name} ({max_limit})."}
                queue_name = await _queue_name_for_new_service(mikrotik, temp.dni_ruc)
                data["name"] = queue_name
                await mikrotik.add("queue", "simple", **data)
                return {"ok": True, "message": f"Cola simple '{queue_name}' creada en {router_obj.name} ({max_limit})."}
            return {"ok": False, "message": "El servicio no tiene usuario PPPoE ni IP para aprovisionar."}
    except mt.MikroTikError as exc:
        return {"ok": False, "message": f"MikroTik no respondió: {exc}"}


async def _remove_service_queue(mikrotik, dni: str, ip_address: Optional[str]) -> None:
    queues = await mikrotik.simple_queues()
    matches = [q for q in queues if _queue_matches_service(q, dni, ip_address)]
    if not matches and ip_address:
        legacy_name = f"svc-{_clean_dni(dni)}-{ip_address}"
        matches = [q for q in queues if q.get("name") == legacy_name]
    await mikrotik.remove("queue", "simple", ids=[q["id"] for q in matches if q.get("id")])


async def _refresh_optical_power(db: AsyncSession, rows: list[ClientService]) -> None:
    """Consulta en paralelo las OLT para reducir el tiempo de carga de la pestaña Servicios."""
    fiber_rows = [row for row in rows if row.technology == "fiber" and row.onu_sn]
    if not fiber_rows:
        return
    olts = (await db.execute(select(Router).where(Router.device_type == "olt"))).scalars().all()
    if not olts:
        return

    async def find_power(row: ClientService):
        async def query_olt(olt_router: Router):
            try:
                result = await olt.find_onu(olt_router, row.onu_sn)
                if result.get("found"):
                    power = result.get("optical_power_dbm")
                    if power is None:
                        power = result.get("power_dbm") or result.get("rx_power_dbm")
                    return power
            except Exception:
                return None
            return None
        values = await asyncio.gather(*(query_olt(olt_router) for olt_router in olts))
        for power in values:
            if power is not None:
                row.optical_power_dbm = power
                return True
        return False

    changed = any(await asyncio.gather(*(find_power(row) for row in fiber_rows)))
    if changed:
        await db.commit()


async def _create_advance_invoice(db: AsyncSession, client: Client, row: ClientService, service_number: int) -> Invoice:
    """Genera un recibo pendiente por el importe del nuevo servicio adicional."""
    now = datetime.now(timezone.utc)
    invoice = Invoice(
        invoice_number=correlative("REC"), client_id=client.id, service_id=row.id,
        client_name=client.full_name, client_dni_ruc=client.dni_ruc, client_address=client.address,
        client_phone=client.phone, plan_name=row.plan_name, amount=row.plan_price, month_period=current_period(),
        issue_date=now.strftime("%Y-%m-%d"), due_date=(now + timedelta(days=10)).strftime("%Y-%m-%d"),
        status="unpaid", notes=f"Pago adelantado - Servicio {service_number}",
    )
    db.add(invoice)
    await db.flush()
    unpaid = (await db.execute(select(Invoice).where(Invoice.client_id == client.id, Invoice.status.in_(["unpaid", "overdue"])))) .scalars().all()
    client.unpaid_invoices_count = len(unpaid)
    client.balance_due = round(sum(item.amount for item in unpaid), 2)
    return invoice


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
    client = await _get_visible_client(db, client_id, current_user)
    temp = await _prepare(db, client_id, payload.model_dump(exclude_unset=True))
    row = ClientService(client_id=client_id, **_service_payload(temp))
    db.add(row); await db.flush()
    router_obj = await db.get(Router, row.router_id) if row.router_id else None
    plan = await db.get(Plan, row.plan_id) if row.plan_id else None
    service_number = await _service_number(db, client_id, row.id)
    result = await _provision_service(row, temp, router_obj, plan, service_number)
    if not result["ok"]:
        await db.rollback(); raise HTTPException(status_code=502, detail=f"No se pudo crear el servicio en MikroTik: {result['message']}")
    invoice = await _create_advance_invoice(db, client, row, service_number)
    await db.commit(); await db.refresh(row)
    return {**row.to_dict(), "service_id": row.id, "is_primary": False, "mikrotik": result, "advance_invoice": invoice.to_dict()}


@router.patch("/{client_id}/services/{service_id}")
async def update_client_service(client_id: str, service_id: str, payload: ClientServiceUpdate, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    client = await _get_visible_client(db, client_id, current_user)
    row = await db.get(ClientService, service_id)
    if not row or row.client_id != client_id:
        raise HTTPException(status_code=404, detail="Servicio no encontrado.")
    current = row.to_dict(); current.update(payload.model_dump(exclude_unset=True))
    old_router_id = row.router_id; old_connection_type = row.connection_type; old_pppoe_user = row.pppoe_user; old_ip_address = row.ip_address
    temp = await _prepare(db, client_id, current, service_id)
    for field, value in _service_payload(temp).items(): setattr(row, field, value)
    await db.flush()
    router_obj = await db.get(Router, row.router_id) if row.router_id else None
    plan = await db.get(Plan, row.plan_id) if row.plan_id else None
    service_number = await _service_number(db, client_id, row.id)
    result = await _provision_service(row, temp, router_obj, plan, service_number, previous_ip=old_ip_address, updating=True)
    if not result["ok"]:
        await db.rollback(); raise HTTPException(status_code=502, detail=f"No se pudo actualizar el servicio en MikroTik: {result['message']}")
    if old_router_id != row.router_id or old_connection_type != row.connection_type or old_pppoe_user != row.pppoe_user:
        old_router = await db.get(Router, old_router_id) if old_router_id else None
        if old_router and old_router.device_type == "mikrotik" and old_router.password:
            try:
                async with mt.connect(old_router) as old_mikrotik:
                    if old_pppoe_user and old_connection_type == "PPPoE": await old_mikrotik.remove_ppp_secret(old_pppoe_user)
                    if old_ip_address and old_connection_type != "PPPoE": await _remove_service_queue(old_mikrotik, client.dni_ruc, old_ip_address)
            except mt.MikroTikError as exc:
                await db.rollback(); raise HTTPException(status_code=502, detail=f"Servicio actualizado, pero no se pudo limpiar la configuración anterior en MikroTik: {exc}")
    await db.commit(); await db.refresh(row)
    return {**row.to_dict(), "service_id": row.id, "is_primary": False, "mikrotik": result}


@router.delete("/{client_id}/services/{service_id}")
async def delete_client_service(client_id: str, service_id: str, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    client = await _get_visible_client(db, client_id, current_user)
    row = await db.get(ClientService, service_id)
    if not row or row.client_id != client_id:
        raise HTTPException(status_code=404, detail="Servicio no encontrado.")
    router_obj = await db.get(Router, row.router_id) if row.router_id else None
    if router_obj and router_obj.device_type == "mikrotik" and router_obj.password:
        try:
            async with mt.connect(router_obj) as mikrotik:
                if row.pppoe_user: await mikrotik.remove_ppp_secret(row.pppoe_user)
                if row.ip_address: await _remove_service_queue(mikrotik, client.dni_ruc, row.ip_address)
        except mt.MikroTikError as exc:
            raise HTTPException(status_code=502, detail=f"No se pudo eliminar el servicio de MikroTik: {exc}")
    await db.delete(row); await db.commit()
    return {"ok": True}


@router.get("/{client_id}/services/{service_id}")
async def get_client_service(client_id: str, service_id: str, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    await _get_visible_client(db, client_id, current_user)
    row = await db.get(ClientService, service_id)
    if not row or row.client_id != client_id: raise HTTPException(status_code=404, detail="Servicio no encontrado.")
    return {**row.to_dict(), "service_id": row.id, "is_primary": False}


@router.get("/{client_id}/services/{service_id}/onu-status")
async def client_service_onu_status(client_id: str, service_id: str, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    await _get_visible_client(db, client_id, current_user)
    row = await db.get(ClientService, service_id)
    if not row or row.client_id != client_id: raise HTTPException(status_code=404, detail="Servicio no encontrado.")
    if not row.onu_sn: raise HTTPException(status_code=400, detail="El servicio no tiene ONU SN registrado.")
    olts = (await db.execute(select(Router).where(Router.device_type == "olt"))).scalars().all()
    if not olts: raise HTTPException(status_code=400, detail="No hay ninguna OLT registrada en Gestión de Red.")
    results = []
    for olt_router in olts:
        try:
            res = await olt.find_onu(olt_router, row.onu_sn); results.append(res)
            if res.get("found"):
                power = res.get("optical_power_dbm")
                if power is None: power = res.get("power_dbm") or res.get("rx_power_dbm")
                if power is not None: row.optical_power_dbm = power
                await db.commit()
                return {"ok": True, "service_id": row.id, "onu_sn": row.onu_sn, "power_dbm": power, "result": res, "olt": olt_router.name}
        except Exception as exc:
            results.append({"found": False, "olt": olt_router.name, "error": str(exc)})
    return {"ok": False, "service_id": row.id, "onu_sn": row.onu_sn, "message": "ONU no encontrada en las OLT registradas.", "results": results}
