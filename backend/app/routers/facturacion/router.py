"""
Archivo: backend/app/routers/facturacion/router.py
Actualización: 2026-09-08 — liga facturas a servicios específicos del cliente y expone el servicio en consultas.
Función: Facturación y cobros: listar/crear facturas, facturación masiva mensual, marcar vencidas y pagos,
         manteniendo cada recibo asociado al cliente y, cuando corresponde, al servicio principal o adicional.
Trabaja con: backend/app/models/invoice.py, client.py, client_service.py, router.py, setting.py,
             backend/app/integrations/mikrotik/service.py, frontend/src/modules/facturacion/Billing.jsx,
             frontend/src/modules/clientes/editor/ClientBilling.jsx
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
from app.models.client_service import ClientService
from app.models.invoice import Invoice
from app.models.router import Router
from app.models.setting import Setting
from app.routers.facturacion.schemas import InvoiceIn, PaymentIn

router = APIRouter(tags=["Facturación"], dependencies=[Depends(get_current_user)])

async def _refresh_balance(db: AsyncSession, client: Client):
    unpaid = (await db.execute(select(Invoice).where(Invoice.client_id == client.id, Invoice.status.in_(["unpaid", "overdue"])))).scalars().all()
    client.unpaid_invoices_count = len(unpaid)
    client.balance_due = round(sum(i.amount for i in unpaid), 2)
    return unpaid

async def _service_labels(db: AsyncSession, client_ids: set[str]) -> dict[tuple[str, str], str]:
    if not client_ids: return {}
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
    if status and status != "all": q = q.where(Invoice.status == status)
    if search:
        like = f"%{search}%"
        q = q.where(or_(Invoice.invoice_number.ilike(like), Invoice.client_name.ilike(like), Invoice.client_dni_ruc.ilike(like), Invoice.month_period.ilike(like)))
    rows = (await db.execute(q.order_by(Invoice.issue_date.desc(), Invoice.invoice_number.desc()))).scalars().all()
    return await _decorate_invoices(db, rows)

@router.post("/invoices")
async def create_invoice(data: InvoiceIn, db: AsyncSession = Depends(get_db)):
    c = await get_or_404(db, Client, data.client_id, "Cliente")
    service = None
    if data.service_id and data.service_id != "primary":
        service = await db.get(ClientService, data.service_id)
        if not service or service.client_id != c.id:
            raise HTTPException(status_code=422, detail="El servicio seleccionado no pertenece al cliente.")
    now = datetime.now(timezone.utc)
    inv = Invoice(invoice_number=data.invoice_number or correlative("REC"), client_id=c.id,
                  service_id=service.id if service else None, client_name=c.full_name, client_dni_ruc=c.dni_ruc,
                  client_address=c.address, client_phone=c.phone,
                  plan_name=data.plan_name or (service.plan_name if service else c.plan_name),
                  amount=data.amount if data.amount is not None else (service.plan_price if service else c.plan_price),
                  month_period=data.month_period or current_period(), issue_date=data.issue_date or now.strftime("%Y-%m-%d"),
                  due_date=data.due_date or (now + timedelta(days=10)).strftime("%Y-%m-%d"), status=data.status, notes=data.notes)
    db.add(inv); await db.flush(); await _refresh_balance(db, c); await db.commit()
    return (await _decorate_invoices(db, [inv]))[0]

@router.delete("/invoices/{invoice_id}")
async def cancel_invoice(invoice_id: str, db: AsyncSession = Depends(get_db)):
    inv = await get_or_404(db, Invoice, invoice_id, "Factura")
    inv.status = "canceled"
    c = await db.get(Client, inv.client_id)
    if c: await _refresh_balance(db, c)
    await db.commit()
    return {"message": "Factura anulada"}

@router.post("/payments")
async def register_payment(data: PaymentIn, current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    inv = await get_or_404(db, Invoice, data.invoice_id, "Factura")
    if inv.status == "paid": raise HTTPException(status_code=400, detail="La factura ya está pagada")
    if data.amount <= 0: raise HTTPException(status_code=400, detail="El monto del pago debe ser mayor que cero")
    if data.amount > inv.amount: raise HTTPException(status_code=400, detail="El pago no puede superar el monto de la factura")
    inv.status = "paid" if data.amount >= inv.amount else "unpaid"
    inv.paid_amount = data.amount; inv.payment_date = now_iso(); inv.payment_method = data.payment_method
    inv.operation_reference = data.operation_reference or correlative("OP"); inv.operator_name = current_user.get("name", ""); inv.notes = data.notes or inv.notes
    mikrotik = None; c = await db.get(Client, inv.client_id)
    if c:
        remaining = await _refresh_balance(db, c)
        if not remaining and c.status == "suspended":
            c.status, c.is_online, c.last_connection_time = "active", True, now_iso()
            s = await db.get(Setting, "system_config"); rtr = await db.get(Router, c.router_id) if c.router_id else None
            mikrotik = await mt.restore_client(c, rtr, (s.data or {}).get("mikrotik_cut_list") or "morosos")
    await db.commit()
    return {"message": "Pago registrado exitosamente. Recibo emitido.", "invoice": (await _decorate_invoices(db, [inv]))[0], "mikrotik": mikrotik}

@router.post("/invoices/mass-generate")
async def mass_generate(db: AsyncSession = Depends(get_db)):
    period = current_period(); now = datetime.now(timezone.utc)
    clients = (await db.execute(select(Client).where(Client.status != "canceled"))).scalars().all(); count = 0
    for c in clients:
        exists = (await db.execute(select(func.count()).select_from(Invoice).where(Invoice.client_id == c.id, Invoice.month_period == period, Invoice.service_id.is_(None)))).scalar()
        if exists or not c.plan_price: continue
        due = now.replace(day=min(max(c.billing_day, 1), 28)) + timedelta(days=5)
        db.add(Invoice(invoice_number=correlative("REC"), client_id=c.id, service_id=None, client_name=c.full_name, client_dni_ruc=c.dni_ruc,
                       client_address=c.address, client_phone=c.phone, plan_name=c.plan_name, amount=c.plan_price,
                       month_period=period, issue_date=now.strftime("%Y-%m-%d"), due_date=due.strftime("%Y-%m-%d"),
                       status="unpaid", notes=f"Factura mensual periodo {period} - Servicio 1"))
        await db.flush(); await _refresh_balance(db, c); count += 1
    await db.commit(); return {"message": f"Se han generado {count} facturas para el periodo {period}", "period": period, "count": count}

@router.post("/invoices/mark-overdue")
async def mark_overdue(db: AsyncSession = Depends(get_db)):
    s = await db.get(Setting, "system_config"); data = (s.data or {}) if s else {}
    grace = int(data.get("billing_grace_days", data.get("grace_days", 3)) or 0)
    limit = (datetime.now(timezone.utc) - timedelta(days=grace)).strftime("%Y-%m-%d")
    rows = (await db.execute(select(Invoice).where(Invoice.status == "unpaid", Invoice.due_date < limit))).scalars().all()
    for i in rows: i.status = "overdue"
    await db.commit(); return {"message": f"{len(rows)} facturas marcadas como vencidas (gracia {grace} días)", "count": len(rows)}
