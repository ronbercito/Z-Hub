#!/bin/bash
# ============================================================================== 
# Archivo: deploy/install.sh
# Función: instalación y despliegue automático de Z-Hub en Debian/Ubuntu.
# Trabaja con: deploy/mariadb/init.sql.template, deploy/supervisor/zhub_backend.conf.template,
#              deploy/nginx/zhub.conf.template, deploy/env/backend.env.example,
#              backend/requirements.txt, frontend/package.json
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
STEP="inicio"

trap 'rc=$?; echo "ERROR_SETUP: paso=$STEP linea=$LINENO comando=$BASH_COMMAND codigo=$rc"; exit $rc' ERR

STEP="paquetes del sistema"
echo "🚀 Instalando Z-Hub ISP"
echo "📂 Aplicación: $APP_DIR"
echo "📦 1/6 Paquetes del sistema..."
export DEBIAN_FRONTEND=noninteractive
$SUDO apt-get update
$SUDO apt-get install -y curl wget git build-essential python3 python3-pip python3-venv python3-dev \
  nginx supervisor gnupg lsb-release mariadb-server mariadb-client libmariadb-dev pkg-config gettext-base

STEP="Node.js y Yarn"
echo "📦 2/6 Node.js LTS y Yarn..."
if ! command -v node >/dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | $SUDO bash -
  $SUDO apt-get install -y nodejs
fi
command -v yarn >/dev/null || $SUDO npm install --global yarn

STEP="MariaDB"
echo "🗄️ 3/6 Base de datos MariaDB..."
$SUDO systemctl enable --now mariadb

if [ -f "$APP_DIR/backend/.env" ] && grep -q "^DATABASE_URL=" "$APP_DIR/backend/.env"; then
  DB_PASS="$(grep '^DATABASE_URL=' "$APP_DIR/backend/.env" | sed -E 's#.*://[^:]+:([^@]+)@.*#\1#')"
  echo "   .env existente: se conserva la contraseña de la base de datos."
else
  # No usar `head` en una sustitución bajo pipefail: head puede cerrar el pipe
  # antes de que tr termine y provocar código 141 (SIGPIPE).
  DB_PASS="$(python3 - <<'PY'
import secrets
print(secrets.token_urlsafe(18)[:24])
PY
)"
fi

export DB_NAME DB_USER DB_PASS
envsubst < "$DEPLOY_DIR/mariadb/init.sql.template" | $SUDO mariadb
echo "   Base '$DB_NAME' y usuario '$DB_USER' listos."

STEP="backend FastAPI"
echo "🐍 4/6 Backend FastAPI..."
cd "$APP_DIR/backend"
if [ ! -f ".env" ]; then
  JWT_SECRET="$(python3 - <<'PY'
import secrets
print(secrets.token_hex(32))
PY
)"
  export JWT_SECRET
  envsubst < "$DEPLOY_DIR/env/backend.env.example" > .env
  echo "   backend/.env generado."
fi
[ -d venv ] || python3 -m venv venv
./venv/bin/pip install --upgrade pip
./venv/bin/pip install -r requirements.txt

STEP="frontend React"
echo "⚛️ 5/6 Compilando frontend React..."
cd "$APP_DIR/frontend"
printf 'REACT_APP_BACKEND_URL=\n' > .env
rm -rf build
yarn install --network-timeout 100000
DISABLE_ESLINT_PLUGIN=true CI= yarn build
$SUDO mkdir -p "$WEB_ROOT"
$SUDO rm -rf "$WEB_ROOT"/*
$SUDO cp -r build/. "$WEB_ROOT"/
$SUDO chown -R www-data:www-data "/var/www/z-hub"
$SUDO chmod -R 755 "/var/www/z-hub"

STEP="Supervisor y Nginx"
echo "⚙️ 6/6 Supervisor y Nginx..."
cd "$APP_DIR"
export APP_DIR WEB_ROOT
envsubst < "$DEPLOY_DIR/supervisor/zhub_backend.conf.template" | $SUDO tee /etc/supervisor/conf.d/zhub_backend.conf >/dev/null
$SUDO supervisorctl reread || true
$SUDO supervisorctl update || true
$SUDO supervisorctl restart zhub_backend || true

echo "   Esperando al backend..."
for i in $(seq 1 20); do
  if curl -fs http://127.0.0.1:8001/api/health >/dev/null 2>&1; then echo "   ✅ Backend Z-Hub respondiendo"; break; fi
  sleep 2
  if [ "$i" -eq 20 ]; then
    echo "   ❌ El backend no responde. Últimas líneas del log:"
    $SUDO tail -n 30 /var/log/zhub_backend.err.log
    exit 1
  fi
done

$SUDO rm -f /etc/nginx/sites-enabled/default
envsubst '$WEB_ROOT' < "$DEPLOY_DIR/nginx/zhub.conf.template" | $SUDO tee /etc/nginx/sites-available/zhub >/dev/null
$SUDO ln -sf /etc/nginx/sites-available/zhub /etc/nginx/sites-enabled/zhub
$SUDO nginx -t
$SUDO systemctl restart nginx

IP="$(hostname -I 2>/dev/null | awk '{print $1}')"
echo "========================================================="
echo "🎉 Z-HUB — DESPLIEGUE COMPLETADO"
echo "🌐 Panel:    http://${IP:-IP_DEL_SERVIDOR}/"
echo "🔑 Acceso:   $(grep '^ADMIN_EMAIL=' "$APP_DIR/backend/.env" | cut -d= -f2 | tr -d '\"')  /  $(grep '^ADMIN_PASSWORD=' "$APP_DIR/backend/.env" | cut -d= -f2 | tr -d '\"')"
echo "🗄️ MariaDB: base $DB_NAME, usuario $DB_USER (clave en backend/.env)"
echo "📂 Z-Hub: $APP_DIR"
echo "📜 Logs: /var/log/zhub_backend.err.log"
echo "========================================================="