from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def test_wizard_starts_with_integrated_registration_and_existing_account_escape():
    view = read("frontend/src/modules/setup/SetupWizard.jsx")
    assert '["Registro", "Activación", "Administrador", "Finalizar"]' in view
    assert "Registra tu empresa" in view
    assert "Ya tengo una cuenta" in view
    assert "Registrar y continuar" in view
    assert 'axios.post(`${API}/setup/register`' in view


def test_country_first_defaults_to_peru_and_latam_prefixes_are_embedded():
    view = read("frontend/src/modules/setup/SetupWizard.jsx")
    assert 'country:"Perú"' in view
    assert 'name:"Perú", code:"51"' in view
    for country in ("Argentina", "Bolivia", "Brasil", "Chile", "Colombia", "Costa Rica", "Cuba", "Ecuador", "El Salvador", "Guatemala", "Haití", "Honduras", "México", "Nicaragua", "Panamá", "Paraguay", "Perú", "República Dominicana", "Uruguay", "Venezuela"):
        assert f'name:"{country}"' in view
    assert "El prefijo +{country.code} se agrega automáticamente" in view
    assert ">CIUDAD<" not in view
    assert "registration.city" not in view


def test_backend_proxies_registration_without_exposing_central_server_to_browser():
    router = read("backend/app/routers/setup/router.py")
    client = read("backend/app/core/auto_trial.py")
    schemas = read("backend/app/routers/setup/schemas.py")
    assert '@router.post("/register")' in router
    assert "CustomerRegistrationRequest" in schemas
    assert '"/v1/public/customers/register"' in client
    assert '"city": ""' in client
    assert "ZHUB_LICENSE_SERVER_URL" in client


def test_release_is_135_and_continuity_documents_the_flow():
    version = read("frontend/src/modules/system-update/version.js")
    continuity = read("docs/CONTINUIDAD_Z-HUB-v1.3.md")
    assert 'PANEL_VERSION = "1.3.5"' in version
    assert "1.3.5" in continuity
    assert "Ya tengo una cuenta" in continuity
    assert "Perú" in continuity
