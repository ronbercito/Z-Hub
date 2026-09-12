from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def test_client_cards_styles_are_loaded_and_color_coded():
    index = read("frontend/src/index.css")
    css = read("frontend/src/modules/clientes/client-status-cards.css")
    assert '@import "./modules/clientes/client-status-cards.css";' in index
    assert ':has(.client-status-pill.is-active)' in css
    assert ':has(.client-status-pill.is-paused)' in css
    assert ':has(.client-status-pill.is-suspended)' in css
    assert '#16b653' in css
    assert '#f2ad00' in css
    assert '#ef3f4c' in css


def test_client_cards_preserve_existing_information_and_actions():
    view = read("frontend/src/modules/clientes/Clients.jsx")
    for token in ("client-main-name", "client-plan-name", "client-ip-value", "client-contact-line", "client-debt-caption", "client-status-pill", "client-actions"):
        assert token in view


def test_richer_card_layout_keeps_reference_structure():
    css = read("frontend/src/modules/clientes/client-status-cards.css")
    assert 'content:"Servicio principal"' in css
    assert 'content:"Conexión / red"' in css
    assert '.client-main-cell:nth-child(5)' in css
    assert '.client-main-cell:nth-child(6)' in css
    assert 'grid-template-rows:auto auto' in css


def test_release_history_is_preserved_after_1312():
    version = read("frontend/src/modules/system-update/version.js")
    continuity = read("docs/CONTINUIDAD_Z-HUB-v1.3.md")
    assert 'PANEL_VERSION = "1.3.12"' in version
    assert "1.3.11 — Cartilla visual enriquecida de Clientes" in continuity
    assert "backup/pre-client-card-visual-1.3.11-20260912" in continuity
    assert "1.3.10 — Cartillas visuales de clientes por estado" in continuity
    assert "backup/pre-client-status-cards-1.3.10-20260912" in continuity
