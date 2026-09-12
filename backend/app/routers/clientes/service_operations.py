"""Control operativo individual de servicios.

Disponible únicamente cuando `client_individual_service_control_enabled` está activo.
Permite suspender, pausar o reactivar un servicio sin cambiar el estado general
del abonado. Activo/suspendido/pausado siguen consumiendo cupo de licencia.
"""
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db, now_iso
from app.core.security import get_current_user
from app.integrations.mikrotik import service as mt
from app.models.client import Client
from app.models.client_activity import ClientActivity
from app.models.client_service import ClientService
from app.models.client_service_state import ClientServiceState
from app.models.router import Router
from app.models.setting import DEFAULT_SETTINGS, Setting

router = APIRouter(prefix="/clients", tags=["Clientes / Estados por servicio"], dependencies=[Depends(get_current_user)])

ALLOWED_SERVICE_STATUSES = {"active", "suspended", "paused"}


class ServiceStatusIn(BaseModel):
    status: Literal["active", "suspended", "paused"]
    reason: str = Field(default="", max_length=250)


async def _settings(db: AsyncSession) -> dict:
    row = await db.get(Setting, "system_config")
    return {**DEFAULT_SETTINGS, **((row.data or {}) if row else {})}


async def _enabled(db: AsyncSession) -> bool:
    return bool((await _settings(db)).get("client_individual_service_control_enabled", False))


def _state_id(client_id: str, service_id: str) -> str:
    return f"{client_id}:{service_id}"


async def _cut_list(db: AsyncSession) -> str:
    data = await _settings(db)
    return str(data.get("mikrotik_cut_list") or "morosos")


async def _apply_network_state(db: AsyncSession, client: Client, service, status: str) -> dict:
    router_device = await db.get(Router, service.router_id) if getattr(service, "router_id", "") else None
    if not router_device or router_device.device_type != "mikrotik" or not router_device.password:
        raise HTTPException(status_code=409, detail="El servicio no tiene un MikroTik operativo con credenciales configuradas.")

    disabled = status in {"suspended", "paused"}
    try:
        async with mt.connect(router_device) as mikrotik:
            if getattr(service, "connection_type", "") == "PPPoE" and getattr(service, "pppoe_user", ""):
                found = await mikrotik.set_ppp_secret_disabled(service.pppoe_user, disabled)
                if not found:
                    raise HTTPException(status_code=409, detail=f"No existe el secret PPPoE '{service.pppoe_user}' en {router_device.name}.")
                message = f"PPPoE {'deshabilitado' if disabled else 'habilitado'} en {router_device.name}."
            elif getattr(service, "ip_address", ""):
                cut_list = await _cut_list(db)
                if disabled:
                    await mikrotik.address_list_add(cut_list, service.ip_address, comment=f"{client.full_name} | servicio individual")
                else:
                    await mikrotik.address_list_remove(cut_list, service.ip_address)
                message = f"IP {service.ip_address} {'agregada a' if disabled else 'retirada de'} {cut_list} en {router_device.name}."
            else:
                raise HTTPException(status_code=409, detail="El servicio no tiene usuario PPPoE ni IP administrable.")
    except HTTPException:
        raise
    except mt.MikroTikError as exc:
        raise HTTPException(status_code=502, detail=f"MikroTik no respondió: {exc}") from exc
    return {"ok": True, "message": message}


@router.get("/service-control-policy")
async def service_control_policy(db: AsyncSession = Depends(get_db)):
    return {"enabled": await _enabled(db)}


@router.get("/{client_id}/service-states")
async def service_states(client_id: str, db: AsyncSession = Depends(get_db)):
    client = await db.get(Client, client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Cliente no encontrado.")
    rows = (await db.execute(select(ClientService).where(ClientService.client_id == client_id).order_by(ClientService.created_at.asc()))).scalars().all()
    stored = (await db.execute(select(ClientServiceState).where(ClientServiceState.client_id == client_id))).scalars().all()
    state_map = {item.service_id: item for item in stored}
    primary = state_map.get("primary")
    result = {
        "enabled": await _enabled(db),
        "client_status": client.status,
        "states": {
            "primary": (primary.status if primary else client.status) if client.status in ALLOWED_SERVICE_STATUSES else client.status,
            **{row.id: row.status for row in rows},
        },
    }
    return result


@router.post("/{client_id}/services/{service_id}/operational-status")
async def set_service_operational_status(client_id: str, service_id: str, payload: ServiceStatusIn, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if not await _enabled(db):
        raise HTTPException(status_code=409, detail="La gestión individual por servicio está desactivada en Ajustes > Configuración clientes.")

    client = await db.get(Client, client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Cliente no encontrado.")
    if client.status in {"retired", "pending_install"}:
        raise HTTPException(status_code=409, detail="El cliente no está operativo. Usa primero el flujo general del abonado.")
    if client.status in {"suspended", "paused"} and payload.status == "active":
        raise HTTPException(status_code=409, detail="El abonado está suspendido o pausado de forma general. Reactívalo primero para habilitar servicios individuales.")

    is_primary = service_id == "primary"
    service = client if is_primary else await db.get(ClientService, service_id)
    if not service or (not is_primary and service.client_id != client_id):
        raise HTTPException(status_code=404, detail="Servicio no encontrado.")

    network = await _apply_network_state(db, client, service, payload.status)
    reason = payload.reason.strip()
    if not is_primary:
        service.status = payload.status

    state_key = _state_id(client_id, service_id)
    state = await db.get(ClientServiceState, state_key)
    if not state:
        state = ClientServiceState(id=state_key, client_id=client_id, service_id=service_id)
        db.add(state)
    state.status = payload.status
    state.reason = reason
    state.updated_at = now_iso()

    operator = current_user.get("name") or current_user.get("username") or "Operador"
    label = "Servicio principal" if is_primary else f"Servicio adicional {service_id[:8]}"
    action = {"active": "Servicio reactivado", "suspended": "Servicio suspendido", "paused": "Servicio pausado"}[payload.status]
    detail = f"{label}: {action.lower()} de forma individual."
    if reason:
        detail += f" Motivo: {reason}"
    db.add(ClientActivity(client_id=client.id, action=action, detail=detail, operator_name=operator))
    await db.commit()

    return {
        "ok": True,
        "service_id": service_id,
        "status": payload.status,
        "message": f"{label} actualizado a {payload.status}.",
        "mikrotik": network,
    }
