from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def read(path):
    return (ROOT / path).read_text(encoding="utf-8")


def test_license_card_is_operational_in_settings_home():
    home = read("frontend/src/modules/ajustes/SettingsHome.jsx")
    assert 'id:"license"' in home
    assert 'label:"Licencia Z-Hub"' in home
    assert 'live:true' in home


def test_settings_modal_uses_dedicated_license_view():
    modal = read("frontend/src/modules/ajustes/SettingsModal.jsx")
    assert 'import LicenseSettings from "./LicenseSettings"' in modal
    assert 'section === "license" ? <LicenseSettings />' in modal


def test_license_view_shows_capacity_and_trial_without_paid_expiry():
    view = read("frontend/src/modules/ajustes/LicenseSettings.jsx")
    assert '/settings/license-info' in view
    assert 'Abonados usados' in view
    assert 'Capacidad' in view
    assert 'Disponibles' in view
    assert 'trial_days_remaining' in view
    assert 'Licencia pagada sin fecha de vencimiento.' in view
    assert 'capacity-track' in view


def test_license_api_masks_key_and_protects_internal_metadata():
    settings = read("backend/app/routers/ajustes/router.py")
    assert '@router.get("/license-info")' in settings
    assert 'license_key_masked' in settings
    assert 'LICENSE_INTERNAL_SETTINGS' in settings
    for key in ("license_key", "license_type", "license_plan", "license_max_clients", "license_activated_at"):
        assert f'"{key}"' in settings
    assert 'hidden = {"smtp_password_encrypted", *LICENSE_INTERNAL_SETTINGS}' in settings


def test_stage4_keeps_license_ui_read_only():
    view = read("frontend/src/modules/ajustes/LicenseSettings.jsx")
    assert 'axios.get(`${API}/settings/license-info`' in view
    assert 'axios.post(' not in view
    assert 'axios.put(' not in view
    assert 'axios.patch(' not in view
    assert 'axios.delete(' not in view


def test_release_contract_is_present():
    version = read("frontend/src/modules/system-update/version.js")
    assert 'export const PANEL_VERSION = ' in version
    assert 'export const CHANGELOG = [' in version
