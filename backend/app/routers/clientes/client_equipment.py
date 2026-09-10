"""CRUD de equipos físicos asignados a clientes. No mueve inventario ni crea recuperaciones."""
from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db, now_iso
from app.models.client import Client
from app.models.client_equipment import ClientEquipment
from app.models.setting import DEFAULT_SETTINGS, Setting

router = APIRouter(prefix="/client-equipment", tags=["Equipos de clientes"])


class EquipmentIn(BaseModel):
    equipment_type: str = Field(min_length=2, max_length=60)
    brand_model: str = Field(default="", max_length=150)
    serial_mac: str = Field(default="", max_length=150)
    ownership: str = "company"
    delivered_at: str = ""
    notes: str = Field(default="", max_length=1000)


def _row(item: ClientEquipment) -> dict:
    return {
        "id": item.id, "client_id": item.client_id, "equipment_type": item.equipment_type,
        "brand_model": item.brand_model, "serial_mac": item.serial_mac, "ownership": item.ownership,
        "status": item.status, "delivered_at": item.delivered_at, "notes": item.notes,
        "created_at": item.created_at, "updated_at": item.updated_at,
    }


async def _enabled(db: AsyncSession) -> bool:
    setting = await db.get(Setting, "system_config")
    data = {**DEFAULT_SETTINGS, **((setting.data if setting else {}) or {})}
    return data.get("client_equipment_recovery_enabled", False) is True


async def _require_enabled(db: AsyncSession) -> None:
    if not await _enabled(db):
        raise HTTPException(404, "El control de equipos de clientes está desactivado")


@router.get("/enabled")
async def enabled(db: AsyncSession = Depends(get_db)):
    return {"enabled": await _enabled(db)}


@router.get("/client/{client_id}")
async def list_client_equipment(client_id: str, db: AsyncSession = Depends(get_db)):
    await _require_enabled(db)
    if not await db.get(Client, client_id):
        raise HTTPException(404, "Cliente no encontrado")
    rows = (await db.execute(select(ClientEquipment).where(ClientEquipment.client_id == client_id).order_by(ClientEquipment.created_at))).scalars().all()
    return [_row(item) for item in rows]


@router.post("/client/{client_id}")
async def assign_equipment(client_id: str, data: EquipmentIn, db: AsyncSession = Depends(get_db)):
    await _require_enabled(db)
    if not await db.get(Client, client_id):
        raise HTTPException(404, "Cliente no encontrado")
    ownership = data.ownership if data.ownership in {"company", "client"} else "company"
    delivered = data.delivered_at.strip() or date.today().isoformat()
    item = ClientEquipment(
        client_id=client_id, equipment_type=data.equipment_type.strip(), brand_model=data.brand_model.strip(),
        serial_mac=data.serial_mac.strip(), ownership=ownership, status="installed", delivered_at=delivered,
        notes=data.notes.strip(),
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return _row(item)


@router.put("/{equipment_id}")
async def update_equipment(equipment_id: str, data: EquipmentIn, db: AsyncSession = Depends(get_db)):
    await _require_enabled(db)
    item = await db.get(ClientEquipment, equipment_id)
    if not item:
        raise HTTPException(404, "Equipo no encontrado")
    item.equipment_type = data.equipment_type.strip()
    item.brand_model = data.brand_model.strip()
    item.serial_mac = data.serial_mac.strip()
    item.ownership = data.ownership if data.ownership in {"company", "client"} else "company"
    item.delivered_at = data.delivered_at.strip() or item.delivered_at
    item.notes = data.notes.strip()
    item.updated_at = now_iso()
    await db.commit()
    return _row(item)


@router.delete("/{equipment_id}")
async def unassign_equipment(equipment_id: str, db: AsyncSession = Depends(get_db)):
    await _require_enabled(db)
    item = await db.get(ClientEquipment, equipment_id)
    if not item:
        raise HTTPException(404, "Equipo no encontrado")
    if item.status not in {"installed", "assigned"}:
        raise HTTPException(409, "Este equipo ya participa en un proceso de recuperación")
    await db.delete(item)
    await db.commit()
    return {"ok": True, "message": "Equipo retirado de la ficha del cliente"}
