from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def test_delete_action_is_compact_icon_only():
    card = read("frontend/src/modules/red/components/RouterCard.jsx")
    assert 'btn-delete-router-card-' in card
    assert 'aria-label={deleting ? "Eliminando router" : "Eliminar router"}' in card
    assert 'h-9 w-9' in card
    assert '<Trash2' in card
    assert 'group-hover:scale-110' in card
    assert 'Eliminar router"}</button>' not in card


def test_release_1320_is_documented():
    version = read("frontend/src/modules/system-update/version.js")
    continuity = read("docs/CONTINUIDAD_Z-HUB-v1.3.md")
    assert 'PANEL_VERSION = "1.3.20"' in version
    assert "1.3.20" in continuity
    assert "backup/pre-router-delete-icon-1.3.20-20260912" in continuity
