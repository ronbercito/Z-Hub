#!/usr/bin/env bash
set -euo pipefail
OUT_DIR="${1:-/etc/zhub-license-server}"
mkdir -p "$OUT_DIR"
umask 077
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:3072 -out "$OUT_DIR/private.pem"
openssl rsa -pubout -in "$OUT_DIR/private.pem" -out "$OUT_DIR/public.pem"
chmod 600 "$OUT_DIR/private.pem"
chmod 644 "$OUT_DIR/public.pem"
printf 'Claves creadas:\n  privada: %s/private.pem\n  publica: %s/public.pem\n' "$OUT_DIR" "$OUT_DIR"
