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

# Mantener la terminal limpia incluso durante el bootstrap de Git y la
# sincronización inicial. deploy/install.sh reutiliza este mismo log.
touch "$LOG_FILE" 2>/dev/null || true
chmod 600 "$LOG_FILE" 2>/dev/null || true
exec 3>&1 4>&2
exec 1>>"$LOG_FILE" 2>&1

if ! command -v git >/dev/null 2>&1; then
  export DEBIAN_FRONTEND=noninteractive
  if command -v apt-get >/dev/null 2>&1; then
    apt-get update
    apt-get install -y git
  else
    printf '%s\n' "No se encontró apt-get. Instale Git manualmente y vuelva a ejecutar." >&2
    exit 1
  fi
fi

git config --system --add safe.directory "$ROOT_DIR" 2>/dev/null || true

if [[ "${ZHUB_SKIP_GIT_SYNC:-0}" != "1" ]] && git -C "$ROOT_DIR" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git -C "$ROOT_DIR" fetch origin main
  git -C "$ROOT_DIR" checkout main 2>/dev/null || true
  git -C "$ROOT_DIR" reset --hard origin/main
fi

exec bash "$ROOT_DIR/deploy/install.sh" "$@"
