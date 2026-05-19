#!/usr/bin/env bash
# Run only API in dev (NestJS watch).
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./_lib.sh
. "$DIR/_lib.sh"
load_env

log "Starting API on :${API_PORT:-4000}"
exec $PNPM --filter @gayatri/api dev
