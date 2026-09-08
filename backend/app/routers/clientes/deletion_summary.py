"""
Archivo: backend/app/routers/clientes/deletion_summary.py
Actualización: 2026-09-08 — resumen autoritativo para la confirmación de eliminación.
Función: entrega al frontend el nombre, todos los servicios y la deuda pendiente reales
         del cliente antes de permitir una eliminación definitiva.
Trabaja con: Client, ClientService, Invoice y clientDeleteGuard.js.
"""
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.client import Client
from app.models.client_service import ClientService
from app.models.invoice import Invoice
from app.routers.clientes.router import _get_visible_client

router = APIRouter(prefix="/clients", tags=["Resumen de eliminación"])


@router.get("/{client_id}/deletion-summary")
async def get_deletion_summary(
    client_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Devuelve datos reales y completos para la advertencia previa al borrado."""
    client = await _get_visible_client(db, client_id, current_user)

    rows = (
        await db.execute(
            select(ClientService)
            .where(ClientService.client_id == client_id)
            .order_by(ClientService.created_at.asc(), ClientService.id.asc())
        )
    ).scalars().all()

    services = [
        {
            "service_id": "primary",
            "is_primary": True,
            "label": f"Servicio principal · {client.plan_name or 'Sin plan'}",
            "plan_name": client.plan_name or "Sin plan",
        }
    ]
    for index, row in enumerate(rows, start=2):
        services.append(
            {
                "service_id": row.id,
                "is_primary": False,
                "label": f"Servicio {index} · {row.plan_name or 'Sin plan'}",
                "plan_name": row.plan_name or "Sin plan",
            }
        )

    invoices = (
        await db.execute(
            select(Invoice).where(
                Invoice.client_id == client_id,
                Invoice.status.in_(["unpaid", "overdue"]),
            )
        )
    ).scalars().all()

    pending_total = round(
        sum(max(0.0, float(item.amount or 0) - float(item.paid_amount or 0)) for item in invoices),
        2,
    )

    return {
        "client_id": client.id,
        "client_name": client.full_name or "Cliente sin nombre",
        "services": services,
        "service_count": len(services),
        "pending_invoice_count": len(invoices),
        "pending_total": pending_total,
    }
