from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def test_router_cards_use_compact_layout_styles():
    index = read("frontend/src/index.css")
    css = read("frontend/src/modules/red/router-card-layout.css")
    assert '@import "./modules/red/router-card-layout.css";' in index
    assert ".network-reference > div:has(> .network-router-card)" in css
    assert "display: flex !important" in css
    assert "flex-wrap: wrap !important" in css
    assert "justify-content: flex-start !important" in css


def test_mikrotik_cards_expose_delete_action_with_confirmation():
    card = read("frontend/src/modules/red/components/RouterCard.jsx")
    assert "btn-delete-router-card-" in card
    assert 'canPermission(user, moduleName, "delete")' in card
    assert "window.confirm" in card
    assert "axios.delete" in card
    assert "Eliminar router" in card


def test_release_1317_remains_documented():
    continuity = read("docs/CONTINUIDAD_Z-HUB-v1.3.md")
    assert "1.3.17" in continuity
    assert "backup/pre-router-card-order-delete-1.3.17-20260912" in continuity
