"""
Archivo: backend/app/routers/facturacion/client_balances.py
Actualización: 2026-09-08 — auditoría detallada de altas y ediciones de saldos.
Función: listar, registrar y editar créditos/deudas firmados sin permitir que un ajuste nuevo aumente por encima del monto registrado.
Trabaja con: ClientBalance, Client, Invoice, ClientActivity y frontend/src/modules/clientes/editor/billing/ClientBillingBalances.jsx.
"""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.client import Client
from app.models.client_activity import ClientActivity
from app.models.client_balance import ClientBalance
from app.models.invoice import Invoice
from app.routers.clientes.router import _get_visible_client
from app.routers.facturacion.balances import balance_total, create_balance_entry

router = APIRouter(prefix="/clients", tags=["Saldos de clientes"], dependencies=[Depends(get_current_user)])


class ClientBalanceIn(BaseModel):
    amount: float = Field(..., description="Positivo = saldo a favor; negativo = deuda")
    description: str = ""
    source_invoice_id: Optional[str] = None


class ClientBalanceUpdate(BaseModel):
    amount: Optional[float] = Field(None, description="Nuevo monto; solo editable antes de aplicar el movimiento")
    description: Optional[str] = None


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


def _operator(user: dict) -> tuple[str, str]:
    name = user.get("name") or user.get("username") or user.get("email") or "Sistema"
    account = user.get("email") or user.get("username") or name
    role = user.get("role") or "sin rol"
    return name, f"Cuenta: {account} | Rol: {role}"


def _activity(db: AsyncSession, client_id: str, action: str, detail: str, user: dict):
    operator, identity = _operator(user)
    db.add(ClientActivity(client_id=client_id, action=action, detail=f"{detail} | {identity}", operator_name=operator))


@router.get("/{client_id}/balances")
async def list_client_balances(client_id: str, search: Optional[str] = None, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    await _get_visible_client(db, client_id, current_user)
    query = select(ClientBalance).where(ClientBalance.client_id == client_id)
    if search:
        like = f"%{search.strip()}%"
        query = query.where(ClientBalance.description.ilike(like))
    rows = (await db.execute(query.order_by(ClientBalance.created_at.desc(), ClientBalance.id.desc()))).scalars().all()
    total = await balance_total(db, client_id)
    return {"total": total, "credit": max(total, 0), "debt": abs(min(total, 0)), "rows": await _serialize_rows(db, rows)}


@router.post("/{client_id}/balances")
async def add_client_balance(client_id: str, data: ClientBalanceIn, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
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
    operator, _ = _operator(current_user)
    entry = await create_balance_entry(db, client, amount, data.description, operator_name=operator, source_invoice_id=data.source_invoice_id)
    new_total = round(await balance_total(db, client.id), 2)
    movement_type = "saldo a favor" if amount > 0 else "deuda"
    source_detail = ""
    if data.source_invoice_id:
        source = await db.get(Invoice, data.source_invoice_id)
        source_detail = f" | Factura origen: {source.invoice_number if source else data.source_invoice_id}"
    _activity(db, client.id, "Saldo agregado", f"Se agregó {movement_type} por S/. {abs(amount):.2f}. Descripción: {data.description.strip()}. Saldo neto resultante: S/. {new_total:.2f}{source_detail}", current_user)
    await db.commit()
    rows = await _serialize_rows(db, [entry])
    return {"message": "Saldo registrado correctamente.", "balance": new_total, "entry": rows[0]}


@router.put("/{client_id}/balances/{balance_id}")
async def update_client_balance(client_id: str, balance_id: str, data: ClientBalanceUpdate, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    client = await _get_visible_client(db, client_id, current_user)
    entry = await db.get(ClientBalance, balance_id)
    if not entry or entry.client_id != client.id:
        raise HTTPException(status_code=404, detail="Movimiento de saldo no encontrado.")

    old_amount = round(float(entry.amount or 0), 2)
    old_description = entry.description or ""
    if data.description is not None:
        description = data.description.strip()
        if not description:
            raise HTTPException(status_code=422, detail="La descripción no puede quedar vacía.")
        entry.description = description

    if data.amount is not None:
        new_amount = round(float(data.amount), 2)
        original = old_amount
        remaining = round(float(entry.remaining_amount or 0), 2)
        if entry.parent_id or abs(remaining - original) >= 0.005:
            raise HTTPException(status_code=409, detail="El monto ya fue aplicado a una factura y no puede modificarse. Puedes editar la descripción.")
        if new_amount == 0:
            entry.amount = 0
            entry.remaining_amount = 0
        else:
            if (original > 0 and new_amount < 0) or (original < 0 and new_amount > 0):
                raise HTTPException(status_code=422, detail=f"No puedes cambiar el tipo de saldo. Conserva {'saldo a favor' if original > 0 else 'deuda'}.")
            if abs(new_amount) > abs(original) + 0.005:
                raise HTTPException(status_code=422, detail=f"No es posible. El monto máximo a editar es S/. {abs(original):.2f}.")
            entry.amount = new_amount
            entry.remaining_amount = new_amount

    operator, identity = _operator(current_user)
    entry.operator_name = operator
    changes = []
    if data.amount is not None and old_amount != round(float(entry.amount or 0), 2):
        changes.append(f"monto: S/. {old_amount:.2f} → S/. {float(entry.amount or 0):.2f}")
    if data.description is not None and old_description != entry.description:
        changes.append(f"descripción: '{old_description}' → '{entry.description}'")
    if not changes:
        changes.append("se guardó el movimiento sin cambios de importe ni descripción")
    new_total = round(await balance_total(db, client.id), 2)
    _activity(db, client.id, "Saldo editado", f"Se modificó el movimiento {entry.id[:8]}. {'; '.join(changes)}. Saldo neto resultante: S/. {new_total:.2f} | {identity}", current_user)
    await db.commit()
    rows = await _serialize_rows(db, [entry])
    return {"message": "Saldo actualizado correctamente.", "balance": new_total, "entry": rows[0]}
