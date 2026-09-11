from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def read(path):
    return (ROOT / path).read_text(encoding="utf-8")


def test_license_manager_centralizes_plan_and_capacity_contract():
    manager = read("backend/app/core/license_manager.py")
    assert '"PLAN_100": 100' in manager
    assert '"PLAN_200": 200' in manager
    assert '"PLAN_800": 800' in manager
    assert '"PLAN_1000": 1000' in manager
    assert '"UNLIMITED": None' in manager
    assert 'TRIAL_DAYS = 30' in manager
    assert 'TRIAL_MAX_CLIENTS = 20' in manager
    assert 'NON_COUNTING_CLIENT_STATUSES = {"retired"}' in manager


def test_license_manager_exposes_stage2_api():
    manager = read("backend/app/core/license_manager.py")
    for name in (
        "get_license_record",
        "get_license",
        "get_status",
        "get_client_limit",
        "get_client_usage",
        "can_create_client",
        "is_trial",
        "trial_days_remaining",
        "apply_license_metadata",
    ):
        assert f"def {name}(" in manager or f"async def {name}(" in manager


def test_legacy_paid_licenses_remain_unlimited_but_trial_is_limited():
    manager = read("backend/app/core/license_manager.py")
    assert 'plan = plan or "UNLIMITED"' in manager
    assert 'if license_type == "TRIAL":' in manager
    assert 'max_clients = TRIAL_MAX_CLIENTS' in manager
    assert 'if is_trial(data):\n        return TRIAL_MAX_CLIENTS' in manager
    assert 'if str(info.get("type", "")).upper() == "TRIAL":\n        return True' not in manager


def test_setup_uses_license_manager_instead_of_own_parser():
    setup = read("backend/app/routers/setup/router.py")
    assert "from app.core.license_manager import" in setup
    assert "resolve_license_record" in setup
    assert "apply_license_metadata" in setup
    assert "REPO_LICENSE_FILE" not in setup
    assert "PRIVATE_LICENSE_FILE" not in setup
    assert "def _licenses" not in setup


def test_settings_store_normalized_license_snapshot():
    settings = read("backend/app/models/setting.py")
    assert '"license_type": ""' in settings
    assert '"license_plan": ""' in settings
    assert '"license_max_clients": None' in settings
    assert '"license_activated_at": ""' in settings
    assert '"license_expires_at": ""' in settings


def test_remote_trial_expiration_is_preserved_and_authoritative():
    remote = read("backend/app/core/license_remote.py")
    manager = read("backend/app/core/license_manager.py")
    assert '"expires_at": payload.get("expires_at")' in remote
    assert 'remote_expires = _parse_datetime(data.get("license_expires_at"))' in manager
    assert 'result["license_expires_at"] = remote_expires.isoformat()' in manager
    assert 'return remote_expires' in manager
    assert 'started + timedelta(days=TRIAL_DAYS)' in manager


def test_stage2_keeps_capacity_decision_out_of_client_crud_implementation():
    clients = read("backend/app/routers/clientes/router.py")
    assert "can_create_client" not in clients
    assert "CLIENT_LIMIT_REACHED" not in clients


def test_release_contract_remains_versioned():
    version = read("frontend/src/modules/system-update/version.js")
    assert 'export const PANEL_VERSION = ' in version
    assert 'export const CHANGELOG = [' in version
