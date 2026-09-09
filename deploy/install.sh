#!/bin/bash
# ============================================================================== 
# Z-HUB — Instalador y despliegue automático para Debian/Ubuntu
# La instalación técnica termina dejando el asistente web para licencia y admin.
# ============================================================================== 
set -Eeuo pipefail

if [ "$(id -u)" -eq 0 ]; then SUDO=""; else
  command -v sudo >/dev/null || { echo "❌ Ejecute como root o instale sudo." >&2; exit 1; }
  SUDO="sudo"
fi

DEPLOY_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(dirname "$DEPLOY_DIR")"
WEB_ROOT="/var/www/z-hub/web"
DB_NAME="zhub"
DB_USER="zhub"
LOG_FILE="/var/log/zhub_install.log"
LICENSE_DIR="/etc/zhub/licencia"
LICENSE_FILE="$LICENSE_DIR/licencias.txt"
STEP="inicio"
START_TIME="$(date +%s)"

$SUDO touch "$LOG_FILE"
$SUDO chmod 600 "$LOG_FILE"

if ! { true >&3; } 2>/dev/null; then
  exec 3>&1 4>&2
fi
exec 1>>"$LOG_FILE" 2>&1

COLOR_TITLE='\033[1;36m'
COLOR_OK='\033[1;32m'
COLOR_WORK='\033[1;33m'
COLOR_ERROR='\033[1;31m'
COLOR_INFO='\033[0;37m'
COLOR_IMPORTANT='\033[1;35m'
COLOR_RESET='\033[0m'

ui()      { printf '%s\n' "$*" >&3; }
line()    { ui "────────────────────────────────────────────────────────────"; }
section() { line; printf '%b%s%b\n' "$COLOR_TITLE" "$1" "$COLOR_RESET" >&3; line; }
title()   { printf '%b%s%b\n' "$COLOR_TITLE" "$1" "$COLOR_RESET" >&3; }
ok()      { printf '%b  ✓ %s%b\n' "$COLOR_OK" "$1" "$COLOR_RESET" >&3; }
info()    { printf '%b  • %s%b\n' "$COLOR_INFO" "$1" "$COLOR_RESET" >&3; }
important(){ printf '%b  %s%b\n' "$COLOR_IMPORTANT" "$1" "$COLOR_RESET" >&3; }
warn()    { printf '%b  ⚠ %s%b\n' "$COLOR_WORK" "$1" "$COLOR_RESET" >&3; }

run_visual() {
  local label="$1"; shift
  local pid rc i=0
  printf '%b  ⟳ %s%b\n' "$COLOR_WORK" "$label" "$COLOR_RESET" >&3
  "$@" >>"$LOG_FILE" 2>&1 &
  pid=$!
  while kill -0 "$pid" 2>/dev/null; do
    case $((i % 4)) in
      0) printf '\r%b      ⠋ Trabajando... %b' "$COLOR_WORK" "$COLOR_RESET" >&3 ;;
      1) printf '\r%b      ⠙ Trabajando... %b' "$COLOR_WORK" "$COLOR_RESET" >&3 ;;
      2) printf '\r%b      ⠹ Trabajando... %b' "$COLOR_WORK" "$COLOR_RESET" >&3 ;;
      3) printf '\r%b      ⠸ Trabajando... %b' "$COLOR_WORK" "$COLOR_RESET" >&3 ;;
    esac
    i=$((i + 1)); sleep 1
  done
  wait "$pid" || rc=$?
  rc=${rc:-0}; printf '\r' >&3
  if [ "$rc" -eq 0 ]; then ok "$label completado"; else
    printf '%b      ✗ El proceso falló (código %s)%b\n' "$COLOR_ERROR" "$rc" "$COLOR_RESET" >&3
    printf '%b      Revisa el registro técnico de instalación%b\n' "$COLOR_ERROR" "$COLOR_RESET" >&3
    return "$rc"
  fi
}

trap 'rc=$?; ui ""; printf "%b╔════════════════════════════════════════════════════════════╗%b\n" "$COLOR_ERROR" "$COLOR_RESET" >&3; printf "%b║                 ❌ INSTALACIÓN DETENIDA                   ║%b\n" "$COLOR_ERROR" "$COLOR_RESET" >&3; printf "%b╚════════════════════════════════════════════════════════════╝%b\n" "$COLOR_ERROR" "$COLOR_RESET" >&3; ui "  Paso: $STEP"; ui "  Línea: $LINENO"; ui "  Código: $rc"; ui "  Registro técnico disponible"; tail -n 18 "$LOG_FILE" >&3 2>&3 || true; exit $rc' ERR

ui ""
printf '%b%s%b\n' "$COLOR_TITLE" "╔════════════════════════════════════════════════════════════╗" "$COLOR_RESET" >&3
printf '%b%s%b\n' "$COLOR_TITLE" "║                    Z-HUB ISP INSTALLER                    ║" "$COLOR_RESET" >&3
printf '%b%s%b\n' "$COLOR_TITLE" "║              Instalación y configuración automática       ║" "$COLOR_RESET" >&3
printf '%b%s%b\n' "$COLOR_TITLE" "╚════════════════════════════════════════════════════════════╝" "$COLOR_RESET" >&3
ui ""
title "Sistema detectado"
if [ -r /etc/os-release ]; then . /etc/os-release; ok "${PRETTY_NAME:-Sistema Linux}"; else ok "Sistema Linux"; fi
ok "Arquitectura: $(dpkg --print-architecture 2>/dev/null || uname -m)"
ok "Usuario: $(id -un)"

export DEBIAN_FRONTEND=noninteractive
STEP="Preparando el entorno"
section "[1/7] Preparando el entorno"
run_visual "Actualizando componentes" apt-get update
run_visual "Preparando recursos necesarios" apt-get install -y curl wget git build-essential python3 python3-pip python3-venv python3-dev nginx supervisor gnupg lsb-release mariadb-server mariadb-client libmariadb-dev pkg-config gettext-base
run_visual "Preparando registro interno" bash -c 'mkdir -p "$1"; if [ ! -f "$2" ] && [ -f "$3" ]; then cp "$3" "$2"; fi; test -f "$2"; chown root:www-data "$2"; chmod 640 "$2"' _ "$LICENSE_DIR" "$LICENSE_FILE" "$APP_DIR/licencia/licencias.txt"
# El registro queda fuera del checkout publicado y fuera del webroot. El backend
# utiliza /etc/zhub/licencia/licencias.txt como fuente privada de validación.
rm -rf "$APP_DIR/licencia"
ok "Entorno preparado"

STEP="Configurando el sistema"
section "[2/7] Configurando el sistema"
if ! command -v node >/dev/null; then run_visual "Preparando componentes del sistema" bash -c 'curl -fsSL https://deb.nodesource.com/setup_20.x | bash -'; run_visual "Configurando herramientas" apt-get install -y nodejs; fi
if ! command -v yarn >/dev/null; then run_visual "Configurando herramientas" npm install --global yarn; fi
ok "Sistema configurado"

STEP="Inicializando componentes"
section "[3/7] Inicializando componentes"
run_visual "Inicializando servicios" systemctl enable --now mariadb
ok "Componentes inicializados"

if [ -f "$APP_DIR/backend/.env" ] && grep -q "^DATABASE_URL=" "$APP_DIR/backend/.env"; then
  DB_PASS="$(grep '^DATABASE_URL=' "$APP_DIR/backend/.env" | sed -E 's#.*://[^:]+:([^@]+)@.*#\1#')"
  info "Configuración existente: se conserva la configuración actual"
else
  DB_PASS="$(python3 - <<'PY'
import secrets
print(secrets.token_urlsafe(18)[:24])
PY
)"
  important "Se generó una credencial segura para el sistema"
fi
export DB_NAME DB_USER DB_PASS
run_visual "Preparando datos y configuración" bash -c 'envsubst < "$1/mariadb/init.sql.template" | mariadb' _ "$DEPLOY_DIR"
ok "Configuración de acceso preparada"

STEP="Preparando la aplicación"
section "[4/7] Preparando la aplicación"
cd "$APP_DIR/backend"
if [ ! -f ".env" ]; then
  JWT_SECRET="$(python3 - <<'PY'
import secrets
print(secrets.token_hex(32))
PY
)"
  export JWT_SECRET
  envsubst < "$DEPLOY_DIR/env/backend.env.example" > .env
  ok "Configuración de la aplicación generada"
else ok "Configuración de la aplicación conservada"; fi
if [ ! -d venv ]; then run_visual "Preparando entorno de ejecución" python3 -m venv venv; fi
run_visual "Actualizando herramientas" ./venv/bin/pip install --upgrade pip
run_visual "Preparando dependencias" ./venv/bin/pip install -r requirements.txt
ok "Entorno de ejecución y dependencias listos"

STEP="Procesando la aplicación"
section "[5/7] Procesando la aplicación"
cd "$APP_DIR/frontend"
printf 'REACT_APP_BACKEND_URL=\n' > .env
rm -rf build
run_visual "Preparando recursos de la aplicación" yarn install --network-timeout 100000
ok "Dependencias preparadas"
run_visual "Procesando componentes" env DISABLE_ESLINT_PLUGIN=true CI= yarn build
ok "Recursos de la aplicación generados correctamente"
mkdir -p "$WEB_ROOT"
rm -rf "$WEB_ROOT"/*
run_visual "Publicando recursos" cp -r build/. "$WEB_ROOT"/
run_visual "Ajustando permisos" chown -R www-data:www-data "$APP_DIR"
run_visual "Aplicando configuración de seguridad" chmod -R 755 "$APP_DIR"
git config --system --add safe.directory "$APP_DIR"
ok "Recursos publicados correctamente"
ok "Configuración de seguridad aplicada"

STEP="Activando el sistema"
section "[6/7] Activando el sistema"
cd "$APP_DIR"
export APP_DIR WEB_ROOT
envsubst < "$DEPLOY_DIR/supervisor/zhub_backend.conf.template" | tee /etc/supervisor/conf.d/zhub_backend.conf >/dev/null
run_visual "Actualizando configuración de servicios" bash -c 'supervisorctl reread'
run_visual "Aplicando configuración" bash -c 'supervisorctl update'
run_visual "Reiniciando componentes" bash -c 'supervisorctl restart zhub_backend'
ok "Servicios configurados"
info "Comprobando respuesta del sistema..."
BACKEND_OK=0
for i in $(seq 1 20); do
  printf '\r%b  ⟳ Comprobación: intento %02d/20 ... %b' "$COLOR_WORK" "$i" "$COLOR_RESET" >&3
  if curl -fs http://127.0.0.1:8001/api/health >/dev/null 2>&1; then BACKEND_OK=1; break; fi
  sleep 2
done
printf '\r' >&3
if [ "$BACKEND_OK" -ne 1 ]; then printf '%b✗ El servicio principal no responde%b\n' "$COLOR_ERROR" "$COLOR_RESET" >&3; exit 1; fi
ok "Servicio principal respondiendo correctamente"
rm -f /etc/nginx/sites-enabled/default
envsubst '$WEB_ROOT' < "$DEPLOY_DIR/nginx/zhub.conf.template" | tee /etc/nginx/sites-available/zhub >/dev/null
ln -sf /etc/nginx/sites-available/zhub /etc/nginx/sites-enabled/zhub
run_visual "Validando configuración" nginx -t
run_visual "Activando acceso web" systemctl restart nginx
ok "Acceso web activado"

STEP="Finalizando instalación"
section "[7/7] Finalizando instalación"
if curl -fs http://127.0.0.1:8001/api/health >/dev/null 2>&1; then ok "Servicio principal: OK"; else printf '%b✗ Comprobación final del servicio falló%b\n' "$COLOR_ERROR" "$COLOR_RESET" >&3; exit 1; fi
if systemctl is-active --quiet mariadb; then ok "Datos: OK"; else printf '%b✗ Servicio de datos inactivo%b\n' "$COLOR_ERROR" "$COLOR_RESET" >&3; exit 1; fi
if supervisorctl status zhub_backend 2>/dev/null | grep -q RUNNING; then ok "Servicios: OK"; else printf '%b✗ Los servicios no están activos%b\n' "$COLOR_ERROR" "$COLOR_RESET" >&3; exit 1; fi
if systemctl is-active --quiet nginx; then ok "Acceso web: OK"; else printf '%b✗ Acceso web inactivo%b\n' "$COLOR_ERROR" "$COLOR_RESET" >&3; exit 1; fi
ok "Actualización: OK"

IP="$(hostname -I 2>/dev/null | awk '{print $1}')"
PANEL_URL="http://${IP:-IP_DEL_SERVIDOR}/"
END_TIME="$(date +%s)"
ELAPSED=$((END_TIME - START_TIME))
ui ""
printf '%b%s%b\n' "$COLOR_OK" "╔════════════════════════════════════════════════════════════╗" "$COLOR_RESET" >&3
printf '%b%s%b\n' "$COLOR_OK" "║                  ✓ Z-HUB INSTALADO                        ║" "$COLOR_RESET" >&3
printf '%b%s%b\n' "$COLOR_OK" "╚════════════════════════════════════════════════════════════╝" "$COLOR_RESET" >&3
ui ""
ok "Servicio principal: OK"
ok "Datos:              OK"
ok "Servicios:          OK"
ok "Acceso web:         OK"
ok "Actualización:      OK"
ok "Duración:           ${ELAPSED}s"
ui ""
printf '%b  🌐 Panel:          \033]8;;%s\a%s\033]8;;\a%b\n' "$COLOR_IMPORTANT" "$PANEL_URL" "$PANEL_URL" "$COLOR_RESET" >&3
info "Continúe en el navegador para activar la licencia y crear la cuenta administradora."
if command -v xdg-open >/dev/null 2>&1 && [ -n "${DISPLAY:-}${WAYLAND_DISPLAY:-}" ]; then
  xdg-open "$PANEL_URL" >/dev/null 2>&1 &
fi
ui ""
printf '%b%s%b\n' "$COLOR_OK" "============================================================" "$COLOR_RESET" >&3
printf '%b  ✓ Z-HUB ESTÁ LISTO PARA CONFIGURACIÓN INICIAL%b\n' "$COLOR_OK" "$COLOR_RESET" >&3
printf '%b%s%b\n' "$COLOR_OK" "============================================================" "$COLOR_RESET" >&3
