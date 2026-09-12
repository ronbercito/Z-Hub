"""Registro de Tráfico — control de Traffic Flow y Etapa 3/5."""
from ipaddress import ip_address

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, field_validator
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.integrations.mikrotik import service as mt
from app.integrations.mikrotik.client import MikroTikError
from app.models.router import Router
from app.services.traffic_flow_collector import traffic_flow_runtime
from app.services.traffic_aggregation import traffic_aggregation_runtime


router = APIRouter(prefix="/routers", tags=["Red / Traffic Flow"], dependencies=[Depends(get_current_user)])


class TrafficFlowConfigIn(BaseModel):
    collector_ip: str
    collector_port: int = Field(default=2055, ge=1, le=65535)
    version: str = "9"
    interfaces: str = "all"

    @field_validator("collector_ip")
    @classmethod
    def valid_collector_ip(cls, value: str) -> str:
        return str(ip_address(value.strip()))

    @field_validator("version")
    @classmethod
    def valid_version(cls, value: str) -> str:
        normalized = value.strip().lower()
        if normalized not in {"5", "9", "ipfix"}:
            raise ValueError("version debe ser 5, 9 o ipfix")
        return normalized

    @field_validator("interfaces")
    @classmethod
    def valid_interfaces(cls, value: str) -> str:
        clean = value.strip() or "all"
        if len(clean) > 500:
            raise ValueError("lista de interfaces demasiado larga")
        return clean


async def _mikrotik(db: AsyncSession, router_id: str) -> Router:
    item = await db.get(Router, router_id)
    if not item:
        raise HTTPException(status_code=404, detail="Router no encontrado")
    if item.device_type != "mikrotik":
        raise HTTPException(status_code=400, detail="Traffic Flow solo aplica a MikroTik RouterOS")
    if not item.password:
        raise HTTPException(status_code=400, detail="El router no tiene credenciales API configuradas")
    return item


async def _read_routeros_traffic_flow(item: Router) -> dict:
    async with mt.connect(item) as client:
        general = await client.rows("ip", "traffic-flow")
        targets = await client.rows("ip", "traffic-flow", "target")
    return {"general": general[0] if general else {}, "targets": targets}


@router.get("/traffic-flow/collector")
async def collector_status():
    """Estado en memoria del receptor UDP y decoder NetFlow/IPFIX."""
    return traffic_flow_runtime.status()


@router.get("/traffic-flow/aggregation")
async def aggregation_status():
    """Estado del worker que asocia servicios y persiste agregados horarios."""
    return traffic_aggregation_runtime.status()


@router.get("/{router_id}/traffic-flow")
async def router_traffic_flow_status(router_id: str, db: AsyncSession = Depends(get_db)):
    item = await _mikrotik(db, router_id)
    try:
        data = await _read_routeros_traffic_flow(item)
    except MikroTikError as exc:
        raise HTTPException(status_code=502, detail=str(exc))
    return {"ok": True, "router": item.name, **data}


@router.post("/{router_id}/traffic-flow/configure")
async def configure_router_traffic_flow(router_id: str, data: TrafficFlowConfigIn, db: AsyncSession = Depends(get_db)):
    """Configura un router explícitamente; nunca se ejecuta de forma masiva/automática."""
    item = await _mikrotik(db, router_id)
    try:
        async with mt.connect(item) as client:
            # Compatible con RouterOS v6/v7. v9 es el valor recomendado porque
            # permite IPv4 e IPv6 con templates en ambas generaciones.
            await client.command("/ip/traffic-flow/set", enabled="yes", interfaces=data.interfaces)
            targets = await client.rows("ip", "traffic-flow", "target")
            match = next((row for row in targets
                          if str(row.get("dst-address", "")) == data.collector_ip
                          and int(row.get("port", 2055) or 2055) == data.collector_port), None)
            payload = {"dst-address": data.collector_ip, "port": data.collector_port, "version": data.version}
            if match:
                await client.set("ip", "traffic-flow", "target", **{".id": match[".id"], **payload})
                action = "updated"
            else:
                await client.add("ip", "traffic-flow", "target", **payload)
                action = "created"
            current = await client.rows("ip", "traffic-flow")
            targets = await client.rows("ip", "traffic-flow", "target")
    except (MikroTikError, ValueError) as exc:
        raise HTTPException(status_code=502, detail=str(exc))
    return {
        "ok": True,
        "action": action,
        "router": item.name,
        "collector": f"{data.collector_ip}:{data.collector_port}",
        "version": data.version,
        "interfaces": data.interfaces,
        "general": current[0] if current else {},
        "targets": targets,
    }


@router.post("/{router_id}/traffic-flow/disable")
async def disable_router_traffic_flow(router_id: str, db: AsyncSession = Depends(get_db)):
    """Rollback rápido: deshabilita exportación sin borrar targets existentes."""
    item = await _mikrotik(db, router_id)
    try:
        async with mt.connect(item) as client:
            await client.command("/ip/traffic-flow/set", enabled="no")
    except MikroTikError as exc:
        raise HTTPException(status_code=502, detail=str(exc))
    return {"ok": True, "router": item.name, "enabled": False}
