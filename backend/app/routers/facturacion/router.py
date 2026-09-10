"""
Archivo: backend/app/routers/facturacion/router.py
Actualización: 2026-09-10 — mantiene consistencia de pagos/reactivación y usa zona horaria de negocio.
Función: Facturación y cobros: listar/crear facturas, facturación masiva mensual, marcar vencidas y pagos,
         manteniendo cada recibo asociado al cliente y aplicando créditos/deudas del libro mayor.
Trabaja con: invoice.py, client.py, client_service.py, client_balance.py, client_activity.py,
             backend/app/routers/facturacion/balances.py, frontend/src/modules/clientes/editor/billing/ClientBilling.jsx
"""
import calendar
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db, now_iso
from app.core.security import get_current_user
from app.core.utils import business_now, business_today, correlative, current_period, get_or_404
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


def _billing_dates(client: Client, now: datetime) -> tuple[str, str, str]:
    """Calcula emisión y vencimiento usando el día 1-30 configurado en el abonado."""
    billing_day = min(max(int(client.billing_day or 5), 1), 30)
    due_day = min(billing_day, calendar.monthrange(now.year, now.month)[1])
    due = now.replace(day=due_day, hour=0, minute=0, second=0, microsecond=0)
    if due < now.replace(hour=0, minute=0, second=0, microsecond=0):
        if due.month == 12:
            year, month = due.year + 1, 1
        else:
            year, month = due.year, due.month + 1
        due_day = min(billing_day, calendar.monthrange(year, month)[1])
        due = due.replace(year=year, month=month, day=due_day)
    lead = max(int(client.invoice_lead_days or 0), 0)
    issue = due - timedelta(days=lead)
    return issue.strftime("%Y-%m-%d"), due.strftime("%Y-%m-%d"), due.strftime("%Y-%m")


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
    now = business_now()
    default_issue, default_due, _ = _billing_dates(c, now)
    inv = Invoice(invoice_number=data.invoice_number or correlative("REC"), client_id=c.id, service_id=service.id if service else None, client_name=c.full_name, client_dni_ruc=c.dni_ruc, client_address=c.address, client_phone=c.phone, plan_name=data.plan_name or (service.plan_name if service else c.plan_name), amount=data.amount if data.amount is not None else (service.plan_price if service else c.plan_price), month_period=data.month_period or current_period(), issue_date=data.issue_date or default_issue, due_date=data.due_date or default_due, status=data.status, notes=data.notes)
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
    reactivation_warning = ""
    c = await db.get(Client, inv.client_id)
    if c:
        remaining_invoices = await _refresh_balance(db, c)
        if not remaining_invoices and c.status == "suspended":
            s = await db.get(Setting, "system_config")
            rtr = await db.get(Router, c.router_id) if c.router_id else None
            mikrotik = await mt.restore_client(c, rtr, (s.data or {}).get("mikrotik_cut_list") or "morosos")
            if mikrotik.get("ok"):
                c.status, c.is_online, c.last_connection_time = "active", True, now_iso()
            else:
                # El pago es un hecho financiero y se conserva. El cliente permanece suspendido
                # hasta que MikroTik confirme la restauración para no mentir sobre su estado.
                c.status, c.is_online = "suspended", False
                reactivation_warning = f"Pago registrado, pero MikroTik no pudo reactivar el servicio: {mikrotik.get('message', 'error desconocido')}"
        _activity(db, c.id, "Pago registrado", f"Se registró pago en {inv.invoice_number}. Monto pagado en esta operación: S/. {float(data.amount):.2f}. Método: {data.payment_method}. Referencia: {inv.operation_reference}. Pagado acumulado: S/. {new_paid:.2f} de S/. {float(inv.amount or 0):.2f}. Estado resultante: {inv.status}.{' ' + reactivation_warning if reactivation_warning else ''}", current_user)

    await db.commit()
    message = "Pago registrado exitosamente. Recibo emitido."
    if reactivation_warning:
        message += " El servicio continúa suspendido porque la reactivación en MikroTik no fue confirmada."
    return {"message": message, "invoice": (await _decorate_invoices(db, [inv]))[0], "mikrotik": mikrotik, "reactivation_warning": reactivation_warning}


@router.post("/invoices/mass-generate")
async def mass_generate(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    now = business_now()
    clients = (await db.execute(select(Client).where(Client.status != "canceled"))).scalars().all()
    count = 0
    auto_paid = 0
    periods = []
    for c in clients:
        if c.status == "paused":
            continue
        issue_date, due_date, period = _billing_dates(c, now)
        exists = (await db.execute(select(func.count()).select_from(Invoice).where(Invoice.client_id == c.id, Invoice.month_period == period, Invoice.service_id.is_(None)))).scalar()
        if exists or not c.plan_price:
            continue
        inv = Invoice(invoice_number=correlative("REC"), client_id=c.id, service_id=None, client_name=c.full_name, client_dni_ruc=c.dni_ruc, client_address=c.address, client_phone=c.phone, plan_name=c.plan_name, amount=c.plan_price, month_period=period, issue_date=issue_date, due_date=due_date, status="unpaid", notes=f"Factura mensual periodo {period} - Servicio 1")
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
        detail = f"Se generó automáticamente la factura mensual {inv.invoice_number}. Período: {period}. Monto base: S/. {float(c.plan_price or 0):.2f}. Emisión: {inv.issue_date}. Vencimiento: {inv.due_date}. Anticipación configurada: {int(c.invoice_lead_days or 0)} día(s)."
        if applied["credit_applied"] > 0:
            detail += f" Saldo a favor aplicado: S/. {float(applied['credit_applied']):.2f}."
        if applied["debt_added"] > 0:
            detail += f" Deuda trasladada: S/. {float(applied['debt_added']):.2f}."
        _activity(db, c.id, "Factura mensual generada", detail, current_user)
        count += 1
        periods.append(period)
    await db.commit()
    period_label = periods[0] if periods and len(set(periods)) == 1 else current_period()
    return {"message": f"Se han generado {count} facturas para el periodo {period_label}", "period": period_label, "count": count, "auto_paid": auto_paid}


@router.post("/invoices/mark-overdue")
async def mark_overdue(db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    rows = (await db.execute(select(Invoice).where(Invoice.status == "unpaid"))).scalars().all()
    today_value = business_today()
    affected = 0
    grace_values = []
    for invoice in rows:
        client = await db.get(Client, invoice.client_id)
        if client and client.status == "paused":
            continue
        grace = max(0, int(client.grace_days or 0)) if client else 0
        try:
            due = datetime.strptime(invoice.due_date, "%Y-%m-%d").date()
        except (TypeError, ValueError):
            continue
        overdue_limit = due + timedelta(days=grace)
        if today_value <= overdue_limit:
            continue
        invoice.status = "overdue"
        affected += 1
        grace_values.append(grace)
        _activity(db, invoice.client_id, "Factura vencida", f"La factura {invoice.invoice_number} pasó a estado VENCIDA. Monto pendiente: S/. {max(0.0, float(invoice.amount or 0) - float(invoice.paid_amount or 0)):.2f}. Fecha de vencimiento: {invoice.due_date}. Días de gracia configurados para el abonado: {grace}.", current_user)
    await db.commit()
    return {"message": f"{affected} facturas marcadas como vencidas respetando la gracia configurada por abonado", "count": affected, "grace_days_used": sorted(set(grace_values))}
