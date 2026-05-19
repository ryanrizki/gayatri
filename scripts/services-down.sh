#!/usr/bin/env bash
# Stop Postgres + Redis (data persists in volumes).
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

log "Stopping services"
"${COMPOSE[@]}" down
