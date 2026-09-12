from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def test_delete_icon_and_offline_status_have_strong_contrast():
    card = read("frontend/src/modules/red/components/RouterCard.jsx")
    assert 'bg-rose-600 text-white' in card
    assert 'border-2 border-white/80 bg-rose-600 text-white' in card
    assert 'h-10 w-10' in card
    assert 'ring-2 ring-rose-300/35' in card


def test_card_selection_uses_pointer_down_for_immediate_response():
    card = read("frontend/src/modules/red/components/RouterCard.jsx")
    assert 'onPointerDown={(event) => { if (event.button === 0) onSelect?.(); }}' in card
    assert 'onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") onSelect?.(); }}' in card
    assert 'role="button"' in card
    assert 'tabIndex={0}' in card
    assert 'onPointerDown={stopPointer}' in card


def test_release_1321_is_documented():
    version = read("frontend/src/modules/system-update/version.js")
    continuity = read("docs/CONTINUIDAD_Z-HUB-v1.3.md")
    assert 'PANEL_VERSION = "1.3.21"' in version
    assert "1.3.21" in continuity
    assert "backup/pre-router-card-highlight-select-1.3.21-20260912" in continuity
