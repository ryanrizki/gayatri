# 01 — Finish create-admin runner

**Status:** ready-for-agent

## Context

`packages/db/prisma/create-admin.ts` ready (scrypt `salt:hash`, matches `auth.service`). Wired: `pnpm db:create-admin`. Shell wrapper added: `scripts/db-create-admin.sh` (passes `--email/--password/--name/--role`, or env, or interactive).

## Remaining

- Add README row under "Database" scripts table:
  `| ./scripts/db-create-admin.sh [--email .. --password .. --name .. --role OWNER\|ADMIN\|STAFF] | Create/update an admin user |`
- Optional: mention in scripts/README.md table.

## Done when

README documents the command; running `./scripts/db-create-admin.sh --email t@t.com --password test123 --role ADMIN` upserts and login works.
