"""Baja controlada de clientes: conserva identidad e historial de retiro y libera recursos técnicos."""
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
from app.models.setting import Setting
from app.models.task import Task
from app.models.ticket import Ticket

router = APIRouter(prefix="/clients", tags=["Clientes retirados"], dependencies=[Depends(get_current_user)])


class RetirementIn(BaseModel):
    reason: str = Field(min_length=10, max_length=250)


async def _cut_list(db: AsyncSession) -> str:
    setting = await db.get(Setting, "system_config")
    return (setting.data or {}).get("mikrotik_cut_list") or "morosos" if setting else "morosos"


@router.get("/retired/list")
async def list_retired(search: str = "", db: AsyncSession = Depends(get_db)):
    q = select(Client).where(Client.status == "retired")
    rows = (await db.execute(q.order_by(Client.retired_at.desc()))).scalars().all()
    term = search.strip().lower()
    if term:
        rows = [c for c in rows if term in " ".join([c.full_name, c.dni_ruc, c.phone, c.email, c.address]).lower()]
    return [c.to_dict() for c in rows]


@router.get("/retired/by-dni/{dni_ruc}")
async def retired_by_dni(dni_ruc: str, db: AsyncSession = Depends(get_db)):
    client = await db.scalar(select(Client).where(Client.dni_ruc == dni_ruc.strip(), Client.status == "retired"))
    return {"found": bool(client), "client": client.to_dict() if client else None}


@router.post("/{client_id}/retire")
async def retire_client(client_id: str, payload: RetirementIn, db: AsyncSession = Depends(get_db)):
    client = await db.get(Client, client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")
    if client.status == "retired":
        raise HTTPException(status_code=409, detail="El cliente ya se encuentra retirado.")

    reason = payload.reason.strip()
    if len(reason) < 10:
        raise HTTPException(status_code=422, detail="El motivo del retiro debe tener al menos 10 caracteres.")

    router_device = await db.get(Router, client.router_id) if client.router_id else None
    cleanup = await mt.remove_client(client, router_device, await _cut_list(db))
    if not cleanup.get("ok"):
        await db.rollback()
        raise HTTPException(status_code=502, detail=f"No se retiró al cliente porque no se pudo liberar MikroTik: {cleanup.get('message', 'error desconocido')}")

    # El historial de identidad permanece en clients; la información operativa se elimina.
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

    # Libera plan, router, IP, NAP, ONU y cualquier asociación técnica.
    client.ip_address = ""
    client.mac_address = ""
    client.onu_sn = ""
    client.connection_type = "PPPoE"
    client.pppoe_user = ""
    client.pppoe_password = ""
    client.plan_id = ""
    client.plan_name = ""
    client.plan_price = 0.0
    client.router_id = ""
    client.router_name = ""
    client.ipv4_network_id = ""
    client.nap_box = ""
    client.nap_box_id = ""
    client.nap_port = None
    client.optical_power_dbm = None
    client.zone_id = ""
    client.zone_name = ""
    client.monitoring_equipment_id = ""
    client.monitoring_equipment_name = ""
    client.antenna_type = ""
    client.management_ip = ""

    await db.commit()
    await db.refresh(client)
    return {"ok": True, "message": "Cliente retirado y recursos liberados correctamente.", "client": client.to_dict(), "mikrotik": cleanup}
