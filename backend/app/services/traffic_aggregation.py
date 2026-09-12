"""Registro de Tráfico — Etapa 3/5: asociación y agregación persistente.

Consume lotes decodificados por el collector Traffic Flow, resuelve la identidad
cliente ↔ servicio ↔ router ↔ IP y persiste únicamente agregados horarios.
Los flujos crudos viven solo en la cola acotada del proceso y se descartan tras
ser agregados.
"""
from __future__ import annotations

import asyncio
import os
import time
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from sqlalchemy import select

from app.core import database
from app.core.database import now_iso
from app.models.client import Client
from app.models.client_service import ClientService
from app.models.router import Router
from app.models.traffic_registry import TrafficAggregate, TrafficIdentity
from app.services.traffic_flow_collector import DecodedFlow, traffic_flow_runtime


@dataclass(frozen=True)
class ServiceIdentity:
    client_id: str
    service_id: str
    router_id: str
    ip_address: str
    connection_type: str
    pppoe_user: str


@dataclass
class PendingAggregate:
    identity: ServiceIdentity
    period_start: str
    period_end: str
    download_bytes: int = 0
    upload_bytes: int = 0
    flow_count: int = 0

    @property
    def total_bytes(self) -> int:
        return self.download_bytes + self.upload_bytes


class TrafficAggregationRuntime:
    """Worker acotado de Etapa 3; una sola instancia por proceso backend."""

    def __init__(self):
        self.enabled = False
        self.running = False
        self.cache_ttl = 60.0
        self.flush_seconds = 5.0
        self._identity_cache: dict[str, tuple[float, dict[str, ServiceIdentity]]] = {}
        self._pending: dict[tuple[str, str, str, str, str], PendingAggregate] = {}
        self.processed_batches = 0
        self.processed_flows = 0
        self.matched_flows = 0
        self.unmatched_flows = 0
        self.persisted_buckets = 0
        self.identity_refreshes = 0
        self.db_errors = 0
        self.last_flush_at = ""
        self.last_error = ""

    def configure(self) -> bool:
        self.enabled = os.environ.get("TRAFFIC_FLOW_AGGREGATION_ENABLED", "false").strip().lower() in {"1", "true", "yes", "on"}
        self.cache_ttl = max(10.0, float(os.environ.get("TRAFFIC_FLOW_IDENTITY_CACHE_SECONDS", "60")))
        self.flush_seconds = max(1.0, float(os.environ.get("TRAFFIC_FLOW_FLUSH_SECONDS", "5")))
        return self.enabled

    @staticmethod
    def _hour_bucket(observed_at: str) -> tuple[str, str]:
        try:
            stamp = datetime.fromisoformat(observed_at.replace("Z", "+00:00"))
        except ValueError:
            stamp = datetime.now(timezone.utc)
        if stamp.tzinfo is None:
            stamp = stamp.replace(tzinfo=timezone.utc)
        stamp = stamp.astimezone(timezone.utc).replace(minute=0, second=0, microsecond=0)
        return stamp.isoformat(), (stamp + timedelta(hours=1)).isoformat()

    async def _load_identity_map(self, exporter: str) -> dict[str, ServiceIdentity]:
        cached = self._identity_cache.get(exporter)
        now = time.monotonic()
        if cached and cached[0] > now:
            return cached[1]

        async with database.SessionLocal() as db:
            router = (await db.execute(
                select(Router).where(Router.device_type == "mikrotik", Router.ip_address == exporter)
            )).scalars().first()
            if not router:
                self._identity_cache[exporter] = (now + self.cache_ttl, {})
                return {}

            clients = (await db.execute(select(Client).where(Client.router_id == router.id))).scalars().all()
            services = (await db.execute(select(ClientService).where(ClientService.router_id == router.id))).scalars().all()

        mapping: dict[str, ServiceIdentity] = {}
        for client in clients:
            ip = (client.ip_address or "").strip()
            if ip and client.status != "retired":
                mapping[ip] = ServiceIdentity(
                    client_id=client.id,
                    service_id="",
                    router_id=router.id,
                    ip_address=ip,
                    connection_type=client.connection_type or "",
                    pppoe_user=client.pppoe_user or "",
                )
        for service in services:
            ip = (service.ip_address or "").strip()
            if ip and service.status != "retired":
                mapping[ip] = ServiceIdentity(
                    client_id=service.client_id,
                    service_id=service.id,
                    router_id=router.id,
                    ip_address=ip,
                    connection_type=service.connection_type or "",
                    pppoe_user=service.pppoe_user or "",
                )

        self._identity_cache[exporter] = (now + self.cache_ttl, mapping)
        self.identity_refreshes += 1
        return mapping

    def _add_direction(self, identity: ServiceIdentity, flow: DecodedFlow, *, download: bool) -> None:
        period_start, period_end = self._hour_bucket(flow.observed_at)
        key = (identity.client_id, identity.service_id, identity.router_id, identity.ip_address, period_start)
        item = self._pending.get(key)
        if not item:
            item = PendingAggregate(identity=identity, period_start=period_start, period_end=period_end)
            self._pending[key] = item
        if download:
            item.download_bytes += max(0, int(flow.bytes_count))
        else:
            item.upload_bytes += max(0, int(flow.bytes_count))
        item.flow_count += 1

    async def _consume_batch(self, exporter: str, flows: list[DecodedFlow]) -> None:
        identities = await self._load_identity_map(exporter)
        self.processed_batches += 1
        self.processed_flows += len(flows)
        for flow in flows:
            src_identity = identities.get(flow.source_ip)
            dst_identity = identities.get(flow.destination_ip)
            matched = False
            if src_identity:
                self._add_direction(src_identity, flow, download=False)
                matched = True
            if dst_identity:
                self._add_direction(dst_identity, flow, download=True)
                matched = True
            if matched:
                self.matched_flows += 1
            else:
                self.unmatched_flows += 1

    async def _sync_identities(self, db, identities: dict[tuple[str, str], ServiceIdentity]) -> None:
        if not identities:
            return
        client_ids = sorted({item.client_id for item in identities.values()})
        existing = (await db.execute(
            select(TrafficIdentity).where(
                TrafficIdentity.valid_until == "",
                TrafficIdentity.client_id.in_(client_ids),
            )
        )).scalars().all()
        by_service: dict[tuple[str, str], list[TrafficIdentity]] = {}
        for item in existing:
            by_service.setdefault((item.client_id, item.service_id or ""), []).append(item)

        stamp = now_iso()
        for service_key, current in identities.items():
            rows = by_service.get(service_key, [])
            exact = None
            for row in rows:
                if row.router_id == current.router_id and row.ip_address == current.ip_address:
                    exact = row
                else:
                    row.valid_until = stamp
            if exact is None:
                db.add(TrafficIdentity(
                    client_id=current.client_id,
                    service_id=current.service_id,
                    router_id=current.router_id,
                    ip_address=current.ip_address,
                    connection_type=current.connection_type,
                    pppoe_user=current.pppoe_user,
                    source="traffic_flow",
                    valid_from=stamp,
                ))

    async def flush(self) -> None:
        if not self._pending:
            self.last_flush_at = now_iso()
            return
        pending = self._pending
        self._pending = {}
        try:
            async with database.SessionLocal() as db:
                identities = {(item.identity.client_id, item.identity.service_id): item.identity for item in pending.values()}
                await self._sync_identities(db, identities)

                periods = sorted({item.period_start for item in pending.values()})
                router_ids = sorted({item.identity.router_id for item in pending.values()})
                client_ids = sorted({item.identity.client_id for item in pending.values()})
                existing = (await db.execute(
                    select(TrafficAggregate).where(
                        TrafficAggregate.bucket_type == "hour",
                        TrafficAggregate.period_start.in_(periods),
                        TrafficAggregate.router_id.in_(router_ids),
                        TrafficAggregate.client_id.in_(client_ids),
                    )
                )).scalars().all()
                aggregate_map = {
                    (row.client_id, row.service_id or "", row.router_id, row.ip_address, row.period_start): row
                    for row in existing
                }

                stamp = now_iso()
                for key, item in pending.items():
                    ident = item.identity
                    aggregate = aggregate_map.get(key)
                    if aggregate:
                        aggregate.download_bytes += item.download_bytes
                        aggregate.upload_bytes += item.upload_bytes
                        aggregate.total_bytes = aggregate.download_bytes + aggregate.upload_bytes
                        aggregate.flow_count += item.flow_count
                        aggregate.period_end = item.period_end
                        aggregate.updated_at = stamp
                    else:
                        aggregate = TrafficAggregate(
                            client_id=ident.client_id,
                            service_id=ident.service_id,
                            router_id=ident.router_id,
                            ip_address=ident.ip_address,
                            bucket_type="hour",
                            period_start=item.period_start,
                            period_end=item.period_end,
                            download_bytes=item.download_bytes,
                            upload_bytes=item.upload_bytes,
                            total_bytes=item.total_bytes,
                            flow_count=item.flow_count,
                            data_source="traffic_flow",
                            processing_status="aggregated",
                        )
                        db.add(aggregate)
                        aggregate_map[key] = aggregate
                    self.persisted_buckets += 1
                await db.commit()
            self.last_flush_at = now_iso()
            self.last_error = ""
        except Exception as exc:
            self.db_errors += 1
            self.last_error = str(exc)[:300]
            for key, item in pending.items():
                previous = self._pending.get(key)
                if previous:
                    previous.download_bytes += item.download_bytes
                    previous.upload_bytes += item.upload_bytes
                    previous.flow_count += item.flow_count
                else:
                    self._pending[key] = item

    async def run(self) -> None:
        if not self.configure():
            return
        self.running = True
        last_flush = time.monotonic()
        try:
            while True:
                timeout = max(0.2, self.flush_seconds - (time.monotonic() - last_flush))
                try:
                    exporter, _version, flows = await asyncio.wait_for(traffic_flow_runtime.queue.get(), timeout=timeout)
                except asyncio.TimeoutError:
                    pass
                else:
                    try:
                        await self._consume_batch(exporter, flows)
                    finally:
                        traffic_flow_runtime.queue.task_done()
                if time.monotonic() - last_flush >= self.flush_seconds or len(self._pending) >= 5000:
                    await self.flush()
                    last_flush = time.monotonic()
        except asyncio.CancelledError:
            await self.flush()
            raise
        finally:
            self.running = False

    def status(self) -> dict:
        return {
            "enabled": self.enabled,
            "running": self.running,
            "cache_ttl_seconds": self.cache_ttl,
            "flush_seconds": self.flush_seconds,
            "processed_batches": self.processed_batches,
            "processed_flows": self.processed_flows,
            "matched_flows": self.matched_flows,
            "unmatched_flows": self.unmatched_flows,
            "persisted_buckets": self.persisted_buckets,
            "identity_refreshes": self.identity_refreshes,
            "db_errors": self.db_errors,
            "pending_buckets": len(self._pending),
            "last_flush_at": self.last_flush_at,
            "last_error": self.last_error,
        }


traffic_aggregation_runtime = TrafficAggregationRuntime()
