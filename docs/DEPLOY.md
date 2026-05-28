# Deployment Guide

**Stack:**
- **VPS** (Sumopod 2 vCPU / 2 GB) — API + Postgres + Caddy (auto SSL)
- **Vercel** — web + admin (free tier)
- **Cloudflare** — DNS (free) — *only on the custom-domain path*

Total cost: Rp 60k/mo VPS + Rp 0 (Vercel + Cloudflare).

---

## Two paths

| Path | Domain for API | When to use |
|---|---|---|
| **A. sslip.io quick deploy** | `<dashed-vps-ip>.sslip.io` (e.g. `43-157-205-51.sslip.io`) | You don't have a custom domain yet but want real HTTPS now. Caddy still gets a Let's Encrypt cert. |
| **B. Custom domain** | `api.yourdomain.com` via Cloudflare | Production. |

The two paths only differ in §1 (DNS) and the value of `API_DOMAIN` / `CORS_ORIGINS` in §3. Everything else (VPS bootstrap, docker compose, Vercel projects, WA pairing) is identical.

Path A — what `API_DOMAIN` looks like:

```
# VPS public IP: 43.157.205.51
API_DOMAIN=43-157-205-51.sslip.io
```

`sslip.io` is wildcard DNS that resolves any `a-b-c-d.sslip.io` back to `a.b.c.d`. No registration, no records to add — point Caddy at it and Let's Encrypt issues normally.

---

## Prerequisites

- VPS root SSH credentials from Sumopod.
- Vercel account (free, sign in with GitHub).
- *Path B only:* a domain you own + a Cloudflare account.

---

## 1. DNS

### Path A — sslip.io (skip Cloudflare)

Nothing to configure. The API will be reachable at `https://<dash-separated-vps-ip>.sslip.io` once Caddy starts. Vercel will hand you a free `*.vercel.app` URL for each frontend in §5/§6.

### Path B — Cloudflare custom domain

1. Cloudflare → Add a site → enter `gayatri.example.com` (apex).
2. Pick **Free plan**.
3. Cloudflare gives you 2 nameservers (e.g. `xxx.ns.cloudflare.com`). Paste them into your domain registrar's DNS settings. Propagation: 5 min–24 h.
4. Cloudflare → DNS → Add records:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| A | `api` | `<VPS-IP>` | **DNS only** (grey cloud) |
| CNAME | `@` | `cname.vercel-dns.com` | DNS only |
| CNAME | `admin` | `cname.vercel-dns.com` | DNS only |

> **Why "DNS only" for `api`?** Caddy needs port 80 reachable to fetch Let's Encrypt cert. Cloudflare proxy (orange cloud) breaks this on first issue. After cert issued, you can flip to proxied if you want CF caching.

---

## 2. VPS — initial setup

SSH in (Sumopod images typically log you in as `ubuntu`; if you're handed `root`, the steps below still work):

```sh
ssh ubuntu@<VPS-IP>
```

### Install Docker

```sh
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# log out, log back in so the docker group takes effect
```

Verify: `docker --version` and `docker compose version`.

### (Recommended, but you can defer) Harden SSH + firewall

You can run the stack as the default `ubuntu` user without locking SSH down — that's fine for a first deploy. **Before sharing the VPS IP publicly**, do the steps below.

```sh
# Optional: create a dedicated deploy user instead of staying on `ubuntu`
sudo adduser deploy
sudo usermod -aG sudo,docker deploy
# (run on laptop:) ssh-copy-id deploy@<VPS-IP>

# Disable password login + root SSH
sudo sed -i 's/^#*PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sudo sed -i 's/^#*PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo systemctl restart ssh

# Firewall — only allow SSH, HTTP, HTTPS
sudo apt update && sudo apt install -y ufw
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable
```

---

## 3. Deploy the API

As whichever non-root user owns the deploy (`ubuntu` or `deploy`):

```sh
# Clone repo
cd ~
git clone https://github.com/ryanrizki/gayatri.git
cd gayatri

# Create production env file
cp deploy/.env.production.example deploy/.env.production
nano deploy/.env.production
```

### Fill `deploy/.env.production`

Generate secrets first:
```sh
openssl rand -hex 48        # ADMIN_SESSION_SECRET
openssl rand -hex 48        # JWT_SECRET (different value)
openssl rand -hex 32        # INTERNAL_SECRET
```

Edit values (Path B — custom domain):

```env
POSTGRES_USER=gayatri
POSTGRES_PASSWORD=<strong-random>
POSTGRES_DB=gayatri

API_DOMAIN=api.gayatri.example.com
APP_URL_WEB=https://gayatri.example.com
APP_URL_ADMIN=https://admin.gayatri.example.com
CORS_ORIGINS=https://gayatri.example.com,https://admin.gayatri.example.com

ADMIN_SESSION_SECRET=<hex>
JWT_SECRET=<hex>
INTERNAL_SECRET=<hex>

ADMIN_WA_NUMBER=628xxxxxxxxxx
```

Path A — sslip.io + Vercel preview domains:

```env
API_DOMAIN=43-157-205-51.sslip.io
APP_URL_WEB=https://gayatri-web-lac.vercel.app
APP_URL_ADMIN=https://gayatri-admins.vercel.app
CORS_ORIGINS=https://gayatri-web-lac.vercel.app,https://gayatri-admins.vercel.app
```

> `WA_PROVIDER` and `INTERNAL_CRON_ENABLED` are hard-coded to `internal` / `true` in `deploy/docker-compose.prod.yml`, so the API runs the in-process Baileys gateway and the 30 s self-cron without any extra config. Override in compose only if you want to switch to an external scheduler (cron-job.org → `POST /v1/internal/tick`) or a different WA provider.

### Build + start

```sh
docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env.production up -d --build
```

First build: 3–6 min. Watch logs:

```sh
docker compose -f deploy/docker-compose.prod.yml logs -f api
```

Migrations run automatically via `docker-entrypoint.sh`.

### Verify

```sh
# Path A
curl https://43-157-205-51.sslip.io/v1/health
# Path B
curl https://api.gayatri.example.com/v1/health
# {"ok":true,"service":"gayatri-api","ts":"..."}
```

If Caddy can't get the cert:
- Path A: confirm port 80 + 443 are reachable from the public internet (`curl -I http://<vps-ip>` from your laptop).
- Path B: confirm `api.gayatri.example.com` resolves to the VPS IP (`dig api.gayatri.example.com`) and the Cloudflare proxy is OFF (grey cloud).

---

## 4. Seed DB + create first admin

```sh
# Run seed (one-time) — creates a default admin (gayatri123, weak!) + sample catalog
docker compose -f deploy/docker-compose.prod.yml exec api \
  packages/db/node_modules/.bin/tsx packages/db/prisma/seed.ts

# Replace the seeded password / add another admin via the prod wrapper
./scripts/prod-create-admin.sh \
  --email owner@yourdomain.com --password '<strong>' --name 'Owner' --role OWNER
```

> The prod wrapper (`scripts/prod-create-admin.sh`) is just a thin shell around
> `docker compose … exec api packages/db/node_modules/.bin/tsx packages/db/prisma/create-admin.ts`.
> Note the `packages/db/node_modules/.bin/` prefix — pnpm puts workspace devDeps
> in each package's own `node_modules`, not the root. Running without flags drops
> you into interactive prompts. Roles: `OWNER` | `ADMIN` | `STAFF`. Re-running
> with an existing email resets that user's password/name/role (upsert).

---

## 5. Vercel — web

1. [vercel.com](https://vercel.com) → Add New Project → Import `gayatri` repo.
2. **Root Directory:** `apps/web`
3. Framework: Next.js (auto-detected via `apps/web/vercel.json`).
4. **Environment Variables:**

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | Path A: `https://43-157-205-51.sslip.io` · Path B: `https://api.gayatri.example.com` |
| `TZ` | `Asia/Jakarta` |

5. Deploy. After it builds:
   - Path A: note the assigned `*.vercel.app` URL — that's the value you already put in `APP_URL_WEB` / `CORS_ORIGINS`.
   - Path B: Vercel → Project → Settings → Domains → add `gayatri.example.com`.

---

## 6. Vercel — admin

Same as web, different root:

1. New Project → same repo → **Root Directory:** `apps/admin`
2. **Environment Variables:**

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | same value as the web project |
| `ADMIN_SESSION_SECRET` | same value as on VPS |
| `JWT_SECRET` | same value as on VPS |
| `TZ` | `Asia/Jakarta` |

3. Path B: Domains → add `admin.gayatri.example.com`. Path A: just use the assigned `*.vercel.app` URL.

### Cross-origin auth wiring (Path A specifically)

When the admin is on `*.vercel.app` and the API is on `sslip.io`, the auth cookie has to round-trip across origins:

1. `apps/api/src/admin/auth.controller.ts` sets the API-domain cookie with `SameSite=None; Secure` in production so the browser actually accepts it cross-site.
2. `adminApi` is called with `credentials: 'include'` so subsequent client-side fetches send that cookie back to the API.
3. The admin's SSR `(dashboard)/layout.tsx` can't read the API-domain cookie (different origin), so the login form also `POST`s the JWT to `apps/admin/src/app/api/auth/session/route.ts`, which sets a second `gayatri_admin` cookie on the Vercel origin. That's what the SSR `/me` check reads.

You don't need to configure anything for this — it's wired in the code. Just confirm both cookies appear in DevTools → Application → Cookies after login (one on the API host, one on the Vercel host).

If you later move to Path B with both admin and API under the same apex (`admin.gayatri.example.com` + `api.gayatri.example.com`), `SameSite=None` still works — or you can simplify by serving both from the same site so `SameSite=Lax` is enough. The Route Handler mirror is harmless either way.

---

## 7. Pair WhatsApp

1. Open the admin URL (`https://gayatri-admins.vercel.app` for Path A, `https://admin.gayatri.example.com` for Path B).
2. Log in with the owner you created.
3. Sidebar → **WhatsApp → Pairing** (`/wa/connect`).
4. Click **Hubungkan WhatsApp** → scan QR with WhatsApp → Linked Devices.
5. Status flips to **Terhubung** within ~5 s.

Session is stored in the `wa_session` Docker volume — survives container restarts and redeploys.

---

## 8. Updating later

On VPS:
```sh
cd ~/gayatri
git pull
docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env.production up -d --build
```

Migrations run automatically. WA session and Postgres data are in named volumes — preserved.

Vercel auto-deploys on every push to `main`.

---

## Backups

### Postgres dump (run weekly via cron)

```sh
docker compose -f deploy/docker-compose.prod.yml exec -T postgres \
  pg_dump -U gayatri gayatri | gzip > ~/backups/gayatri-$(date +%F).sql.gz
```

### WA session

```sh
docker run --rm -v gayatri_wa_session:/data -v ~/backups:/backup alpine \
  tar czf /backup/wa-session-$(date +%F).tar.gz -C /data .
```

Copy backups off-box (rsync to your laptop, or push to R2 / S3).

---

## Checklist

- [ ] Path B only: domain registered, nameservers pointing to Cloudflare
- [ ] Path B only: CF DNS: `api` A record to VPS IP, `@` + `admin` CNAME to Vercel
- [ ] Docker + compose installed
- [ ] Repo cloned, `deploy/.env.production` filled with real secrets (chmod 600)
- [ ] `docker compose -f deploy/docker-compose.prod.yml --env-file deploy/.env.production up -d --build` runs clean
- [ ] `curl https://<API_DOMAIN>/v1/health` returns `ok` (Caddy got a Let's Encrypt cert)
- [ ] DB seeded, first admin created — **replace the seed password** before exposing the URL anywhere
- [ ] Vercel web project deployed (custom domain attached for Path B)
- [ ] Vercel admin project deployed (custom domain attached for Path B)
- [ ] Admin login works end-to-end (two `gayatri_admin` cookies set in DevTools — one per origin)
- [ ] WA paired from `/wa/connect`
- [ ] Backup cron set
- [ ] VPS SSH hardened (no root, no password) + UFW 22/80/443 only — *before sharing the IP*
