from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
LICENSE_UI = ROOT / "frontend/src/modules/ajustes/LicenseSettings.jsx"
VERSION = ROOT / "frontend/src/modules/system-update/version.js"


def test_whatsapp_message_is_presentable_and_keeps_installation_context():
    source = LICENSE_UI.read_text(encoding="utf-8")
    assert '"Hola, buen día."' in source
    assert '"Datos de mi instalación:"' in source
    assert '• Installation ID:' in source
    assert '• Plan actual:' in source
    assert '• Capacidad utilizada:' in source
    assert '• Estado:' in source
    assert 'planes disponibles' in source
    assert 'pasar mi Z-Hub Trial a una licencia pagada' not in source


def test_release_version_is_137():
    source = VERSION.read_text(encoding="utf-8")
    assert 'PANEL_VERSION = "1.3.7"' in source
