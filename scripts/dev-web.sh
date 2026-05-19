#!/usr/bin/env bash
# Run only customer web frontend.
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./_lib.sh
. "$DIR/_lib.sh"
load_env

log "Starting web on :${WEB_PORT:-3000}"
exec $PNPM --filter @gayatri/web dev
