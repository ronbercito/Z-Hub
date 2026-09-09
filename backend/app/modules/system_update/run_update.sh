#!/usr/bin/env bash
# Archivo: backend/app/modules/system_update/run_update.sh
# Función: instala una nueva versión de Z-Hub de forma transaccional y restaura la anterior si falla.
# Recibe: ZHUB_UPDATE_REPOSITORY / ZHUB_UPDATE_SOURCE desde system_update/router.py.
# Entrega: progreso, fuente usada, paso exacto del fallo y detalle del instalador.
set -euo pipefail
ROOT="${ZHUB_ROOT:-/var/www/z-hub}"
PRIMARY_REPOSITORY="${ZHUB_REPOSITORY:-https://github.com/ronbercito/Z-Hub.git}"
REPOSITORY_URL="${ZHUB_UPDATE_REPOSITORY:-$PRIMARY_REPOSITORY}"
UPDATE_SOURCE="${ZHUB_UPDATE_SOURCE:-zhub}"
BACKUP_FILE="$ROOT/.zhub-update-backup"
LOG="/tmp/z-hub-update.log"
ERROR_LOG="/tmp/z-hub-update-error.log"
cd "$ROOT"

: > "$LOG"
: > "$ERROR_LOG"
STEP="Preparando la actualización"
trap 'rc=$?; echo "ERROR en paso: $STEP" >> "$LOG"; echo "Comando: $BASH_COMMAND" >> "$LOG"; echo "Código: $rc" >> "$LOG"; tail -n 80 "$LOG" > "$ERROR_LOG" || true; exit $rc' ERR

echo "PROGRESS:5:Preparando la actualización de Z-Hub" >> "$LOG"
echo "SOURCE:$UPDATE_SOURCE:$REPOSITORY_URL" >> "$LOG"
PREVIOUS="$(git rev-parse HEAD)"
printf '%s\n' "$PREVIOUS" > "$BACKUP_FILE"

STEP="Descargando la nueva versión"
echo "PROGRESS:20:Descargando la nueva versión desde $UPDATE_SOURCE" >> "$LOG"
git remote set-url origin "$REPOSITORY_URL"
if git fetch --force origin main >> "$LOG" 2>&1; then
  STEP="Aplicando archivos nuevos"
  echo "PROGRESS:45:Aplicando archivos nuevos" >> "$LOG"
  if git reset --hard origin/main >> "$LOG" 2>&1; then
    STEP="Instalando componentes del panel"
    echo "PROGRESS:70:Instalando componentes del panel" >> "$LOG"
    if bash install.sh >> "$LOG" 2>&1; then
      trap - ERR
      echo "PROGRESS:100:Actualización terminada" >> "$LOG"
      rm -f "$BACKUP_FILE"
      echo "SUCCESS: actualización Z-Hub instalada correctamente desde $UPDATE_SOURCE." >> "$LOG"
      exit 0
    fi
  fi
fi

tail -n 80 "$LOG" > "$ERROR_LOG" || true
echo "FAILED: se restaurará la versión anterior." >> "$LOG"
echo "PROGRESS:85:Restaurando la versión anterior" >> "$LOG"
if git reset --hard "$PREVIOUS" >> "$LOG" 2>&1; then
  STEP="Restaurando la versión anterior"
  if ZHUB_SKIP_GIT_SYNC=1 bash install.sh >> "$LOG" 2>&1; then
    echo "ROLLED_BACK: versión anterior restaurada." >> "$LOG"
    rm -f "$BACKUP_FILE"
  else
    echo "ROLLBACK_FAILED: requiere revisión por consola." >> "$LOG"
  fi
else
  echo "ROLLBACK_FAILED: no se pudo restaurar el commit anterior." >> "$LOG"
fi
exit 1
