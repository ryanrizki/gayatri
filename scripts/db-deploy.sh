#!/usr/bin/env bash
# Apply migrations in production (no prompts).
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./_lib.sh
. "$DIR/_lib.sh"
load_env

log "Running prisma migrate deploy"
exec $PNPM --filter @gayatri/db prisma migrate deploy
