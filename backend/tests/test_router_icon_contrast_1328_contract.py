from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def test_metric_icons_use_solid_high_contrast_skin():
    css = read("frontend/src/modules/red/router-card-light-skin.css")
    assert ".router-modern-metric__icon svg" in css
    assert "stroke:#fff!important" in css
    assert "background:linear-gradient(145deg,#22b783,#078f68)!important" in css
    assert "background:linear-gradient(145deg,#1989f5,#0f67cf)!important" in css
    assert "background:linear-gradient(145deg,#8b5cf6,#6d28d9)!important" in css
    assert "background:linear-gradient(145deg,#f6b73c,#df8b08)!important" in css
    assert "background:linear-gradient(145deg,#23b8d6,#07859e)!important" in css


def test_map_icon_is_high_contrast():
    css = read("frontend/src/modules/red/router-card-light-skin.css")
    assert ".router-modern-action--map" in css
    assert "background:linear-gradient(145deg,#31a7ff,#1478df)!important" in css
    assert ".router-modern-action--map svg" in css


def test_release_1328_version_backup_and_history_survive_later_releases():
    version = read("frontend/src/modules/system-update/version.js")
    continuity = read("docs/CONTINUIDAD_Z-HUB-v1.3.md")
    match = re.search(r'PANEL_VERSION\s*=\s*"1\.3\.(\d+)"', version)
    assert match and int(match.group(1)) >= 28
    assert "1.3.28 — Iconos MikroTik de alto contraste" in continuity
    assert "backup/pre-router-icon-contrast-1.3.28-20260912" in continuity
