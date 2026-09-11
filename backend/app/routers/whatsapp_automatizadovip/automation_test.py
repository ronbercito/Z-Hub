"""Pruebas manuales y seguras de las tres automatizaciones de AutomatizadoVIP."""
from __future__ import annotations
from datetime import date, datetime
from typing import Any, Literal
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.client import Client
from app.models.invoice import Invoice
from app.models.setting import Setting
from app.models.whatsapp_automatizadovip_log import WhatsAppAutomatizadoVIPLog
from app.services.whatsapp_automatizadovip import WhatsAppGatewayError, send_messages
from app.services.whatsapp_automatizadovip_automation import cut_warning, payment_confirmation, payment_reminder
from app.services.whatsapp_automatizadovip_templates import get_templates
router=APIRouter(prefix="/whatsapp/automatizadovip/automation-test",tags=["WhatsApp AutomatizadoVIP - pruebas"])
SETTINGS_KEY="whatsapp_automatizadovip"
DEFAULT_AUTOMATION={"enabled":False,"reminder_enabled":True,"reminder_days_before":3,"cut_warning_enabled":True,"payment_confirmation_enabled":True,"run_interval_minutes":30,"max_batch":50}
Kind=Literal["reminder","cut","payment"]
class TestInvoiceRequest(BaseModel):
    kind:Kind; invoice_id:str=Field(min_length=1); force_test:bool=False
def _root_config(setting:Setting|None)->dict[str,Any]:
    raw=((setting.data if setting else {}) or {}).get(SETTINGS_KEY) or {}; return {**raw,"automation":{**DEFAULT_AUTOMATION,**(raw.get("automation") or {})}}
def _parse_date(value:str|None)->date|None:
    text=str(value or "").strip()
    if not text:return None
    try:return datetime.fromisoformat(text.replace("Z","+00:00")).date()
    except ValueError:pass
    for fmt in ("%Y-%m-%d","%d/%m/%Y","%Y/%m/%d"):
        try:return datetime.strptime(text,fmt).date()
        except ValueError:continue
    return None
def _eligibility(kind,invoice,client,automation,today):
    due=_parse_date(invoice.due_date)
    if kind=="payment":
        paid_day=_parse_date(invoice.payment_date); eligible=invoice.status in {"paid","pagado"} and paid_day==today; return eligible,"Pago registrado hoy" if eligible else "La factura no tiene un pago registrado hoy",None
    if not due:return False,"La factura no tiene una fecha de vencimiento válida",None
    days=(due-today).days
    if kind=="reminder":
        configured=max(0,int(automation.get("reminder_days_before",3))); eligible=invoice.status in {"unpaid","pending"} and days==configured; return eligible,f"Cumple el recordatorio configurado a {configured} días" if eligible else f"Hoy faltan {days} días; la configuración requiere {configured}",days
    grace=max(0,int(client.grace_days or 0)); overdue=(today-due).days; eligible=invoice.status in {"unpaid","pending","overdue"} and due<today and overdue>=grace; return eligible,f"Cumple el aviso de corte: {overdue} días vencidos y {grace} días de gracia" if eligible else f"Tiene {overdue} días vencidos y {grace} días de gracia",days
def _message(kind,setting,client,invoice):
    data=(setting.data if setting else {}) or {}; templates=get_templates(data); company=data.get("company_name") or "su proveedor de internet"; yape=data.get("yape_number") or ""; phone=data.get("phone") or yape
    if kind=="reminder": return payment_reminder(templates["payment_reminder"]["text"].replace("{empresa}",company).replace("{yape}",yape),client.full_name,invoice.amount,invoice.plan_name or client.plan_name,invoice.due_date)
    if kind=="cut": return cut_warning(templates["cut_warning"]["text"].replace("{empresa}",company).replace("{telefono}",phone),client.full_name,invoice.amount)
    return payment_confirmation(templates["payment_confirmation"]["text"].replace("{empresa}",company),client.full_name,invoice.paid_amount or invoice.amount,invoice.invoice_number)
async def _load_test_data(db,data):
    setting=await db.get(Setting,"system_config"); cfg=_root_config(setting); invoice=await db.get(Invoice,data.invoice_id)
    if not invoice:raise HTTPException(status_code=404,detail="No se encontró la factura seleccionada")
    client=await db.get(Client,invoice.client_id)
    if not client:raise HTTPException(status_code=404,detail="No se encontró el cliente de la factura")
    if client.status=="retired":raise HTTPException(status_code=409,detail="El cliente está retirado")
    return setting,cfg,invoice,client
@router.get("/candidates")
async def candidates(kind:Kind=Query(...),limit:int=Query(default=50,ge=1,le=100),db:AsyncSession=Depends(get_db)):
    setting=await db.get(Setting,"system_config"); cfg=_root_config(setting); today=date.today(); query=select(Invoice).where(Invoice.status.in_(["paid","pagado"] if kind=="payment" else ["unpaid","pending","overdue"])).limit(500); invoices=(await db.execute(query)).scalars().all(); result=[]
    for invoice in invoices:
        client=await db.get(Client,invoice.client_id)
        if not client or client.status=="retired" or not(client.phone or invoice.client_phone):continue
        eligible,reason,days=_eligibility(kind,invoice,client,cfg["automation"],today)
        if kind=="reminder" and _parse_date(invoice.due_date) is None:continue
        result.append({"invoice_id":invoice.id,"invoice_number":invoice.invoice_number,"client_id":client.id,"client_name":client.full_name,"phone":client.phone or invoice.client_phone,"amount":invoice.amount,"paid_amount":invoice.paid_amount,"status":invoice.status,"due_date":invoice.due_date,"payment_date":invoice.payment_date,"days_remaining":days,"eligible":eligible,"reason":reason})
        if len(result)>=limit:break
    return {"kind":kind,"today":today.isoformat(),"configured_days_before":cfg["automation"].get("reminder_days_before",3),"items":result}
@router.post("/preview")
async def preview(data:TestInvoiceRequest,db:AsyncSession=Depends(get_db)):
    setting,cfg,invoice,client=await _load_test_data(db,data); eligible,reason,days=_eligibility(data.kind,invoice,client,cfg["automation"],date.today()); return {"kind":data.kind,"eligible":eligible,"reason":reason,"today":date.today().isoformat(),"days_remaining":days,"configured_days_before":cfg["automation"].get("reminder_days_before",3),"invoice":{"id":invoice.id,"number":invoice.invoice_number,"amount":invoice.amount,"status":invoice.status,"due_date":invoice.due_date,"payment_date":invoice.payment_date},"client":{"id":client.id,"name":client.full_name,"phone":client.phone or invoice.client_phone},"message":_message(data.kind,setting,client,invoice)}
@router.post("/send")
async def send_test(data:TestInvoiceRequest,db:AsyncSession=Depends(get_db)):
    setting,cfg,invoice,client=await _load_test_data(db,data)
    if not cfg.get("enabled"):raise HTTPException(status_code=409,detail="Active primero la pasarela AutomatizadoVIP")
    if not str(cfg.get("api_key") or "").strip():raise HTTPException(status_code=409,detail="Configure la API Key de AutomatizadoVIP")
    key={"reminder":"reminder_enabled","cut":"cut_warning_enabled","payment":"payment_confirmation_enabled"}[data.kind]
    if not cfg["automation"].get(key):raise HTTPException(status_code=409,detail="Esta automatización está desactivada en la configuración")
    eligible,reason,days=_eligibility(data.kind,invoice,client,cfg["automation"],date.today())
    if not eligible and not data.force_test:raise HTTPException(status_code=409,detail=f"La factura no cumple la condición automática: {reason}. Para una prueba controlada use la opción de prueba forzada.")
    message=_message(data.kind,setting,client,invoice); phone=client.phone or invoice.client_phone
    try: result=await send_messages(api_key=cfg["api_key"],contacts=[{"number":phone,"message":message}],gateway_url=cfg.get("gateway_url"),country_code=cfg.get("country_code","51"),verify=bool(cfg.get("verify",True)))
    except (ValueError,WhatsAppGatewayError) as exc:
        db.add(WhatsAppAutomatizadoVIPLog(client_id=client.id,phone=phone,message=message,status="failed",error_message=str(exc))); await db.commit(); raise HTTPException(status_code=502,detail=str(exc)) from exc
    db.add(WhatsAppAutomatizadoVIPLog(client_id=client.id,phone=phone,message=message,status="sent",http_status=result.status_code,response_data=result.response)); await db.commit()
    return {"ok":result.ok,"status_code":result.status_code,"kind":data.kind,"invoice_id":invoice.id,"client_name":client.full_name,"days_remaining":days,"forced_test":bool(data.force_test and not eligible),"message":message,"gateway_response":result.response}
