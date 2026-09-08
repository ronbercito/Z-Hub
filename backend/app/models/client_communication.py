"""Archivo: backend/app/models/client_communication.py
Actualización: 2026-09-08 — modelo mejorado para Email, SMS y historial de comunicaciones.
Función: persiste mensajes Email, SMS, WhatsApp y notas vinculadas a un abonado.
Recibe: client_workspace/router.py y el usuario autenticado.
Entrega: registros a la ficha del cliente, la bitácora y futuras integraciones de mensajería.
"""
from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base, new_id, now_iso

class ClientCommunication(Base):
    __tablename__ = "client_communications"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    client_id: Mapped[str] = mapped_column(String(36), index=True)
    type: Mapped[str] = mapped_column(String(20), default="note")  # email, sms, note
    channel: Mapped[str] = mapped_column(String(20), default="note")  # compatibilidad
    recipient: Mapped[str] = mapped_column(String(190), default="")
    subject: Mapped[str] = mapped_column(String(200), default="")
    message: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(20), default="recorded")  # sent, pending, error, recorded
    operator_id: Mapped[str] = mapped_column(String(36), default="")
    operator_name: Mapped[str] = mapped_column(String(150), default="")
    template: Mapped[str] = mapped_column(String(50), default="none")  # para email
    created_at: Mapped[str] = mapped_column(String(40), default=now_iso)
