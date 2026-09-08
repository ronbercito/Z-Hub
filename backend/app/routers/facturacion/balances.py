"""
Archivo: backend/app/routers/facturacion/balances.py
Actualización: 2026-09-08 — corrige la aplicación de deuda completa a la siguiente factura.
Función: registra movimientos firmados y aplica automáticamente créditos o deudas a facturas nuevas.
Trabaja con: ClientBalance, Invoice, Client y las rutas de facturación del cliente.
"""
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.client import Client
from app.models.client_balance import ClientBalance
from app.models.invoice import Invoice


async def balance_total(db: AsyncSession, client_id: str) -> float:
    rows = (await db.execute(
        select(ClientBalance).where(ClientBalance.client_id == client_id)
    )).scalars().all()
    return round(sum(float(row.amount or 0) for row in rows), 2)


async def create_balance_entry(
    db: AsyncSession,
    client: Client,
    amount: float,
    description: str,
    operator_name: str = "Sistema",
    source_invoice_id: Optional[str] = None,
) -> ClientBalance:
    entry = ClientBalance(
        client_id=client.id,
        source_invoice_id=source_invoice_id,
        amount=round(float(amount), 2),
        remaining_amount=round(float(amount), 2),
        description=(description or "").strip(),
        operator_name=operator_name or "Sistema",
    )
    db.add(entry)
    await db.flush()
    return entry


async def apply_balances_to_invoice(
    db: AsyncSession,
    invoice: Invoice,
    operator_name: str = "Sistema",
) -> dict:
    """Aplica saldo pendiente a una factura recién generada.

    Crédito positivo: paga la factura total o parcialmente.
    Deuda negativa: se suma completa al monto de la factura y se consume la deuda.
    Cada aplicación queda registrada como movimiento inverso ligado a la factura destino.
    """
    active = (await db.execute(
        select(ClientBalance)
        .where(
            ClientBalance.client_id == invoice.client_id,
            ClientBalance.remaining_amount != 0,
            ClientBalance.parent_id.is_(None),
        )
        .order_by(ClientBalance.created_at.asc(), ClientBalance.id.asc())
    )).scalars().all()

    credit_applied = 0.0
    debt_added = 0.0

    # Toda deuda pendiente se traslada a la nueva factura, aunque sea mayor que su importe original.
    for source in active:
        if float(source.remaining_amount or 0) >= 0 or abs(float(source.remaining_amount or 0)) < 0.005:
            continue
        debt = abs(float(source.remaining_amount or 0))
        if debt <= 0:
            continue
        invoice.amount = round(float(invoice.amount or 0) + debt, 2)
        source.remaining_amount = 0.0
        debt_added += debt
        application = ClientBalance(
            client_id=invoice.client_id,
            source_invoice_id=source.source_invoice_id,
            target_invoice_id=invoice.id,
            parent_id=source.id,
            amount=round(debt, 2),
            remaining_amount=0.0,
            description=f"Aplicación de deuda a {invoice.invoice_number}",
            operator_name=operator_name or "Sistema",
        )
        db.add(application)

    # Después se utiliza el crédito disponible sobre el total final de la factura.
    remaining_due = max(0.0, float(invoice.amount or 0) - float(invoice.paid_amount or 0))
    for source in active:
        if float(source.remaining_amount or 0) <= 0 or remaining_due <= 0:
            continue
        credit = min(float(source.remaining_amount), remaining_due)
        if credit <= 0:
            continue
        invoice.paid_amount = round(float(invoice.paid_amount or 0) + credit, 2)
        source.remaining_amount = round(float(source.remaining_amount) - credit, 2)
        credit_applied += credit
        application = ClientBalance(
            client_id=invoice.client_id,
            source_invoice_id=source.source_invoice_id,
            target_invoice_id=invoice.id,
            parent_id=source.id,
            amount=round(-credit, 2),
            remaining_amount=0.0,
            description=f"Aplicación de saldo a favor en {invoice.invoice_number}",
            operator_name=operator_name or "Sistema",
        )
        db.add(application)
        remaining_due = round(remaining_due - credit, 2)

    if float(invoice.amount or 0) > 0 and remaining_due <= 0.005:
        invoice.status = "paid"
        invoice.paid_amount = round(float(invoice.amount or 0), 2)

    await db.flush()
    return {
        "credit_applied": round(credit_applied, 2),
        "debt_added": round(debt_added, 2),
        "remaining_due": round(max(0.0, float(invoice.amount or 0) - float(invoice.paid_amount or 0)), 2),
    }
