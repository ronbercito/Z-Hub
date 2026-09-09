#!/bin/bash
# ==============================================================================
# Archivo: install.sh (raíz del proyecto Z-Hub)
# Función: sincroniza Z-Hub con origin/main y ejecuta el instalador real.
#          Durante un rollback, ZHUB_SKIP_GIT_SYNC=1 conserva el commit restaurado.
#          Los archivos locales no versionados (por ejemplo backend/.env) se conservan.
# ==============================================================================
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [[ "${ZHUB_SKIP_GIT_SYNC:-0}" != "1" ]] && git -C "$ROOT_DIR" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "🔄 Sincronizando Z-Hub con GitHub (origin/main)..."
  git -C "$ROOT_DIR" fetch origin main
  git -C "$ROOT_DIR" checkout main 2>/dev/null || true
  git -C "$ROOT_DIR" reset --hard origin/main
  echo "✅ Código Z-Hub actualizado desde origin/main"
else
  if [[ "${ZHUB_SKIP_GIT_SYNC:-0}" == "1" ]]; then
    echo "↩️ Rollback: se conserva el commit restaurado y no se sincroniza origin/main."
  else
    echo "⚠️ No se detectó un checkout Git; se ejecutará el instalador local."
  fi
fi

exec bash "$ROOT_DIR/deploy/install.sh" "$@"
