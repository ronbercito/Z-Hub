#!/usr/bin/env bash
set -euo pipefail
cd /var/www/mikrohub
git fetch origin main
git reset --hard origin/main
bash setup_debian.sh
