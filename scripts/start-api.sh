#!/usr/bin/env bash
# Run built API in production mode. Requires `./scripts/build.sh` first.
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./_lib.sh
. "$DIR/_lib.sh"
load_env

export NODE_ENV=production
log "Starting API (production) on :${API_PORT:-4000}"
exec $PNPM --filter @gayatri/api start
