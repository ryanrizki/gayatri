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
| `create-admin.sh` | Create or reset an `AdminUser` against the **local dev** DB. Args `--email --password --name --role`, or interactive prompts. |
| `prod-create-admin.sh` | Same, but runs inside the **VPS production** API container (`docker compose exec api …`). Use this to replace the seeded password after deploy. |
| `db-studio.sh` | Open Prisma Studio in browser |
| `db-reset.sh` | DESTRUCTIVE — drop + recreate + reseed (prompts for confirmation) |
| `clean.sh` | Remove `.next`, `dist`, `.turbo`, `*.tsbuildinfo` |
| `wa-openwa-bridge.mjs` | **Local WhatsApp bridge** (Baileys). Speaks the OpenWA REST contract on `:9099` (`POST /api/messages/send`). First run prints QR — scan via WhatsApp → Linked Devices. Session cached in `.wa-session/`. Required when `WA_PROVIDER=openwa`. Run: `node scripts/wa-openwa-bridge.mjs` |
| `wa-stub.mjs` | Fake WA receiver on `:9099` (logs to `/tmp/wa-stub.log`, nothing real sent). Same contract as the bridge — point `OPENWA_URL` at it for tests. Run: `node scripts/wa-stub.mjs` |

## Typical first run

```sh
./scripts/setup.sh
./scripts/secret.sh   # paste into .env twice
./scripts/db-migrate.sh init
./scripts/db-seed.sh
./scripts/dev.sh
```

## WhatsApp setup

API's `InternalCron` (every 30s) drains `WaLog` and calls the WA gateway.
For sends to actually leave the box you need one of:

### Recommended: in-process session, paired from admin UI

1. `WA_PROVIDER=internal` in `.env`.
2. Start the app stack as usual (`./scripts/dev.sh`).
3. Open admin → **WA Connect** (`/wa/connect`) → click **Hubungkan WhatsApp**.
4. Scan the QR with WhatsApp → Linked Devices.
5. Status flips to **Terhubung** — pending `WaLog` rows drain within ~30s.

Session cached in `.wa-session-api/` (gitignored). API restart resumes
automatically.

### Alternative: standalone bridge or stub

For when you want the WA session outside the API process (or no real send):

```sh
# Real free WhatsApp via a separate process (scan QR in terminal):
node scripts/wa-openwa-bridge.mjs

# OR fake receiver — for testing the pipeline without a real device:
node scripts/wa-stub.mjs
```

Both listen on `:9099` matching `OPENWA_URL` in `.env`. Set `WA_PROVIDER=openwa`.

### Manual one-shot drain (no cron needed)

```sh
curl -X POST http://localhost:4010/v1/internal/tick \
  -H "Authorization: Bearer ${INTERNAL_SECRET}"
```

Disable the in-process cron (e.g. to use cron-job.org instead) with `INTERNAL_CRON_ENABLED=false`.
