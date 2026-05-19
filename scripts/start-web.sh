#!/usr/bin/env bash
# Run built web in production mode.
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./_lib.sh
. "$DIR/_lib.sh"
load_env

export NODE_ENV=production
log "Starting web (production) on :${WEB_PORT:-3000}"
exec $PNPM --filter @gayatri/web start
