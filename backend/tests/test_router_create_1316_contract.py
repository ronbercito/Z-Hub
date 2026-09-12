from pathlib import Path
import importlib.util

ROOT = Path(__file__).resolve().parents[2]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def load_schemas_module():
    path = ROOT / "backend/app/routers/red/schemas.py"
    spec = importlib.util.spec_from_file_location("red_schemas_contract", path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def test_router_schema_accepts_blank_coordinates_from_form():
    module = load_schemas_module()
    payload = {
        "name": "MikroTik prueba",
        "device_type": "mikrotik",
        "ip_address": "192.168.88.1",
        "port": 8728,
        "username": "admin",
        "password": "",
        "latitude": "",
        "longitude": "",
    }
    parsed = module.RouterIn(**payload)
    assert parsed.latitude == 0.0
    assert parsed.longitude == 0.0


def test_router_hotfix_release_marker():
    version = read("frontend/src/modules/system-update/version.js")
    continuity = read("docs/CONTINUIDAD_Z-HUB-v1.3.md")
    assert 'PANEL_VERSION = "1.3.16"' in version
    assert "1.3.16" in continuity
    assert "backup/pre-router-create-hotfix-1.3.16-20260912" in continuity
