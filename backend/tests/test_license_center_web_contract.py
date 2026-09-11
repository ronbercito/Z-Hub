from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def read(path):
    return (ROOT / path).read_text(encoding="utf-8")


def test_license_server_exposes_admin_web_and_customer_crud():
    main = read("license_server/app/main.py")
    assert 'APP_VERSION = "1.2.1"' in main
    assert 'app.mount("/admin-static"' in main
    assert '@app.get("/admin-ui"' in main
    assert 'CREATE TABLE IF NOT EXISTS customers' in main
    assert '@app.get("/admin/customers"' in main
    assert '@app.post("/admin/customers"' in main
    assert '@app.put("/admin/customers/{customer_id}"' in main
    assert '@app.delete("/admin/customers/{customer_id}"' in main


def test_license_server_exposes_license_installation_dashboard_crud():
    main = read("license_server/app/main.py")
    assert '@app.get("/admin/dashboard"' in main
    assert '@app.get("/admin/licenses"' in main
    assert '@app.delete("/admin/licenses/{license_key}"' in main
    assert '@app.get("/admin/installations"' in main
    assert '@app.delete("/admin/licenses/{license_key}/installations/{installation_id}"' in main
    assert 'installation_name' in main
    assert 'customer_id' in main


def test_license_center_automates_keys_plans_and_customer_data():
    main = read("license_server/app/main.py")
    js = read("license_server/static/app.js")
    assert '@app.get("/admin/licenses/generate-key"' in main
    assert 'secrets.token_hex(24).upper()' in main
    assert '"PLAN_100": 100' in main
    assert '"PLAN_300": 300' in main
    assert '"PLAN_500": 500' in main
    assert '"PLAN_1000": 1000' in main
    assert '"ILIMITADO": None' in main
    assert "requestLicenseKey" in js
    assert "syncCustomerToLicense" in js
    assert "syncPlan" in js
    assert "PLAN_300" in js and "PLAN_500" in js and "ILIMITADO" in js


def test_trial_expiry_limit_and_revoked_status_are_server_side():
    main = read("license_server/app/main.py")
    js = read("license_server/static/app.js")
    assert 'TRIAL_DAYS = max(1' in main
    assert 'TRIAL_MAX_CLIENTS = 20' in main
    assert 'plan, plan_limit = "TRIAL", TRIAL_MAX_CLIENTS' in main
    assert 'expires_at TEXT NULL' in main
    assert '_ensure_column(db, "licenses", "expires_at"' in main
    assert '"TRIAL_EXPIRED"' in main
    assert '"REVOCADA"' in main
    assert 'timedelta(days=TRIAL_DAYS)' in main
    assert '"expires_at": row["expires_at"]' in main
    assert 'TRIAL:20' in js
    assert 'máximo 20 abonados' in js


def test_license_center_static_assets_exist_and_use_admin_token():
    html = read("license_server/static/index.html")
    js = read("license_server/static/app.js")
    css = read("license_server/static/styles.css")
    assert "Z-Hub License Center" in html
    assert "Clientes / ISP" in html
    assert "Licencias" in html
    assert "Instalaciones" in html
    assert "Validaciones" in html
    assert "sessionStorage" in js
    assert "Authorization" in js
    assert "/admin/dashboard" in js
    assert "/admin/customers" in js
    assert "/admin/licenses" in js
    assert ".sidebar" in css


def test_panel_version_marks_1270():
    version = read("frontend/src/modules/system-update/version.js")
    assert 'PANEL_VERSION = "1.2.70"' in version
    assert "TRIAL" in version
    assert "20 abonados" in version
