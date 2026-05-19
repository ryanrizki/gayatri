#!/usr/bin/env bash
# Run all apps in parallel via Turbo (api + web + admin).
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./_lib.sh
. "$DIR/_lib.sh"
load_env

log "Starting dev (api :${API_PORT:-4000}, web :${WEB_PORT:-3000}, admin :${ADMIN_PORT:-3001})"
exec $PNPM run dev
