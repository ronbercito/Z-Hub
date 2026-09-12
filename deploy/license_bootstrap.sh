#!/bin/bash
# Z-Hub 1.3.3 — bootstrap seguro para Web-Licence en instalaciones limpias.
# Solo instala material PUBLICO de confianza y exporta la configuración remota.
set -Eeuo pipefail

BOOTSTRAP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TRUST_DIR="$BOOTSTRAP_DIR/trust"
LICENSE_DIR="/etc/zhub/licencia"
SYSTEM_CA_TARGET="/usr/local/share/ca-certificates/zhub-lab-ca.crt"
PUBLIC_KEY_TARGET="$LICENSE_DIR/server-public.pem"
DEFAULT_LICENSE_SERVER_URL="https://192.168.10.240"

mkdir -p "$LICENSE_DIR"

if [ ! -f "$TRUST_DIR/server-public.pem" ]; then
  echo "Falta la clave publica RS256 incluida con Z-Hub: $TRUST_DIR/server-public.pem" >&2
  exit 1
fi
if [ ! -f "$TRUST_DIR/zhub-lab-ca.crt" ]; then
  echo "Falta la CA publica TLS incluida con Z-Hub: $TRUST_DIR/zhub-lab-ca.crt" >&2
  exit 1
fi

install -m 0644 "$TRUST_DIR/server-public.pem" "$PUBLIC_KEY_TARGET"
install -m 0644 "$TRUST_DIR/zhub-lab-ca.crt" "$SYSTEM_CA_TARGET"
update-ca-certificates >/dev/null

export ZHUB_LICENSE_SERVER_URL="${ZHUB_LICENSE_SERVER_URL:-$DEFAULT_LICENSE_SERVER_URL}"
export ZHUB_LICENSE_SERVER_PUBLIC_KEY_FILE="${ZHUB_LICENSE_SERVER_PUBLIC_KEY_FILE:-$PUBLIC_KEY_TARGET}"

echo "  ✓ Confianza publica de Web-Licence instalada"
echo "  ✓ License Server preparado para activacion automatica"
