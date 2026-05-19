# scripts

Convenience wrappers. All are idempotent and source `.env` from repo root.

| Script | Purpose |
|---|---|
| `setup.sh` | First-time: copy `.env`, install deps, generate Prisma client |
| `secret.sh` | Print 96-char hex — paste into `ADMIN_SESSION_SECRET` / `JWT_SECRET` |
| `dev.sh` | Run api + web + admin in parallel (Turbo) |
| `dev-api.sh` / `dev-web.sh` / `dev-admin.sh` | Run a single app |
| `build.sh` | Build all packages and apps |
| `typecheck.sh` / `lint.sh` | Run all `typecheck` / `lint` tasks |
| `start-api.sh` / `start-web.sh` / `start-admin.sh` | Run built apps with `NODE_ENV=production` |
| `db-migrate.sh [name]` | `prisma migrate dev` — pass migration name when creating new |
| `db-deploy.sh` | `prisma migrate deploy` — for production / CI |
| `db-seed.sh` | Run seed script (admin user + sample catalog) |
| `db-studio.sh` | Open Prisma Studio in browser |
| `db-reset.sh` | DESTRUCTIVE — drop + recreate + reseed (prompts for confirmation) |
| `clean.sh` | Remove `.next`, `dist`, `.turbo`, `*.tsbuildinfo` |

## Typical first run

```sh
./scripts/setup.sh
./scripts/secret.sh   # paste into .env twice
./scripts/db-migrate.sh init
./scripts/db-seed.sh
./scripts/dev.sh
```
