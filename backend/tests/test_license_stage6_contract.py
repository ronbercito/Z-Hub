from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def read(path):
    return (ROOT / path).read_text(encoding="utf-8")


def test_remote_client_uses_signed_authorization_and_cache():
    remote = read("backend/app/core/license_remote.py")
    assert 'algorithms=["RS256"]' in remote
    assert '"/v1/licenses/validate"' in remote
    assert "ZHUB_LICENSE_CACHE_FILE" in remote
    assert "LicenseServerRejected" in remote
    assert "LicenseServerUnavailable" in remote
    assert "_write_cache(token)" in remote
    assert "_read_cache()" in remote


def test_remote_rejection_does_not_use_cache():
    remote = read("backend/app/core/license_remote.py")
    assert "except LicenseServerRejected:" in remote
    assert "raise" in remote
    assert "Rechazo explícito" in remote


def test_license_manager_prefers_remote_when_configured_and_keeps_transition():
    manager = read("backend/app/core/license_manager.py")
    assert "async def resolve_license_record(" in manager
    assert "remote_enabled()" in manager
    assert "resolve_remote_license" in manager
    assert '"source": "local-transition"' in manager
    assert '"license_installation_id"' in manager
    assert '"validation_source"' in manager
    assert '"license_server_online"' in manager


def test_setup_and_paid_activation_use_unified_remote_resolution():
    setup = read("backend/app/routers/setup/router.py")
    license_router = read("backend/app/routers/license/router.py")
    assert "await resolve_license_record(db" in setup
    assert "await resolve_license_record(db" in license_router


def test_license_server_validates_authorized_installation_and_signs_rs256():
    server = read("license_server/app/main.py")
    assert '@app.post("/v1/licenses/validate")' in server
    assert "_installation_allowed" in server
    assert 'algorithm="RS256"' in server
    assert '"grace_until"' in server
    assert "validations" in server
    assert '"/admin/licenses/{license_key}"' in server
    assert "def upsert_license(" in server


def test_stage6_deployment_assets_exist():
    assert (ROOT / "license_server/deploy/zhub-license-server.service").exists()
    assert (ROOT / "license_server/deploy/nginx.conf.example").exists()
    assert (ROOT / "license_server/scripts/generate_keys.sh").exists()
    assert (ROOT / "license_server/README.md").exists()


def test_stage6_release_remains_present_after_future_versions():
    version = read("frontend/src/modules/system-update/version.js")
    assert "PANEL_VERSION" in version
    server = read("license_server/app/main.py")
    assert "Z-Hub License Server" in server
    assert "GRACE_HOURS" in server


def test_installer_preserves_remote_license_environment():
    deploy = read("deploy/install.sh")
    template = read("deploy/supervisor/zhub_backend.conf.template")
    assert 'SUPERVISOR_CONF="/etc/supervisor/conf.d/zhub_backend.conf"' in deploy
    assert "CURRENT_SUPERVISOR_ENV" in deploy
    assert "ZHUB_SUPERVISOR_LICENSE_ENV" in deploy
    assert "ZHUB_LICENSE_SERVER_URL" in deploy
    assert "ZHUB_LICENSE_SERVER_PUBLIC_KEY_FILE" in deploy
    assert 'environment=PYTHONUNBUFFERED=1${ZHUB_SUPERVISOR_LICENSE_ENV}' in template
    assert "192.168.10.240" not in deploy
    assert "192.168.10.240" not in template

