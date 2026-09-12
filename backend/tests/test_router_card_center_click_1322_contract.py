from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def test_empty_children_do_not_create_pointer_blocking_center_area():
    card = read("frontend/src/modules/red/components/RouterCard.jsx")
    assert 'const childNodes = React.Children.toArray(children).filter(Boolean);' in card
    assert 'childNodes.length > 0' in card
    assert '{childNodes}' in card


def test_light_theme_delete_action_stays_high_contrast():
    css = read("frontend/src/modules/red/router-card-layout.css")
    assert 'background: #dc2626 !important;' in css
    assert 'border-color: #ffffff !important;' in css
    assert 'color: #ffffff !important;' in css


def test_release_1322_is_documented():
    version = read("frontend/src/modules/system-update/version.js")
    continuity = read("docs/CONTINUIDAD_Z-HUB-v1.3.md")
    assert 'PANEL_VERSION = "1.3.22"' in version
    assert "1.3.22" in continuity
    assert "backup/pre-router-card-center-click-1.3.22-20260912" in continuity
