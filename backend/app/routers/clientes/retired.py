"""Baja controlada de clientes: conserva identidad e historial de retiro y libera recursos técnicos."""
import json

from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db, now_iso
from app.core.security import get_current_user
from app.integrations.mikrotik import service as mt
from app.models.client import Client
from app.models.client_activity import ClientActivity
from app.models.client_communication import ClientCommunication
from app.models.client_document import ClientDocument
from app.models.client_service import ClientService
from app.models.invoice import Invoice
from app.models.router import Router
from app.models.setting import DEFAULT_SETTINGS, Setting
from app.models.task import Task
from app.models.ticket import Ticket

router = APIRouter(prefix="/clients", tags=["Clientes retirados"], dependencies=[Depends(get_current_user)])


class RetirementIn(BaseModel):
    reason: str = Field(default="", max_length=250)


async def _settings(db: AsyncSession) -> dict:
    setting = await db.get(Setting, "system_config")
    return {**DEFAULT_SETTINGS, **((setting.data or {}) if setting else {})}


async def _cut_list(db: AsyncSession) -> str:
    return (await _settings(db)).get("mikrotik_cut_list") or "morosos"


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
async def retire_client(client_id: str, payload: RetirementIn, db: AsyncSession = Depends(get_db)):
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

    router_device = await db.get(Router, client.router_id) if client.router_id else None
    cleanup = await mt.remove_client(client, router_device, settings.get("mikrotik_cut_list") or "morosos")
    if not cleanup.get("ok"):
        await db.rollback()
        raise HTTPException(status_code=502, detail=f"No se retiró al cliente porque no se pudo liberar MikroTik: {cleanup.get('message', 'error desconocido')}")

    for model in (ClientService, Invoice, Ticket, Task, ClientCommunication, ClientDocument, ClientActivity):
        await db.execute(delete(model).where(model.client_id == client.id))

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
    await db.commit()
    await db.refresh(client)
    return {"ok": True, "message": "Cliente retirado y recursos liberados correctamente.", "client": _decorate_retired(client), "mikrotik": cleanup}


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
