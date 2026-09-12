from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def test_router_header_identity_is_forced_visible_in_light_theme():
    css = read("frontend/src/modules/red/router-card-light-skin.css")
    for token in (
        ".router-modern-title-wrap",
        ".router-modern-name-row h3",
        ".router-modern-address",
        ".router-modern-model",
    ):
        assert token in css
    assert "opacity:1!important" in css
    assert "visibility:visible!important" in css
    assert "min-width:95px!important" in css
    assert "color:#062a4a!important" in css
    assert "color:#0b67a4!important" in css


def test_release_1326_version_backup_and_history():
    version = read("frontend/src/modules/system-update/version.js")
    continuity = read("docs/CONTINUIDAD_Z-HUB-v1.3.md")
    assert 'PANEL_VERSION = "1.3.26"' in version
    assert "1.3.26 — Cabecera MikroTik con identidad visible" in continuity
    assert "backup/pre-router-header-contrast-1.3.26-20260912" in continuity
