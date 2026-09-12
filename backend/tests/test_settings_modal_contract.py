from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def read(path):
    return (ROOT / path).read_text(encoding="utf-8")


def compact(text):
    return "".join(text.split())


def test_settings_cards_open_modal_not_full_page():
    layout = read("frontend/src/components/layout/Layout.jsx")
    assert 'import SettingsModal from "../../modules/ajustes/SettingsModal"' in layout
    assert 'case "ajustes": return <SettingsHome onOpen={openSettingsSection} />;' in layout
    assert 'setSettingsModalSection(section)' in layout
    assert '<SettingsModal section={settingsModalSection}' in layout


def test_modal_closes_normally_but_supports_locked_license_recovery():
    modal = read("frontend/src/modules/ajustes/SettingsModal.jsx")
    dense = compact(modal)
    assert 'locked = false' in modal
    assert 'onMouseDown={locked?undefined:onClose}' in dense
    assert 'event.key==="Escape"' in dense
    assert 'axios.interceptors.response.use' in modal
    assert '["post","put","patch","delete"].includes(method)' in dense
    assert 'isWrite&&!isUtilityAction' in dense
    assert '{!locked&&<button' in dense


def test_modal_is_compact_and_theme_aware():
    css = read("frontend/src/modules/ajustes/settings-modal.css")
    assert 'width:min(980px,92vw)' in css
    assert 'max-height:min(82vh,820px)' in css
    assert '.settings-modal-scroll' in css
    assert 'html[data-panel-theme="zhub-light"]' in css
    assert 'html[data-panel-theme="zhub-dark"]' in css
    assert '--sm-surface:#ffffff' in css
    assert '--sm-surface:#14243a' in css
    assert '.settings-modal-panel input:not([type="checkbox"])' in css
    assert '.settings-modal-panel select' in css
    assert '.settings-modal-panel textarea' in css
    assert 'input[type="file"]::file-selector-button' in css


def test_staff_permission_buttons_are_theme_aware():
    css = read("frontend/src/modules/ajustes/settings-modal.css")
    assert 'section.mx-auto.max-w-6xl button.bg-slate-800' in css
    assert 'section.mx-auto.max-w-6xl button.bg-cyan-500\\/20' in css
    assert 'background:#f7fafc!important' in css
    assert 'background:#dff4fb!important' in css
    assert 'border-color:#27a9cf!important' in css


def test_release_version_contract_exists():
    version = read("frontend/src/modules/system-update/version.js")
    assert 'export const PANEL_VERSION = ' in version
    assert 'export const CHANGELOG = [' in version
