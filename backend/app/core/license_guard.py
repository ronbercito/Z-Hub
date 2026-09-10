"""Aplicación del límite comercial de abonados (Licencias Etapa 3/7)."""
from __future__ import annotations

import re

from fastapi import Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.license_manager import get_license
from app.models.client import Client

CLIENT_LIMIT_CODE = "CLIENT_LIMIT_REACHED"


def _limit_message(usage: int, limit: int) -> str:
    return (
        f"Límite de abonados alcanzado. Tu licencia permite hasta {limit} abonados registrados. "
        f"Actualmente utilizas {usage} de {limit}. Puedes seguir administrando tus abonados actuales, "
        "pero necesitas ampliar tu licencia para registrar uno nuevo."
    )


async def _raise_if_capacity_full(db: AsyncSession) -> None:
    license_info = await get_license(db)
    if license_info.get("status") != "active":
        # La política de Trial vencido pertenece a la Etapa 5. En esta etapa solo
        # se aplica el límite de capacidad a licencias activas con límite finito.
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
    """Protege altas nuevas y reactivación de un cliente retirado.

    Se instala como dependencia del CRUD principal de Clientes. Solo consulta
    licencia para las operaciones que pueden aumentar el número de abonados que
    consumen cupo; editar clientes ya contabilizados sigue permitido.
    """
    path = request.url.path.rstrip("/")

    if request.method == "POST" and path == "/api/clients":
        await _raise_if_capacity_full(db)
        return

    if request.method == "PUT":
        match = re.fullmatch(r"/api/clients/([^/]+)", path)
        if match:
            client = await db.get(Client, match.group(1))
            if client and client.status == "retired":
                await _raise_if_capacity_full(db)
