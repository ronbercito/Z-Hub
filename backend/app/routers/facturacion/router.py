"""
Archivo: backend/app/routers/facturacion/router.py
Actualización: 2026-09-08 — auditoría detallada de creación de facturas, pagos y facturación automática.
Función: Facturación y cobros: listar/crear facturas, facturación masiva mensual, marcar vencidas y pagos,
         manteniendo cada recibo asociado al cliente y aplicando créditos/deudas del libro mayor.
Trabaja con: invoice.py, client.py, client_service.py, client_balance.py, client_activity.py,
             backend/app/routers/facturacion/balances.py, frontend/src/modules/clientes/editor/billing/ClientBilling.jsx
"""
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db, now_iso
from app.core.security import get_current_user
from app.core.utils import correlative, current_period, get_or_404
from app.integrations.mikrotik import service as mt
from app.models.client import Client
from app.models.client_activity import ClientActivity
from app.models.client_service import ClientService
from app.models.invoice import Invoice
from app.models.router import Router
from app.models.setting import Setting
from app.routers.facturacion.balances import apply_balances_to_invoice
from app.routers.facturacion.schemas import InvoiceIn, PaymentIn

router = APIRouter(tags=["Facturación"], dependencies=[Depends(get_current_user)])


async def _refresh_balance(db: AsyncSession, client: Client):
    unpaid = (await db.execute(select(Invoice).where(Invoice.client_id == client.id, Invoice.status.in_(["unpaid", "overdue"])))) .scalars().all()
    pending = [i for i in unpaid if max(0.0, float(i.amount or 0) - float(i.paid_amount or 0)) > 0.005]
    client.unpaid_invoices_count = len(pending)
    client.balance_due = round(sum(max(0.0, float(i.amount or 0) - float(i.paid_amount or 0)) for i in pending), 2)
    return pending


def _activity(db: AsyncSession, client_id: str, action: str, detail: str, user: dict | None = None):
    user = user or {}
    name = user.get("name") or user.get("username") or user.get("email") or "Sistema"
    account = user.get("email") or user.get("username") or name
    role = user.get("role") or "sin rol"
    db.add(ClientActivity(client_id=client_id, action=action, detail=f"{detail} | Cuenta: {account} | Rol: {role}", operator_name=name))


async def _service_labels(db: AsyncSession, client_ids: set[str]) -> dict[tuple[str, str], str]:
    if not client_ids:
        return {}
    rows = (await db.execute(select(ClientService).where(ClientService.client_id.in_(client_ids)).order_by(ClientService.client_id.asc(), ClientService.created_at.asc(), ClientService.id.asc()))).scalars().all()
    labels, counters = {}, {}
    for row in rows:
        counters[row.client_id] = counters.get(row.client_id, 1) + 1
        labels[(row.client_id, row.id)] = f"Servicio {counters[row.client_id]}"
    return labels


async def _decorate_invoices(db: AsyncSession, rows: list[Invoice]) -> list[dict]:
    labels = await _service_labels(db, {row.client_id for row in rows})
    result = []
    for row in rows:
        item = row.to_dict()
        item["service_label"] = labels.get((row.client_id, row.service_id), "Servicio 1") if row.service_id else "Servicio 1"
        item["service_type"] = "adicional" if row.service_id else "principal"
        result.append(item)
    return result


@router.get("/invoices")
async def list_invoices(status: Optional[str] = None, search: Optional[str] = None, db: AsyncSession = Depends(get_db)):
    q = select(Invoice)
    if status and status != "all":
        q = q.where(Invoice.status == status)
    if search:
        like = f"%{search}%"
        q = q.where(or_(Invoice.invoice_number.ilike(like), Invoice.client_name.ilike(like), Invoice.client_dni_ruc.ilike(like), Invoice.month_period.ilike(like)))
    rows = (await db.execute(q.order_by(Invoice.issue_date.desc(), Invoice.invoice_number.desc()))).scalars().all()
    return await _decorate_invoices(db, rows)


@router.post("/invoices")
async def create_invoice(data: InvoiceIn, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    c = await get_or_404(db, Client, data.client_id, "Cliente")
    service = None
    if data.service_id and data.service_id != "primary":
        service = await db.get(ClientService, data.service_id)
        if not service or service.client_id != c.id:
            raise HTTPException(status_code=422, detail="El servicio seleccionado no pertenece al cliente.")
    now = datetime.now(timezone.utc)
    inv = Invoice(invoice_number=data.invoice_number or correlative("REC"), client_id=c.id, service_id=service.id if service else None, client_name=c.full_name, client_dni_ruc=c.dni_ruc, client_address=c.address, client_phone=c.phone, plan_name=data.plan_name or (service.plan_name if service else c.plan_name), amount=data.amount if data.amount is not None else (service.plan_price if service else c.plan_price), month_period=data.month_period or current_period(), issue_date=data.issue_date or now.strftime("%Y-%m-%d"), due_date=data.due_date or (now + timedelta(days=10)).strftime("%Y-%m-%d"), status=data.status, notes=data.notes)
    db.add(inv)
    await db.flush()
    operator = current_user.get("name") or current_user.get("username") or "Sistema"
    applied = await apply_balances_to_invoice(db, inv, operator_name=operator)
    if applied["credit_applied"] > 0:
        inv.payment_date = now_iso()
        inv.payment_method = "Saldo a favor"
        inv.operation_reference = correlative("SAL")
        inv.operator_name = operator
        inv.notes = f"{inv.notes or ''} | Pago automático con saldo a favor.".strip(" |")
    await _refresh_balance(db, c)
    detail = f"Se creó la factura {inv.invoice_number}. Tipo: {'Factura de servicio' if service else 'Factura libre'}. Plan: {inv.plan_name or '—'}. Monto base: S/. {float(data.amount if data.amount is not None else inv.amount or 0):.2f}. Período: {inv.month_period}. Vencimiento: {inv.due_date}."
    if service:
        detail += f" Servicio: {service.plan_name} ({service.id[:8]})."
    if applied["credit_applied"] > 0:
        detail += f" Se aplicó automáticamente saldo a favor por S/. {float(applied['credit_applied']):.2f}; pagado: S/. {float(inv.paid_amount or 0):.2f}."
    if applied["debt_added"] > 0:
        detail += f" Se trasladó deuda por S/. {float(applied['debt_added']):.2f}."
    _activity(db, c.id, "Factura creada", detail, current_user)
    await db.commit()
    return (await _decorate_invoices(db, [inv]))[0]


@router.delete("/invoices/{invoice_id}")
async def cancel_invoice(invoice_id: str, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    inv = await get_or_404(db, Invoice, invoice_id, "Factura")
    old_status = inv.status
    inv.status = "canceled"
    c = await db.get(Client, inv.client_id)
    if c:
        await _refresh_balance(db, c)
        _activity(db, c.id, "Factura anulada", f"Se anuló la factura {inv.invoice_number}. Monto: S/. {float(inv.amount or 0):.2f}. Estado anterior: {old_status}.", current_user)
    await db.commit()
    return {"message": "Factura anulada"}


@router.post("/payments")
async def register_payment(data: PaymentIn, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    inv = await get_or_404(db, Invoice, data.invoice_id, "Factura")
    if inv.status == "paid":
        raise HTTPException(status_code=400, detail="La factura ya está pagada")
    if data.amount <= 0:
        raise HTTPException(status_code=400, detail="El monto del pago debe ser mayor que cero")
    current_paid = float(inv.paid_amount or 0)
    remaining = max(0.0, float(inv.amount or 0) - current_paid)
    if data.amount > remaining + 0.005:
        raise HTTPException(status_code=400, detail="El pago no puede superar el saldo pendiente de la factura")
    new_paid = round(current_paid + float(data.amount), 2)
    inv.status = "paid" if new_paid >= float(inv.amount or 0) - 0.005 else "unpaid"
    inv.paid_amount = new_paid
    inv.payment_date = now_iso()
    inv.payment_method = data.payment_method
    inv.operation_reference = data.operation_reference or correlative("OP")
    inv.operator_name = current_user.get("name", "")
    inv.notes = data.notes or inv.notes
    mikrotik = None
    c = await db.get(Client, inv.client_id)
    if c:
        remaining_invoices = await _refresh_balance(db, c)
        if not remaining_invoices and c.status == "suspended":
            c.status, c.is_online, c.last_connection_time = "active", True, now_iso()
            s = await db.get(Setting, "system_config")
            rtr = await db.get(Router, c.router_id) if c.router_id else None
            mikrotik = await mt.restore_client(c, rtr, (s.data or {}).get("mikrotik_cut_list") or "morosos")
        _activity(db, c.id, "Pago registrado", f"Se registró pago en {inv.invoice_number}. Monto pagado en esta operación: S/. {float(data.amount):.2f}. Método: {data.payment_method}. Referencia: {inv.operation_reference}. Pagado acumulado: S/. {new_paid:.2f} de S/. {float(inv.amount or 0):.2f}. Estado resultante: {inv.status}.", current_user)
    await db.commit()
    return {"message": "Pago registrado exitosamente. Recibo emitido.", "invoice": (await _decorate_invoices(db, [inv]))[0], "mikrotik": mikrotik}


@router.post("/invoices/mass-generate")
async def mass_generate(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    period = current_period()
    now = datetime.now(timezone.utc)
    clients = (await db.execute(select(Client).where(Client.status != "canceled"))).scalars().all()
    count = 0
    auto_paid = 0
    for c in clients:
        exists = (await db.execute(select(func.count()).select_from(Invoice).where(Invoice.client_id == c.id, Invoice.month_period == period, Invoice.service_id.is_(None)))).scalar()
        if exists or not c.plan_price:
            continue
        due = now.replace(day=min(max(c.billing_day, 1), 28)) + timedelta(days=5)
        inv = Invoice(invoice_number=correlative("REC"), client_id=c.id, service_id=None, client_name=c.full_name, client_dni_ruc=c.dni_ruc, client_address=c.address, client_phone=c.phone, plan_name=c.plan_name, amount=c.plan_price, month_period=period, issue_date=now.strftime("%Y-%m-%d"), due_date=due.strftime("%Y-%m-%d"), status="unpaid", notes=f"Factura mensual periodo {period} - Servicio 1")
        db.add(inv)
        await db.flush()
        applied = await apply_balances_to_invoice(db, inv, operator_name="Sistema")
        if applied["credit_applied"] > 0:
            inv.payment_date = now_iso()
            inv.payment_method = "Saldo a favor"
            inv.operation_reference = correlative("SAL")
            inv.operator_name = "Sistema"
            inv.notes = f"{inv.notes} | Pago automático con saldo a favor."
            auto_paid += 1
        await _refresh_balance(db, c)
        detail = f"Se generó automáticamente la factura mensual {inv.invoice_number}. Período: {period}. Monto base: S/. {float(c.plan_price or 0):.2f}. Vencimiento: {inv.due_date}."
        if applied["credit_applied"] > 0:
            detail += f" Saldo a favor aplicado: S/. {float(applied['credit_applied']):.2f}."
        if applied["debt_added"] > 0:
            detail += f" Deuda trasladada: S/. {float(applied['debt_added']):.2f}."
        _activity(db, c.id, "Factura mensual generada", detail, current_user)
        count += 1
    await db.commit()
    return {"message": f"Se han generado {count} facturas para el periodo {period}", "period": period, "count": count, "auto_paid": auto_paid}


@router.post("/invoices/mark-overdue")
async def mark_overdue(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    s = await db.get(Setting, "system_config")
    data = (s.data or {}) if s else {}
    grace = int(data.get("billing_grace_days", data.get("grace_days", 3)) or 0)
    limit = (datetime.now(timezone.utc) - timedelta(days=grace)).strftime("%Y-%m-%d")
    rows = (await db.execute(select(Invoice).where(Invoice.status == "unpaid", Invoice.due_date < limit))).scalars().all()
    for i in rows:
        i.status = "overdue"
        _activity(db, i.client_id, "Factura vencida", f"La factura {i.invoice_number} pasó a estado VENCIDA. Monto pendiente: S/. {max(0.0, float(i.amount or 0) - float(i.paid_amount or 0)):.2f}. Fecha de vencimiento: {i.due_date}. Días de gracia configurados: {grace}.", current_user)
    await db.commit()
    return {"message": f"{len(rows)} facturas marcadas como vencidas (gracia {grace} días)", "count": len(rows)}
