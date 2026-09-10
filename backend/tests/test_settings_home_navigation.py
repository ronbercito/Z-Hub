from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def source(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def test_settings_main_entry_opens_visual_home():
    layout = source("frontend/src/components/layout/Layout.jsx")
    sidebar = source("frontend/src/components/layout/Sidebar.jsx")

    assert 'import SettingsHome from "../../modules/ajustes/SettingsHome"' in layout
    assert 'case "ajustes": return <SettingsHome onOpen={openSettingsSection} />;' in layout
    assert '{ id:"ajustes",label:"Ajustes",icon:Settings,testId:TEST_IDS.NAV_AJUSTES },' in sidebar
    assert 'SETTINGS_SECTIONS.map' not in sidebar
    assert 'tab==="ajustes"||String(tab||"").startsWith("settings_")' in sidebar


def test_settings_home_keeps_cards_and_hover_states():
    home = source("frontend/src/modules/ajustes/SettingsHome.jsx")
    css = source("frontend/src/modules/ajustes/settings-home.css")

    assert 'settings-module-grid' in home
    assert 'Operativo' in home
    assert 'En desarrollo' in home
    assert 'module-tooltip' in home
    assert '.settings-module-card:hover' in css
    assert 'html[data-panel-theme="zhub-dark"]' in css
