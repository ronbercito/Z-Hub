"""
Archivo: backend/app/routers/clientes/services.py
Actualización: 2026-09-08 — servicios de Internet agrupados por cliente y editables desde ventana emergente.
Función: CRUD de servicios adicionales sin alterar el servicio principal histórico guardado en `clients`.
Trabaja con: backend/app/models/client_service.py, clientes/router.py y ClientServiceEditor.jsx.
"""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.client import Client
from app.models.client_service import ClientService
from app.routers.clientes.router import _attach_plan_router, _get_visible_client
from app.routers.clientes.schemas import ClientServiceUpdate

router = APIRouter(prefix="/clients", tags=["Servicios de clientes"], dependencies=[Depends(get_current_user)])


def _service_payload(temp: Client) -> dict:
    fields = (
        "plan_id", "plan_name", "plan_price", "router_id", "router_name", "connection_type",
        "ipv4_network_id", "ip_address", "pppoe_user", "pppoe_password", "technology",
        "zone_id", "zone_name", "nap_box_id", "nap_box", "nap_port", "onu_sn", "optical_power_dbm",
        "installation_date", "monitoring_equipment_id", "monitoring_equipment_name", "antenna_type",
        "management_ip", "status",
    )
    return {field: getattr(temp, field) for field in fields}


def _normalize(data: dict) -> dict:
    string_fields = (
        "plan_id", "router_id", "connection_type", "ipv4_network_id", "ip_address", "pppoe_user",
        "pppoe_password", "technology", "zone_id", "nap_box_id", "onu_sn", "installation_date",
        "monitoring_equipment_id", "antenna_type", "management_ip",
    )
    for field in string_fields:
        if data.get(field) is None:
            data[field] = ""
    return data


async def _prepare(db: AsyncSession, client_id: str, data: dict, current_service_id: Optional[str] = None) -> Client:
    data = _normalize(dict(data))
    temp = Client(**data)
    temp.id = ""
    await _attach_plan_router(db, temp)

    if temp.ip_address:
        q = select(ClientService.id).where(ClientService.client_id == client_id, ClientService.ip_address == temp.ip_address)
        if current_service_id:
            q = q.where(ClientService.id != current_service_id)
        if await db.scalar(q):
            raise HTTPException(status_code=422, detail="La IP seleccionada ya está asignada a otro servicio del cliente.")

    if temp.nap_box_id and temp.nap_port is not None:
        q = select(ClientService.id).where(
            ClientService.nap_box_id == temp.nap_box_id,
            ClientService.nap_port == temp.nap_port,
        )
        if current_service_id:
            q = q.where(ClientService.id != current_service_id)
        if await db.scalar(q):
            raise HTTPException(status_code=422, detail=f"El puerto NAP {temp.nap_port} ya está ocupado por otro servicio.")

    return temp


@router.get("/{client_id}/services")
async def list_client_services(client_id: str, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    client = await _get_visible_client(db, client_id, current_user)
    rows = (await db.execute(select(ClientService).where(ClientService.client_id == client_id).order_by(ClientService.created_at.asc()))).scalars().all()

    primary = client.to_dict()
    primary.update({"service_id": "primary", "is_primary": True})
    result = [primary]
    for row in rows:
        item = row.to_dict()
        item.update({"service_id": row.id, "is_primary": False})
        result.append(item)
    return result


@router.post("/{client_id}/services")
async def create_client_service(client_id: str, payload: ClientServiceUpdate, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    await _get_visible_client(db, client_id, current_user)
    data = payload.model_dump(exclude_unset=True)
    temp = await _prepare(db, client_id, data)
    row = ClientService(client_id=client_id, **_service_payload(temp))
    db.add(row)
    await db.commit()
    await db.refresh(row)
    return {**row.to_dict(), "service_id": row.id, "is_primary": False}


@router.patch("/{client_id}/services/{service_id}")
async def update_client_service(client_id: str, service_id: str, payload: ClientServiceUpdate, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    await _get_visible_client(db, client_id, current_user)
    row = await db.get(ClientService, service_id)
    if not row or row.client_id != client_id:
        raise HTTPException(status_code=404, detail="Servicio no encontrado.")
    current = row.to_dict()
    current.update(payload.model_dump(exclude_unset=True))
    temp = await _prepare(db, client_id, current, service_id)
    for field, value in _service_payload(temp).items():
        setattr(row, field, value)
    await db.commit()
    await db.refresh(row)
    return {**row.to_dict(), "service_id": row.id, "is_primary": False}


@router.delete("/{client_id}/services/{service_id}")
async def delete_client_service(client_id: str, service_id: str, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    await _get_visible_client(db, client_id, current_user)
    row = await db.get(ClientService, service_id)
    if not row or row.client_id != client_id:
        raise HTTPException(status_code=404, detail="Servicio no encontrado.")
    await db.delete(row)
    await db.commit()
    return {"ok": True}


@router.get("/{client_id}/services/{service_id}")
async def get_client_service(client_id: str, service_id: str, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    await _get_visible_client(db, client_id, current_user)
    row = await db.get(ClientService, service_id)
    if not row or row.client_id != client_id:
        raise HTTPException(status_code=404, detail="Servicio no encontrado.")
    return {**row.to_dict(), "service_id": row.id, "is_primary": False}
