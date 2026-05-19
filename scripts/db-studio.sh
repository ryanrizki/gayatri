#!/usr/bin/env bash
# Open Prisma Studio in browser.
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./_lib.sh
. "$DIR/_lib.sh"
load_env

log "Launching Prisma Studio"
exec $PNPM run db:studio
