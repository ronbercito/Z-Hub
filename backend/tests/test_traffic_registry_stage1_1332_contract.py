from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def test_stage1_models_keep_historical_identity_and_aggregates():
    text = (ROOT / "backend/app/models/traffic_registry.py").read_text(encoding="utf-8")
    for token in (
        'class TrafficIdentity', 'client_id', 'service_id', 'router_id', 'ip_address',
        'valid_from', 'valid_until', 'class TrafficAggregate', 'download_bytes',
        'upload_bytes', 'total_bytes', 'flow_count', 'data_source', 'processing_status',
    ):
        assert token in text


def test_stage1_collector_is_passive_and_ipv4_ipv6_ready():
    text = (ROOT / "backend/app/services/traffic_registry.py").read_text(encoding="utf-8")
    assert 'ip_address(source_ip)' in text
    assert 'ip_version=src.version' in text
    assert 'def collector_enabled()' in text
    assert 'return False' in text


def test_stage1_models_are_registered():
    text = (ROOT / "backend/app/models/__init__.py").read_text(encoding="utf-8")
    assert 'from .traffic_registry import TrafficIdentity, TrafficAggregate' in text
