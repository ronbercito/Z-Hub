from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def test_hardware_id_uses_multiple_local_signals_and_sha256_only():
    hw = read("backend/app/core/hardware_id.py")
    assert 'Path("/etc/machine-id")' in hw
    assert 'Path("/sys/class/dmi/id/product_uuid")' in hw
    assert 'Path("/sys/class/dmi/id/product_serial")' in hw
    assert 'uuid.getnode()' in hw
    assert 'hashlib.sha256' in hw
    assert 'hexdigest()' in hw


def test_auto_trial_client_calls_web_licence_without_curl_insecure():
    client = read("backend/app/core/auto_trial.py")
    assert '/v1/public/trials/activate' in client
    assert '"hardware_id": hardware_id()' in client
    assert '"installation_id"' in client
    assert 'AutoTrialRejected' in client
    assert 'AutoTrialUnavailable' in client
    assert 'curl -k' not in client


def test_stage4_wizard_uses_backend_auto_trial_without_license_key_input():
    wizard = read("frontend/src/modules/setup/SetupWizard.jsx")
    router = read("backend/app/routers/setup/router.py")
    assert 'axios.post(`${API}/setup/auto-trial`' in wizard
    assert 'SERIE DE LICENCIA' not in wizard
    assert 'licenseKey' not in wizard
    assert '@router.post("/auto-trial")' in router
    assert 'activate_auto_trial' in router
    assert 'await axios.post(`${API}/setup/complete`, {})' in wizard
    assert 'req.license_key' not in router[router.index('@router.post("/complete")'):]


def test_panel_version_starts_130_series():
    version = read("frontend/src/modules/system-update/version.js")
    assert 'PANEL_VERSION = "1.3.0"' in version
    continuity = read("docs/CONTINUIDAD_Z-HUB-v1.3.md")
    assert "1.3.0" in continuity
    assert "Etapa 4/7" in continuity
