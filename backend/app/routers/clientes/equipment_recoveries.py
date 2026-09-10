"""Flujo operativo de recuperación física de ONU/CPE y otros equipos instalados."""
import json
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db, now_iso
from app.core.security import get_current_user
from app.models.client import Client
from app.models.client_equipment import ClientEquipment
from app.models.equipment_recovery import EquipmentRecovery
from app.models.setting import DEFAULT_SETTINGS, Setting

router = APIRouter(prefix="/equipment-recoveries", tags=["Clientes / Recuperación de equipos"], dependencies=[Depends(get_current_user)])

OPEN_STATUSES = {"pending", "contacted", "visit_scheduled"}
CLOSED_STATUSES = {"recovered", "not_recovered"}
VALID_STATUSES = OPEN_STATUSES | CLOSED_STATUSES
ALLOWED_TRANSITIONS = {
    "pending": VALID_STATUSES,
    "contacted": VALID_STATUSES,
    "visit_scheduled": VALID_STATUSES,
    "recovered": {"recovered"},
    "not_recovered": {"not_recovered"},
}

class RecoveryUpdate(BaseModel):
    status: str
    assigned_to: str = Field(default="", max_length=120)
    scheduled_date: str = Field(default="", max_length=10)
    notes: str = Field(default="", max_length=2000)

class EquipmentResultUpdate(BaseModel):
    status: str
    notes: str = Field(default="", max_length=1000)

async def _enabled(db: AsyncSession) -> bool:
    setting = await db.get(Setting, "system_config")
    data = {**DEFAULT_SETTINGS, **((setting.data if setting else {}) or {})}
    return data.get("client_equipment_recovery_enabled", False) is True

async def _require_enabled(db: AsyncSession) -> None:
    if not await _enabled(db):
        raise HTTPException(status_code=404, detail="El módulo de Recuperación de equipos está desactivado.")

def _safe_snapshot(client: Client) -> dict:
    if client.status != "retired" or not client.retirement_technical_snapshot:
        return {}
    try:
        data = json.loads(client.retirement_technical_snapshot)
        return data if isinstance(data, dict) else {}
    except (TypeError, ValueError, json.JSONDecodeError):
        return {}

async def _assigned_items(db: AsyncSession, client: Client) -> list[dict]:
    rows = (await db.execute(select(ClientEquipment).where(
        ClientEquipment.client_id == client.id,
        ClientEquipment.ownership == "company",
        ClientEquipment.status.in_(("installed", "assigned", "recovery_pending")),
    ).order_by(ClientEquipment.created_at))).scalars().all()
    return [{
        "equipment_id": row.id, "type": row.equipment_type or "Equipo",
        "brand_model": row.brand_model or "", "identifier": row.serial_mac or "",
        "serial_mac": row.serial_mac or "", "ownership": row.ownership,
        "status": "pending", "source_status": row.status,
        "delivered_at": row.delivered_at or "", "notes": row.notes or "",
    } for row in rows]

async def _equipment_for(db: AsyncSession, client: Client) -> dict:
    snapshot = _safe_snapshot(client)
    technology = snapshot.get("technology") or client.technology or ""
    assigned = await _assigned_items(db, client)
    if assigned:
        equipment = assigned
    else:
        equipment = []
        if technology == "fiber":
            onu_sn = snapshot.get("onu_sn") or client.onu_sn or ""
            if onu_sn:
                equipment.append({"type": "ONU", "identifier": onu_sn, "status": "pending", "notes": ""})
        elif technology == "wireless":
            antenna = snapshot.get("antenna_type") or client.antenna_type or ""
            management_ip = snapshot.get("management_ip") or client.management_ip or ""
            if antenna or management_ip:
                equipment.append({"type": "CPE", "identifier": antenna or "CPE inalámbrico", "management_ip": management_ip, "status": "pending", "notes": ""})
        if not equipment:
            equipment.append({"type": "Por verificar", "identifier": "Equipo por verificar en campo", "status": "pending", "notes": ""})
    return {"technology": technology, "items": equipment, "history": [],
        "nap_box": snapshot.get("nap_box") or client.nap_box or "",
        "nap_port": snapshot.get("nap_port") if "nap_port" in snapshot else client.nap_port,
        "zone_name": snapshot.get("zone_name") or client.zone_name or ""}

def _equipment_payload(row: EquipmentRecovery) -> dict:
    try:
        data = json.loads(row.equipment_data or "{}")
        return data if isinstance(data, dict) else {}
    except (TypeError, ValueError, json.JSONDecodeError):
        return {}

def _decorate(row: EquipmentRecovery) -> dict:
    item = row.to_dict()
    item["equipment"] = _equipment_payload(row)
    item["closed"] = row.status in CLOSED_STATUSES
    return item

def _add_history(data: dict, action: str, detail: str, user: str = "Sistema") -> None:
    history = data.setdefault("history", [])
    history.append({"at": now_iso(), "action": action, "detail": detail, "user": user})
    if len(history) > 100:
        del history[:-100]

@router.get("")
async def list_recoveries(search: str = "", status: str = "all", db: AsyncSession = Depends(get_db)):
    await _require_enabled(db)
    q = select(EquipmentRecovery)
    if status and status != "all":
        if status not in VALID_STATUSES:
            raise HTTPException(status_code=422, detail="Estado de recuperación no válido.")
        q = q.where(EquipmentRecovery.status == status)
    term = search.strip()
    if term:
        like = f"%{term}%"
        q = q.where(or_(EquipmentRecovery.client_name.ilike(like), EquipmentRecovery.dni_ruc.ilike(like), EquipmentRecovery.phone.ilike(like), EquipmentRecovery.address.ilike(like), EquipmentRecovery.assigned_to.ilike(like)))
    rows = (await db.execute(q.order_by(EquipmentRecovery.created_at.desc()))).scalars().all()
    return [_decorate(row) for row in rows]

@router.get("/summary")
async def recovery_summary(db: AsyncSession = Depends(get_db)):
    await _require_enabled(db)
    rows = (await db.execute(select(EquipmentRecovery))).scalars().all()
    counts = {state: 0 for state in VALID_STATUSES}
    for row in rows:
        if row.status in counts: counts[row.status] += 1
    counts["open"] = sum(counts[state] for state in OPEN_STATUSES)
    counts["total"] = len(rows)
    return counts

@router.post("/from-client/{client_id}")
async def create_from_client(client_id: str, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    await _require_enabled(db)
    client = await db.get(Client, client_id)
    if not client: raise HTTPException(status_code=404, detail="Cliente no encontrado.")
    if client.status not in {"suspended", "retired"}: raise HTTPException(status_code=409, detail="Solo se puede enviar a recuperación un cliente suspendido o retirado.")
    existing = await db.scalar(select(EquipmentRecovery).where(EquipmentRecovery.client_id == client.id, EquipmentRecovery.status.in_(tuple(OPEN_STATUSES))))
    if existing: raise HTTPException(status_code=409, detail="Este cliente ya tiene una recuperación de equipos pendiente.")
    equipment = await _equipment_for(db, client)
    _add_history(equipment, "created", "Caso de recuperación creado", current_user.get("name") or current_user.get("username") or "Sistema")
    row = EquipmentRecovery(client_id=client.id, client_name=client.full_name or "", dni_ruc=client.dni_ruc or "", phone=client.phone or "", address=client.address or "", technology=equipment.get("technology") or "", source_status=client.status, equipment_data=json.dumps(equipment, ensure_ascii=False), status="pending", created_by=current_user.get("name") or current_user.get("username") or "Sistema")
    db.add(row)
    for item in equipment.get("items") or []:
        if item.get("equipment_id"):
            assigned = await db.get(ClientEquipment, item["equipment_id"])
            if assigned and assigned.status in {"installed", "assigned"}:
                assigned.status = "recovery_pending"; assigned.updated_at = now_iso()
    await db.commit(); await db.refresh(row)
    return {"ok": True, "message": "Cliente enviado a Recuperación de equipos.", "recovery": _decorate(row)}

@router.patch("/{recovery_id}")
async def update_recovery(recovery_id: str, payload: RecoveryUpdate, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    await _require_enabled(db)
    row = await db.get(EquipmentRecovery, recovery_id)
    if not row: raise HTTPException(status_code=404, detail="Caso de recuperación no encontrado.")
    status = payload.status.strip().lower()
    if status not in VALID_STATUSES: raise HTTPException(status_code=422, detail="Estado de recuperación no válido.")
    if status not in ALLOWED_TRANSITIONS.get(row.status, set()): raise HTTPException(status_code=409, detail="El caso ya está cerrado. Para un nuevo intento crea un caso nuevo.")
    scheduled_date = payload.scheduled_date.strip()
    if scheduled_date:
        try: datetime.strptime(scheduled_date, "%Y-%m-%d")
        except ValueError as error: raise HTTPException(status_code=422, detail="La fecha de visita no es válida.") from error
    if status == "visit_scheduled" and not scheduled_date: raise HTTPException(status_code=422, detail="Indica una fecha para la visita programada.")
    data = _equipment_payload(row)
    previous = row.status
    row.status = status; row.assigned_to = payload.assigned_to.strip(); row.scheduled_date = scheduled_date; row.notes = payload.notes.strip(); row.updated_at = now_iso()
    if status == "recovered": row.recovered_at = row.recovered_at or now_iso()
    elif status not in CLOSED_STATUSES: row.recovered_at = ""
    _add_history(data, "case_status", f"{previous} → {status}", current_user.get("name") or current_user.get("username") or "Sistema")
    row.equipment_data = json.dumps(data, ensure_ascii=False)
    await db.commit(); await db.refresh(row)
    return {"ok": True, "message": "Seguimiento de recuperación actualizado.", "recovery": _decorate(row)}

@router.patch("/{recovery_id}/equipment/{equipment_id}")
async def update_equipment_result(recovery_id: str, equipment_id: str, payload: EquipmentResultUpdate, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    """Resuelve un equipo individualmente. No mueve stock de Almacén (Etapa 4)."""
    await _require_enabled(db)
    row = await db.get(EquipmentRecovery, recovery_id)
    if not row: raise HTTPException(status_code=404, detail="Caso de recuperación no encontrado.")
    if row.status in CLOSED_STATUSES: raise HTTPException(status_code=409, detail="El caso ya está cerrado.")
    result = payload.status.strip().lower()
    if result not in {"pending", "recovered", "not_recovered"}: raise HTTPException(status_code=422, detail="Estado del equipo no válido.")
    data = _equipment_payload(row); items = data.get("items") or []
    target = next((item for item in items if str(item.get("equipment_id") or item.get("identifier") or "") == equipment_id), None)
    if not target: raise HTTPException(status_code=404, detail="Equipo no encontrado en este caso.")
    previous = target.get("status") or "pending"; target["status"] = result; target["recovery_notes"] = payload.notes.strip(); target["resolved_at"] = now_iso() if result in CLOSED_STATUSES else ""
    linked_id = target.get("equipment_id")
    if linked_id:
        assigned = await db.get(ClientEquipment, linked_id)
        if assigned:
            assigned.status = "recovered" if result == "recovered" else ("not_recovered" if result == "not_recovered" else "recovery_pending")
            assigned.updated_at = now_iso()
    _add_history(data, "equipment_status", f"{target.get('type','Equipo')} {target.get('identifier','')}: {previous} → {result}", current_user.get("name") or current_user.get("username") or "Sistema")
    resolved = [i.get("status") in CLOSED_STATUSES for i in items]
    if items and all(resolved):
        row.status = "recovered" if all(i.get("status") == "recovered" for i in items) else "not_recovered"
        row.recovered_at = now_iso() if row.status == "recovered" else ""
        _add_history(data, "case_closed", f"Caso cerrado automáticamente como {row.status}", "Sistema")
    row.equipment_data = json.dumps(data, ensure_ascii=False); row.updated_at = now_iso()
    await db.commit(); await db.refresh(row)
    return {"ok": True, "message": "Resultado del equipo actualizado.", "recovery": _decorate(row)}
