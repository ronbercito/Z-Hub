from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def read(path):
    return (ROOT / path).read_text(encoding="utf-8")


def test_trial_contract_is_30_days_and_exposes_dates_warning_and_read_only():
    manager = read("backend/app/core/license_manager.py")
    assert "TRIAL_DAYS = 30" in manager
    assert "def trial_started_at(" in manager
    assert "def trial_expires_at(" in manager
    assert "def trial_warning_level(" in manager
    assert '"trial_started_at"' in manager
    assert '"trial_expires_at"' in manager
    assert '"trial_warning_level"' in manager
    assert '"read_only": status == "trial_expired"' in manager


def test_legacy_snapshot_fixes_false_invalid_without_ignoring_explicit_inactive_row():
    manager = read("backend/app/core/license_manager.py")
    assert "def _has_persisted_snapshot(" in manager
    assert 'row is not None and row.get("status") != "ACTIVA"' in manager
    assert "if _has_persisted_snapshot(data):" in manager


def test_trial_expiry_blocks_writes_but_keeps_recovery_paths():
    guard = read("backend/app/core/license_guard.py")
    assert 'TRIAL_EXPIRED_CODE = "TRIAL_EXPIRED"' in guard
    assert 'WRITE_METHODS = {"POST", "PUT", "PATCH", "DELETE"}' in guard
    assert '"/api/auth/login"' in guard
    assert '"/api/auth/logout"' in guard
    assert '"/api/license/activate"' in guard
    assert '"/api/system-update"' in guard
    assert "async def enforce_trial_write_access(" in guard
    assert 'info.get("status") != "trial_expired"' in guard
    assert "status_code=403" in guard


def test_trial_write_guard_is_global_api_dependency():
    server = read("backend/server.py")
    assert "enforce_trial_write_access" in server
    assert 'APIRouter(prefix="/api", dependencies=[Depends(enforce_trial_write_access)])' in server
    assert "license_router" in server


def test_paid_activation_requires_admin_and_preserves_data_path():
    router = read("backend/app/routers/license/router.py")
    assert 'APIRouter(prefix="/license"' in router
    assert '@router.get("/info")' in router
    assert '@router.post("/activate", dependencies=[Depends(require_role("admin"))])' in router
    assert 'record.get("type") != "PAID"' in router
    assert "apply_license_metadata" in router
    assert "await db.commit()" in router


def test_license_ui_shows_trial_dates_warnings_and_paid_activation():
    view = read("frontend/src/modules/ajustes/LicenseSettings.jsx")
    assert "Inicio Trial" in view
    assert "Fin Trial" in view
    assert "trial_warning_level" in view
    assert "modo consulta" in view
    assert 'axios.post(`${API}/license/activate`' in view
    assert 'user?.role === "admin"' in view


def test_release_contract_remains_versioned():
    version = read("frontend/src/modules/system-update/version.js")
    assert 'export const PANEL_VERSION = ' in version
    assert 'export const CHANGELOG = [' in version
    assert "Trial" in version
