"""
Archivo: backend/app/models/traffic_registry.py
Función: Base persistente del Registro de Tráfico. Conserva la asociación histórica
         cliente ↔ servicio ↔ IP ↔ router y los agregados de consumo que producirán
         las etapas posteriores del collector Traffic Flow.

Etapa 1/5: este modelo NO configura Traffic Flow ni modifica MikroTik.
"""
from sqlalchemy import BigInteger, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base, new_id, now_iso


class TrafficIdentity(Base):
    """Vigencia histórica de una identidad de red asociada a un servicio."""

    __tablename__ = "traffic_identities"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    client_id: Mapped[str] = mapped_column(String(36), index=True)
    # Vacío = servicio principal almacenado en clients; UUID = ClientService adicional.
    service_id: Mapped[str] = mapped_column(String(36), default="", index=True)
    router_id: Mapped[str] = mapped_column(String(36), default="", index=True)
    ip_address: Mapped[str] = mapped_column(String(60), default="", index=True)
    connection_type: Mapped[str] = mapped_column(String(30), default="")
    pppoe_user: Mapped[str] = mapped_column(String(80), default="", index=True)
    source: Mapped[str] = mapped_column(String(30), default="zhub")
    valid_from: Mapped[str] = mapped_column(String(40), default=now_iso, index=True)
    valid_until: Mapped[str] = mapped_column(String(40), default="", index=True)
    created_at: Mapped[str] = mapped_column(String(40), default=now_iso)


class TrafficAggregate(Base):
    """Consumo agregado; evita usar MariaDB como almacén indefinido de flujos brutos."""

    __tablename__ = "traffic_aggregates"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_id)
    client_id: Mapped[str] = mapped_column(String(36), index=True)
    service_id: Mapped[str] = mapped_column(String(36), default="", index=True)
    router_id: Mapped[str] = mapped_column(String(36), default="", index=True)
    ip_address: Mapped[str] = mapped_column(String(60), default="", index=True)
    bucket_type: Mapped[str] = mapped_column(String(16), default="hour", index=True)
    period_start: Mapped[str] = mapped_column(String(40), index=True)
    period_end: Mapped[str] = mapped_column(String(40), default="")
    download_bytes: Mapped[int] = mapped_column(BigInteger, default=0)
    upload_bytes: Mapped[int] = mapped_column(BigInteger, default=0)
    total_bytes: Mapped[int] = mapped_column(BigInteger, default=0)
    flow_count: Mapped[int] = mapped_column(Integer, default=0)
    data_source: Mapped[str] = mapped_column(String(30), default="traffic_flow")
    processing_status: Mapped[str] = mapped_column(String(20), default="aggregated", index=True)
    created_at: Mapped[str] = mapped_column(String(40), default=now_iso)
    updated_at: Mapped[str] = mapped_column(String(40), default=now_iso)
