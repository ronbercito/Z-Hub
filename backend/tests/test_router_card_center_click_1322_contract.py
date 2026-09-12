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
    assert 'html[data-panel-theme="zhub-light"] .router-modern-action--delete' in css
    assert 'color: #fff !important;' in css
    assert 'linear-gradient(135deg,#ff4b57,#e92638)' in css


def test_release_1322_history_is_preserved_after_later_releases():
    continuity = read("docs/CONTINUIDAD_Z-HUB-v1.3.md")
    assert "1.3.22" in continuity
    assert "backup/pre-router-card-center-click-1.3.22-20260912" in continuity
