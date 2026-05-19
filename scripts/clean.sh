#!/usr/bin/env bash
# Wipe build artifacts and caches. Re-run setup after.
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./_lib.sh
. "$DIR/_lib.sh"

log "Removing .next, dist, .turbo, tsbuildinfo"
find . -type d \( -name ".next" -o -name "dist" -o -name ".turbo" \) -not -path "*/node_modules/*" -prune -exec rm -rf {} +
find . -type f -name "*.tsbuildinfo" -not -path "*/node_modules/*" -delete

log "Done. Run ./scripts/dev.sh to rebuild."
