#!/usr/bin/env bash
# Generate a random secret suitable for ADMIN_SESSION_SECRET / JWT_SECRET.
set -euo pipefail
if command -v openssl >/dev/null 2>&1; then
  openssl rand -hex 48
else
  node -e "process.stdout.write(require('crypto').randomBytes(48).toString('hex'))"
  echo
fi
