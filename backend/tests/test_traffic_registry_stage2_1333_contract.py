import importlib.util
import socket
import struct
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MODULE = ROOT / "backend/app/services/traffic_flow_collector.py"
spec = importlib.util.spec_from_file_location("traffic_flow_collector_contract", MODULE)
mod = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = mod
spec.loader.exec_module(mod)
TrafficFlowDecoder = mod.TrafficFlowDecoder


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def test_netflow_v5_ipv4_is_decoded():
    header = struct.pack("!HHIIIIBBH", 5, 1, 1000, 1789240000, 0, 1, 0, 0, 0)
    record = (
        socket.inet_aton("192.0.2.10") + socket.inet_aton("198.51.100.20") + socket.inet_aton("0.0.0.0")
        + struct.pack("!HHII", 1, 2, 10, 123456)
        + b"\x00" * 20
    )
    version, flows = TrafficFlowDecoder().decode(header + record, "10.0.0.1")
    assert version == 5
    assert len(flows) == 1
    assert flows[0].source_ip == "192.0.2.10"
    assert flows[0].destination_ip == "198.51.100.20"
    assert flows[0].bytes_count == 123456
    assert flows[0].ip_version == 4


def test_netflow_v9_template_decodes_ipv4():
    decoder = TrafficFlowDecoder()
    header = struct.pack("!HHIIII", 9, 1, 1000, 1789240000, 1, 77)
    template_payload = struct.pack("!HH", 256, 3) + struct.pack("!HHHHHH", 8, 4, 12, 4, 1, 4)
    template_set = struct.pack("!HH", 0, 4 + len(template_payload)) + template_payload
    decoder.decode(header + template_set, "10.0.0.2")
    data = socket.inet_aton("10.10.10.10") + socket.inet_aton("8.8.8.8") + struct.pack("!I", 4096)
    data_set = struct.pack("!HH", 256, 4 + len(data)) + data
    _, flows = decoder.decode(header + data_set, "10.0.0.2")
    assert len(flows) == 1
    assert flows[0].source_ip == "10.10.10.10"
    assert flows[0].destination_ip == "8.8.8.8"
    assert flows[0].bytes_count == 4096
    assert flows[0].ip_version == 4


def test_ipfix_template_decodes_ipv6():
    decoder = TrafficFlowDecoder()
    domain = 99
    template_payload = struct.pack("!HH", 300, 3) + struct.pack("!HHHHHH", 27, 16, 28, 16, 1, 8)
    template_set = struct.pack("!HH", 2, 4 + len(template_payload)) + template_payload
    packet_len = 16 + len(template_set)
    header = struct.pack("!HHIII", 10, packet_len, 1789240000, 1, domain)
    decoder.decode(header + template_set, "2001:db8::1")
    data = socket.inet_pton(socket.AF_INET6, "2001:db8:1::10") + socket.inet_pton(socket.AF_INET6, "2001:4860:4860::8888") + (987654).to_bytes(8, "big")
    data_set = struct.pack("!HH", 300, 4 + len(data)) + data
    header2 = struct.pack("!HHIII", 10, 16 + len(data_set), 1789240001, 2, domain)
    _, flows = decoder.decode(header2 + data_set, "2001:db8::1")
    assert len(flows) == 1
    assert flows[0].source_ip == "2001:db8:1::10"
    assert flows[0].bytes_count == 987654
    assert flows[0].ip_version == 6


def test_stage2_is_bounded_and_has_duplicate_detection():
    text = read("backend/app/services/traffic_flow_collector.py")
    assert "Queue(maxsize=512)" in text
    assert "digest = hashlib.blake2s" in text
    assert "self.duplicates += 1" in text
    assert "TRAFFIC_FLOW_ENABLED" in text
    assert "TRAFFIC_FLOW_BUFFER_FLOWS" in text
    assert '"false"' in text


def test_stage2_routeros_control_is_explicit_and_not_mass_configuration():
    text = read("backend/app/routers/red/traffic_flow.py")
    assert '/traffic-flow/configure' in text
    assert '/traffic-flow/disable' in text
    assert '/ip/traffic-flow/set' in text
    assert 'version: str = "9"' in text
    assert "router_id" in text


def test_stage2_wired_into_server_and_release():
    server = read("backend/server.py")
    version = read("frontend/src/modules/system-update/version.js")
    continuity = read("docs/CONTINUIDAD_Z-HUB-v1.3.md")
    assert "traffic_flow_runtime.start()" in server
    assert "traffic_flow_router" in server
    assert 'PANEL_VERSION = "1.3.33"' in version
    assert "Registro de Tráfico · Etapa 2/5" in continuity
