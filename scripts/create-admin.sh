#!/usr/bin/env bash
# Create or update a superadmin (OWNER) / admin user.
#
# Usage:
#   ./scripts/create-admin.sh --email boss@gayatri.local --password 'S3cret!' --name 'Boss'
#   ./scripts/create-admin.sh --email staff@gayatri.local --password pw --role STAFF
#   ./scripts/create-admin.sh            # interactive prompts
#
# Defaults: role=OWNER (superadmin), name="Super Admin".
# Re-running with an existing email resets that user's password/name/role.
set -euo pipefail
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./_lib.sh
. "$DIR/_lib.sh"
load_env

log "Creating admin user"
exec $PNPM run db:create-admin -- "$@"
