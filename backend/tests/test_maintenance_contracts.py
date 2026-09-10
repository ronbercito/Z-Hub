"""Regresiones estáticas de seguridad/integridad introducidas desde Z-Hub 1.2.37.

No requieren MariaDB, RouterOS ni credenciales. Complementan, no sustituyen, las pruebas
operativas con un MikroTik/OLT de laboratorio.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def source(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def test_installer_never_chmods_entire_app_755():
    text = source("deploy/install.sh")
    assert 'chmod -R 755 "$APP_DIR"' not in text
    assert 'chmod 600 "$APP_DIR/backend/.env"' in text


def test_installer_preserves_frontend_and_venv_executables():
    text = source("deploy/install.sh")
    assert '-path "$APP_DIR/frontend/node_modules"' in text
    assert '-path "$APP_DIR/backend/venv"' in text
    assert 'chmod 755 node_modules/.bin/*' in text
    assert text.count('chmod 755 node_modules/.bin/*') >= 2


def test_client_toggle_requires_mikrotik_success_before_local_status():
    text = source("backend/app/routers/clientes/router.py")
    cut_call = text.index("result = await mt.cut_client")
    cut_check = text.index('if not result.get("ok"):', cut_call)
    local_suspend = text.index('c.status, c.is_online = "suspended", False', cut_call)
    assert cut_call < cut_check < local_suspend

    restore_call = text.index("result = await mt.restore_client", cut_call)
    restore_check = text.index('if not result.get("ok"):', restore_call)
    local_active = text.index('c.status, c.is_online = "active", True', restore_call)
    assert restore_call < restore_check < local_active


def test_permanent_delete_aborts_when_mikrotik_cleanup_fails():
    text = source("backend/app/routers/clientes/router.py")
    start = text.index("async def delete_client")
    block = text[start:text.index('@router.post("/{client_id}/toggle-status")', start)]
    assert 'if not result.get("ok"):' in block
    assert "await db.delete(c)" in block
    assert block.index('if not result.get("ok"):') < block.index("await db.delete(c)")


def test_payment_does_not_fake_reactivation():
    text = source("backend/app/routers/facturacion/router.py")
    start = text.index("async def register_payment")
    block = text[start:text.index('@router.post("/invoices/mass-generate")', start)]
    assert 'if mikrotik.get("ok"):' in block
    assert 'c.status, c.is_online = "suspended", False' in block
    assert "reactivation_warning" in block


def test_retirement_preserves_administrative_history():
    text = source("backend/app/routers/clientes/retired.py")
    assert "delete(ClientService)" not in text
    assert "delete(Invoice)" not in text
    assert 'invoice.status = "canceled"' in text
    assert 'service.status = "retired"' in text
    assert 'action="Cliente retirado"' in text


def test_communications_do_not_claim_external_delivery():
    text = source("backend/app/routers/clientes/router.py")
    assert 'status="registered"' in text
    assert '"sent": False' in text
    assert 'status="sent"' not in text


def test_generic_settings_are_whitelisted():
    text = source("backend/app/routers/ajustes/router.py")
    assert "EDITABLE_SETTINGS = set(DEFAULT_SETTINGS) - PROTECTED_GENERIC_SETTINGS" in text
    assert "unknown = sorted(set(data) - EDITABLE_SETTINGS)" in text
    assert 'data.pop("license_key", None)' not in text


def test_auth_token_is_not_persisted_in_local_storage():
    text = source("frontend/src/context/AuthContext.js")
    assert 'localStorage.setItem("fibraz_token"' not in text
    assert "axios.defaults.withCredentials = true" in text


def test_recovery_closed_cases_cannot_be_reopened():
    backend = source("backend/app/routers/clientes/equipment_recoveries.py")
    frontend = source("frontend/src/modules/clientes/recuperacion/EquipmentRecovery.jsx")
    assert '"recovered": {"recovered"}' in backend
    assert '"not_recovered": {"not_recovered"}' in backend
    assert "CLOSED_STATUSES" in frontend and ">Cerrado<" in frontend


def test_business_timezone_defaults_to_lima():
    config = source("backend/app/core/config.py")
    utils = source("backend/app/core/utils.py")
    assert 'APP_TIMEZONE = os.environ.get("APP_TIMEZONE", "America/Lima")' in config
    assert "def business_now()" in utils
    assert "def business_today()" in utils


def test_new_service_wizard_is_sequential_and_defaults_to_static_ip():
    text = source("frontend/src/modules/clientes/editor/ClientServiceEditor.jsx")
    assert 'connection_type: "IP Estática"' in text
    assert 'technology: ""' in text
    assert 'label="Router *"' in text
    assert 'title="Selecciona la tecnología"' in text
    assert 'title="Plan de internet"' in text
    assert 'title="Tipo de conexión"' in text
    assert 'disabled={!routerReady}' in text
    assert 'disabled={!technologyReady}' in text
    assert 'disabled={!planReady}' in text
    assert 'disabled={saving || !canSubmit}' in text
    assert 'planTechnology(p.type) === formData.technology' in text
    assert 'client-service-wizard.css' in text


def test_new_service_wizard_has_explicit_light_theme_skin():
    css = source("frontend/src/modules/clientes/editor/client-service-wizard.css")
    assert 'html[data-panel-theme="zhub-light"] .service-wizard-modal' in css
    assert 'html[data-panel-theme="zhub-light"] .service-wizard-card' in css
    assert 'html[data-panel-theme="zhub-light"] .service-wizard-input' in css
