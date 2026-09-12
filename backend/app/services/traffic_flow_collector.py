"""
Registro de Tráfico — Etapa 2/5.

Collector UDP acotado para MikroTik Traffic Flow. Soporta NetFlow v5 y los
formatos con plantillas NetFlow v9/IPFIX necesarios para IPv4/IPv6. En esta
etapa los flujos se reciben y validan en memoria; la persistencia/agregación
por cliente se implementa en Etapa 3/5.
"""
from __future__ import annotations

import asyncio
import hashlib
import os
import struct
import time
from dataclasses import dataclass
from datetime import datetime, timezone
from ipaddress import ip_address
from typing import Callable


@dataclass(frozen=True)
class DecodedFlow:
    source_ip: str
    destination_ip: str
    bytes_count: int
    ip_version: int
    observed_at: str


@dataclass(frozen=True)
class TemplateField:
    field_type: int
    length: int
    enterprise: int = 0


class TrafficFlowDecoder:
    """Decoder mínimo y stateful para templates v9/IPFIX por exportador."""

    def __init__(self):
        self.templates: dict[tuple[str, int, int, int], tuple[TemplateField, ...]] = {}

    @staticmethod
    def _iso(epoch: int) -> str:
        return datetime.fromtimestamp(epoch, tz=timezone.utc).isoformat()

    def decode(self, packet: bytes, exporter: str) -> tuple[int, list[DecodedFlow]]:
        if len(packet) < 2:
            raise ValueError("datagrama Traffic Flow demasiado corto")
        version = struct.unpack_from("!H", packet, 0)[0]
        if version == 5:
            return version, self._decode_v5(packet)
        if version == 9:
            return version, self._decode_v9(packet, exporter)
        if version == 10:
            return version, self._decode_ipfix(packet, exporter)
        raise ValueError(f"versión NetFlow/IPFIX no soportada: {version}")

    def _decode_v5(self, packet: bytes) -> list[DecodedFlow]:
        if len(packet) < 24:
            raise ValueError("cabecera NetFlow v5 incompleta")
        count = struct.unpack_from("!H", packet, 2)[0]
        export_epoch = struct.unpack_from("!I", packet, 8)[0]
        flows: list[DecodedFlow] = []
        offset = 24
        for _ in range(count):
            if offset + 48 > len(packet):
                raise ValueError("registro NetFlow v5 truncado")
            src = str(ip_address(packet[offset:offset + 4]))
            dst = str(ip_address(packet[offset + 4:offset + 8]))
            octets = struct.unpack_from("!I", packet, offset + 20)[0]
            flows.append(DecodedFlow(src, dst, octets, 4, self._iso(export_epoch)))
            offset += 48
        return flows

    def _decode_v9(self, packet: bytes, exporter: str) -> list[DecodedFlow]:
        if len(packet) < 20:
            raise ValueError("cabecera NetFlow v9 incompleta")
        export_epoch = struct.unpack_from("!I", packet, 8)[0]
        source_id = struct.unpack_from("!I", packet, 16)[0]
        return self._decode_sets(packet, 20, exporter, 9, source_id, export_epoch, template_set_id=0)

    def _decode_ipfix(self, packet: bytes, exporter: str) -> list[DecodedFlow]:
        if len(packet) < 16:
            raise ValueError("cabecera IPFIX incompleta")
        total_length = struct.unpack_from("!H", packet, 2)[0]
        if total_length < 16 or total_length > len(packet):
            raise ValueError("longitud IPFIX inválida")
        export_epoch = struct.unpack_from("!I", packet, 4)[0]
        domain_id = struct.unpack_from("!I", packet, 12)[0]
        return self._decode_sets(packet[:total_length], 16, exporter, 10, domain_id, export_epoch, template_set_id=2)

    def _decode_sets(self, packet: bytes, offset: int, exporter: str, version: int,
                     domain_id: int, export_epoch: int, template_set_id: int) -> list[DecodedFlow]:
        flows: list[DecodedFlow] = []
        while offset + 4 <= len(packet):
            set_id, set_length = struct.unpack_from("!HH", packet, offset)
            if set_length < 4 or offset + set_length > len(packet):
                raise ValueError("FlowSet/Set truncado o inválido")
            payload = packet[offset + 4:offset + set_length]
            if set_id == template_set_id:
                self._parse_templates(payload, exporter, version, domain_id)
            elif set_id >= 256:
                template = self.templates.get((exporter, version, domain_id, set_id))
                if template:
                    flows.extend(self._parse_data_records(payload, template, export_epoch))
            offset += set_length
        return flows

    def _parse_templates(self, payload: bytes, exporter: str, version: int, domain_id: int) -> None:
        offset = 0
        while offset + 4 <= len(payload):
            template_id, field_count = struct.unpack_from("!HH", payload, offset)
            offset += 4
            fields: list[TemplateField] = []
            complete = True
            for _ in range(field_count):
                if offset + 4 > len(payload):
                    complete = False
                    break
                raw_type, length = struct.unpack_from("!HH", payload, offset)
                offset += 4
                enterprise = 0
                field_type = raw_type & 0x7FFF
                if raw_type & 0x8000:
                    if offset + 4 > len(payload):
                        complete = False
                        break
                    enterprise = struct.unpack_from("!I", payload, offset)[0]
                    offset += 4
                fields.append(TemplateField(field_type, length, enterprise))
            if not complete:
                break
            if template_id >= 256 and fields:
                self.templates[(exporter, version, domain_id, template_id)] = tuple(fields)

    def _parse_data_records(self, payload: bytes, fields: tuple[TemplateField, ...], export_epoch: int) -> list[DecodedFlow]:
        if any(field.length == 65535 for field in fields):
            return []
        record_length = sum(field.length for field in fields)
        if record_length <= 0:
            return []
        flows: list[DecodedFlow] = []
        offset = 0
        while offset + record_length <= len(payload):
            cursor = offset
            values: dict[int, bytes] = {}
            for field in fields:
                value = payload[cursor:cursor + field.length]
                cursor += field.length
                if field.enterprise == 0 and field.field_type in {1, 8, 12, 27, 28}:
                    values[field.field_type] = value
            src_raw = values.get(8) or values.get(27)
            dst_raw = values.get(12) or values.get(28)
            byte_raw = values.get(1)
            if src_raw and dst_raw and byte_raw and len(src_raw) in {4, 16} and len(dst_raw) == len(src_raw):
                try:
                    src = str(ip_address(src_raw))
                    dst = str(ip_address(dst_raw))
                except ValueError:
                    pass
                else:
                    flows.append(DecodedFlow(
                        source_ip=src,
                        destination_ip=dst,
                        bytes_count=int.from_bytes(byte_raw, "big", signed=False),
                        ip_version=4 if len(src_raw) == 4 else 6,
                        observed_at=self._iso(export_epoch),
                    ))
            offset += record_length
        return flows


class TrafficFlowProtocol(asyncio.DatagramProtocol):
    """Receptor con deduplicación corta, límites y contadores de validación."""

    def __init__(self, on_flows: Callable[[str, int, list[DecodedFlow]], None] | None = None):
        self.decoder = TrafficFlowDecoder()
        self.on_flows = on_flows
        self.started_at = time.time()
        self.packets = 0
        self.flows = 0
        self.ipv4_flows = 0
        self.ipv6_flows = 0
        self.duplicates = 0
        self.parse_errors = 0
        self.last_received_at = ""
        self.exporters: dict[str, dict[str, int | str]] = {}
        self._seen: dict[bytes, float] = {}

    def datagram_received(self, data: bytes, addr) -> None:
        exporter = str(addr[0])
        now = time.monotonic()
        digest = hashlib.blake2s(exporter.encode() + data, digest_size=16).digest()
        expiry = self._seen.get(digest)
        if expiry and expiry > now:
            self.duplicates += 1
            return
        self._seen[digest] = now + 30.0
        if len(self._seen) > 4096:
            self._seen = {key: until for key, until in self._seen.items() if until > now}
        try:
            version, flows = self.decoder.decode(data, exporter)
        except (ValueError, struct.error):
            self.parse_errors += 1
            return
        self.packets += 1
        self.flows += len(flows)
        self.ipv4_flows += sum(1 for flow in flows if flow.ip_version == 4)
        self.ipv6_flows += sum(1 for flow in flows if flow.ip_version == 6)
        stamp = datetime.now(timezone.utc).isoformat()
        self.last_received_at = stamp
        stats = self.exporters.setdefault(exporter, {"packets": 0, "flows": 0, "last_version": version, "last_received_at": stamp})
        stats["packets"] = int(stats["packets"]) + 1
        stats["flows"] = int(stats["flows"]) + len(flows)
        stats["last_version"] = version
        stats["last_received_at"] = stamp
        if flows and self.on_flows:
            self.on_flows(exporter, version, flows)


class TrafficFlowRuntime:
    def __init__(self):
        self.transport = None
        self.protocol: TrafficFlowProtocol | None = None
        self.bind = ""
        self.port = 0
        self.enabled = False
        self.buffer_flows = False
        self.queue: asyncio.Queue[tuple[str, int, list[DecodedFlow]]] = asyncio.Queue(maxsize=512)
        self.dropped_batches = 0

    def _enqueue(self, exporter: str, version: int, flows: list[DecodedFlow]) -> None:
        # Etapa 2 solo valida recepción. No retiene lotes crudos salvo que la
        # futura Etapa 3 habilite explícitamente el buffer/consumer.
        if not self.buffer_flows:
            return
        try:
            self.queue.put_nowait((exporter, version, flows))
        except asyncio.QueueFull:
            self.dropped_batches += 1

    async def start(self) -> bool:
        self.enabled = os.environ.get("TRAFFIC_FLOW_ENABLED", "false").strip().lower() in {"1", "true", "yes", "on"}
        self.buffer_flows = os.environ.get("TRAFFIC_FLOW_BUFFER_FLOWS", "false").strip().lower() in {"1", "true", "yes", "on"}
        self.bind = os.environ.get("TRAFFIC_FLOW_BIND", "0.0.0.0").strip() or "0.0.0.0"
        self.port = int(os.environ.get("TRAFFIC_FLOW_PORT", "2055"))
        if not self.enabled:
            return False
        loop = asyncio.get_running_loop()
        transport, protocol = await loop.create_datagram_endpoint(
            lambda: TrafficFlowProtocol(self._enqueue),
            local_addr=(self.bind, self.port),
        )
        self.transport, self.protocol = transport, protocol
        return True

    async def stop(self) -> None:
        if self.transport:
            self.transport.close()
            self.transport = None

    def status(self) -> dict:
        protocol = self.protocol
        return {
            "enabled": self.enabled,
            "listening": bool(self.transport),
            "bind": self.bind,
            "port": self.port,
            "buffer_flows": self.buffer_flows,
            "packets": protocol.packets if protocol else 0,
            "flows": protocol.flows if protocol else 0,
            "ipv4_flows": protocol.ipv4_flows if protocol else 0,
            "ipv6_flows": protocol.ipv6_flows if protocol else 0,
            "duplicates": protocol.duplicates if protocol else 0,
            "parse_errors": protocol.parse_errors if protocol else 0,
            "dropped_batches": self.dropped_batches,
            "last_received_at": protocol.last_received_at if protocol else "",
            "exporters": protocol.exporters if protocol else {},
            "queued_batches": self.queue.qsize(),
        }


traffic_flow_runtime = TrafficFlowRuntime()
