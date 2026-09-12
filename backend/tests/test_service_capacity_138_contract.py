from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def test_capacity_counts_services_and_preserves_suspended_paused():
    usage = read("backend/app/core/license_usage.py")
    assert 'CAPACITY_STATUSES = ("active", "suspended", "paused")' in usage
    assert "ClientService" in usage
    assert "primary + additional" in usage


def test_guard_blocks_new_additional_service_not_resume():
    guard = read("backend/app/core/license_guard.py")
    server = read("backend/server.py")
    assert 'r"/api/clients/[^/]+/services"' in guard
    assert "client_services_router" in server
    assert "enforce_client_capacity" in server
    assert "resume-pause" in guard
    assert "volver a active" in guard


def test_ui_and_release_keep_138_service_capacity_contract_after_later_releases():
    view = read("frontend/src/modules/ajustes/LicenseSettings.jsx")
    version = read("frontend/src/modules/system-update/version.js")
    continuity = read("docs/CONTINUIDAD_Z-HUB-v1.3.md")
    match = re.search(r'PANEL_VERSION\s*=\s*"(\d+)\.(\d+)\.(\d+)"', version)
    assert match
    assert tuple(map(int, match.groups())) >= (1, 3, 8)
    assert "1.3.8" in continuity
    assert "servicios contabilizados" in view
    assert "suspendido/cortado" in view
    assert "servicio adicional consume un cupo" in view
