from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def test_139_setting_is_optional_and_disabled_by_default():
    settings = read("backend/app/models/setting.py")
    view = read("frontend/src/modules/ajustes/clientes/ClientSettings.jsx")
    assert '"client_individual_service_control_enabled": False' in settings
    assert "Gestión individual por servicio" in view
    assert "Administrar estados por servicio" in view
    assert "client_individual_service_control_enabled" in view


def test_139_persists_independent_service_state_without_rewriting_client_schema():
    model = read("backend/app/models/client_service_state.py")
    models = read("backend/app/models/__init__.py")
    assert '__tablename__ = "client_service_states"' in model
    assert 'service_id: Mapped[str]' in model
    assert 'status: Mapped[str]' in model
    assert "ClientServiceState" in models


def test_139_backend_exposes_on_demand_individual_actions():
    operations = read("backend/app/routers/clientes/service_operations.py")
    server = read("backend/server.py")
    assert '"/service-control-policy"' in operations
    assert '"/{client_id}/service-states"' in operations
    assert '"/{client_id}/services/{service_id}/operational-status"' in operations
    assert 'Literal["active", "suspended", "paused"]' in operations
    assert "set_ppp_secret_disabled" in operations
    assert "address_list_add" in operations
    assert "address_list_remove" in operations
    assert "client_service_operations_router" in server


def test_139_service_ui_only_loads_one_state_summary_and_actions_are_manual():
    view = read("frontend/src/modules/clientes/editor/ClientServiceEditor.jsx")
    assert "/service-states" in view
    assert "/operational-status" in view
    assert "Promise.allSettled" in view
    assert "Suspender / cortar" in view
    assert "Pausar" in view
    assert "Reactivar" in view
    assert "setInterval" not in view


def test_139_preserves_license_capacity_rule_and_release_history():
    usage = read("backend/app/core/license_usage.py")
    continuity = read("docs/CONTINUIDAD_Z-HUB-v1.3.md")
    assert 'CAPACITY_STATUSES = ("active", "suspended", "paused")' in usage
    assert "1.3.9" in continuity
    assert "backup/pre-individual-service-control-1.3.9-20260912" in continuity
