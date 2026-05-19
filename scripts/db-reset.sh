#!/usr/bin/env bash
# DESTRUCTIVE: drop schema, re-run migrations, re-seed.
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./_lib.sh
. "$DIR/_lib.sh"
load_env

warn "This will DROP and RECREATE the database. All data lost."
read -r -p "Type 'reset' to continue: " ans
if [ "$ans" != "reset" ]; then
  err "Aborted."
  exit 1
fi

log "Running prisma migrate reset (force)"
exec $PNPM --filter @gayatri/db prisma migrate reset --force
