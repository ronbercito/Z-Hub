"""
Archivo: backend/app/routers/red/nap_boxes.py
Actualización: 2026-09-08 — los puertos ocupados por clientes y servicios adicionales ahora se reflejan en los selectores de NAP.
Función: API de Cajas NAP (/api/nap-boxes): administra el inventario físico y muestra
         ocupación por puerto usando los clientes vinculados y sus servicios adicionales.
Alcance: no ejecuta comandos en OLT o MikroTik.
Trabaja con: models/nap_box.py, models/client.py, models/client_service.py, models/zone.py,
             frontend/modules/red/NapBoxes.jsx y ClientServiceEditor.jsx.
"""
from hashlib import sha256

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.core.utils import get_or_404
from app.models.client import Client
from app.models.client_service import ClientService
from app.models.nap_box import NapBox
from app.models.zone import Zone

router = APIRouter(prefix="/nap-boxes", tags=["Red / Cajas NAP"], dependencies=[Depends(get_current_user)])


class NapBoxIn(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    location: str = ""
    latitude: float | None = None
    longitude: float | None = None
    ports: int = Field(ge=1, le=128)
    details: str = ""
    zone_id: str = Field(min_length=1)


async def _rows(db: AsyncSession):
    boxes = (await db.execute(select(NapBox))).scalars().all()
    boxes.sort(key=lambda box: ((box.zone_name or "").casefold(), (box.display_name or box.name).casefold()))

    # Una NAP puede estar ocupada por el servicio principal histórico o por un
    # servicio adicional del mismo/otro cliente. Ambos deben bloquear el puerto.
    client_rows = (await db.execute(
        select(Client.nap_box_id, Client.nap_port, Client.id, Client.full_name)
        .where(Client.nap_box_id != "", Client.nap_port.is_not(None))
    )).all()
    service_rows = (await db.execute(
        select(ClientService.nap_box_id, ClientService.nap_port, ClientService.id, ClientService.client_id)
        .where(ClientService.nap_box_id != "", ClientService.nap_port.is_not(None))
    )).all()

    assigned = {}
    for box_id, port, client_id, name in client_rows:
        assigned.setdefault(box_id, {})[port] = {"client_id": client_id, "client_name": name, "source": "client"}
    for box_id, port, service_id, client_id in service_rows:
        # La validación de servicios impide duplicados; este guard evita que un
        # dato histórico inconsistente reemplace la primera asignación mostrada.
        assigned.setdefault(box_id, {}).setdefault(port, {
            "client_id": client_id,
            "service_id": service_id,
            "client_name": "Servicio adicional",
            "source": "service",
        })

    return [{
        **box.to_dict(),
        "name": box.display_name or box.name,
        "assigned_ports": assigned.get(box.id, {}),
        "used_ports": len(assigned.get(box.id, {})),
    } for box in boxes]


@router.get("")
async def list_nap_boxes(db: AsyncSession = Depends(get_db)):
    return await _rows(db)


@router.post("")
async def create_nap_box(data: NapBoxIn, db: AsyncSession = Depends(get_db)):
    zone = await db.get(Zone, data.zone_id)
    if not zone:
        raise HTTPException(status_code=422, detail="La zona seleccionada ya no existe.")
    display_name = data.name.strip()
    internal_name = sha256(f"{zone.id}:{display_name.lower()}".encode()).hexdigest()
    exists = await db.scalar(select(NapBox.id).where(NapBox.zone_id == zone.id, func.lower(func.coalesce(func.nullif(NapBox.display_name, ""), NapBox.name)) == display_name.lower()))
    if exists:
        raise HTTPException(status_code=422, detail="Ya existe una caja NAP con ese nombre en esta zona.")
    box = NapBox(**{**data.model_dump(), "name": internal_name, "display_name": display_name, "zone_name": zone.name})
    db.add(box)
    await db.commit()
    return {**box.to_dict(), "name": box.display_name or box.name, "assigned_ports": {}, "used_ports": 0}


@router.put("/{box_id}")
async def update_nap_box(box_id: str, data: NapBoxIn, db: AsyncSession = Depends(get_db)):
    box = await get_or_404(db, NapBox, box_id, "Caja NAP")
    client_used = await db.scalar(select(func.count(Client.id)).where(Client.nap_box_id == box.id, Client.nap_port.is_not(None))) or 0
    service_used = await db.scalar(select(func.count(ClientService.id)).where(ClientService.nap_box_id == box.id, ClientService.nap_port.is_not(None))) or 0
    used = client_used + service_used
    if used and data.ports < used:
        raise HTTPException(status_code=422, detail=f"No puedes reducir los puertos: hay {used} asignación(es) en esta NAP.")
    zone = await db.get(Zone, data.zone_id)
    if not zone:
        raise HTTPException(status_code=422, detail="La zona seleccionada ya no existe.")
    display_name = data.name.strip()
    internal_name = f"{zone.id}:{display_name}".lower()
    exists = await db.scalar(select(NapBox.id).where(NapBox.zone_id == zone.id, func.lower(NapBox.display_name) == display_name.lower(), NapBox.id != box.id))
    if exists:
        raise HTTPException(status_code=422, detail="Ya existe una caja NAP con ese nombre en esta zona.")
    box.name, box.display_name, box.location = internal_name, display_name, data.location.strip()
    box.zone_id, box.zone_name = zone.id, zone.name
    box.latitude, box.longitude = data.latitude, data.longitude
    box.ports, box.details = data.ports, data.details.strip()
    await db.commit()
    return {**box.to_dict(), "name": box.display_name or box.name, "used_ports": used, "assigned_ports": {}}


@router.delete("/{box_id}")
async def delete_nap_box(box_id: str, db: AsyncSession = Depends(get_db)):
    box = await get_or_404(db, NapBox, box_id, "Caja NAP")
    client_used = await db.scalar(select(func.count(Client.id)).where(Client.nap_box_id == box.id, Client.nap_port.is_not(None))) or 0
    service_used = await db.scalar(select(func.count(ClientService.id)).where(ClientService.nap_box_id == box.id, ClientService.nap_port.is_not(None))) or 0
    used = client_used + service_used
    if used:
        raise HTTPException(status_code=409, detail=f"No puedes eliminar la NAP: tiene {used} asignación(es).")
    await db.delete(box)
    await db.commit()
    return {"message": "Caja NAP eliminada"}
