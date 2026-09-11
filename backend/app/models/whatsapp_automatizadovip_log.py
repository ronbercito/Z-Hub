"""Historial de envíos realizados mediante AutomatizadoVIP."""

from datetime import datetime
from typing import Any

from sqlalchemy import DateTime, Integer, JSON, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class WhatsAppAutomatizadoVIPLog(Base):
    __tablename__ = "whatsapp_automatizadovip_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    client_id: Mapped[str | None] = mapped_column(String(64), nullable=True, index=True)
    phone: Mapped[str] = mapped_column(String(32), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(24), nullable=False, default="pending", index=True)
    http_status: Mapped[int | None] = mapped_column(Integer, nullable=True)
    response_data: Mapped[Any | None] = mapped_column(JSON, nullable=True)
    error_message: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False, index=True)
