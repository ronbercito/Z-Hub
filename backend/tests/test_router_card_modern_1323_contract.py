from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def test_modern_mikrotik_card_has_reference_sections():
    card = read("frontend/src/modules/red/components/RouterCard.jsx")
    metric = read("frontend/src/modules/red/components/RouterCardMetric.jsx")
    for token in (
        "router-modern-header",
        "router-modern-primary-metrics",
        "router-modern-secondary-metrics",
        "router-modern-footer",
        "PPPoE",
        "Colas",
        "Tráfico",
        "Ver en mapa",
        "Eliminar router",
    ):
        assert token in card
    assert "router-modern-progress" in metric


def test_visual_states_and_theme_styles_are_present():
    card = read("frontend/src/modules/red/components/RouterCard.jsx")
    css = read("frontend/src/modules/red/router-card-layout.css")
    light_css = read("frontend/src/modules/red/router-card-light-skin.css")
    assert 'visualState' in card
    assert 'router-modern-status--${visualState}' in card
    assert 'data-router-visual-state={visualState}' in card
    for state in ("online", "offline", "alert", "unknown"):
        assert f"router-modern-status--{state}" in css
    assert 'data-panel-theme="dark"' in light_css
    assert 'data-panel-theme="zhub-dark"' in light_css


def test_release_1323_backup_and_history_remain_preserved():
    continuity = read("docs/CONTINUIDAD_Z-HUB-v1.3.md")
    assert "1.3.23" in continuity
    assert "backup/pre-router-card-modern-1.3.23-20260912" in continuity
