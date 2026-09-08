"""
Archivo: backend/app/models/client_service.py
Actualización: 2026-09-08 — los servicios adicionales se eliminan automáticamente al eliminar su cliente.
Función: Tabla de servicios de Internet adicionales de un cliente; conserva la configuración técnica
         de cada servicio separada para permitir varios servicios dentro de una misma ficha.
Trabaja con: backend/app/models/client.py, backend/app/routers/clientes/router.py y ClientDetail.jsx.
"""
from sqlalchemy import Float, Integer, String, delete, event
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base, new_id, now_iso
from app.models.client import Client


class ClientService(Base):
    __tablename__ = "client_services"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    client_id: Mapped[str] = mapped_column(String(36), index=True)

    plan_id: Mapped[str] = mapped_column(String(36), default="")
    plan_name: Mapped[str] = mapped_column(String(120), default="")
    plan_price: Mapped[float] = mapped_column(Float, default=0.0)
    router_id: Mapped[str] = mapped_column(String(36), default="")
    router_name: Mapped[str] = mapped_column(String(120), default="")
    connection_type: Mapped[str] = mapped_column(String(30), default="PPPoE")
    ipv4_network_id: Mapped[str] = mapped_column(String(36), default="", index=True)
    ip_address: Mapped[str] = mapped_column(String(60), default="", index=True)
    pppoe_user: Mapped[str] = mapped_column(String(80), default="")
    pppoe_password: Mapped[str] = mapped_column(String(80), default="")
    technology: Mapped[str] = mapped_column(String(20), default="fiber")
    zone_id: Mapped[str] = mapped_column(String(36), default="", index=True)
    zone_name: Mapped[str] = mapped_column(String(120), default="")
    nap_box_id: Mapped[str] = mapped_column(String(36), default="", index=True)
    nap_box: Mapped[str] = mapped_column(String(80), default="")
    nap_port: Mapped[int | None] = mapped_column(Integer, nullable=True)
    onu_sn: Mapped[str] = mapped_column(String(60), default="")
    optical_power_dbm: Mapped[float | None] = mapped_column(Float, nullable=True)
    installation_date: Mapped[str] = mapped_column(String(10), default="")
    monitoring_equipment_id: Mapped[str] = mapped_column(String(36), default="", index=True)
    monitoring_equipment_name: Mapped[str] = mapped_column(String(120), default="")
    antenna_type: Mapped[str] = mapped_column(String(80), default="")
    management_ip: Mapped[str] = mapped_column(String(60), default="")
    status: Mapped[str] = mapped_column(String(30), default="active")
    created_at: Mapped[str] = mapped_column(String(40), default=now_iso)


@event.listens_for(Client, "after_delete")
def _delete_client_services_after_client_delete(mapper, connection, target):
    """Libera en la base de datos todos los recursos de servicios del cliente eliminado."""
    connection.execute(delete(ClientService).where(ClientService.client_id == target.id))
