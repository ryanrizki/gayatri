# Deployment Guide

**Stack:** Supabase (Postgres) · Fly.io (API) · Vercel (Web + Admin)

> Railway is an alternative — see "Railway alternative" at the bottom.

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

## 2. Fly.io — API

### Install CLI + login

```sh
curl -L https://fly.io/install.sh | sh
export FLYCTL_INSTALL="$HOME/.fly"
export PATH="$FLYCTL_INSTALL/bin:$PATH"
fly auth login        # opens browser
```

### Launch (first time only)

From repo root:

```sh
fly launch --no-deploy --copy-config --name gayatri-api --region sin
```

- Says "found existing fly.toml" → answer **Yes** to use it.
- Skip Postgres prompt (we use Supabase).
- Skip Redis.
- Don't deploy yet — we need to set secrets first.

### Set secrets (env vars)

```sh
fly secrets set \
  DATABASE_URL="postgresql://postgres.xxx:PASS@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres" \
  ADMIN_SESSION_SECRET="$(openssl rand -hex 48)" \
  JWT_SECRET="$(openssl rand -hex 48)" \
  INTERNAL_SECRET="$(openssl rand -hex 32)" \
  ADMIN_WA_NUMBER="62xxxxxxxxxx" \
  CORS_ORIGINS="https://web.yourdomain.com,https://admin.yourdomain.com" \
  APP_URL_WEB="https://web.yourdomain.com" \
  APP_URL_ADMIN="https://admin.yourdomain.com"
```

(Non-secret vars `NODE_ENV`, `TZ`, `API_PORT`, `WA_PROVIDER`, `INTERNAL_CRON_ENABLED`
live in `fly.toml [env]` — already set.)

### Volume for WA session

`fly.toml` declares the mount, but the volume itself must exist first:

```sh
fly volumes create wa_session --region sin --size 1
```

### Deploy

```sh
fly deploy
```

Build runs Docker from repo root using `apps/api/Dockerfile`. First build ~3–5 min.

### After deploy

- `fly status` — should show 1 machine **passing** healthcheck
- `fly logs` — live tail
- `curl https://gayatri-api.fly.dev/v1/health` → `{"ok":true,...}`
- App URL: `https://gayatri-api.fly.dev` — use as `NEXT_PUBLIC_API_URL` on Vercel
- Open admin `/wa/connect` → scan QR

### Update later

Any `git push` + `fly deploy` redeploys. Volume + session survive.

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

---

## Railway alternative

`railway.toml` + `apps/api/Dockerfile` also work on Railway:

1. Empty Project → + Create → GitHub Repo → pick repo
2. Settings → Variables → paste same env vars as Fly section above
3. Settings → Volumes → mount `/app/.wa-session-api`
4. Deploy

Switch is purely platform — Dockerfile and entrypoint unchanged.
