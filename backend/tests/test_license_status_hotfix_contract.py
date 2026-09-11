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
    assert "el registro privado siempre tiene prioridad" in manager.lower() or "El registro privado tiene prioridad" in manager
    assert 'row is not None and row.get("status") != "ACTIVA"' in manager


def test_release_contains_license_status_hotfix():
    version = read("frontend/src/modules/system-update/version.js")
    assert 'PANEL_VERSION = "1.2.63"' in version
    assert "LICENCIA NO VÁLIDA" in version
