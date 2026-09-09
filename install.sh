#!/bin/bash
# ==============================================================================
# Archivo: install.sh (raíz del proyecto Z-Hub)
# Función: prepara Git, sincroniza Z-Hub con origin/main y ejecuta el instalador real.
#          Durante un rollback, ZHUB_SKIP_GIT_SYNC=1 conserva el commit restaurado.
#          Los archivos locales no versionados (por ejemplo backend/.env) se conservan.
# ============================================================================
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Una instalación nueva puede no tener Git todavía. El instalador raíz se ocupa
# de dejarlo disponible antes de cualquier operación de sincronización.
if ! command -v git >/dev/null 2>&1; then
  echo "📦 Git no está instalado. Instalándolo..."
  export DEBIAN_FRONTEND=noninteractive
  if command -v apt-get >/dev/null 2>&1; then
    apt-get update
    apt-get install -y git
  else
    echo "❌ No se encontró apt-get. Instale Git manualmente y vuelva a ejecutar." >&2
    exit 1
  fi
fi

# El instalador deja el checkout bajo www-data, mientras que el backend de
# Supervisor puede ejecutar Git como root. Marcar el checkout como confiable
# evita el bloqueo de Git por "dubious ownership".
git config --system --add safe.directory "$ROOT_DIR" 2>/dev/null || true

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
