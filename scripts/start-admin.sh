#!/usr/bin/env bash
# Run built admin in production mode.
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./_lib.sh
. "$DIR/_lib.sh"
load_env

export NODE_ENV=production
log "Starting admin (production) on :${ADMIN_PORT:-3001}"
exec $PNPM --filter @gayatri/admin start
