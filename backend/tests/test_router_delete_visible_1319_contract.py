from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def test_delete_router_action_remains_available_after_later_releases():
    card = read("frontend/src/modules/red/components/RouterCard.jsx")
    assert 'network-router-card-actions' in card
    assert 'Eliminar router' in card
    assert 'btn-delete-router-card-' in card
    assert 'canPermission(user, moduleName, "delete")' in card
    assert 'window.confirm' in card
    assert 'axios.delete' in card


def test_release_1319_history_remains_documented():
    continuity = read("docs/CONTINUIDAD_Z-HUB-v1.3.md")
    assert "1.3.19" in continuity
    assert "backup/pre-router-delete-visible-1.3.19-20260912" in continuity
