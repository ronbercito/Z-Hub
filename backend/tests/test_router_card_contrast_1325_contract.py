from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def test_light_card_has_stronger_text_and_icon_contrast():
    css = read("frontend/src/modules/red/router-card-light-skin.css")
    for token in (
        ".router-modern-metric__label",
        ".router-modern-metric__value",
        ".router-modern-metric__icon",
        ".router-modern-location strong",
        ".router-modern-location>svg",
    ):
        assert token in css
    assert "font-weight:900!important" in css
    assert "stroke-width:2.6" in css
    assert "#264d72" in css


def test_metric_tones_keep_distinct_visible_icons():
    css = read("frontend/src/modules/red/router-card-light-skin.css")
    for tone in ("blue", "emerald", "violet", "amber", "cyan"):
        assert f"router-modern-metric--{tone}" in css
    # Desde 1.3.28 el borde pastel de 1.3.25 se reemplaza por fondos sólidos,
    # pero se conserva el requisito histórico de iconos claramente diferenciados.
    assert "stroke:#fff!important" in css


def test_release_1325_history_is_preserved():
    continuity = read("docs/CONTINUIDAD_Z-HUB-v1.3.md")
    assert "1.3.25 — Contraste reforzado en tarjetas MikroTik" in continuity
    assert "backup/pre-router-card-contrast-1.3.25-20260912" in continuity
