from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def read(path):
    return (ROOT / path).read_text(encoding="utf-8")


def compact(text):
    return "".join(text.split())


def test_layout_locks_invalid_missing_or_expired_license_in_settings():
    layout = read("frontend/src/components/layout/Layout.jsx")
    assert '/license/info' in layout
    assert 'LOCKED_LICENSE_STATUSES' in layout
    assert '"trial_expired", "invalid", "missing"' in layout
    assert 'setLicenseLocked(blocked)' in layout
    assert 'setActiveTab("ajustes")' in layout
    assert 'setSettingsModalSection("license")' in layout
    assert 'locked={licenseLocked && settingsModalSection === "license"}' in layout


def test_settings_modal_cannot_close_while_license_is_locked():
    modal = read("frontend/src/modules/ajustes/SettingsModal.jsx")
    dense = compact(modal)
    assert "locked = false" in modal
    assert "if (!section || locked) return undefined" in modal
    assert 'onMouseDown={locked?undefined:onClose}' in dense
    assert '{!locked&&<button' in dense
    assert 'section==="license"?<LicenseSettingslocked={locked}/>' in dense


def test_license_view_routes_recovery_to_whatsapp_without_manual_key_entry():
    view = read("frontend/src/modules/ajustes/LicenseSettings.jsx")
    assert "Esta instalación necesita una licencia activa" in view
    assert "Tus datos permanecen intactos" in view
    assert "Actualizar estado" in view
    assert "Solicitar licencia" in view
    assert "Renovar licencia" in view
    assert "sales_whatsapp" in view
    assert "wa.me" in view
    assert "payment_url" not in view
    assert "Pagar licencia" not in view
    assert "activationKey" not in view


def test_backend_still_exposes_commercial_contact_without_hardcoding():
    config = read("backend/app/core/config.py")
    router = read("backend/app/routers/license/router.py")
    assert 'ZHUB_LICENSE_WHATSAPP' in config
    assert '"sales_whatsapp": ZHUB_LICENSE_WHATSAPP' in router
