from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def compact(text: str) -> str:
    return "".join(text.split())


def test_light_skin_is_loaded_by_router_metric_component():
    metric = read("frontend/src/modules/red/components/RouterCardMetric.jsx")
    assert 'import "../router-card-light-skin.css";' in metric


def test_light_skin_keeps_all_card_sections_light_by_default():
    css = compact(read("frontend/src/modules/red/router-card-light-skin.css"))
    assert ':not([data-panel-theme="dark"]):not([data-panel-theme="zhub-dark"])' in css
    assert '.router-modern-header' in css
    assert '.router-modern-primary-metrics' in css
    assert '.router-modern-secondary-metrics' in css
    assert '.router-modern-footer' in css
    assert 'background:#fff!important' in css or 'background:#ffffff!important' in css
    assert 'background:#f8fbfe!important' in css or 'background:#f9fbfd!important' in css


def test_dark_skin_only_activates_for_explicit_dark_theme():
    css = read("frontend/src/modules/red/router-card-light-skin.css")
    assert 'html[data-panel-theme="dark"] .network-router-card--modern' in css
    assert 'html[data-panel-theme="zhub-dark"] .network-router-card--modern' in css


def test_release_1324_history_is_preserved():
    continuity = read("docs/CONTINUIDAD_Z-HUB-v1.3.md")
    assert "1.3.24 — Tarjeta MikroTik completamente clara" in continuity
    assert "backup/pre-router-card-light-1.3.24-20260912" in continuity
