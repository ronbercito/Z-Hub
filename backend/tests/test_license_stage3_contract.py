from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def read(path):
    return (ROOT / path).read_text(encoding="utf-8")


def test_capacity_guard_exists_and_uses_409_code():
    guard = read("backend/app/core/license_guard.py")
    assert 'CLIENT_LIMIT_CODE = "CLIENT_LIMIT_REACHED"' in guard
    assert "status_code=409" in guard
    assert "X-ZHub-Error-Code" in guard
    assert "get_license(db)" in guard


def test_new_client_post_is_guarded():
    guard = read("backend/app/core/license_guard.py")
    assert 'request.method == "POST" and path == "/api/clients"' in guard
    assert "await _raise_if_capacity_full(db)" in guard


def test_retired_reactivation_is_guarded_but_regular_edits_are_not():
    guard = read("backend/app/core/license_guard.py")
    assert 'request.method == "PUT"' in guard
    assert 'client.status == "retired"' in guard
    assert "if client and client.status" in guard


def test_client_and_service_routers_register_capacity_dependency():
    server = read("backend/server.py")
    assert "from app.core.license_guard import enforce_client_capacity" in server
    assert "if router in (clientes_router, client_services_router):" in server
    assert "dependencies.append(Depends(enforce_client_capacity))" in server


def test_existing_frontend_displays_string_detail_from_limit_error():
    clients = read("frontend/src/modules/clientes/Clients.jsx")
    assert 'typeof e.response?.data?.detail==="string"?e.response.data.detail' in clients


def test_stage3_capacity_rule_remains_scoped_to_active_finite_licenses():
    guard = read("backend/app/core/license_guard.py")
    assert 'license_info.get("status") != "active"' in guard
    assert 'if limit is None:' in guard
    assert 'if usage < int(limit):' in guard
