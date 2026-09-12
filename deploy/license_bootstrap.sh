#!/bin/bash
# Z-Hub 1.3.3 — bootstrap seguro para Web-Licence en instalaciones limpias.
# Solo instala material PUBLICO de confianza y exporta la configuración remota.
set -Eeuo pipefail

BOOTSTRAP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LICENSE_SOURCE_DIR="$BOOTSTRAP_DIR/license"
BOOTSTRAP_ENV="$LICENSE_SOURCE_DIR/bootstrap.env"
LICENSE_DIR="/etc/zhub/licencia"
SYSTEM_CA_TARGET="/usr/local/share/ca-certificates/zhub-lab-ca.crt"

if [ ! -f "$BOOTSTRAP_ENV" ]; then
  echo "Falta configuración pública de Web-Licence: $BOOTSTRAP_ENV" >&2
  exit 1
fi
# shellcheck disable=SC1090
source "$BOOTSTRAP_ENV"

PUBLIC_KEY_TARGET="${ZHUB_LICENSE_SERVER_DEFAULT_PUBLIC_KEY_FILE:-/etc/zhub/licencia/server-public.pem}"
DEFAULT_LICENSE_SERVER_URL="${ZHUB_LICENSE_SERVER_DEFAULT_URL:-}"

if [ -z "$DEFAULT_LICENSE_SERVER_URL" ]; then
  echo "No hay endpoint público por defecto para Web-Licence" >&2
  exit 1
fi
if [ ! -f "$LICENSE_SOURCE_DIR/server-public.pem" ]; then
  echo "Falta la clave pública RS256 incluida con Z-Hub" >&2
  exit 1
fi
if [ ! -f "$LICENSE_SOURCE_DIR/zhub-lab-ca.crt" ]; then
  echo "Falta la CA pública TLS incluida con Z-Hub" >&2
  exit 1
fi

mkdir -p "$LICENSE_DIR"
install -m 0644 "$LICENSE_SOURCE_DIR/server-public.pem" "$PUBLIC_KEY_TARGET"
install -m 0644 "$LICENSE_SOURCE_DIR/zhub-lab-ca.crt" "$SYSTEM_CA_TARGET"
update-ca-certificates >/dev/null

export ZHUB_LICENSE_SERVER_URL="${ZHUB_LICENSE_SERVER_URL:-$DEFAULT_LICENSE_SERVER_URL}"
export ZHUB_LICENSE_SERVER_PUBLIC_KEY_FILE="${ZHUB_LICENSE_SERVER_PUBLIC_KEY_FILE:-$PUBLIC_KEY_TARGET}"

echo "  ✓ Confianza pública de Web-Licence instalada"
echo "  ✓ License Server preparado para activación automática"
