from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]


def source(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def test_timezone_setting_defaults_to_lima_and_is_validated():
    model = source("backend/app/models/setting.py")
    router = source("backend/app/routers/ajustes/router.py")
    assert '"app_timezone": "America/Lima"' in model
    assert "ZoneInfo(timezone)" in router
    assert "Zona horaria no válida" in router


def test_system_settings_exposes_timezone_selector():
    modal = source("frontend/src/modules/ajustes/SettingsModal.jsx")
    panel = source("frontend/src/modules/ajustes/SystemSettings.jsx")
    assert 'section==="system"?<SystemSettings/>' in modal
    assert 'value: "America/Lima"' in panel
    assert "Guardar zona horaria" in panel


def test_automatizado_vip_history_uses_configured_timezone():
    history = source("frontend/src/modules/mensajeria/AutomatizadoVIPHistory.jsx")
    assert 'settingsResponse.data?.app_timezone || "America/Lima"' in history
    assert 'timeZone: timezone || "America/Lima"' in history
    assert "`${text}Z`" in history
