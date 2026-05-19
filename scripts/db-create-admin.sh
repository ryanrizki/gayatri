#!/usr/bin/env bash
# Create or update an admin user. Interactive, or pass flags/env.
#   ./scripts/db-create-admin.sh
#   ./scripts/db-create-admin.sh --email a@b.com --password secret --name "Owner" --role OWNER
#   ADMIN_EMAIL=a@b.com ADMIN_PASSWORD=secret ./scripts/db-create-admin.sh
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./_lib.sh
. "$DIR/_lib.sh"
load_env

log "Creating/updating admin user"
exec $PNPM run db:create-admin -- "$@"
