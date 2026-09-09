"""
Archivo: backend/app/routers/facturacion/invoice_actions.py
Actualización: 2026-09-09 — identidad de documentos alineada con Z-Hub.
Función: operaciones seguras sobre facturas individuales sin borrar facturas pagadas y manteniendo actualizado el resumen del cliente.
Trabaja con: invoice.py, client.py, client_service.py, client_activity.py y Billing.jsx.
"""
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.invoice import Invoice
from app.models.client import Client
from app.models.client_activity import ClientActivity
from app.models.client_service import ClientService

router = APIRouter(tags=["Acciones de facturas"])
class InvoiceUpdateIn(BaseModel):
    plan_name: Optional[str] = None
    amount: Optional[float] = None
    month_period: Optional[str] = None
    issue_date: Optional[str] = None
    due_date: Optional[str] = None
    notes: Optional[str] = None
async def _invoice(db: AsyncSession, invoice_id: str) -> Invoice:
    row = await db.get(Invoice, invoice_id)
    if not row: raise HTTPException(404, "Factura no encontrada")
    return row
async def _refresh_client_balance(db: AsyncSession, client_id: str):
    client = await db.get(Client, client_id)
    if not client: return
    unpaid = (await db.execute(select(Invoice).where(Invoice.client_id == client_id, Invoice.status.in_(["unpaid", "overdue"])))) .scalars().all()
    client.unpaid_invoices_count = len(unpaid)
    client.balance_due = round(sum(float(x.amount or 0) - float(x.paid_amount or 0) for x in unpaid), 2)
def _activity(db: AsyncSession, client_id: str, action: str, detail: str, user: dict):
    name = user.get("name") or user.get("username") or user.get("email") or "Sistema"
    account = user.get("email") or user.get("username") or name
    role = user.get("role") or "sin rol"
    db.add(ClientActivity(client_id=client_id, action=action, detail=f"{detail} | Cuenta: {account} | Rol: {role}", operator_name=name))
@router.put("/invoices/{invoice_id}")
async def update_invoice(invoice_id: str, data: InvoiceUpdateIn, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    inv = await _invoice(db, invoice_id)
    if inv.status == "paid": raise HTTPException(409, "Las facturas pagadas están protegidas y no se pueden editar.")
    if inv.status == "canceled": raise HTTPException(409, "Una factura anulada no se puede editar.")
    if data.amount is not None and data.amount <= 0: raise HTTPException(422, "El monto debe ser mayor que cero.")
    before = {field: getattr(inv, field) for field in ("plan_name", "amount", "month_period", "issue_date", "due_date", "notes")}
    for field in before:
        value = getattr(data, field)
        if value is not None: setattr(inv, field, value)
    await _refresh_client_balance(db, inv.client_id)
    changes = []
    for field, old in before.items():
        new = getattr(inv, field)
        if old != new:
            label = {"plan_name":"plan", "amount":"monto", "month_period":"período", "issue_date":"fecha de emisión", "due_date":"vencimiento", "notes":"observaciones"}[field]
            changes.append(f"{label}: '{old}' → '{new}'")
    if not changes: changes.append("sin cambios detectados")
    _activity(db, inv.client_id, "Factura editada", f"Factura {inv.invoice_number}. {'; '.join(changes)}.", current_user)
    await db.commit(); await db.refresh(inv); return inv.to_dict()
@router.delete("/invoices/{invoice_id}/permanent")
async def delete_invoice(invoice_id: str, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    inv = await _invoice(db, invoice_id)
    if inv.status == "paid" or float(inv.paid_amount or 0) > 0: raise HTTPException(409, "Protección activa: las facturas pagadas o con pagos registrados no se pueden eliminar.")
    client_id, number, amount, period = inv.client_id, inv.invoice_number, float(inv.amount or 0), inv.month_period or ""
    _activity(db, client_id, "Factura eliminada", f"Se eliminó definitivamente la factura {number}. Monto: S/. {amount:.2f}. Período: {period}.", current_user)
    await db.delete(inv); await db.flush(); await _refresh_client_balance(db, client_id); await db.commit()
    return {"message": "Factura eliminada definitivamente", "client_id": client_id}
@router.post("/invoices/{invoice_id}/annul")
async def annul_invoice(invoice_id: str, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    inv = await _invoice(db, invoice_id)
    if inv.status == "paid" or float(inv.paid_amount or 0) > 0: raise HTTPException(409, "Las facturas pagadas o con pagos registrados están protegidas y no se pueden anular.")
    if inv.status == "canceled": return {"message": "La factura ya estaba anulada", "invoice": inv.to_dict()}
    inv.status = "canceled"; await _refresh_client_balance(db, inv.client_id)
    _activity(db, inv.client_id, "Factura anulada", f"Se anuló la factura {inv.invoice_number}. Monto: S/. {float(inv.amount or 0):.2f}. Período: {inv.month_period or '—'}.", current_user)
    await db.commit(); await db.refresh(inv)
    return {"message": "Factura anulada correctamente", "invoice": inv.to_dict()}
@router.get("/invoices/{invoice_id}/pdf", response_class=HTMLResponse)
async def invoice_pdf(invoice_id: str, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    inv = await _invoice(db, invoice_id)
    service = await db.get(ClientService, inv.service_id) if inv.service_id else None
    service_label = inv.service_label or (f"Servicio adicional · {service.plan_name}" if service else "Servicio 1 · Principal")
    def esc(value):
        import html
        return html.escape(str(value or ""))
    paid = float(inv.paid_amount or 0); balance = max(0, float(inv.amount or 0) - paid)
    body = f"""<!doctype html><html><head><meta charset='utf-8'><title>{esc(inv.invoice_number)}</title><style>body{{font-family:Arial,sans-serif;background:#f3f4f6;margin:0;padding:30px;color:#111827}}.sheet{{max-width:760px;margin:auto;background:white;padding:38px;border-radius:12px;box-shadow:0 2px 12px #0001}}h1{{margin:0 0 4px}}.muted{{color:#6b7280}}.grid{{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:24px 0}}.box{{border:1px solid #e5e7eb;padding:12px;border-radius:8px}}.total{{font-size:20px;font-weight:700;text-align:right;margin-top:20px}}button{{padding:10px 16px;border:0;border-radius:8px;background:#0891b2;color:white;font-weight:700;cursor:pointer}}@media print{{body{{background:white;padding:0}}.sheet{{box-shadow:none;max-width:none}}button{{display:none}}}}</style></head><body><main class='sheet'><button onclick='window.print()'>Imprimir / Guardar como PDF</button><h1>FACTURA {esc(inv.invoice_number)}</h1><div class='muted'>Z-Hub · Documento de cobranza</div><div class='grid'><div class='box'><b>Cliente</b><br>{esc(inv.client_name)}<br>DNI/RUC: {esc(inv.client_dni_ruc)}<br>{esc(inv.client_address)}<br>{esc(inv.client_phone)}</div><div class='box'><b>Servicio asociado</b><br>{esc(service_label)}<br>Plan: {esc(inv.plan_name)}<br>Período: {esc(inv.month_period)}<br>Emisión: {esc(inv.issue_date)}<br>Vencimiento: {esc(inv.due_date)}</div></div><div class='box'><b>Detalle</b><br>{esc(inv.notes)}</div><div class='total'>Total: S/. {float(inv.amount or 0):.2f}<br><span class='muted'>Pagado: S/. {paid:.2f} · Saldo: S/. {balance:.2f}</span></div><p class='muted'>Estado: {esc(inv.status)}</p></main></body></html>"""
    return HTMLResponse(body)
@router.post("/invoices/{invoice_id}/send")
async def invoice_send(invoice_id: str, channel: str, db: AsyncSession = Depends(get_db), current_user: dict = Depends(get_current_user)):
    inv = await _invoice(db, invoice_id)
    if channel not in {"email", "whatsapp"}: raise HTTPException(422, "Canal no válido. Use email o whatsapp.")
    if channel == "email" and not (inv.client_phone or inv.client_name): raise HTTPException(422, "La factura no tiene datos del cliente para preparar el envío.")
    _activity(db, inv.client_id, "Factura preparada para envío", f"Factura {inv.invoice_number} preparada para canal {channel.upper()}.", current_user)
    await db.commit()
    return {"ok": True, "channel": channel, "invoice_number": inv.invoice_number, "recipient": inv.client_phone if channel == "whatsapp" else "", "message": f"Factura {inv.invoice_number} lista para enviar por {channel}."}
