"""
Archivo: backend/app/models/installation.py
Función: almacena solicitudes de instalación pendientes antes de convertirlas en
         abonados. No reemplaza ni modifica el modelo Client.
"""
from sqlalchemy import Float, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base, new_id, now_iso


class Installation(Base):
    __tablename__ = "installations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    full_name: Mapped[str] = mapped_column(String(150), index=True)
    dni_ruc: Mapped[str] = mapped_column(String(20), index=True)
    phone: Mapped[str] = mapped_column(String(30), default="")
    email: Mapped[str] = mapped_column(String(190), default="")
    address: Mapped[str] = mapped_column(String(255), default="")
    reference: Mapped[str] = mapped_column(String(255), default="")
    latitude: Mapped[float] = mapped_column(Float, default=0.0)
    longitude: Mapped[float] = mapped_column(Float, default=0.0)
    installation_date: Mapped[str] = mapped_column(String(10), default="")
    technology: Mapped[str] = mapped_column(String(20), default="fiber")
    status: Mapped[str] = mapped_column(String(20), default="pending", index=True)
    created_by_user_id: Mapped[str] = mapped_column(String(36), default="", index=True)
    created_at: Mapped[str] = mapped_column(String(40), default=now_iso)
