from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]


def read(path):
    return (ROOT / path).read_text(encoding="utf-8")


def compact(text):
    return "".join(text.split())


def test_trial_contract_is_30_days_and_exposes_dates_warning_and_read_only():
    manager = read("backend/app/core/license_manager.py")
    assert "TRIAL_DAYS = 30" in manager
    assert "def trial_started_at(" in manager
    assert "def trial_expires_at(" in manager
    assert "def trial_warning_level(" in manager
    assert '"trial_started_at"' in manager
    assert '"trial_expires_at"' in manager
    assert '"trial_warning_level"' in manager
    assert '"read_only": status in {"invalid", "missing", "trial_expired"}' in manager


def test_persisted_snapshot_no_longer_authorizes_by_itself():
    manager = read("backend/app/core/license_manager.py")
    assert "_has_persisted_snapshot" not in manager
    assert "BLOCKED_LICENSE_STATUSES" in manager
    assert '_is_blocked_license_status(row.get("status"))' in manager
    assert 'return "invalid"' in manager


def test_license_recovery_blocks_writes_but_keeps_recovery_paths():
    guard = read("backend/app/core/license_guard.py")
    assert 'TRIAL_EXPIRED_CODE = "TRIAL_EXPIRED"' in guard
    assert 'LICENSE_REQUIRED_CODE = "LICENSE_REQUIRED"' in guard
    assert 'BLOCKED_LICENSE_STATUSES = {"trial_expired", "invalid", "missing"}' in guard
    assert 'WRITE_METHODS = {"POST", "PUT", "PATCH", "DELETE"}' in guard
    assert '"/api/auth/login"' in guard
    assert '"/api/auth/logout"' in guard
    assert '"/api/license/activate"' in guard
    assert '"/api/system-update"' in guard
    assert "async def enforce_trial_write_access(" in guard
    assert "status not in BLOCKED_LICENSE_STATUSES" in guard
    assert "status_code=403" in guard


def test_trial_write_guard_is_global_api_dependency():
    server = read("backend/server.py")
    dense = compact(server)
    assert "enforce_trial_write_access" in server
    assert 'APIRouter(prefix="/api",dependencies=[Depends(enforce_trial_write_access)])' in dense
    assert "license_router" in server


def test_manual_activation_endpoint_is_retained_only_as_backend_compatibility():
    router = read("backend/app/routers/license/router.py")
    assert 'APIRouter(prefix="/license"' in router
    assert '@router.get("/info")' in router
    assert '@router.post("/activate", dependencies=[Depends(require_role("admin"))])' in router
    assert 'license_type not in {"PAID", "TRIAL"}' in router
    assert "apply_license_metadata" in router


def test_customer_license_ui_is_read_only_and_commercial():
    view = read("frontend/src/modules/ajustes/LicenseSettings.jsx")
    assert "Installation ID" in view
    assert "Días restantes" in view
    assert "Capacidad autorizada" in view
    assert "Vencimiento" in view
    assert "Solicitar licencia" in view
    assert "Cambiar plan" in view
    assert "Sin vencimiento" in view
    assert "servicios" in view
    assert "por WhatsApp" in view
    assert "sales_whatsapp" in view
    assert "wa.me" in view
    assert 'axios.post(`${API}/license/activate`' not in view
    assert "activationKey" not in view
    assert "license_key_masked" not in view


def test_release_contract_remains_versioned():
    version = read("frontend/src/modules/system-update/version.js")
    assert re.search(r'PANEL_VERSION = "1\.3\.\d+"', version)
    assert 'export const CHANGELOG = [' in version
