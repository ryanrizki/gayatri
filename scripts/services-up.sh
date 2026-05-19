#!/usr/bin/env bash
# Start Postgres + Redis via docker-compose. Idempotent.
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./_lib.sh
. "$DIR/_lib.sh"

if command -v docker >/dev/null 2>&1; then
  COMPOSE=(docker compose)
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE=(docker-compose)
else
  err "docker not found"
  exit 127
fi

log "Starting Postgres :5434"
"${COMPOSE[@]}" up -d
log "Services ready"
