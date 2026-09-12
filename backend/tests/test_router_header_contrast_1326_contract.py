from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def test_router_header_identity_remains_high_contrast_after_1326():
    css = read("frontend/src/modules/red/router-card-light-skin.css")
    for token in (
        ".router-modern-identity-panel",
        ".router-modern-identity-name",
        ".router-modern-identity-address",
        ".router-modern-identity-model",
    ):
        assert token in css
    assert "opacity:1!important" in css
    assert "visibility:visible!important" in css
    assert "-webkit-text-fill-color" in css


def test_release_1326_backup_and_history_are_preserved():
    version = read("frontend/src/modules/system-update/version.js")
    continuity = read("docs/CONTINUIDAD_Z-HUB-v1.3.md")
    assert 'PANEL_VERSION = "1.3.' in version
    assert "1.3.26 — Cabecera MikroTik con identidad visible" in continuity
    assert "backup/pre-router-header-contrast-1.3.26-20260912" in continuity
