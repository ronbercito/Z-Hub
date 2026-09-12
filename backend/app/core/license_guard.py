"""Aplicación de reglas comerciales de licencia de Z-Hub.

1.3.4: alcanzar la capacidad NO bloquea el panel. Solo impide nuevas altas o
reactivaciones que aumentarían la cantidad de abonados activos.
"""
from __future__ import annotations

import re

from fastapi import Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.license_manager import get_license
from app.models.client import Client

CLIENT_LIMIT_CODE = "CLIENT_LIMIT_REACHED"
TRIAL_EXPIRED_CODE = "TRIAL_EXPIRED"
LICENSE_REQUIRED_CODE = "LICENSE_REQUIRED"
TRIAL_EXPIRED_MESSAGE = (
    "El período de prueba de 30 días ha finalizado. Z-Hub permanece disponible en modo consulta; "
    "activa una licencia pagada para volver a modificar datos."
)
LICENSE_REQUIRED_MESSAGE = (
    "La instalación no tiene una licencia válida y activa. Ingresa una nueva licencia para continuar. "
    "Los datos existentes permanecen intactos."
)
WRITE_METHODS = {"POST", "PUT", "PATCH", "DELETE"}
TRIAL_WRITE_EXEMPT_PATHS = {
    "/api/auth/login",
    "/api/auth/logout",
    "/api/license/activate",
}
TRIAL_WRITE_EXEMPT_PREFIXES = (
    "/api/setup/",
    "/api/system-update",
)
BLOCKED_LICENSE_STATUSES = {"trial_expired", "invalid", "missing"}


def _limit_message(usage: int, limit: int) -> str:
    return (
        f"Límite de licencia alcanzado. Tu plan permite hasta {limit} abonados activos. "
        f"Actualmente utilizas {usage} de {limit}. Todas las demás funciones del panel continúan disponibles; "
        "cambia a un plan superior para registrar o reactivar más clientes."
    )


async def _raise_if_capacity_full(db: AsyncSession) -> None:
    license_info = await get_license(db)
    if license_info.get("status") != "active":
        return
    limit = license_info.get("max_clients")
    if limit is None:
        return
    usage = int(license_info.get("client_usage") or 0)
    if usage < int(limit):
        return
    raise HTTPException(
        status_code=409,
        detail=f"{CLIENT_LIMIT_CODE}: {_limit_message(usage, int(limit))}",
        headers={
            "X-ZHub-Error-Code": CLIENT_LIMIT_CODE,
            "X-ZHub-Client-Usage": str(usage),
            "X-ZHub-Client-Limit": str(limit),
        },
    )


async def enforce_client_capacity(request: Request, db: AsyncSession = Depends(get_db)) -> None:
    """Bloquea solo operaciones que pueden aumentar el número de abonados activos."""
    path = request.url.path.rstrip("/")

    # El alta normal crea un abonado activo por defecto.
    if request.method == "POST" and path == "/api/clients":
        await _raise_if_capacity_full(db)
        return

    # Corte/reactivación: cortar siempre se permite; reactivar consume capacidad.
    if request.method == "POST":
        match = re.fullmatch(r"/api/clients/([^/]+)/toggle-status", path)
        if match:
            client = await db.get(Client, match.group(1))
            if client and client.status != "active":
                await _raise_if_capacity_full(db)
            return

        # Reanudar una pausa devuelve el servicio a active.
        match = re.fullmatch(r"/api/clients/([^/]+)/resume-pause", path)
        if match:
            client = await db.get(Client, match.group(1))
            if client and client.status != "active":
                await _raise_if_capacity_full(db)
            return

    # La edición de clientes activos no consume otro cupo. Solo una reactivación
    # histórica de un retirado necesita comprobar capacidad.
    if request.method == "PUT":
        match = re.fullmatch(r"/api/clients/([^/]+)", path)
        if match:
            client = await db.get(Client, match.group(1))
            if client and client.status == "retired":
                await _raise_if_capacity_full(db)


def _trial_write_is_exempt(path: str) -> bool:
    if path in TRIAL_WRITE_EXEMPT_PATHS:
        return True
    return any(path.startswith(prefix) for prefix in TRIAL_WRITE_EXEMPT_PREFIXES)


async def enforce_trial_write_access(request: Request, db: AsyncSession = Depends(get_db)) -> None:
    """Bloquea escrituras cuando la licencia requiere recuperación.

    Aplica a Trial vencido, licencia inválida o instalación sin licencia. Login/logout,
    activación de licencia, setup y actualización del sistema permanecen disponibles
    para recuperar el panel sin borrar ni modificar datos existentes.
    """
    if request.method.upper() not in WRITE_METHODS:
        return
    path = request.url.path.rstrip("/") or "/"
    if _trial_write_is_exempt(path):
        return

    info = await get_license(db)
    status = str(info.get("status") or "").strip().lower()
    if status not in BLOCKED_LICENSE_STATUSES:
        return

    if status == "trial_expired":
        code = TRIAL_EXPIRED_CODE
        message = TRIAL_EXPIRED_MESSAGE
    else:
        code = LICENSE_REQUIRED_CODE
        message = LICENSE_REQUIRED_MESSAGE

    raise HTTPException(
        status_code=403,
        detail=f"{code}: {message}",
        headers={"X-ZHub-Error-Code": code},
    )
