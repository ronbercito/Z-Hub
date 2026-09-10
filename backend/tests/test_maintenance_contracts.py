"""Regresiones estáticas de seguridad/integridad introducidas desde Z-Hub 1.2.37."""
from pathlib import Path
ROOT = Path(__file__).resolve().parents[2]
def source(path: str) -> str: return (ROOT / path).read_text(encoding="utf-8")

def test_installer_never_chmods_entire_app_755():
    text=source("deploy/install.sh"); assert 'chmod -R 755 "$APP_DIR"' not in text; assert 'chmod 600 "$APP_DIR/backend/.env"' in text

def test_installer_preserves_frontend_and_venv_executables():
    text=source("deploy/install.sh"); assert '-path "$APP_DIR/frontend/node_modules"' in text; assert '-path "$APP_DIR/backend/venv"' in text; assert text.count('chmod 755 node_modules/.bin/*')>=2

def test_client_toggle_requires_mikrotik_success_before_local_status():
    text=source("backend/app/routers/clientes/router.py"); a=text.index("result = await mt.cut_client"); b=text.index('if not result.get("ok"):',a); c=text.index('c.status, c.is_online = "suspended", False',a); assert a<b<c; a=text.index("result = await mt.restore_client",a); b=text.index('if not result.get("ok"):',a); c=text.index('c.status, c.is_online = "active", True',a); assert a<b<c

def test_permanent_delete_aborts_when_mikrotik_cleanup_fails():
    text=source("backend/app/routers/clientes/router.py"); start=text.index("async def delete_client"); block=text[start:text.index('@router.post("/{client_id}/toggle-status")',start)]; assert 'if not result.get("ok"):' in block and "await db.delete(c)" in block; assert block.index('if not result.get("ok"):')<block.index("await db.delete(c)")

def test_payment_does_not_fake_reactivation():
    text=source("backend/app/routers/facturacion/router.py"); start=text.index("async def register_payment"); block=text[start:text.index('@router.post("/invoices/mass-generate")',start)]; assert 'if mikrotik.get("ok"):' in block; assert 'c.status, c.is_online = "suspended", False' in block; assert "reactivation_warning" in block

def test_retirement_preserves_administrative_history():
    text=source("backend/app/routers/clientes/retired.py"); assert "delete(ClientService)" not in text; assert "delete(Invoice)" not in text; assert 'invoice.status = "canceled"' in text; assert 'service.status = "retired"' in text; assert 'action="Cliente retirado"' in text

def test_communications_do_not_claim_external_delivery():
    text=source("backend/app/routers/clientes/router.py"); assert 'status="registered"' in text; assert '"sent": False' in text; assert 'status="sent"' not in text

def test_generic_settings_are_whitelisted():
    text=source("backend/app/routers/ajustes/router.py"); assert "EDITABLE_SETTINGS = set(DEFAULT_SETTINGS) - PROTECTED_GENERIC_SETTINGS" in text; assert "unknown = sorted(set(data) - EDITABLE_SETTINGS)" in text; assert 'data.pop("license_key", None)' not in text

def test_auth_token_is_not_persisted_in_local_storage():
    text=source("frontend/src/context/AuthContext.js"); assert 'localStorage.setItem("fibraz_token"' not in text; assert "axios.defaults.withCredentials = true" in text

def test_recovery_closed_cases_cannot_be_reopened():
    b=source("backend/app/routers/clientes/equipment_recoveries.py")
    f=source("frontend/src/modules/clientes/recuperacion/EquipmentRecovery.jsx")
    assert '"recovered": {"recovered"}' in b
    assert '"not_recovered": {"not_recovered"}' in b
    assert 'const CLOSED=new Set(["recovered","not_recovered"])' in f
    assert 'CLOSED.has(r.status)?"Ver detalle":"Gestionar"' in f
    assert '!CLOSED.has(editing.status)' in f

def test_business_timezone_defaults_to_lima():
    c=source("backend/app/core/config.py"); u=source("backend/app/core/utils.py"); assert 'APP_TIMEZONE = os.environ.get("APP_TIMEZONE", "America/Lima")' in c; assert "def business_now()" in u; assert "def business_today()" in u

def test_new_service_modal_is_compact_sequential_and_defaults_static_ip():
    text=source("frontend/src/modules/clientes/editor/ClientServiceEditor.jsx")
    assert 'connection_type:"IP Estática"' in text
    assert 'technology:""' in text
    assert 'label="Router *"' in text and 'label="Tecnología *"' in text and 'label="Plan de internet *"' in text and 'label="Tipo de conexión *"' in text
    assert 'disabled={!routerReady}' in text and 'disabled={!technologyReady}' in text and 'disabled={!planReady}' in text
    assert 'disabled={saving||!canSubmit}' in text
    assert 'planTechnology(p.type)===formData.technology' in text
    assert 'service-wizard-modal--compact' in text and 'max-w-5xl' in text and 'max-h-[88vh]' in text
    assert 'Flujo de configuración' not in text and 'Control automático' not in text

def test_new_service_wizard_has_explicit_light_theme_skin():
    css=source("frontend/src/modules/clientes/editor/client-service-wizard.css"); assert 'html[data-panel-theme="zhub-light"] .service-wizard-modal' in css; assert 'html[data-panel-theme="zhub-light"] .service-wizard-card' in css; assert 'html[data-panel-theme="zhub-light"] .service-wizard-input' in css

def test_new_client_registration_uses_same_progressive_service_flow():
    text=source("frontend/src/modules/clientes/usuarios/ClientRegistrationWizard.jsx")
    css=source("frontend/src/modules/clientes/usuarios/client-registration-service.css")
    assert 'connection_type: "IP Estática"' in text
    assert 'label="Router *"' in text and 'label="Tecnología *"' in text and 'label="Plan de internet *"' in text and 'label="Tipo de conexión *"' in text
    assert 'label="MikroTik *"' not in text
    assert 'disabled={!routerReady}' in text and 'disabled={!technologyReady}' in text and 'disabled={!planReady}' in text and 'disabled={!connectionReady}' in text
    assert 'disabled={!networkReady' in text
    assert 'planTechnology(plan.type) === selectedTechnology' in text
    assert 'disabled={!serviceReady}' in text
    assert 'client-registration-service.css' in text
    assert 'html[data-panel-theme="zhub-light"] .client-registration-service' in css

def test_clients_list_restores_pending_invoice_badge_and_red_total():
    text=source("frontend/src/modules/clientes/Clients.jsx")
    css=source("frontend/src/modules/clientes/clients-theme.css")
    assert 'Number(c.balance_due||0)>0' in text
    assert 'c.unpaid_invoices_count' in text
    assert 'factura(s) pendiente(s)' in text
    assert 'client-debt-positive' in text and 'client-debt-count' in text
    assert '<span>S/. {Number(c.balance_due||0).toFixed(2)}</span>' in text
    assert '.client-debt-positive' in css and '.client-debt-count' in css

def test_clients_main_table_has_separate_columns_and_map_action():
    text=source("frontend/src/modules/clientes/Clients.jsx")
    css=source("frontend/src/modules/clientes/clients-theme.css")
    expected=['<th>Abonado</th>','<th>Contacto</th>','<th>Plan / Tarifa</th>','<th>IP / Conexión</th>','<th>Deuda</th>','<th>Estado</th>']
    positions=[text.index(item) for item in expected]
    assert positions == sorted(positions)
    assert 'colSpan="7"' in text
    assert 'title="Ver en mapa"' in text and 'client-action-map' in text
    assert 'DNI: {c.dni_ruc||"—"}' in text
    assert '{c.phone||"—"}' in text and '{c.email||"—"}' in text
    assert '.clients-main-table' in css and '.client-status-pill' in css
    assert 'html[data-panel-theme="zhub-light"] .clients-page .client-main-row' in css
