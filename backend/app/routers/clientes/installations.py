"""CRUD de solicitudes de instalación previas al alta del abonado."""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.installation import Installation
from app.models.client import Client

router = APIRouter(prefix="/installations", tags=["Instalaciones"], dependencies=[Depends(get_current_user)])

class InstallationIn(BaseModel):
    full_name: str
    dni_ruc: str
    phone: str = ""
    email: str = ""
    address: str = ""
    reference: str = ""
    latitude: float | None = None
    longitude: float | None = None
    installation_date: str = ""
    technology: str = "fiber"
    allow_retired: bool = False

@router.get("")
async def list_installations(db: AsyncSession = Depends(get_db)):
    rows = await db.scalars(select(Installation).where(Installation.status == "pending").order_by(Installation.created_at.desc()))
    return [item.to_dict() for item in rows.all()]

@router.post("")
async def create_installation(payload: InstallationIn, db: AsyncSession = Depends(get_db), user: dict = Depends(get_current_user)):
    full_name = payload.full_name.strip(); dni_ruc = payload.dni_ruc.strip(); phone = payload.phone.strip(); address = payload.address.strip()
    if not full_name or not dni_ruc or not phone or not address:
        raise HTTPException(status_code=422, detail="Completa nombre, DNI/RUC, dirección y celular.")
    existing = await db.scalar(select(Installation).where(Installation.dni_ruc == dni_ruc, Installation.status == "pending"))
    if existing:
        raise HTTPException(status_code=409, detail="Ya existe una instalación pendiente con este DNI/RUC.")
    retired = await db.scalar(select(Client).where(Client.dni_ruc == dni_ruc, Client.status == "retired"))
    if retired and not payload.allow_retired:
        raise HTTPException(status_code=409, detail={
            "code": "RETIRED_CLIENT",
            "message": "Este DNI/RUC pertenece a un cliente retirado.",
            "client": {"id": retired.id, "full_name": retired.full_name, "dni_ruc": retired.dni_ruc, "phone": retired.phone, "address": retired.address, "retired_at": retired.retired_at, "retirement_reason": retired.retirement_reason},
        })
    installation = Installation(full_name=full_name, dni_ruc=dni_ruc, phone=phone, email=payload.email.strip(), address=address,
        reference=payload.reference.strip(), latitude=float(payload.latitude or 0), longitude=float(payload.longitude or 0),
        installation_date=payload.installation_date or "", technology=payload.technology or "fiber", status="pending",
        created_by_user_id=str(user.get("id") or ""))
    db.add(installation); await db.commit(); await db.refresh(installation)
    return installation.to_dict()

@router.delete("/{installation_id}")
async def delete_installation(installation_id: str, db: AsyncSession = Depends(get_db)):
    installation = await db.get(Installation, installation_id)
    if not installation:
        raise HTTPException(status_code=404, detail="Instalación no encontrada")
    await db.delete(installation); await db.commit()
    return {"ok": True}
