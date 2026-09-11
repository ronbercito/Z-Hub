from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def read(path):
    return (ROOT / path).read_text(encoding="utf-8")


def test_packaged_license_fallback_no_longer_authorizes_demo_keys():
    fallback = read("backend/app/core/license_fallback.txt")
    assert "ZHUB-2026-DEMO-002" not in fallback
    assert "ESTADO: ACTIVA" not in fallback
    assert "NO autoriza instalaciones" in fallback


def test_license_manager_uses_only_private_local_registry_during_transition():
    manager = read("backend/app/core/license_manager.py")
    assert "return _parse_license_file(PRIVATE_LICENSE_FILE)" in manager
    assert "REPO_LICENSE_FILE" not in manager


def test_old_repo_license_path_is_not_used_as_runtime_fallback():
    manager = read("backend/app/core/license_manager.py")
    assert 'parents[3] / "licencia" / "licencias.txt"' not in manager
