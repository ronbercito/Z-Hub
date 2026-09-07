#!/usr/bin/env bash
# Actualizador transaccional de MikroHub: rollback automático ante fallos.
set -euo pipefail
ROOT="/var/www/mikrohub"
BACKUP_FILE="$ROOT/.mikrohub-update-backup"
LOG="/tmp/mikrohub-update.log"
cd "$ROOT"

PREVIOUS="$(git rev-parse HEAD)"
printf '%s\n' "$PREVIOUS" > "$BACKUP_FILE"
echo "Respaldo de código creado: $PREVIOUS" >> "$LOG"

if git fetch origin main && git reset --hard origin/main && bash setup_debian.sh; then
  rm -f "$BACKUP_FILE"
  echo "SUCCESS: actualización instalada correctamente." >> "$LOG"
  exit 0
fi

echo "FAILED: se restaurará la versión anterior." >> "$LOG"
git reset --hard "$PREVIOUS" >> "$LOG" 2>&1
if bash setup_debian.sh >> "$LOG" 2>&1; then
  echo "ROLLED_BACK: versión anterior restaurada." >> "$LOG"
else
  echo "ROLLBACK_FAILED: requiere revisión por consola." >> "$LOG"
fi
exit 1
