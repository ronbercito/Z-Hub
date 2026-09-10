from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def text(path):
    return (ROOT / path).read_text(encoding="utf-8")


def test_stage3_has_individual_equipment_endpoint_and_no_inventory_move():
    src = text("backend/app/routers/clientes/equipment_recoveries.py")
    assert '/equipment/{equipment_id}' in src
    assert '"recovered", "not_recovered"' in src
    assert 'assigned.status = "recovered"' in src
    assert "Almacén (Etapa 4)" in src


def test_stage3_closes_case_when_all_items_resolved():
    src = text("backend/app/routers/clientes/equipment_recoveries.py")
    assert "if items and all(resolved)" in src
    assert 'row.status = "recovered" if all' in src


def test_stage3_ui_exposes_operational_flow():
    src = text("frontend/src/modules/clientes/recuperacion/EquipmentRecovery.jsx")
    for label in ["Responsable", "Contactado", "Visita programada", "Equipos del caso", "No recuperado", "Recuperado", "Historial del caso"]:
        assert label in src
