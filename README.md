# Gayatri

Baby spa booking + commerce platform with WhatsApp-native notifications.

## Apps

- `apps/web` — customer frontend (Next.js)
- `apps/admin` — admin dashboard (Next.js)
- `apps/api` — REST API (NestJS)
- `apps/worker` — cron + WA queue consumer (Node)

## Packages

- `packages/db` — Prisma schema + client
- `packages/ui` — shared shadcn components
- `packages/wa` — WhatsApp gateway abstraction
- `packages/types` — shared DTO + Zod schemas
- `packages/config` — shared ESLint/TS/Tailwind

## Docs

- [PRD](./docs/PRD.md)
- [Tech Plan](./docs/TECH.md)
- [Flow](./docs/FLOW.md)
- [API Reference](./docs/API.md)
- [Design System & Stitch Workflow](./docs/DESIGN.md)

## Stack

Next.js · NestJS · Prisma · PostgreSQL · Redis · BullMQ · Midtrans · Fonnte/WA Business API

## Quick start

```sh
./scripts/setup.sh                  # copy .env, install deps, prisma generate
./scripts/secret.sh                 # generate a secret — paste into .env (JWT_SECRET + ADMIN_SESSION_SECRET)
./scripts/services-up.sh            # start Postgres :5434 and Redis :6380 (docker-compose)
./scripts/db-migrate.sh init        # first migration
./scripts/db-seed.sh                # seed admin user + sample catalog
./scripts/dev.sh                    # api :4010 · web :3000 · admin :3001 · worker
```

Default admin login is created by the seed script — check [packages/db/prisma/seed.ts](./packages/db/prisma/seed.ts) for credentials.

## Scripts

All scripts live in [scripts/](./scripts/) (see [scripts/README.md](./scripts/README.md) for the full table). Each loads `.env` and resolves `pnpm` (global → corepack fallback).

### Dev

| Script | What it does |
|---|---|
| `./scripts/dev.sh` | Run api + web + admin + worker in parallel (Turbo) |
| `./scripts/dev-api.sh` | API only (`:4000`) |
| `./scripts/dev-web.sh` | Customer web only (`:3000`) |
| `./scripts/dev-admin.sh` | Admin only (`:3001`) |
| `./scripts/dev-worker.sh` | WA worker only |

### Build & check

| Script | What it does |
|---|---|
| `./scripts/build.sh` | Build all packages + apps |
| `./scripts/typecheck.sh` | Run all `typecheck` tasks |
| `./scripts/lint.sh` | Run all `lint` tasks |
| `./scripts/clean.sh` | Remove `.next`, `dist`, `.turbo`, `*.tsbuildinfo` |

### Production start (after build)

| Script | What it does |
|---|---|
| `./scripts/start-api.sh` | API with `NODE_ENV=production` |
| `./scripts/start-web.sh` | Web with `NODE_ENV=production` |
| `./scripts/start-admin.sh` | Admin with `NODE_ENV=production` |

### Database

| Script | What it does |
|---|---|
| `./scripts/db-migrate.sh [name]` | `prisma migrate dev` — pass migration name when creating new |
| `./scripts/db-deploy.sh` | `prisma migrate deploy` — for CI / production |
| `./scripts/db-seed.sh` | Seed admin user + sample catalog |
| `./scripts/db-studio.sh` | Open Prisma Studio |
| `./scripts/db-reset.sh` | **Destructive** — drop + recreate + reseed (prompts for `reset`) |

### Secrets

| Script | What it does |
|---|---|
| `./scripts/secret.sh` | Print 96-char hex (openssl or node fallback) — use for `JWT_SECRET` / `ADMIN_SESSION_SECRET` |

## Status

Draft / pre-MVP.
