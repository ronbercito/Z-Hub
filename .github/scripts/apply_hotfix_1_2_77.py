from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    file = Path(path)
    text = file.read_text(encoding="utf-8")
    if new in text:
        return
    if old not in text:
        raise SystemExit(f"Patrón no encontrado en {path}")
    file.write_text(text.replace(old, new, 1), encoding="utf-8")


replace_once(
    "deploy/install.sh",
    'LICENSE_FILE="$LICENSE_DIR/licencias.txt"\nSTEP="inicio"',
    'LICENSE_FILE="$LICENSE_DIR/licencias.txt"\nSUPERVISOR_CONF="/etc/supervisor/conf.d/zhub_backend.conf"\nSTEP="inicio"',
)

old_block = """cd "$APP_DIR"
export APP_DIR WEB_ROOT
envsubst < "$DEPLOY_DIR/supervisor/zhub_backend.conf.template" | tee /etc/supervisor/conf.d/zhub_backend.conf >/dev/null
run_visual "Actualizando configuración de servicios" bash -c 'supervisorctl reread'"""

new_block = """cd "$APP_DIR"

# Las variables del License Server viven en Supervisor y no forman parte del
# repositorio. Antes de regenerar la configuración preservamos las que ya están
# activas para que una actualización no devuelva Z-Hub a "Modo local".
CURRENT_SUPERVISOR_ENV=""
if [ -f "$SUPERVISOR_CONF" ]; then
  CURRENT_SUPERVISOR_ENV="$(grep '^environment=' "$SUPERVISOR_CONF" | tail -n 1 || true)"
fi

LICENSE_SERVER_URL="${ZHUB_LICENSE_SERVER_URL:-}"
LICENSE_SERVER_PUBLIC_KEY_FILE="${ZHUB_LICENSE_SERVER_PUBLIC_KEY_FILE:-}"
if [ -z "$LICENSE_SERVER_URL" ] && [ -n "$CURRENT_SUPERVISOR_ENV" ]; then
  LICENSE_SERVER_URL="$(printf '%s\\n' "$CURRENT_SUPERVISOR_ENV" | sed -n 's/.*ZHUB_LICENSE_SERVER_URL="\\([^"]*\\)".*/\\1/p')"
fi
if [ -z "$LICENSE_SERVER_PUBLIC_KEY_FILE" ] && [ -n "$CURRENT_SUPERVISOR_ENV" ]; then
  LICENSE_SERVER_PUBLIC_KEY_FILE="$(printf '%s\\n' "$CURRENT_SUPERVISOR_ENV" | sed -n 's/.*ZHUB_LICENSE_SERVER_PUBLIC_KEY_FILE="\\([^"]*\\)".*/\\1/p')"
fi

ZHUB_SUPERVISOR_LICENSE_ENV=""
if [ -n "$LICENSE_SERVER_URL" ]; then
  ZHUB_SUPERVISOR_LICENSE_ENV="${ZHUB_SUPERVISOR_LICENSE_ENV},ZHUB_LICENSE_SERVER_URL=\\"${LICENSE_SERVER_URL}\\""
fi
if [ -n "$LICENSE_SERVER_PUBLIC_KEY_FILE" ]; then
  ZHUB_SUPERVISOR_LICENSE_ENV="${ZHUB_SUPERVISOR_LICENSE_ENV},ZHUB_LICENSE_SERVER_PUBLIC_KEY_FILE=\\"${LICENSE_SERVER_PUBLIC_KEY_FILE}\\""
fi
export APP_DIR WEB_ROOT ZHUB_SUPERVISOR_LICENSE_ENV

if [ -n "$ZHUB_SUPERVISOR_LICENSE_ENV" ]; then
  info "Configuración remota de licencias detectada: se conservará durante la actualización"
fi

envsubst < "$DEPLOY_DIR/supervisor/zhub_backend.conf.template" | tee "$SUPERVISOR_CONF" >/dev/null
run_visual "Actualizando configuración de servicios" bash -c 'supervisorctl reread'"""

replace_once("deploy/install.sh", old_block, new_block)

replace_once(
    "deploy/supervisor/zhub_backend.conf.template",
    "environment=PYTHONUNBUFFERED=1\n",
    "environment=PYTHONUNBUFFERED=1${ZHUB_SUPERVISOR_LICENSE_ENV}\n",
)

contracts = Path("backend/tests/test_license_stage6_contract.py")
contracts_text = contracts.read_text(encoding="utf-8")
contract_marker = "def test_installer_preserves_remote_license_environment():"
if contract_marker not in contracts_text:
    contracts_text = contracts_text.rstrip() + """


def test_installer_preserves_remote_license_environment():
    deploy = read("deploy/install.sh")
    template = read("deploy/supervisor/zhub_backend.conf.template")
    assert 'SUPERVISOR_CONF="/etc/supervisor/conf.d/zhub_backend.conf"' in deploy
    assert "CURRENT_SUPERVISOR_ENV" in deploy
    assert "ZHUB_SUPERVISOR_LICENSE_ENV" in deploy
    assert "ZHUB_LICENSE_SERVER_URL" in deploy
    assert "ZHUB_LICENSE_SERVER_PUBLIC_KEY_FILE" in deploy
    assert 'environment=PYTHONUNBUFFERED=1${ZHUB_SUPERVISOR_LICENSE_ENV}' in template
    assert "192.168.10.240" not in deploy
    assert "192.168.10.240" not in template
""" + "\n"
    contracts.write_text(contracts_text, encoding="utf-8")

Path("frontend/src/modules/system-update/version.js").write_text(
    """/** Z-Hub panel version — changelog contains only the current release. */
export const PANEL_VERSION = "1.2.77";
export const CHANGELOG = [
  { type: "Licencias", text: "Las actualizaciones conservan la configuración del License Server remoto existente en Supervisor y evitan regresar a Modo local." },
  { type: "Despliegue", text: "El instalador reconstruye zhub_backend.conf preservando ZHUB_LICENSE_SERVER_URL y ZHUB_LICENSE_SERVER_PUBLIC_KEY_FILE cuando ya estaban configurados." },
  { type: "Seguridad", text: "No se incrustan IP, URL, claves privadas ni tokens en el repositorio; solo se reutilizan los valores existentes de la instalación." },
  { type: "Compatibilidad", text: "Instalaciones sin License Server remoto continúan generando la configuración estándar de Supervisor sin variables adicionales." },
  { type: "Backup", text: "Se creó backup/pre-license-env-persistence-1.2.77-20260911 antes de corregir la persistencia." },
];
""",
    encoding="utf-8",
)

continuity = Path("docs/CONTINUIDAD_Z-HUB.md")
continuity_text = continuity.read_text(encoding="utf-8")
heading = "### 1.2.77 — 2026-09-11 — Persistencia del License Server durante actualizaciones"
if heading not in continuity_text:
    continuity_text = continuity_text.rstrip() + """

---

### 1.2.77 — 2026-09-11 — Persistencia del License Server durante actualizaciones
- **Causa:** al instalar 1.2.76, `deploy/install.sh` regeneró `/etc/supervisor/conf.d/zhub_backend.conf` desde la plantilla y reemplazó la línea `environment` por `PYTHONUNBUFFERED=1`; esto eliminó `ZHUB_LICENSE_SERVER_URL` y `ZHUB_LICENSE_SERVER_PUBLIC_KEY_FILE`, por lo que el backend volvió a `Modo local` aunque la CA y la clave pública RSA seguían instaladas.
- **Corrección:** antes de regenerar Supervisor, el instalador lee la configuración `environment=` existente y conserva los valores de `ZHUB_LICENSE_SERVER_URL` y `ZHUB_LICENSE_SERVER_PUBLIC_KEY_FILE`. También respeta valores ya exportados en el entorno de instalación.
- **Plantilla:** `deploy/supervisor/zhub_backend.conf.template` incorpora `${ZHUB_SUPERVISOR_LICENSE_ENV}` después de `PYTHONUNBUFFERED=1`; si no hay configuración remota, la expansión queda vacía y el comportamiento local anterior se conserva.
- **Portabilidad:** no se fija `192.168.10.240`, dominios, rutas privadas ni credenciales en el repositorio. Cada instalación conserva sus propios valores.
- **Seguridad:** no se copian claves privadas ni tokens administrativos. La clave pública y la CA continúan fuera del repositorio en las rutas configuradas por la instalación.
- **Regresión cubierta:** `backend/tests/test_license_stage6_contract.py` verifica que el instalador preserve ambas variables y que no exista una IP de laboratorio incrustada.
- **Archivos:** `deploy/install.sh`, `deploy/supervisor/zhub_backend.conf.template`, `backend/tests/test_license_stage6_contract.py`, `frontend/src/modules/system-update/version.js`.
- **Backup previo:** `backup/pre-license-env-persistence-1.2.77-20260911`.
- **Prueba operativa previa al cambio:** después de restaurar manualmente las variables en `z2`, el panel volvió a mostrar `TRIAL ACTIVO`, License Server `Conectado`, fuente `Servidor remoto`, capacidad 20 y período de gracia.
- **Validación pendiente de despliegue:** instalar 1.2.77 sobre `z2` y confirmar que, tras el reinicio del backend, las dos variables siguen presentes en `/proc/<pid>/environ` y el panel continúa en `Servidor remoto` sin intervención manual.
- **Estado de etapas:** Etapa 6 queda funcionalmente cerrada; este 1.2.77 es un hotfix de persistencia de despliegue. Después de validarlo corresponde continuar con la Etapa 7 (Centro de Licencias / gestión comercial por GUI).
""" + "\n"
    continuity.write_text(continuity_text, encoding="utf-8")
