"""Equipos físicos asignados a un cliente para control y futura recuperación."""
from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base, new_id, now_iso


class ClientEquipment(Base):
    __tablename__ = "client_equipment"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    client_id: Mapped[str] = mapped_column(String(36), default="", index=True)
    equipment_type: Mapped[str] = mapped_column(String(60), default="")
    brand_model: Mapped[str] = mapped_column(String(150), default="")
    serial_mac: Mapped[str] = mapped_column(String(150), default="", index=True)
    ownership: Mapped[str] = mapped_column(String(20), default="company", index=True)
    status: Mapped[str] = mapped_column(String(30), default="installed", index=True)
    delivered_at: Mapped[str] = mapped_column(String(10), default="")
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[str] = mapped_column(String(40), default=now_iso)
    updated_at: Mapped[str] = mapped_column(String(40), default=now_iso)
