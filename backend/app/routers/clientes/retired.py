"""Baja controlada de clientes: conserva historial administrativo y libera recursos técnicos."""
import json

from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db, now_iso
from app.core.security import get_current_user
from app.integrations.mikrotik import service as mt
from app.models.client import Client
from app.models.client_activity import ClientActivity
from app.models.client_service import ClientService
from app.models.invoice import Invoice
from app.models.router import Router
from app.models.setting import DEFAULT_SETTINGS, Setting
from app.routers.clientes.services import _remove_service_queue

router = APIRouter(prefix="/clients", tags=["Clientes retirados"], dependencies=[Depends(get_current_user)])


class RetirementIn(BaseModel):
    reason: str = Field(default="", max_length=250)


async def _settings(db: AsyncSession) -> dict:
    setting = await db.get(Setting, "system_config")
    return {**DEFAULT_SETTINGS, **((setting.data or {}) if setting else {})}


def _retirement_policy(data: dict) -> dict:
    return {
        "reason_required": data.get("client_retirement_reason_required", True) is not False,
        "keep_technical_snapshot": data.get("client_retirement_keep_technical_snapshot", True) is not False,
        "allow_reactivation": data.get("client_retirement_allow_reactivation", True) is not False,
    }


def _technical_snapshot(client: Client) -> dict:
    return {
        "technology": client.technology or "",
        "plan_name": client.plan_name or "",
        "router_name": client.router_name or "",
        "ip_address": client.ip_address or "",
        "connection_type": client.connection_type or "",
        "pppoe_user": client.pppoe_user or "",
        "onu_sn": client.onu_sn or "",
        "nap_box": client.nap_box or "",
        "nap_port": client.nap_port,
        "zone_name": client.zone_name or "",
        "monitoring_equipment_name": client.monitoring_equipment_name or "",
        "antenna_type": client.antenna_type or "",
        "management_ip": client.management_ip or "",
        "installation_date": client.installation_date or "",
    }


def _decorate_retired(client: Client) -> dict:
    item = client.to_dict()
    try:
        item["retirement_snapshot"] = json.loads(client.retirement_technical_snapshot or "{}")
    except (TypeError, ValueError, json.JSONDecodeError):
        item["retirement_snapshot"] = {}
    return item


async def _cleanup_additional_services(db: AsyncSession, client: Client) -> list[ClientService]:
    """Retira recursos RouterOS de servicios adicionales sin borrar sus filas históricas."""
    services = (await db.execute(
        select(ClientService).where(ClientService.client_id == client.id)
    )).scalars().all()
    for service in services:
        router_device = await db.get(Router, service.router_id) if service.router_id else None
        if not router_device or router_device.device_type != "mikrotik" or not router_device.password:
            if service.pppoe_user or service.ip_address:
                raise HTTPException(status_code=502, detail=f"No se retiró al cliente: el servicio adicional {service.plan_name or service.id[:8]} no tiene un MikroTik válido para liberar sus recursos.")
            continue
        try:
            async with mt.connect(router_device) as mikrotik:
                if service.pppoe_user:
                    await mikrotik.remove_ppp_secret(service.pppoe_user)
                if service.ip_address:
                    await _remove_service_queue(mikrotik, client.dni_ruc, service.ip_address)
        except mt.MikroTikError as exc:
            raise HTTPException(status_code=502, detail=f"No se retiró al cliente porque falló la limpieza de un servicio adicional en MikroTik: {exc}") from exc
    return services


@router.get("/retirement-policy")
async def retirement_policy(db: AsyncSession = Depends(get_db)):
    return _retirement_policy(await _settings(db))


@router.get("/retired/list")
async def list_retired(search: str = "", db: AsyncSession = Depends(get_db)):
    rows = (await db.execute(select(Client).where(Client.status == "retired").order_by(Client.retired_at.desc()))).scalars().all()
    term = search.strip().lower()
    if term:
        rows = [c for c in rows if term in " ".join([c.full_name or "", c.dni_ruc or "", c.phone or "", c.email or "", c.address or ""]).lower()]
    return [_decorate_retired(c) for c in rows]


@router.get("/retired/by-dni/{dni_ruc}")
async def retired_by_dni(dni_ruc: str, db: AsyncSession = Depends(get_db)):
    client = await db.scalar(select(Client).where(Client.dni_ruc == dni_ruc.strip(), Client.status == "retired"))
    return {"found": bool(client), "client": _decorate_retired(client) if client else None}


@router.post("/{client_id}/retire")
async def retire_client(client_id: str, payload: RetirementIn, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    client = await db.get(Client, client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    if client.status == "retired":
        raise HTTPException(status_code=409, detail="El cliente ya se encuentra retirado.")

    settings = await _settings(db)
    policy = _retirement_policy(settings)
    reason = payload.reason.strip()
    if policy["reason_required"] and len(reason) < 10:
        raise HTTPException(status_code=422, detail="El motivo del retiro debe tener al menos 10 caracteres.")
    if reason and len(reason) < 3:
        raise HTTPException(status_code=422, detail="Si registras un motivo, debe tener al menos 3 caracteres.")

    if policy["keep_technical_snapshot"]:
        client.retirement_technical_snapshot = json.dumps(_technical_snapshot(client), ensure_ascii=False)
    else:
        client.retirement_technical_snapshot = ""

    # 1) Liberar el servicio principal. La BD no cambia de estado si RouterOS no confirma.
    router_device = await db.get(Router, client.router_id) if client.router_id else None
    cleanup = await mt.remove_client(client, router_device, settings.get("mikrotik_cut_list") or "morosos")
    if not cleanup.get("ok"):
        await db.rollback()
        raise HTTPException(status_code=502, detail=f"No se retiró al cliente porque no se pudo liberar MikroTik: {cleanup.get('message', 'error desconocido')}")

    # 2) Liberar también servicios adicionales; se conservan como historial con estado retired.
    try:
        additional_services = await _cleanup_additional_services(db, client)
    except HTTPException:
        await db.rollback()
        raise

    # 3) Conservar historial financiero/técnico/documental. Las facturas pendientes se anulan,
    # no se eliminan; las pagadas y anuladas permanecen para auditoría.
    invoices = (await db.execute(select(Invoice).where(Invoice.client_id == client.id))).scalars().all()
    canceled_count = 0
    for invoice in invoices:
        if invoice.status in {"unpaid", "overdue"}:
            invoice.status = "canceled"
            invoice.notes = f"{invoice.notes or ''} | Anulada automáticamente por retiro del cliente.".strip(" |")
            canceled_count += 1
    for service in additional_services:
        service.status = "retired"

    client.status = "retired"
    client.retired_at = now_iso()
    client.retirement_reason = reason
    client.is_online = False
    client.last_connection_time = ""
    client.mikrotik_status = ""
    client.unpaid_invoices_count = 0
    client.balance_due = 0.0
    client.ip_address = ""; client.mac_address = ""; client.onu_sn = ""
    client.connection_type = "PPPoE"; client.pppoe_user = ""; client.pppoe_password = ""
    client.plan_id = ""; client.plan_name = ""; client.plan_price = 0.0
    client.router_id = ""; client.router_name = ""; client.ipv4_network_id = ""
    client.nap_box = ""; client.nap_box_id = ""; client.nap_port = None; client.optical_power_dbm = None
    client.zone_id = ""; client.zone_name = ""
    client.monitoring_equipment_id = ""; client.monitoring_equipment_name = ""
    client.antenna_type = ""; client.management_ip = ""

    operator = current_user.get("name") or current_user.get("username") or current_user.get("email") or "Sistema"
    db.add(ClientActivity(
        client_id=client.id,
        action="Cliente retirado",
        detail=f"Retiro confirmado. Motivo: {reason or 'sin motivo'}. Se conservaron facturas, tickets, tareas, documentos, comunicaciones y actividades. Facturas pendientes anuladas: {canceled_count}. Servicios adicionales archivados: {len(additional_services)}.",
        operator_name=operator,
    ))
    await db.commit()
    await db.refresh(client)
    return {"ok": True, "message": "Cliente retirado, recursos liberados e historial conservado correctamente.", "client": _decorate_retired(client), "mikrotik": cleanup, "history_preserved": True, "canceled_pending_invoices": canceled_count, "archived_services": len(additional_services)}


@router.post("/{client_id}/reactivation-complete")
async def complete_reactivation(client_id: str, db: AsyncSession = Depends(get_db)):
    client = await db.get(Client, client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    if not _retirement_policy(await _settings(db))["allow_reactivation"]:
        raise HTTPException(status_code=403, detail="La reactivación de clientes retirados está desactivada en Configuración clientes.")
    client.status = "active"
    client.retired_at = ""
    client.retirement_reason = ""
    await db.commit()
    return {"ok": True, "client": client.to_dict()}
