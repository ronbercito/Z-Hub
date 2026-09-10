from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def read(path):
    return (ROOT / path).read_text(encoding="utf-8")


def test_settings_cards_open_modal_not_full_page():
    layout = read("frontend/src/components/layout/Layout.jsx")
    assert 'import SettingsModal from "../../modules/ajustes/SettingsModal"' in layout
    assert 'case "ajustes": return <SettingsHome onOpen={openSettingsSection} />;' in layout
    assert 'setSettingsModalSection(section)' in layout
    assert '<SettingsModal section={settingsModalSection}' in layout


def test_modal_closes_outside_escape_and_after_successful_save():
    modal = read("frontend/src/modules/ajustes/SettingsModal.jsx")
    assert 'onMouseDown={onClose}' in modal
    assert 'event.key === "Escape"' in modal
    assert 'axios.interceptors.response.use' in modal
    assert '["post", "put", "patch", "delete"].includes(method)' in modal
    assert 'isWrite && !isUtilityAction' in modal


def test_modal_is_compact_and_theme_aware():
    css = read("frontend/src/modules/ajustes/settings-modal.css")
    assert 'width:min(980px,92vw)' in css
    assert 'max-height:min(82vh,820px)' in css
    assert '.settings-modal-scroll' in css
    assert 'html[data-panel-theme="zhub-light"]' in css


def test_release_version():
    version = read("frontend/src/modules/system-update/version.js")
    assert 'PANEL_VERSION = "1.2.55"' in version
