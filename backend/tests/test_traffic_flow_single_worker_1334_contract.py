from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def test_supervisor_uses_single_backend_worker_for_udp_collector():
    supervisor = read("deploy/supervisor/zhub_backend.conf.template")
    assert "--workers 1" in supervisor
    assert "--workers 2" not in supervisor
    assert "collector UDP Traffic Flow" in supervisor


def test_release_1334_documents_validation_hotfix_history():
    continuity = read("docs/CONTINUIDAD_Z-HUB-v1.3.md")
    assert "## 1.3.34 — Hotfix de validación Traffic Flow" in continuity
    assert "backup/pre-traffic-flow-worker-1.3.33-20260912" in continuity
    assert "Uvicorn con `--workers 2`" in continuity
