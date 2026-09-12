from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def test_capacity_counts_only_active_subscribers():
    manager = read("backend/app/core/license_manager.py")
    assert 'ACTIVE_CLIENT_STATUS = "active"' in manager
    assert 'Client.status == ACTIVE_CLIENT_STATUS' in manager
    assert '"PLAN_300": 300' in manager
    assert '"PLAN_500": 500' in manager
    assert '"ILIMITADO": None' in manager


def test_full_capacity_blocks_only_new_or_reactivated_subscribers():
    guard = read("backend/app/core/license_guard.py")
    assert 'request.method == "POST" and path == "/api/clients"' in guard
    assert 'toggle-status' in guard
    assert 'resume-pause' in guard
    assert 'status_code=409' in guard
    assert 'Todas las demás funciones del panel continúan disponibles' in guard
    assert 'WRITE_METHODS' in guard


def test_paid_ui_has_no_time_renewal():
    view = read("frontend/src/modules/ajustes/LicenseSettings.jsx")
    assert 'Licencia sin vencimiento administrada por capacidad' in view
    assert 'Cambiar plan' in view
    assert 'renovar o revisar mi licencia' not in view


def test_capacity_contract_survives_later_13x_releases():
    version = read("frontend/src/modules/system-update/version.js")
    continuity = read("docs/CONTINUIDAD_Z-HUB-v1.3.md")
    match = re.search(r'PANEL_VERSION\s*=\s*"(\d+)\.(\d+)\.(\d+)"', version)
    assert match
    assert tuple(map(int, match.groups())) >= (1, 3, 4)
    assert '1.3.4' in continuity
    assert 'abonados activos' in continuity
    assert 'backup/pre-capacity-only-licensing-1.3.4-20260911' in continuity
