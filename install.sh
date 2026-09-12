#!/bin/bash
# ==============================================================================
# Archivo: install.sh (raíz del proyecto Z-Hub)
# Función: prepara Git, sincroniza Z-Hub con origin/main y ejecuta el instalador real.
#          La salida técnica se guarda en /var/log/zhub_install.log para mantener
#          la terminal limpia; deploy/install.sh presenta la interfaz visual.
#          Durante un rollback, ZHUB_SKIP_GIT_SYNC=1 conserva el commit restaurado.
#          Los archivos locales no versionados (por ejemplo backend/.env) se conservan.
# ============================================================================
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="/var/log/zhub_install.log"

touch "$LOG_FILE" 2>/dev/null || true
chmod 600 "$LOG_FILE" 2>/dev/null || true
exec 3>&1 4>&2
exec 1>>"$LOG_FILE" 2>&1

ui() { printf '%s\n' "$*" >&3; }
spinner_start() {
  local msg="$1" pid="$2" i=0 elapsed=0
  # No usamos \r: algunos terminales/SSH no refrescan correctamente una línea
  # reescrita y el instalador puede parecer congelado. Dejamos un heartbeat
  # visible cada 2 segundos mientras el proceso siga trabajando.
  while kill -0 "$pid" 2>/dev/null; do
    if (( i % 4 == 0 )); then
      ui "  ⟳ $msg — ${elapsed}s transcurridos"
    fi
    i=$((i + 1))
    elapsed=$((elapsed + 1))
    sleep 0.5
  done
}
run_visual() {
  local msg="$1"
  shift
  "$@" &
  local pid=$!
  spinner_start "$msg" "$pid"
  if wait "$pid"; then
    ui "  ✓ $msg"
  else
    local rc=$?
    ui "  ✗ $msg (código $rc)"
    ui "  • Revise: $LOG_FILE"
    return "$rc"
  fi
}

if ! command -v git >/dev/null 2>&1; then
  export DEBIAN_FRONTEND=noninteractive
  if command -v apt-get >/dev/null 2>&1; then
    ui ""
    ui "[1/2] Preparando Git"
    run_visual "Actualizando índices de paquetes" apt-get update
    run_visual "Instalando Git" apt-get install -y git
  else
    printf '%s\n' "No se encontró apt-get. Instale Git manualmente y vuelva a ejecutar." >&2
    exit 1
  fi
fi

git config --system --add safe.directory "$ROOT_DIR" 2>/dev/null || true

if [[ "${ZHUB_SKIP_GIT_SYNC:-0}" != "1" ]] && git -C "$ROOT_DIR" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  ui ""
  ui "────────────────────────────────────────────────────────────"
  ui "  Sincronizando con servidor Z-Hub"
  ui "────────────────────────────────────────────────────────────"
  run_visual "Descargando actualizaciones" git -C "$ROOT_DIR" fetch origin main
  run_visual "Ajustando y verificando" git -C "$ROOT_DIR" checkout main 2>/dev/null || true
  run_visual "Aplicando versión actual" git -C "$ROOT_DIR" reset --hard origin/main
fi

ui ""
ui "  ✓ Código Z-Hub listo"
ui "  ⟳ Preparando conexión segura con Web-Licence..."
# Se usa source para que las variables ZHUB_LICENSE_SERVER_* queden exportadas
# al instalador principal. El bootstrap solo instala material PUBLICO de confianza.
source "$ROOT_DIR/deploy/license_bootstrap.sh"
ui "  ⟳ Iniciando instalador principal..."
ui "  • La instalación continúa; el progreso se mostrará por etapas."

# Ejecutar el instalador principal en primer plano es intencional: deploy/install.sh
# mantiene el descriptor 3 conectado a la terminal y muestra su propia interfaz
# visual. Así no se pierde ninguna etapa ni el resumen final de instalación.
bash "$ROOT_DIR/deploy/install.sh" "$@"
