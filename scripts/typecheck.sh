#!/usr/bin/env bash
# Typecheck all workspaces.
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./_lib.sh
. "$DIR/_lib.sh"

log "Typechecking all"
exec $PNPM run typecheck
