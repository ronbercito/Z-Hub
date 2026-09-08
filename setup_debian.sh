#!/bin/bash
# ==============================================================================
# Archivo: setup_debian.sh (raíz del proyecto)
# Actualización: 2026-09-08 — permite ejecutar el instalador sin resincronizar Git durante rollback.
# Función: actualiza el checkout desde origin/main y ejecuta el instalador real.
#          Durante un rollback, MIKROHUB_SKIP_GIT_SYNC=1 conserva exactamente el commit restaurado.
#          Los archivos locales no versionados (por ejemplo backend/.env) se conservan.
# Trabaja con: deploy/setup_debian.sh
# ==============================================================================
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ "${MIKROHUB_SKIP_GIT_SYNC:-0}" != "1" ]] && git -C "$ROOT_DIR" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "🔄 Sincronizando MikroHub con GitHub (origin/main)..."
  git -C "$ROOT_DIR" fetch origin main
  git -C "$ROOT_DIR" checkout main 2>/dev/null || true
  git -C "$ROOT_DIR" reset --hard origin/main
  echo "✅ Código actualizado desde origin/main"
else
  if [[ "${MIKROHUB_SKIP_GIT_SYNC:-0}" == "1" ]]; then
    echo "↩️ Rollback: se conserva el commit restaurado y no se sincroniza origin/main."
  else
    echo "⚠️  No se detectó un checkout Git; se ejecutará el instalador local."
  fi
fi

exec bash "$ROOT_DIR/deploy/setup_debian.sh" "$@"
