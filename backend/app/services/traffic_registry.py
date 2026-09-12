"""
Etapa 1/5 del Registro de Tráfico.

Este módulo define el contrato interno del collector sin abrir sockets, puertos UDP ni
modificar MikroTik. La recepción NetFlow/Traffic Flow real se habilitará en Etapa 2,
después de validar esta base en un entorno controlado.
"""
from dataclasses import dataclass
from datetime import datetime, timezone
from ipaddress import ip_address


@dataclass(frozen=True)
class TrafficFlowEnvelope:
    router_id: str
    source_ip: str
    destination_ip: str
    bytes_count: int
    observed_at: str
    ip_version: int


def normalize_flow(router_id: str, source_ip: str, destination_ip: str, bytes_count: int, observed_at: str = "") -> TrafficFlowEnvelope:
    """Valida la forma mínima que consumirá el collector de Etapa 2."""
    src = ip_address(source_ip)
    dst = ip_address(destination_ip)
    if src.version != dst.version:
        raise ValueError("source_ip y destination_ip deben usar la misma familia IP")
    if bytes_count < 0:
        raise ValueError("bytes_count no puede ser negativo")
    timestamp = observed_at or datetime.now(timezone.utc).isoformat()
    return TrafficFlowEnvelope(
        router_id=router_id,
        source_ip=str(src),
        destination_ip=str(dst),
        bytes_count=int(bytes_count),
        observed_at=timestamp,
        ip_version=src.version,
    )


def collector_enabled() -> bool:
    """Etapa 1 es deliberadamente pasiva: no recibe Traffic Flow todavía."""
    return False
