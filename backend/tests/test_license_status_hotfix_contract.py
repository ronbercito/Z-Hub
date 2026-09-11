from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def read(path):
    return (ROOT / path).read_text(encoding="utf-8")


def test_license_registry_merges_repo_fallback_and_private_override():
    manager = read("backend/app/core/license_manager.py")
    assert "def _parse_license_file(path: Path)" in manager
    assert "rows = _parse_license_file(REPO_LICENSE_FILE)" in manager
    assert "rows.update(_parse_license_file(PRIVATE_LICENSE_FILE))" in manager


def test_private_registry_keeps_priority_over_fallback():
    manager = read("backend/app/core/license_manager.py")
    assert "El registro privado tiene prioridad" in manager
    assert "BLOCKED_LICENSE_STATUSES" in manager
    assert "_is_blocked_license_status" in manager


def test_historical_active_statuses_are_normalized():
    manager = read("backend/app/core/license_manager.py")
    assert 'ACTIVE_LICENSE_STATUSES = {"ACTIVA", "ACTIVO", "ACTIVE", "VALIDA", "VÁLIDA"}' in manager
    assert 'return "ACTIVA"' in manager


def test_only_explicit_block_blocks_persisted_snapshot():
    manager = read("backend/app/core/license_manager.py")
    assert 'if row is not None and _is_blocked_license_status(row.get("status")):' in manager
    assert 'if _has_persisted_snapshot(data):\n        return "active"' in manager
    assert 'if row is not None and _is_active_license_status(row.get("status")):' in manager


def test_release_contains_license_status_hotfix():
    version = read("frontend/src/modules/system-update/version.js")
    assert 'PANEL_VERSION = "1.2.64"' in version
    assert "estado histórico" in version.lower() or "snapshot" in version.lower()
