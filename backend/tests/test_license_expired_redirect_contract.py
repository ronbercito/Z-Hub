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


def test_license_view_has_recovery_and_commercial_actions():
    view = read("frontend/src/modules/ajustes/LicenseSettings.jsx")
    assert "Esta instalación necesita una nueva licencia" in view
    assert "esta ventana permanecerá bloqueada" in view
    assert "Pagar licencia" in view
    assert "Contactar por WhatsApp" in view
    assert "sales_whatsapp" in view
    assert "payment_url" in view
    assert "wa.me" in view


def test_backend_exposes_commercial_contact_without_hardcoding():
    config = read("backend/app/core/config.py")
    router = read("backend/app/routers/license/router.py")
    assert 'ZHUB_LICENSE_WHATSAPP' in config
    assert 'ZHUB_LICENSE_PAYMENT_URL' in config
    assert '"sales_whatsapp": ZHUB_LICENSE_WHATSAPP' in router
    assert '"payment_url": ZHUB_LICENSE_PAYMENT_URL' in router
