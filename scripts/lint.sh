#!/usr/bin/env bash
# Lint all workspaces.
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./_lib.sh
. "$DIR/_lib.sh"

log "Linting all"
exec $PNPM run lint
