#!/usr/bin/env bash
# Seed database with initial admin user + sample catalog data.
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./_lib.sh
. "$DIR/_lib.sh"
load_env

log "Seeding database"
exec $PNPM run db:seed
