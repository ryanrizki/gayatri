# Deployment Guide

**Stack:** Supabase (Postgres) · Railway (API) · Vercel (Web + Admin)

---

## 1. Supabase — Database

1. Go to [supabase.com](https://supabase.com) → New project.
2. **Settings → Database → Connection string → URI** — copy it.
   Looks like: `postgresql://postgres.xxxx:password@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres`
3. Save as `DATABASE_URL` for Railway.
4. After Railway deploy, run migrations once:
   ```sh
   DATABASE_URL="<your-supabase-url>" ./scripts/db-deploy.sh
   DATABASE_URL="<your-supabase-url>" ./scripts/db-seed.sh
   ```

---

## 2. Railway — API

### First time

1. [railway.app](https://railway.app) → New Project → Deploy from GitHub repo.
2. Select root of this repo.
3. Railway detects `apps/api/Dockerfile` via `apps/api/railway.toml`.

### Environment variables (Railway → Variables tab)

| Key | Value |
|-----|-------|
| `DATABASE_URL` | Supabase connection string |
| `API_PORT` | `4010` (or Railway sets `PORT` automatically — see note) |
| `ADMIN_SESSION_SECRET` | 96-char hex (`./scripts/secret.sh`) |
| `JWT_SECRET` | 96-char hex (different value) |
| `INTERNAL_SECRET` | any strong random string |
| `CORS_ORIGINS` | `https://web.yourdomain.com,https://admin.yourdomain.com` |
| `APP_URL_WEB` | `https://web.yourdomain.com` |
| `APP_URL_ADMIN` | `https://admin.yourdomain.com` |
| `WA_PROVIDER` | `internal` |
| `ADMIN_WA_NUMBER` | `62xxxxxxxxxx` |
| `TZ` | `Asia/Jakarta` |
| `NODE_ENV` | `production` |

> **PORT note:** Railway injects `PORT` automatically. Update `main.ts` to use
> `process.env.PORT ?? process.env.API_PORT ?? 4010` — see step below.

### Persistent volume for WA session

1. Railway → your API service → **Volumes** → Add Volume.
2. Mount path: `/app/.wa-session-api`
3. This preserves the Baileys session across redeploys.

### After deploy

- Open `https://<railway-url>/v1/health` — should return `{"ok":true,...}`.
- Open admin → `/wa/connect` → scan QR to pair WhatsApp.

---

## 3. Vercel — Web (customer FE)

1. [vercel.com](https://vercel.com) → New Project → Import GitHub repo.
2. **Root Directory:** `apps/web`
3. Vercel reads `apps/web/vercel.json` for build commands automatically.

### Environment variables

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://<railway-url>` |
| `TZ` | `Asia/Jakarta` |
| `NODE_ENV` | `production` |

---

## 4. Vercel — Admin FE

1. New Project → same repo → **Root Directory:** `apps/admin`
2. Vercel reads `apps/admin/vercel.json`.

### Environment variables

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://<railway-url>` |
| `ADMIN_SESSION_SECRET` | same as Railway |
| `JWT_SECRET` | same as Railway |
| `TZ` | `Asia/Jakarta` |
| `NODE_ENV` | `production` |

---

## 5. Create first admin user (production)

```sh
DATABASE_URL="<supabase-url>" ./scripts/create-admin.sh \
  --email owner@yourdomain.com \
  --password <strong-password> \
  --name "Owner" \
  --role OWNER
```

---

## Quick checklist

- [ ] Supabase project created, `DATABASE_URL` copied
- [ ] `ADMIN_SESSION_SECRET` + `JWT_SECRET` generated (two different secrets)
- [ ] Railway service deployed, health endpoint returns `ok`
- [ ] Volume mounted at `/app/.wa-session-api`
- [ ] `CORS_ORIGINS` includes both Vercel URLs
- [ ] Web app deployed on Vercel, `NEXT_PUBLIC_API_URL` set
- [ ] Admin app deployed on Vercel, session secrets set
- [ ] Migrations + seed run on Supabase DB
- [ ] First admin user created
- [ ] WA paired from `/wa/connect`
