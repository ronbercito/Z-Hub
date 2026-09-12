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


def test_stage3_does_not_change_wizard_yet():
    wizard = read("frontend/src/modules/setup/SetupWizard.jsx")
    assert 'axios.post(`${API}/setup/license`, { license_key: licenseKey })' in wizard
    assert '/v1/public/trials/activate' not in wizard


def test_panel_version_is_1299():
    version = read("frontend/src/modules/system-update/version.js")
    assert 'PANEL_VERSION = "1.2.99"' in version
