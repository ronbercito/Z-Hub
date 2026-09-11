from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def read(path):
    return (ROOT / path).read_text(encoding="utf-8")


def test_layout_redirects_expired_trial_to_license_settings():
    layout = read("frontend/src/components/layout/Layout.jsx")
    assert '/license/info' in layout
    assert 'response.data?.status === "trial_expired"' in layout
    assert 'setActiveTab("ajustes")' in layout
    assert 'setSettingsModalSection("license")' in layout


def test_license_view_has_commercial_actions():
    view = read("frontend/src/modules/ajustes/LicenseSettings.jsx")
    assert 'Pagar licencia' in view
    assert 'Contactar por WhatsApp' in view
    assert 'sales_whatsapp' in view
    assert 'payment_url' in view
    assert 'wa.me' in view


def test_backend_exposes_commercial_contact_without_hardcoding():
    config = read("backend/app/core/config.py")
    router = read("backend/app/routers/license/router.py")
    assert 'ZHUB_LICENSE_WHATSAPP' in config
    assert 'ZHUB_LICENSE_PAYMENT_URL' in config
    assert '"sales_whatsapp": ZHUB_LICENSE_WHATSAPP' in router
    assert '"payment_url": ZHUB_LICENSE_PAYMENT_URL' in router
