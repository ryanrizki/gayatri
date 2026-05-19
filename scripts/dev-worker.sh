#!/usr/bin/env bash
# Run only WA worker.
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./_lib.sh
. "$DIR/_lib.sh"
load_env

log "Starting worker"
exec $PNPM --filter @gayatri/worker dev
