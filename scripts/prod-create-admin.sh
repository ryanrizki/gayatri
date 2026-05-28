#!/usr/bin/env bash
# Create or reset an admin user inside the production API container.
# Run on the VPS, from the repo root (e.g. ~/gayatri).
#
# Usage:
#   ./scripts/prod-create-admin.sh --email owner@example.com --password 'S3cret!' --name 'Owner' --role OWNER
#   ./scripts/prod-create-admin.sh                 # interactive prompts
#   ADMIN_EMAIL=a@b.com ADMIN_PASSWORD=x ./scripts/prod-create-admin.sh
#
# Re-running with an existing email resets that user's password/name/role.
# Role defaults to OWNER; valid values match the AdminRole enum in schema.prisma.
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$DIR/.." && pwd)"
cd "$ROOT_DIR"

COMPOSE_FILE="${COMPOSE_FILE:-deploy/docker-compose.prod.yml}"
ENV_FILE="${ENV_FILE:-deploy/.env.production}"

if [ ! -f "$COMPOSE_FILE" ]; then
  echo "[!] compose file not found: $COMPOSE_FILE" >&2
  exit 1
fi
if [ ! -f "$ENV_FILE" ]; then
  echo "[!] env file not found: $ENV_FILE — copy from deploy/.env.production.example first" >&2
  exit 1
fi

# Forward ADMIN_* env vars to the container so the TS script can read them
# (in addition to any --flag args the user passed).
ENV_ARGS=()
for v in ADMIN_EMAIL ADMIN_PASSWORD ADMIN_NAME ADMIN_ROLE; do
  if [ -n "${!v:-}" ]; then
    ENV_ARGS+=(-e "$v=${!v}")
  fi
done

exec docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec \
  "${ENV_ARGS[@]}" api \
  packages/db/node_modules/.bin/tsx packages/db/prisma/create-admin.ts "$@"
