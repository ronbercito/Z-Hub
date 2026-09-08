"""
Archivo: backend/app/routers/clientes/service_delete_audit.py
Actualización: 2026-09-08 — auditoría detallada de eliminación de servicios.
Función: reemplaza el endpoint de eliminación para registrar exactamente qué servicio se eliminó,
qué configuración tenía y qué facturas/deuda pendiente se eliminaron con él.
Trabaja con: ClientService, Invoice, ClientActivity y MikroTik.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.integrations.mikrotik import service as mt
from app.models.client import Client
from app.models.client_activity import ClientActivity
from app.models.client_service import ClientService
from app.models.invoice import Invoice
from app.models.router import Router
from app.routers.clientes.router import _get_visible_client
from app.routers.clientes.services import _remove_service_queue

router = APIRouter(prefix="/clients", tags=["Servicios de clientes - auditoría"])


def _money(value) -> float:
    try:
        return round(float(value or 0), 2)
    except (TypeError, ValueError):
        return 0.0


@router.delete("/{client_id}/services/{service_id}")
async def delete_client_service_detailed(
    client_id: str,
    service_id: str,
    confirm_delete_invoices: bool = Query(False),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Elimina un servicio y deja una auditoría completa y legible en el Log del cliente."""
    client = await _get_visible_client(db, client_id, current_user)
    row = await db.get(ClientService, service_id)
    if not row or row.client_id != client_id:
        raise HTTPException(status_code=404, detail="Servicio no encontrado.")

    all_services = (
        await db.execute(
            select(ClientService)
            .where(ClientService.client_id == client_id)
            .order_by(ClientService.created_at.asc(), ClientService.id.asc())
        )
    ).scalars().all()
    service_number = next((index + 2 for index, item in enumerate(all_services) if item.id == row.id), None)
    service_label = f"Servicio {service_number}" if service_number else "Servicio adicional"

    pending_invoices = (
        await db.execute(
            select(Invoice).where(
                Invoice.service_id == service_id,
                Invoice.status.in_(["unpaid", "overdue"]),
                Invoice.paid_amount <= 0,
            )
        )
    ).scalars().all()

    if pending_invoices and not confirm_delete_invoices:
        total = round(sum(_money(invoice.amount) for invoice in pending_invoices), 2)
        raise HTTPException(
            status_code=409,
            detail={
                "code": "PENDING_INVOICES",
                "message": f"Este servicio tiene {len(pending_invoices)} factura(s) pendiente(s) por S/. {total:.2f}.",
                "count": len(pending_invoices),
                "total": total,
            },
        )

    router_obj = await db.get(Router, row.router_id) if row.router_id else None
    if router_obj and router_obj.device_type == "mikrotik" and router_obj.password:
        try:
            async with mt.connect(router_obj) as mikrotik:
                if row.pppoe_user:
                    await mikrotik.remove_ppp_secret(row.pppoe_user)
                if row.ip_address:
                    await _remove_service_queue(mikrotik, client.dni_ruc, row.ip_address)
        except mt.MikroTikError as exc:
            raise HTTPException(status_code=502, detail=f"No se pudo eliminar el servicio de MikroTik: {exc}")

    deleted_invoice_count = len(pending_invoices)
    deleted_invoice_total = round(sum(_money(invoice.amount) for invoice in pending_invoices), 2)
    invoice_details = [
        f"{invoice.invoice_number or 'sin número'}: S/. {_money(invoice.amount):.2f} ({invoice.status})"
        for invoice in pending_invoices
    ]

    service_details = [
        f"{service_label} eliminado",
        f"Plan: {row.plan_name or 'sin plan'}",
        f"Precio: S/. {_money(row.plan_price):.2f}",
        f"Conexión: {row.connection_type or 'sin especificar'}",
        f"Tecnología: {row.technology or 'sin especificar'}",
        f"MikroTik: {row.router_name or row.router_id or 'sin asignar'}",
        f"IP: {row.ip_address or 'sin IP'}",
        f"Usuario PPPoE: {row.pppoe_user or 'sin usuario'}",
        f"Zona: {row.zone_name or row.zone_id or 'sin zona'}",
        f"Estado anterior: {row.status or 'sin estado'}",
    ]

    if pending_invoices:
        service_details.append(
            f"Deuda/facturas pendientes eliminadas: {deleted_invoice_count} por S/. {deleted_invoice_total:.2f}."
        )
        service_details.append("Facturas eliminadas: " + "; ".join(invoice_details))
    else:
        service_details.append("Deuda/facturas pendientes del servicio: ninguna eliminada.")

    operator = current_user.get("name") or current_user.get("email") or "Sistema"
    account = current_user.get("email") or "sin cuenta"
    role = current_user.get("role") or "sin rol"
    service_details.append(f"Cuenta: {account} | Rol: {role}")

    if pending_invoices:
        await db.execute(delete(Invoice).where(Invoice.id.in_([invoice.id for invoice in pending_invoices])))
    await db.delete(row)
    await db.flush()

    remaining = (
        await db.execute(
            select(Invoice).where(
                Invoice.client_id == client.id,
                Invoice.status.in_(["unpaid", "overdue"]),
            )
        )
    ).scalars().all()
    client.unpaid_invoices_count = len(remaining)
    client.balance_due = round(sum(_money(invoice.amount) for invoice in remaining), 2)

    db.add(
        ClientActivity(
            client_id=client.id,
            action="Servicio eliminado",
            detail=" | ".join(service_details),
            operator_name=operator,
        )
    )
    await db.commit()
    return {
        "ok": True,
        "deleted_invoices": deleted_invoice_count,
        "deleted_invoice_total": deleted_invoice_total,
    }
