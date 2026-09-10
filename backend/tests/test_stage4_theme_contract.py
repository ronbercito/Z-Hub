from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def text(path):
    return (ROOT / path).read_text(encoding="utf-8")


def test_inventory_has_local_theme_and_colored_statuses():
    jsx = text("frontend/src/modules/almacen/Inventory.jsx")
    css = text("frontend/src/modules/almacen/inventory-theme.css")
    assert 'import "./inventory-theme.css"' in jsx
    assert 'className="inventory-page ' in jsx
    assert 'inventory-status-${i.status || "in_stock"}' in jsx
    for status in ["in_stock", "inspection", "damaged", "decommissioned"]:
        assert f".inventory-status-{status}" in css
    assert 'html[data-panel-theme="zhub-light"] .inventory-page' in css


def test_recovery_supports_both_light_theme_selectors():
    css = text("frontend/src/modules/clientes/recuperacion/equipment-recovery.css")
    assert 'html[data-panel-theme="zhub-light"] .equipment-recovery-page' in css
    assert 'html.zhub-light .equipment-recovery-page' in css
    for status in ["pending", "contacted", "visit_scheduled", "recovered", "not_recovered"]:
        assert f"recovery-status-{status}" in css
