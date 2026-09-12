from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def read(path: str) -> str:
    return (ROOT / path).read_text(encoding="utf-8")


def test_clean_install_sources_web_licence_bootstrap():
    installer = read("install.sh")
    assert 'source "$ROOT_DIR/deploy/license_bootstrap.sh"' in installer
    assert "Preparando conexión segura con Web-Licence" in installer


def test_bootstrap_installs_only_public_trust_material_and_exports_remote_config():
    bootstrap = read("deploy/license_bootstrap.sh")
    bootstrap_env = read("deploy/license/bootstrap.env")
    assert "ZHUB_LICENSE_SERVER_DEFAULT_URL=https://192.168.10.240" in bootstrap_env
    assert "ZHUB_LICENSE_SERVER_DEFAULT_PUBLIC_KEY_FILE=/etc/zhub/licencia/server-public.pem" in bootstrap_env
    assert 'source "$BOOTSTRAP_ENV"' in bootstrap
    assert 'server-public.pem' in bootstrap
    assert 'zhub-lab-ca.crt' in bootstrap
    assert 'update-ca-certificates' in bootstrap
    assert 'export ZHUB_LICENSE_SERVER_URL=' in bootstrap
    assert 'export ZHUB_LICENSE_SERVER_PUBLIC_KEY_FILE=' in bootstrap
    assert "curl -k" not in bootstrap
    assert "private.pem" not in bootstrap


def test_public_trust_files_are_versioned_without_private_keys():
    public_key = read("deploy/license/server-public.pem")
    ca = read("deploy/license/zhub-lab-ca.crt")
    assert "BEGIN PUBLIC KEY" in public_key
    assert "BEGIN CERTIFICATE" in ca
    assert "BEGIN PRIVATE KEY" not in public_key
    assert "BEGIN PRIVATE KEY" not in ca


def test_release_is_133_and_continuity_records_fix():
    version = read("frontend/src/modules/system-update/version.js")
    continuity = read("docs/CONTINUIDAD_Z-HUB-v1.3.md")
    assert 'PANEL_VERSION = "1.3.3"' in version
    assert "1.3.3" in continuity
    assert "License Server no configurado" in continuity
    assert "backup/pre-license-bootstrap-1.3.3-20260911" in continuity
