"""Archivo: backend/app/models/client_document.py
Actualización: 2026-09-07 — agrega documentos adjuntos por cliente.
Función: guarda metadatos de contratos, evidencias y archivos relacionados a un abonado.
Recibe: archivos validados por client_workspace/router.py.
Entrega: documentos descargables desde la ficha del cliente.
"""
from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base, new_id, now_iso

class ClientDocument(Base):
    __tablename__ = "client_documents"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    client_id: Mapped[str] = mapped_column(String(36), index=True)
    title: Mapped[str] = mapped_column(String(180), default="")
    category: Mapped[str] = mapped_column(String(40), default="other")
    original_name: Mapped[str] = mapped_column(String(255), default="")
    stored_name: Mapped[str] = mapped_column(String(255), unique=True)
    mime_type: Mapped[str] = mapped_column(String(120), default="application/octet-stream")
    size_bytes: Mapped[int] = mapped_column(Integer, default=0)
    operator_id: Mapped[str] = mapped_column(String(36), default="")
    operator_name: Mapped[str] = mapped_column(String(150), default="")
    created_at: Mapped[str] = mapped_column(String(40), default=now_iso)
