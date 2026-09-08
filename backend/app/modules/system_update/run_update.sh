#!/usr/bin/env bash
# Archivo: backend/app/modules/system_update/run_update.sh
# Actualización: 2026-09-08 — corrige rollback real y conserva el detalle del fallo de instalación.
# Función: instala origin/main de forma transaccional y restaura la versión anterior si falla.
# Recibe: ejecución iniciada por system_update/router.py dentro de /var/www/mikrohub.
# Entrega: marcas PROGRESS en /tmp/mikrohub-update.log y detalle en /tmp/mikrohub-update-error.log.
set -euo pipefail
ROOT="${MIKROHUB_ROOT:-/var/www/mikrohub}"
REPOSITORY_URL="${MIKROHUB_REPOSITORY:-https://github.com/ronbercito/mirkohub.git}"
BACKUP_FILE="$ROOT/.mikrohub-update-backup"
LOG="/tmp/mikrohub-update.log"
ERROR_LOG="/tmp/mikrohub-update-error.log"
cd "$ROOT"

: > "$LOG"
: > "$ERROR_LOG"
echo "PROGRESS:5:Preparando la actualización" >> "$LOG"
PREVIOUS="$(git rev-parse HEAD)"
printf '%s\n' "$PREVIOUS" > "$BACKUP_FILE"
echo "PROGRESS:20:Descargando la nueva versión" >> "$LOG"
git remote set-url origin "$REPOSITORY_URL"

if git fetch origin main >> "$LOG" 2>&1; then
  echo "PROGRESS:45:Aplicando archivos nuevos" >> "$LOG"
  if git reset --hard origin/main >> "$LOG" 2>&1; then
    echo "PROGRESS:70:Instalando componentes del panel" >> "$LOG"
    if bash setup_debian.sh >> "$LOG" 2>&1; then
      echo "PROGRESS:100:Actualización terminada" >> "$LOG"
      rm -f "$BACKUP_FILE"
      echo "SUCCESS: actualización instalada correctamente." >> "$LOG"
      exit 0
    fi
  fi
fi

# Conserva las últimas líneas para que el centro de actualizaciones pueda mostrar
# el motivo real del fallo sin exponer secretos del servidor.
tail -n 40 "$LOG" > "$ERROR_LOG" || true
echo "FAILED: se restaurará la versión anterior." >> "$LOG"
echo "PROGRESS:85:Restaurando la versión anterior" >> "$LOG"
if git reset --hard "$PREVIOUS" >> "$LOG" 2>&1; then
  # IMPORTANTE: setup_debian.sh normalmente sincroniza origin/main; en rollback
  # debe instalar exactamente el commit PREVIOUS restaurado.
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
