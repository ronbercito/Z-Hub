"""Estado operativo independiente de cada servicio del abonado.

La tabla separa el estado del servicio del estado general del cliente sin alterar
la estructura histórica de `clients` ni `client_services`.
"""
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base, now_iso


class ClientServiceState(Base):
    __tablename__ = "client_service_states"

    id: Mapped[str] = mapped_column(String(90), primary_key=True)
    client_id: Mapped[str] = mapped_column(String(36), index=True)
    service_id: Mapped[str] = mapped_column(String(36), index=True)
    status: Mapped[str] = mapped_column(String(30), default="active")
    reason: Mapped[str] = mapped_column(String(250), default="")
    updated_at: Mapped[str] = mapped_column(String(40), default=now_iso)
