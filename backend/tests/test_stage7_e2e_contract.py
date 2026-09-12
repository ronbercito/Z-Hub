from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def test_stage7_paid_is_capacity_only_without_exposing_key():
    router = read("backend/app/routers/license/router.py")
    view = read("frontend/src/modules/ajustes/LicenseSettings.jsx")
    assert '"license_expires_at": None if is_paid' in router
    assert 'Sin vencimiento' in view
    assert 'abonados activos' in view
    assert 'data?.license_expires_at' not in view
    assert 'license_key_masked' not in view


def test_stage7_keeps_auto_trial_and_customer_flow_contracts():
    wizard = read("frontend/src/modules/setup/SetupWizard.jsx")
    auto_trial = read("backend/app/core/auto_trial.py")
    assert '/setup/auto-trial' in wizard
    assert '/v1/public/trials/activate' in auto_trial
    assert '"hardware_id": hardware_id()' in auto_trial
    assert 'SERIE DE LICENCIA' not in wizard


def test_stage7_contract_survives_later_13x_releases():
    version = read("frontend/src/modules/system-update/version.js")
    continuity = read("docs/CONTINUIDAD_Z-HUB-v1.3.md")
    match = re.search(r'PANEL_VERSION\s*=\s*"(\d+)\.(\d+)\.(\d+)"', version)
    assert match, "No se encontró PANEL_VERSION semántica"
    assert tuple(map(int, match.groups())) >= (1, 3, 4)
    assert 'Etapa 7/7' in continuity
