#!/usr/bin/env bash
# Run only admin panel.
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./_lib.sh
. "$DIR/_lib.sh"
load_env

log "Starting admin on :${ADMIN_PORT:-3001}"
exec $PNPM --filter @gayatri/admin dev
