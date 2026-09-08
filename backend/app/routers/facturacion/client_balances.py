"""
Archivo: backend/app/routers/facturacion/client_balances.py
Actualización: 2026-09-08 — API exclusiva de Saldos del cliente.
Función: listar y registrar créditos/deudas firmados sin mezclar la lógica de facturas con la interfaz.
Trabaja con: ClientBalance, Client, Invoice y frontend/src/modules/clientes/editor/billing/ClientBillingBalances.jsx.
"""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.client import Client
from app.models.client_balance import ClientBalance
from app.models.invoice import Invoice
from app.routers.clientes.router import _get_visible_client
from app.routers.facturacion.balances import balance_total, create_balance_entry

router = APIRouter(prefix="/clients", tags=["Saldos de clientes"], dependencies=[Depends(get_current_user)])


class ClientBalanceIn(BaseModel):
    amount: float = Field(..., description="Positivo = saldo a favor; negativo = deuda")
    description: str = ""
    source_invoice_id: Optional[str] = None


async def _serialize_rows(db: AsyncSession, rows: list[ClientBalance]) -> list[dict]:
    invoice_ids = {row.source_invoice_id for row in rows if row.source_invoice_id}
    invoice_ids.update(row.target_invoice_id for row in rows if row.target_invoice_id)
    invoice_map = {}
    if invoice_ids:
        invoices = (await db.execute(select(Invoice).where(Invoice.id.in_(invoice_ids)))).scalars().all()
        invoice_map = {invoice.id: invoice.invoice_number for invoice in invoices}
    return [
        row.to_dict(
            source_number=invoice_map.get(row.source_invoice_id),
            target_number=invoice_map.get(row.target_invoice_id),
        )
        for row in rows
    ]


@router.get("/{client_id}/balances")
async def list_client_balances(
    client_id: str,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    await _get_visible_client(db, client_id, current_user)
    query = select(ClientBalance).where(ClientBalance.client_id == client_id)
    if search:
        like = f"%{search.strip()}%"
        query = query.where(ClientBalance.description.ilike(like))
    rows = (await db.execute(query.order_by(ClientBalance.created_at.desc(), ClientBalance.id.desc()))).scalars().all()
    total = await balance_total(db, client_id)
    return {
        "total": total,
        "credit": max(total, 0),
        "debt": abs(min(total, 0)),
        "rows": await _serialize_rows(db, rows),
    }


@router.post("/{client_id}/balances")
async def add_client_balance(
    client_id: str,
    data: ClientBalanceIn,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    client = await _get_visible_client(db, client_id, current_user)
    amount = round(float(data.amount), 2)
    if amount == 0:
        raise HTTPException(status_code=422, detail="El monto no puede ser cero.")
    if not data.description.strip():
        raise HTTPException(status_code=422, detail="Ingresa una descripción para el saldo.")
    if data.source_invoice_id:
        source = await db.get(Invoice, data.source_invoice_id)
        if not source or source.client_id != client.id:
            raise HTTPException(status_code=422, detail="La factura de origen no pertenece al cliente.")
    operator = current_user.get("name") or current_user.get("username") or "Sistema"
    entry = await create_balance_entry(
        db,
        client,
        amount,
        data.description,
        operator_name=operator,
        source_invoice_id=data.source_invoice_id,
    )
    await db.commit()
    rows = await _serialize_rows(db, [entry])
    return {"message": "Saldo registrado correctamente.", "balance": round(await balance_total(db, client.id), 2), "entry": rows[0]}
