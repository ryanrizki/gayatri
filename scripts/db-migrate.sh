#!/usr/bin/env bash
# Apply Prisma migrations. Pass a name for new migrations:
#   ./scripts/db-migrate.sh init
#   ./scripts/db-migrate.sh add_some_field
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./_lib.sh
. "$DIR/_lib.sh"
load_env

NAME="${1:-}"
if [ -n "$NAME" ]; then
  log "Running prisma migrate dev --name $NAME"
  exec $PNPM --filter @gayatri/db prisma migrate dev --name "$NAME"
else
  log "Running prisma migrate dev"
  exec $PNPM --filter @gayatri/db prisma migrate dev
fi
