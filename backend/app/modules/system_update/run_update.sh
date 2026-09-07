#!/usr/bin/env bash
# Archivo: backend/app/modules/system_update/run_update.sh
# Actualización: 2026-09-07 — informa etapas de progreso sin revelar salida técnica.
# Función: instala origin/main de forma transaccional y restaura la versión anterior si falla.
# Recibe: ejecución iniciada por system_update/router.py dentro de /var/www/mikrohub.
# Entrega: marcas PROGRESS en /tmp/mikrohub-update.log, leídas por el endpoint de estado.
set -euo pipefail
ROOT="${MIKROHUB_ROOT:-/var/www/mikrohub}"
BACKUP_FILE="$ROOT/.mikrohub-update-backup"
LOG="/tmp/mikrohub-update.log"
cd "$ROOT"

: > "$LOG"
echo "PROGRESS:5:Preparando la actualización" >> "$LOG"
PREVIOUS="$(git rev-parse HEAD)"
printf '%s\n' "$PREVIOUS" > "$BACKUP_FILE"
echo "PROGRESS:20:Descargando la nueva versión" >> "$LOG"

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

echo "FAILED: se restaurará la versión anterior." >> "$LOG"
echo "PROGRESS:85:Restaurando la versión anterior" >> "$LOG"
git reset --hard "$PREVIOUS" >> "$LOG" 2>&1
if bash setup_debian.sh >> "$LOG" 2>&1; then
  echo "ROLLED_BACK: versión anterior restaurada." >> "$LOG"
else
  echo "ROLLBACK_FAILED: requiere revisión por consola." >> "$LOG"
fi
exit 1
