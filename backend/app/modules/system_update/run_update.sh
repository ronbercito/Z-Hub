#!/usr/bin/env bash
# Archivo: backend/app/modules/system_update/run_update.sh
# Actualización: 2026-09-09 — versión 1.1.12: instala desde Z-Hub o MikroHub según selección del backend.
# Función: instala main del repositorio elegido de forma transaccional y restaura la versión anterior si falla.
# Recibe: MIKROHUB_UPDATE_REPOSITORY / MIKROHUB_UPDATE_SOURCE desde system_update/router.py.
# Entrega: progreso, fuente usada, paso exacto del fallo y detalle de las últimas líneas del instalador.
set -euo pipefail
ROOT="${MIKROHUB_ROOT:-/var/www/mikrohub}"
PRIMARY_REPOSITORY="${ZHUB_REPOSITORY:-https://github.com/ronbercito/Z-Hub.git}"
LEGACY_REPOSITORY="${MIKROHUB_LEGACY_REPOSITORY:-${MIKROHUB_REPOSITORY:-https://github.com/ronbercito/mirkohub.git}}"
REPOSITORY_URL="${MIKROHUB_UPDATE_REPOSITORY:-$PRIMARY_REPOSITORY}"
UPDATE_SOURCE="${MIKROHUB_UPDATE_SOURCE:-zhub}"
BACKUP_FILE="$ROOT/.mikrohub-update-backup"
LOG="/tmp/mikrohub-update.log"
ERROR_LOG="/tmp/mikrohub-update-error.log"
cd "$ROOT"

: > "$LOG"
: > "$ERROR_LOG"
STEP="Preparando la actualización"
trap 'rc=$?; echo "ERROR en paso: $STEP" >> "$LOG"; echo "Comando: $BASH_COMMAND" >> "$LOG"; echo "Código: $rc" >> "$LOG"; tail -n 80 "$LOG" > "$ERROR_LOG" || true; exit $rc' ERR

echo "PROGRESS:5:Preparando la actualización" >> "$LOG"
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
    if bash setup_debian.sh >> "$LOG" 2>&1; then
      trap - ERR
      echo "PROGRESS:100:Actualización terminada" >> "$LOG"
      rm -f "$BACKUP_FILE"
      echo "SUCCESS: actualización instalada correctamente desde $UPDATE_SOURCE." >> "$LOG"
      exit 0
    fi
  fi
fi

# Conserva suficientes líneas para mostrar el motivo real del fallo sin exponer secretos.
tail -n 80 "$LOG" > "$ERROR_LOG" || true
echo "FAILED: se restaurará la versión anterior." >> "$LOG"
echo "PROGRESS:85:Restaurando la versión anterior" >> "$LOG"
if git reset --hard "$PREVIOUS" >> "$LOG" 2>&1; then
  STEP="Restaurando la versión anterior"
  # IMPORTANTE: durante rollback no se debe resincronizar origin/main.
  if MIKROHUB_SKIP_GIT_SYNC=1 bash setup_debian.sh >> "$LOG" 2>&1; then
    echo "ROLLED_BACK: versión anterior restaurada." >> "$LOG"
    rm -f "$BACKUP_FILE"
  else
    echo "ROLLBACK_FAILED: requiere revisión por consola." >> "$LOG"
  fi
else
  echo "ROLLBACK_FAILED: no se pudo restaurar el commit anterior." >> "$LOG"
fi
exit 1
