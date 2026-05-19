#!/usr/bin/env bash
# Common helpers sourced by other scripts.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# Resolve pnpm. Prefer global; fallback to a shim that wraps `corepack pnpm`.
# Turbo and other tools shell out to a literal `pnpm` binary, so a function or
# alias is not enough — we put a real script on PATH.
if command -v pnpm >/dev/null 2>&1; then
  PNPM="pnpm"
elif command -v corepack >/dev/null 2>&1; then
  export PATH="$ROOT_DIR/scripts/.bin:$PATH"
  PNPM="pnpm"
else
  echo "[!] pnpm not found. Install pnpm or enable corepack." >&2
  exit 127
fi

log() { printf "\033[1;32m[gayatri]\033[0m %s\n" "$*"; }
warn() { printf "\033[1;33m[gayatri]\033[0m %s\n" "$*" >&2; }
err() { printf "\033[1;31m[gayatri]\033[0m %s\n" "$*" >&2; }

load_env() {
  if [ -f "$ROOT_DIR/.env" ]; then
    set -a
    # shellcheck disable=SC1091
    . "$ROOT_DIR/.env"
    set +a
  else
    warn ".env not found. Copy .env.example to .env first."
  fi
}
