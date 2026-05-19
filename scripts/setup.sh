#!/usr/bin/env bash
# One-shot setup: install deps, copy .env, generate Prisma client.
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./_lib.sh
. "$DIR/_lib.sh"

if [ ! -f .env ]; then
  log "Creating .env from .env.example"
  cp .env.example .env
  warn "Edit .env and set ADMIN_SESSION_SECRET / JWT_SECRET to long random strings."
fi

log "Installing dependencies"
$PNPM install

log "Generating Prisma client"
$PNPM --filter @gayatri/db prisma generate

log "Setup complete. Next: ./scripts/db-migrate.sh && ./scripts/db-seed.sh && ./scripts/dev.sh"
