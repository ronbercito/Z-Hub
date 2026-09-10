"""Casos persistentes de recuperación física de equipos de clientes."""
from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base, new_id, now_iso


class EquipmentRecovery(Base):
    __tablename__ = "equipment_recoveries"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    client_id: Mapped[str] = mapped_column(String(36), default="", index=True)
    client_name: Mapped[str] = mapped_column(String(150), default="", index=True)
    dni_ruc: Mapped[str] = mapped_column(String(20), default="", index=True)
    phone: Mapped[str] = mapped_column(String(30), default="")
    address: Mapped[str] = mapped_column(String(255), default="")
    technology: Mapped[str] = mapped_column(String(20), default="")
    source_status: Mapped[str] = mapped_column(String(20), default="suspended", index=True)
    equipment_data: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(30), default="pending", index=True)
    assigned_to: Mapped[str] = mapped_column(String(120), default="")
    scheduled_date: Mapped[str] = mapped_column(String(10), default="", index=True)
    notes: Mapped[str] = mapped_column(Text, default="")
    created_by: Mapped[str] = mapped_column(String(120), default="Sistema")
    created_at: Mapped[str] = mapped_column(String(40), default=now_iso)
    updated_at: Mapped[str] = mapped_column(String(40), default=now_iso)
    recovered_at: Mapped[str] = mapped_column(String(40), default="")
