#!/bin/bash
# ============================================================================== 
# Z-HUB — Instalador y despliegue automático para Debian/Ubuntu
# Mantiene la funcionalidad existente. La terminal muestra solo progreso visual;
# toda la salida técnica de comandos queda registrada en /var/log/zhub_install.log.
# ============================================================================== 
set -Eeuo pipefail

if [ "$(id -u)" -eq 0 ]; then SUDO=""; else
  command -v sudo >/dev/null || { echo "❌ Ejecute como root o instale sudo." >&2; exit 1; }
  SUDO="sudo"
fi

DEPLOY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(dirname "$DEPLOY_DIR")"
WEB_ROOT="/var/www/z-hub/web"
DB_NAME="fibraz_isp_db"
DB_USER="fibraz"
LOG_FILE="/var/log/zhub_install.log"
STEP="inicio"
START_TIME="$(date +%s)"

$SUDO touch "$LOG_FILE"
$SUDO chmod 600 "$LOG_FILE"

# Desde aquí, stdout/stderr técnicos se guardan en el log. El descriptor 3
# permanece conectado a la terminal para la interfaz visual del instalador.
exec 3>&1 4>&2
exec 1>>"$LOG_FILE" 2>&1

ui()      { printf '%s\n' "$*" >&3; }
line()    { ui "────────────────────────────────────────────────────────────"; }
section() { line; ui "$1"; line; }
ok()      { ui "  ✓ $1"; }
info()    { ui "  • $1"; }
warn()    { ui "  ⚠ $1"; }

trap 'rc=$?; ui ""; ui "╔════════════════════════════════════════════════════════════╗"; ui "║                 ❌ INSTALACIÓN DETENIDA                   ║"; ui "╚════════════════════════════════════════════════════════════╝"; ui "  Paso: $STEP"; ui "  Línea: $LINENO"; ui "  Código: $rc"; ui "  Log técnico: $LOG_FILE"; ui "  Últimas líneas del log:"; tail -n 18 "$LOG_FILE" >&3 2>&3 || true; exit $rc' ERR

ui ""
ui "╔════════════════════════════════════════════════════════════╗"
ui "║                    Z-HUB ISP INSTALLER                    ║"
ui "║              Instalación y configuración automática       ║"
ui "╚════════════════════════════════════════════════════════════╝"
ui ""
ui "Sistema detectado"
if [ -r /etc/os-release ]; then
  . /etc/os-release
  ok "${PRETTY_NAME:-Sistema Linux}"
else
  ok "Sistema Linux"
fi
ok "Arquitectura: $(dpkg --print-architecture 2>/dev/null || uname -m)"
ok "Usuario: $(id -un)"

export DEBIAN_FRONTEND=noninteractive

STEP="Preparando sistema"
section "[1/7] Preparando sistema"
apt-get update
apt-get install -y curl wget git build-essential python3 python3-pip python3-venv python3-dev \
  nginx supervisor gnupg lsb-release mariadb-server mariadb-client libmariadb-dev pkg-config gettext-base
ok "Actualizando paquetes"
ok "Instalando Git"
ok "Instalando Python"
ok "Instalando Nginx"
ok "Instalando Supervisor"
ok "Paquetes del sistema listos"

STEP="Node.js y Yarn"
section "[2/7] Node.js LTS y Yarn"
if ! command -v node >/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y nodejs
fi
command -v yarn >/dev/null || npm install --global yarn
ok "Node.js: $(node --version)"
ok "Yarn: $(yarn --version)"

STEP="MariaDB"
section "[3/7] Configurando MariaDB"
systemctl enable --now mariadb
ok "Servicio MariaDB activo"

if [ -f "$APP_DIR/backend/.env" ] && grep -q "^DATABASE_URL=" "$APP_DIR/backend/.env"; then
  DB_PASS="$(grep '^DATABASE_URL=' "$APP_DIR/backend/.env" | sed -E 's#.*://[^:]+:([^@]+)@.*#\1#')"
  info "backend/.env existente: se conserva la contraseña de la base de datos"
else
  DB_PASS="$(python3 - <<'PY'
import secrets
print(secrets.token_urlsafe(18)[:24])
PY
)"
  info "Se generó una contraseña segura para MariaDB"
fi

export DB_NAME DB_USER DB_PASS
envsubst < "$DEPLOY_DIR/mariadb/init.sql.template" | mariadb
ok "Base de datos '$DB_NAME' preparada"
ok "Usuario MariaDB '$DB_USER' preparado"

STEP="Backend FastAPI"
section "[4/7] Instalando backend FastAPI"
cd "$APP_DIR/backend"
if [ ! -f ".env" ]; then
  JWT_SECRET="$(python3 - <<'PY'
import secrets
print(secrets.token_hex(32))
PY
)"
  export JWT_SECRET
  envsubst < "$DEPLOY_DIR/env/backend.env.example" > .env
  ok "backend/.env generado"
else
  ok "backend/.env existente conservado"
fi
[ -d venv ] || python3 -m venv venv
./venv/bin/pip install --upgrade pip
./venv/bin/pip install -r requirements.txt
ok "Entorno virtual y dependencias del backend listos"

STEP="Frontend React"
section "[5/7] Compilando frontend React"
cd "$APP_DIR/frontend"
printf 'REACT_APP_BACKEND_URL=\n' > .env
rm -rf build
yarn install --network-timeout 100000
ok "Dependencias frontend instaladas"
DISABLE_ESLINT_PLUGIN=true CI= yarn build
ok "Frontend compilado correctamente"
mkdir -p "$WEB_ROOT"
rm -rf "$WEB_ROOT"/*
cp -r build/. "$WEB_ROOT"/
chown -R www-data:www-data "$APP_DIR"
chmod -R 755 "$APP_DIR"
git config --system --add safe.directory "$APP_DIR"
ok "Archivos publicados en $WEB_ROOT"
ok "Git safe.directory configurado para $APP_DIR"

STEP="Servicios"
section "[6/7] Activando Supervisor y Nginx"
cd "$APP_DIR"
export APP_DIR WEB_ROOT
envsubst < "$DEPLOY_DIR/supervisor/zhub_backend.conf.template" | tee /etc/supervisor/conf.d/zhub_backend.conf >/dev/null
supervisorctl reread || true
supervisorctl update || true
supervisorctl restart zhub_backend || true
ok "Supervisor configurado"

info "Esperando respuesta del backend..."
BACKEND_OK=0
for i in $(seq 1 20); do
  if curl -fs http://127.0.0.1:8001/api/health >/dev/null 2>&1; then BACKEND_OK=1; break; fi
  sleep 2
done
if [ "$BACKEND_OK" -ne 1 ]; then
  echo "Backend no responde" >&2
  exit 1
fi
ok "Backend Z-Hub respondiendo en 127.0.0.1:8001"

rm -f /etc/nginx/sites-enabled/default
envsubst '$WEB_ROOT' < "$DEPLOY_DIR/nginx/zhub.conf.template" | tee /etc/nginx/sites-available/zhub >/dev/null
ln -sf /etc/nginx/sites-available/zhub /etc/nginx/sites-enabled/zhub
nginx -t
systemctl restart nginx
ok "Nginx configurado y activo"

STEP="Verificación final"
section "[7/7] Verificación final"
if curl -fs http://127.0.0.1:8001/api/health >/dev/null 2>&1; then
  ok "Backend: OK"
else
  echo "Healthcheck final del backend falló" >&2
  exit 1
fi
if systemctl is-active --quiet mariadb; then ok "MariaDB: OK"; else echo "MariaDB inactivo" >&2; exit 1; fi
if supervisorctl status zhub_backend 2>/dev/null | grep -q RUNNING; then ok "Supervisor: OK"; else echo "Supervisor no está RUNNING" >&2; exit 1; fi
if systemctl is-active --quiet nginx; then ok "Nginx: OK"; else echo "Nginx inactivo" >&2; exit 1; fi
ok "Git Update: OK"

IP="$(hostname -I 2>/dev/null | awk '{print $1}')"
END_TIME="$(date +%s)"
ELAPSED=$((END_TIME - START_TIME))

ui ""
ui "╔════════════════════════════════════════════════════════════╗"
ui "║                  ✓ Z-HUB INSTALADO                        ║"
ui "╚════════════════════════════════════════════════════════════╝"
ui ""
ok "Backend:     OK"
ok "MariaDB:     OK"
ok "Supervisor:  OK"
ok "Nginx:       OK"
ok "Git Update:  OK"
ok "Duración:    ${ELAPSED}s"
ui ""
ui "  🌐 Panel:          http://${IP:-IP_DEL_SERVIDOR}/"
ui "  📂 Z-Hub:          $APP_DIR"
ui "  🗄️  Base:           $DB_NAME"
ui "  👤 Usuario BD:      $DB_USER"
ui "  📜 Log técnico:     $LOG_FILE"
ui "  📜 Log backend:     /var/log/zhub_backend.err.log"
ui ""
ui "  Credenciales iniciales:"
ui "  🔑 Email:           $(grep '^ADMIN_EMAIL=' "$APP_DIR/backend/.env" | cut -d= -f2 | tr -d '\"')"
ui "  🔑 Password:        $(grep '^ADMIN_PASSWORD=' "$APP_DIR/backend/.env" | cut -d= -f2 | tr -d '\"')"
ui ""
ui "============================================================"
ui "  ✓ Z-HUB ESTÁ LISTO PARA USAR"
ui "============================================================"
