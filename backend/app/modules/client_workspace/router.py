"""Archivo: backend/app/modules/client_workspace/router.py
Actualización: 2026-09-09 — versión 1.1.79: almacenamiento de documentos bajo la raíz Z-Hub.
Función: registra comunicaciones, documentos y acciones operativas del editor de cliente.
Recibe: ClientDetail.jsx, usuario autenticado y archivos multipart.
Entrega: datos persistentes para las pestañas Email y SMS, Documentos y Log.
"""
import os
import re
from pathlib import Path
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.client import Client
from app.models.client_activity import ClientActivity
from app.models.client_communication import ClientCommunication
from app.models.client_document import ClientDocument
from app.models.client_service import ClientService

router = APIRouter(prefix="/clients", tags=["Editor de cliente"])
UPLOAD_ROOT = Path(os.environ.get("ZHUB_UPLOADS", "/var/www/z-hub/uploads/client-documents"))
MAX_SIZE = 15 * 1024 * 1024
ALLOWED = {"application/pdf","image/jpeg","image/png","image/webp","text/plain","application/msword","application/vnd.openxmlformats-officedocument.wordprocessingml.document"}

class CommunicationIn(BaseModel):
    channel: str = Field(default="note", pattern="^(email|sms|whatsapp|note)$")
    recipient: str = ""
    subject: str = ""
    message: str = Field(min_length=1, max_length=10000)

class ActivityIn(BaseModel):
    action: str = Field(min_length=1, max_length=80)
    detail: str = Field(default="", max_length=4000)

async def _client(db: AsyncSession, client_id: str) -> Client:
    row = await db.get(Client, client_id)
    if not row:
        raise HTTPException(404, "Cliente no encontrado")
    return row

def _activity(db: AsyncSession, client_id: str, action: str, detail: str, user: dict):
    db.add(ClientActivity(client_id=client_id, action=action, detail=detail, operator_name=user.get("name") or user.get("email") or "Sistema"))

def _money(value) -> str:
    return f"S/. {float(value or 0):.2f}"

def _technology(value: str) -> str:
    return {"fiber": "Fibra óptica", "wireless": "Inalámbrico"}.get(value, value or "Sin especificar")

def _connection(value: str) -> str:
    return value or "Sin especificar"

def _service_created_detail(service: ClientService) -> str:
    """Construye un registro legible usando los valores persistidos del servicio recién creado."""
    pppoe = service.pppoe_user if service.connection_type == "PPPoE" else "No aplica"
    ip = service.ip_address or "No asignada"
    return (
        "Se creó un servicio adicional correctamente. "
        f"Plan: {service.plan_name or 'Sin plan'} · "
        f"Precio mensual: {_money(service.plan_price)} · "
        f"Conexión: {_connection(service.connection_type)} · "
        f"Tecnología: {_technology(service.technology)} · "
        f"IP: {ip} · "
        f"Usuario PPPoE: {pppoe} · "
        f"MikroTik: {service.router_name or 'Sin asignar'} · "
        f"Zona: {service.zone_name or 'Sin zona'}."
    )

@router.get("/{client_id}/communications")
async def communications(client_id: str, db: AsyncSession = Depends(get_db), user: dict = Depends(get_current_user)):
    await _client(db, client_id)
    rows = (await db.execute(select(ClientCommunication).where(ClientCommunication.client_id == client_id).order_by(ClientCommunication.created_at.desc()))).scalars().all()
    return [row.to_dict() for row in rows]

@router.post("/{client_id}/communications")
async def create_communication(client_id: str, data: CommunicationIn, db: AsyncSession = Depends(get_db), user: dict = Depends(get_current_user)):
    await _client(db, client_id)
    row = ClientCommunication(client_id=client_id, **data.model_dump(), operator_id=user["id"], operator_name=user.get("name") or "")
    db.add(row)
    _activity(db, client_id, "Comunicación registrada", f"{data.channel.upper()}: {data.subject or data.message[:80]}", user)
    await db.commit()
    return row.to_dict()

@router.post("/{client_id}/activity")
async def create_activity(client_id: str, data: ActivityIn, db: AsyncSession = Depends(get_db), user: dict = Depends(get_current_user)):
    """Registra una acción del editor usando la cuenta autenticada."""
    await _client(db, client_id)
    action = data.action.strip()
    detail = data.detail.strip()
    if action == "Facturación actualizada" and (not detail or detail == "Se realizó una acción en Facturación del cliente: factura, pago, anulación, eliminación o saldo."):
        return {"ok": True, "skipped": True, "reason": "La operación de Facturación se registra con detalle específico."}
    if action == "Servicio creado":
        service = (await db.execute(select(ClientService).where(ClientService.client_id == client_id).order_by(ClientService.created_at.desc(), ClientService.id.desc()).limit(1))).scalar_one_or_none()
        if service:
            detail = _service_created_detail(service)
    operator = user.get("name") or user.get("email") or "Sistema"
    if user.get("email"):
        detail = f"{detail} | Cuenta: {user['email']} | Rol: {user.get('role') or 'sin rol'}".strip(" |")
    row = ClientActivity(client_id=client_id, action=action, detail=detail, operator_name=operator)
    db.add(row)
    await db.commit()
    await db.refresh(row)
    return row.to_dict()

@router.get("/{client_id}/documents")
async def documents(client_id: str, db: AsyncSession = Depends(get_db), user: dict = Depends(get_current_user)):
    await _client(db, client_id)
    rows = (await db.execute(select(ClientDocument).where(ClientDocument.client_id == client_id).order_by(ClientDocument.created_at.desc()))).scalars().all()
    return [row.to_dict() for row in rows]

@router.post("/{client_id}/documents")
async def upload_document(client_id: str, file: UploadFile = File(...), title: str = Form(""), category: str = Form("other"), db: AsyncSession = Depends(get_db), user: dict = Depends(get_current_user)):
    await _client(db, client_id)
    if file.content_type not in ALLOWED:
        raise HTTPException(415, "Formato no permitido. Use PDF, imagen, TXT, DOC o DOCX.")
    content = await file.read()
    if not content or len(content) > MAX_SIZE:
        raise HTTPException(413, "El archivo debe pesar entre 1 byte y 15 MB.")
    safe = re.sub(r"[^A-Za-z0-9._-]", "_", file.filename or "documento")
    stored = f"{client_id}_{os.urandom(12).hex()}_{safe}"
    UPLOAD_ROOT.mkdir(parents=True, exist_ok=True)
    (UPLOAD_ROOT / stored).write_bytes(content)
    row = ClientDocument(client_id=client_id, title=(title or safe)[:180], category=(category or "other")[:40], original_name=(file.filename or safe)[:255], stored_name=stored, mime_type=file.content_type, size_bytes=len(content), operator_id=user["id"], operator_name=user.get("name") or "")
    db.add(row)
    _activity(db, client_id, "Documento adjuntado", row.title, user)
    await db.commit()
    return row.to_dict()

@router.get("/documents/{document_id}/download")
async def download_document(document_id: str, db: AsyncSession = Depends(get_db), user: dict = Depends(get_current_user)):
    row = await db.get(ClientDocument, document_id)
    path = UPLOAD_ROOT / row.stored_name if row else None
    if not row or not path.is_file():
        raise HTTPException(404, "Documento no encontrado")
    return FileResponse(path, media_type=row.mime_type, filename=row.original_name)

@router.delete("/documents/{document_id}")
async def delete_document(document_id: str, db: AsyncSession = Depends(get_db), user: dict = Depends(get_current_user)):
    row = await db.get(ClientDocument, document_id)
    if not row:
        raise HTTPException(404, "Documento no encontrado")
    path = UPLOAD_ROOT / row.stored_name
    if path.is_file():
        path.unlink()
    _activity(db, row.client_id, "Documento eliminado", row.title, user)
    await db.delete(row)
    await db.commit()
    return {"message": "Documento eliminado"}
