from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def read(path):
    return (ROOT / path).read_text(encoding="utf-8")


def test_license_registry_uses_private_runtime_registry_only():
    manager = read("backend/app/core/license_manager.py")
    assert "def _parse_license_file(path: Path)" in manager
    assert "return _parse_license_file(PRIVATE_LICENSE_FILE)" in manager
    assert "REPO_LICENSE_FILE" not in manager


def test_private_registry_still_supports_blocked_statuses():
    manager = read("backend/app/core/license_manager.py")
    assert "BLOCKED_LICENSE_STATUSES" in manager
    assert "_is_blocked_license_status" in manager


def test_historical_active_statuses_are_normalized():
    manager = read("backend/app/core/license_manager.py")
    assert 'ACTIVE_LICENSE_STATUSES = {"ACTIVA", "ACTIVO", "ACTIVE", "VALIDA", "VÁLIDA"}' in manager
    assert 'return "ACTIVA"' in manager


def test_persisted_snapshot_alone_is_not_authorization():
    manager = read("backend/app/core/license_manager.py")
    assert '_is_blocked_license_status(row.get("status"))' in manager
    assert "_has_persisted_snapshot" not in manager
    assert '_is_active_license_status(row.get("status"))' in manager
    assert 'return "invalid"' in manager


def test_hotfix_contract_survives_future_releases():
    version = read("frontend/src/modules/system-update/version.js")
    assert 'PANEL_VERSION = "1.2.' in version
    manager = read("backend/app/core/license_manager.py")
    assert "PRIVATE_LICENSE_FILE" in manager
