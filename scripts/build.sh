#!/usr/bin/env bash
# Build all packages and apps for production.
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./_lib.sh
. "$DIR/_lib.sh"

log "Building all"
exec $PNPM run build
