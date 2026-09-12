from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def _read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def test_stage3_worker_associates_service_identity_and_hourly_buckets():
    text = _read("backend/app/services/traffic_aggregation.py")
    for token in (
        "ServiceIdentity",
        "ClientService",
        "TrafficIdentity",
        "TrafficAggregate",
        'bucket_type="hour"',
        "download_bytes",
        "upload_bytes",
        "total_bytes",
        "flow_count",
        "TrafficAggregate.period_start.in_(periods)",
    ):
        assert token in text


def test_stage3_direction_is_source_upload_destination_download():
    text = _read("backend/app/services/traffic_aggregation.py")
    assert "identities.get(flow.source_ip)" in text
    assert "identities.get(flow.destination_ip)" in text
    assert "self._add_direction(src_identity, flow, download=False)" in text
    assert "self._add_direction(dst_identity, flow, download=True)" in text


def test_stage3_is_opt_in_and_uses_bounded_collector_queue():
    service = _read("backend/app/services/traffic_aggregation.py")
    server = _read("backend/server.py")
    assert 'TRAFFIC_FLOW_AGGREGATION_ENABLED' in service
    assert 'TRAFFIC_FLOW_BUFFER_FLOWS' in server
    assert "traffic_aggregation_runtime.run()" in server
    assert "traffic_flow_runtime.queue.get()" in service
    assert "traffic_flow_runtime.queue.task_done()" in service


def test_stage3_exposes_operational_status_without_raw_flow_storage():
    route = _read("backend/app/routers/red/traffic_flow.py")
    service = _read("backend/app/services/traffic_aggregation.py")
    assert '@router.get("/traffic-flow/aggregation")' in route
    assert "traffic_aggregation_runtime.status()" in route
    assert "persiste únicamente agregados horarios" in service
    assert "Los flujos crudos viven solo en la cola acotada" in service


def test_stage3_version_and_continuity_contract():
    version = _read("frontend/src/modules/system-update/version.js")
    continuity = _read("docs/CONTINUIDAD_Z-HUB-v1.3.md")
    assert 'PANEL_VERSION = "1.3.35"' in version
    assert "1.3.35 — Registro de Tráfico · Etapa 3/5" in continuity
    assert "TRAFFIC_FLOW_AGGREGATION_ENABLED=true" in continuity
    assert "No cambia el contrato Z-Hub ↔ Web-Licence" in continuity
