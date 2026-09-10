from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def test_retirement_preview_and_recovery_creation_contract():
    source = read("backend/app/routers/clientes/retired.py")
    assert 'retirement-equipment-preview' in source
    assert 'ClientEquipment.ownership == "company"' in source
    assert 'ClientEquipment.status.in_(("installed", "assigned"))' in source
    assert 'EquipmentRecovery(' in source
    assert 'item.status = "recovery_pending"' in source
    assert 'recovery_equipment_count' in source


def test_recovery_module_respects_optional_setting():
    source = read("backend/app/routers/clientes/equipment_recoveries.py")
    assert 'client_equipment_recovery_enabled' in source
    assert 'await _require_enabled(db)' in source
    assert 'ClientEquipment' in source
    assert 'equipment_id' in source


def test_retirement_ui_warns_and_uses_preview():
    source = read("frontend/src/modules/clientes/Clients.jsx")
    assert 'retirement-equipment-preview' in source
    assert 'Equipos pendientes de recuperación' in source
    assert 'Retirar y crear recuperación' in source
    assert 'Clientes → Recuperación' in source
