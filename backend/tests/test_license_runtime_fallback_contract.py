from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def read(path):
    return (ROOT / path).read_text(encoding="utf-8")


def test_packaged_license_fallback_exists_and_contains_demo_002():
    fallback = read("backend/app/core/license_fallback.txt")
    assert "ZHUB-2026-DEMO-002" in fallback
    assert "ESTADO: ACTIVA" in fallback


def test_license_manager_reads_runtime_packaged_fallback():
    manager = read("backend/app/core/license_manager.py")
    assert 'Path(__file__).resolve().parent / "license_fallback.txt"' in manager
    assert "rows = _parse_license_file(REPO_LICENSE_FILE)" in manager
    assert "rows.update(_parse_license_file(PRIVATE_LICENSE_FILE))" in manager


def test_old_repo_license_path_is_not_used_as_runtime_fallback():
    manager = read("backend/app/core/license_manager.py")
    assert 'parents[3] / "licencia" / "licencias.txt"' not in manager
