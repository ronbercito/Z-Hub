from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def test_backend_fetches_public_contact_with_local_fallback():
    helper = read("backend/app/core/license_contact.py")
    router = read("backend/app/routers/license/router.py")
    assert '"/v1/public/contact"' in helper
    assert "get_commercial_contact" in router
    assert 'remote_whatsapp or ZHUB_LICENSE_WHATSAPP' in router
    assert '"sales_contact_source"' in router


def test_license_ui_is_compact_and_uses_synced_contact():
    view = read("frontend/src/modules/ajustes/LicenseSettings.jsx")
    compact = read("frontend/src/modules/ajustes/license-settings-compact.css")
    assert 'license-settings-compact.css' in view
    assert "sales_business_name" in view
    assert "sales_contact_name" in view
    assert "sales_email" in view
    assert "Contacto sincronizado desde Web-Licence" in view
    assert "WhatsApp aún no está configurado en Web-Licence" in view
    assert ".license-commercial" in compact


def test_release_and_continuity_are_136():
    version = read("frontend/src/modules/system-update/version.js")
    continuity = read("docs/CONTINUIDAD_Z-HUB-v1.3.md")
    assert 'PANEL_VERSION = "1.3.6"' in version
    assert "1.3.6" in continuity
    assert "/v1/public/contact" in continuity
    assert "backup/pre-license-contact-sync-1.3.6-20260912" in continuity
