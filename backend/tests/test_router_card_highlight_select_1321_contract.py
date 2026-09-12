from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def test_delete_icon_and_offline_status_have_strong_contrast():
    card = read("frontend/src/modules/red/components/RouterCard.jsx")
    css = read("frontend/src/modules/red/router-card-layout.css")
    assert 'router-modern-status--offline' in card
    assert 'router-modern-action--delete' in card
    assert 'linear-gradient(135deg, #f04452, #e11d48)' in css
    assert 'linear-gradient(135deg,#ff4b57,#e92638)' in css


def test_card_selection_uses_pointer_down_for_immediate_response():
    card = read("frontend/src/modules/red/components/RouterCard.jsx")
    assert 'onPointerDown={(event) => { if (event.button === 0) onSelect?.(); }}' in card
    assert 'onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") onSelect?.(); }}' in card
    assert 'role="button"' in card
    assert 'tabIndex={0}' in card


def test_release_1321_history_is_preserved():
    continuity = read("docs/CONTINUIDAD_Z-HUB-v1.3.md")
    assert "1.3.21" in continuity
    assert "backup/pre-router-card-highlight-select-1.3.21-20260912" in continuity
