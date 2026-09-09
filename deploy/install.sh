#!/bin/bash
# ============================================================================== 
# Z-HUB — Instalador y despliegue automático para Debian/Ubuntu
# Mantiene la funcionalidad existente y añade salida visual, diagnóstico y log.
# ============================================================================== 
set -Eeuo pipefail

if [ "$(id -u)" -eq 0 ]; then SUDO=""; else
  command -v sudo >/dev/null || { echo "❌ Ejecute como root o instale sudo."; exit 1; }
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

$SUDO touch "$LOG_FILE" 2>/dev/null || true
$SUDO chmod 644 "$LOG_FILE" 2>/dev/null || true

# Duplica toda la salida en el log sin alterar el flujo del instalador.
exec > >(tee -a "$LOG_FILE") 2>&1

trap 'rc=$?; echo ""; echo "╔════════════════════════════════════════════════════════════╗"; echo "║ ❌ INSTALACIÓN DETENIDA                                    ║"; echo "╚════════════════════════════════════════════════════════════╝"; echo "  Paso: $STEP"; echo "  Línea: $LINENO"; echo "  Código: $rc"; echo "  Log: $LOG_FILE"; echo "  Comando: $BASH_COMMAND"; exit $rc' ERR

header() {
  echo ""
  echo "╔════════════════════════════════════════════════════════════╗"
  printf "║ %-58s ║\n" "$1"
  echo "╚════════════════════════════════════════════════════════════╝"
}

step() {
  STEP="$1"
  echo ""
  echo "────────────────────────────────────────────────────────────"
  printf "▶ %-58s\n" "$2"
  echo "────────────────────────────────────────────────────────────"
}

ok()   { echo "  ✓ $1"; }
info() { echo "  • $1"; }
warn() { echo "  ⚠ $1"; }

header "Z-HUB ISP — INSTALADOR"
info "Aplicación: $APP_DIR"
info "Inicio: $(date '+%Y-%m-%d %H:%M:%S')"
info "Log: $LOG_FILE"

export DEBIAN_FRONTEND=noninteractive

step "paquetes del sistema" "1/6 — Preparando el sistema"
$SUDO apt-get update
$SUDO apt-get install -y curl wget git build-essential python3 python3-pip python3-venv python3-dev \
  nginx supervisor gnupg lsb-release mariadb-server mariadb-client libmariadb-dev pkg-config gettext-base
ok "Paquetes del sistema instalados"
ok "Git disponible: $(git --version)"
ok "Python disponible: $(python3 --version)"

step "Node.js y Yarn" "2/6 — Node.js LTS y Yarn"
if ! command -v node >/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | $SUDO bash -
  $SUDO apt-get install -y nodejs
fi
command -v yarn >/dev/null || $SUDO npm install --global yarn
ok "Node.js: $(node --version)"
ok "Yarn: $(yarn --version)"

step "MariaDB" "3/6 — Configurando MariaDB"
$SUDO systemctl enable --now mariadb
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
envsubst < "$DEPLOY_DIR/mariadb/init.sql.template" | $SUDO mariadb
ok "Base de datos '$DB_NAME' preparada"
ok "Usuario MariaDB '$DB_USER' preparado"

step "backend FastAPI" "4/6 — Instalando backend"
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

step "frontend React" "5/6 — Compilando frontend"
cd "$APP_DIR/frontend"
printf 'REACT_APP_BACKEND_URL=\n' > .env
rm -rf build
yarn install --network-timeout 100000
ok "Dependencias frontend instaladas"
DISABLE_ESLINT_PLUGIN=true CI= yarn build
ok "Frontend compilado correctamente"
$SUDO mkdir -p "$WEB_ROOT"
$SUDO rm -rf "$WEB_ROOT"/*
$SUDO cp -r build/. "$WEB_ROOT"/
$SUDO chown -R www-data:www-data "/var/www/z-hub"
$SUDO chmod -R 755 "/var/www/z-hub"
# El despliegue deja el árbol bajo www-data, mientras el backend de Supervisor
# ejecuta como root. Git 2.35+ bloquea repositorios cuyo propietario difiere del
# usuario que ejecuta git; declarar explícitamente este checkout como confiable.
$SUDO git config --system --add safe.directory "$APP_DIR"
ok "Archivos publicados en $WEB_ROOT"
ok "Git safe.directory configurado para $APP_DIR"

step "Supervisor y Nginx" "6/6 — Activando servicios"
cd "$APP_DIR"
export APP_DIR WEB_ROOT
envsubst < "$DEPLOY_DIR/supervisor/zhub_backend.conf.template" | $SUDO tee /etc/supervisor/conf.d/zhub_backend.conf >/dev/null
$SUDO supervisorctl reread || true
$SUDO supervisorctl update || true
$SUDO supervisorctl restart zhub_backend || true
ok "Supervisor configurado"

info "Esperando respuesta del backend..."
BACKEND_OK=0
for i in $(seq 1 20); do
  if curl -fs http://127.0.0.1:8001/api/health >/dev/null 2>&1; then BACKEND_OK=1; break; fi
  printf "  · intento %02d/20\r" "$i"
  sleep 2
done
echo ""
if [ "$BACKEND_OK" -ne 1 ]; then
  echo "  ❌ El backend no responde. Últimas líneas del log:"
  $SUDO tail -n 30 /var/log/zhub_backend.err.log
  exit 1
fi
ok "Backend Z-Hub respondiendo en 127.0.0.1:8001"

$SUDO rm -f /etc/nginx/sites-enabled/default
envsubst '$WEB_ROOT' < "$DEPLOY_DIR/nginx/zhub.conf.template" | $SUDO tee /etc/nginx/sites-available/zhub >/dev/null
$SUDO ln -sf /etc/nginx/sites-available/zhub /etc/nginx/sites-enabled/zhub
$SUDO nginx -t
$SUDO systemctl restart nginx
ok "Nginx configurado y activo"

IP="$(hostname -I 2>/dev/null | awk '{print $1}')"
END_TIME="$(date +%s)"
ELAPSED=$((END_TIME - START_TIME))

header "Z-HUB — INSTALACIÓN COMPLETADA"
echo ""
ok "Backend:     OK"
ok "MariaDB:     OK"
ok "Supervisor:  OK"
ok "Nginx:       OK"
ok "Git Update:  OK"
ok "Duración:    ${ELAPSED}s"
echo ""
echo "  🌐 Panel:    http://${IP:-IP_DEL_SERVIDOR}/"
echo "  📂 Z-Hub:    $APP_DIR"
echo "  🗄️  Base:     $DB_NAME"
echo "  👤 Usuario:   $DB_USER"
echo "  📜 Instalación: $LOG_FILE"
echo "  📜 Backend:     /var/log/zhub_backend.err.log"
echo ""
echo "  Credenciales iniciales:"
echo "  🔑 Email:    $(grep '^ADMIN_EMAIL=' "$APP_DIR/backend/.env" | cut -d= -f2 | tr -d '\"')"
echo "  🔑 Password: $(grep '^ADMIN_PASSWORD=' "$APP_DIR/backend/.env" | cut -d= -f2 | tr -d '\"')"
echo ""
echo "============================================================"
echo "  ✓ Z-HUB ESTÁ LISTO PARA USAR"
echo "============================================================"
