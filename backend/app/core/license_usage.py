"""Cálculo comercial de capacidad por servicios de acceso.

Z-Hub 1.3.8:
- un servicio principal consume 1 cupo mientras el abonado esté active/suspended/paused;
- cada ClientService adicional consume otro cupo en esos mismos estados;
- suspender/cortar o pausar NO libera capacidad;
- retirar definitivamente un servicio/abonado sí libera capacidad.
"""
from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.client import Client
from app.models.client_service import ClientService

CAPACITY_STATUSES = ("active", "suspended", "paused")


async def get_service_usage(db: AsyncSession) -> int:
    """Devuelve la cantidad total de servicios que consumen licencia."""
    primary_query = select(func.count(Client.id)).where(Client.status.in_(CAPACITY_STATUSES))
    primary = int((await db.scalar(primary_query)) or 0)

    additional_query = (
        select(func.count(ClientService.id))
        .join(Client, Client.id == ClientService.client_id)
        .where(
            Client.status.in_(CAPACITY_STATUSES),
            ClientService.status.in_(CAPACITY_STATUSES),
        )
    )
    additional = int((await db.scalar(additional_query)) or 0)
    return primary + additional
