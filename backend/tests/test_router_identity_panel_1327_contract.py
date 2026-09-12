from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def test_router_identity_uses_dedicated_non_heading_markup():
    card = read("frontend/src/modules/red/components/RouterCard.jsx")
    assert "router-modern-identity-panel" in card
    assert "router-modern-identity-name" in card
    assert "router-modern-identity-address" in card
    assert "router-modern-identity-model" in card
    assert "routerName" in card
    assert "routerIp" in card
    assert "routerModel" in card


def test_identity_styles_force_visible_text_in_light_theme():
    css = read("frontend/src/modules/red/router-card-light-skin.css")
    assert "background:linear-gradient(135deg,#f7fbff,#edf6fd)!important" in css
    assert "-webkit-text-fill-color:#052d50!important" in css
    assert "-webkit-text-fill-color:#086ba8!important" in css
    assert "-webkit-text-fill-color:#456b88!important" in css
    assert "visibility:visible!important" in css


def test_release_1327_is_documented():
    version = read("frontend/src/modules/system-update/version.js")
    continuity = read("docs/CONTINUIDAD_Z-HUB-v1.3.md")
    assert 'PANEL_VERSION = "1.3.27"' in version
    assert "1.3.27 — Identidad MikroTik en bloque propio" in continuity
    assert "backup/pre-router-identity-panel-1.3.27-20260912" in continuity
