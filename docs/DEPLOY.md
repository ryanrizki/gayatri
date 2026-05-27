# Deployment Guide

**Stack:**
- **VPS** (Sumopod 2 vCPU / 2 GB) — API + Postgres + Caddy (auto SSL)
- **Vercel** — web + admin (free tier)
- **Cloudflare** — DNS (free)

Total cost: Rp 60k/mo VPS + Rp 0 (Vercel + Cloudflare).

---

## Prerequisites

- Domain you own (any registrar). Example below: `gayatri.example.com`.
- VPS root SSH credentials from Sumopod.
- Cloudflare account (free).
- Vercel account (free, sign in with GitHub).

---

## 1. Cloudflare — DNS

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

SSH in:

```sh
ssh root@<VPS-IP>
```

### Harden SSH

```sh
# Create non-root user
adduser deploy
usermod -aG sudo deploy

# Copy your SSH key (from your laptop, BEFORE locking down)
# (run on laptop:) ssh-copy-id deploy@<VPS-IP>

# Disable password login + root SSH
sed -i 's/^#*PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/^#*PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart ssh

# Firewall — only allow SSH, HTTP, HTTPS
apt update && apt install -y ufw
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
```

### Install Docker

```sh
curl -fsSL https://get.docker.com | sh
usermod -aG docker deploy
# log out, log back in as deploy user
```

Verify: `docker --version` and `docker compose version`.

---

## 3. Deploy the API

As `deploy` user:

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

Edit values:

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
curl https://api.gayatri.example.com/v1/health
# {"ok":true,"service":"gayatri-api","ts":"..."}
```

If Caddy can't get cert: check that `api.gayatri.example.com` resolves to VPS IP (`dig api.gayatri.example.com`), and CF proxy is OFF (grey cloud).

---

## 4. Seed DB + create first admin

```sh
# Run seed (one-time)
docker compose -f deploy/docker-compose.prod.yml exec api \
  node_modules/.bin/tsx packages/db/prisma/seed.ts

# OR create one admin user only
docker compose -f deploy/docker-compose.prod.yml exec api \
  node_modules/.bin/tsx packages/db/prisma/create-admin.ts \
  --email owner@yourdomain.com --password '<strong>' --name 'Owner' --role OWNER
```

---

## 5. Vercel — web

1. [vercel.com](https://vercel.com) → Add New Project → Import `gayatri` repo.
2. **Root Directory:** `apps/web`
3. Framework: Next.js (auto-detected via `apps/web/vercel.json`).
4. **Environment Variables:**

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://api.gayatri.example.com` |
| `TZ` | `Asia/Jakarta` |

5. Deploy. After it builds:
   - Vercel → Project → Settings → Domains → add `gayatri.example.com`.

---

## 6. Vercel — admin

Same as web, different root:

1. New Project → same repo → **Root Directory:** `apps/admin`
2. **Environment Variables:**

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://api.gayatri.example.com` |
| `ADMIN_SESSION_SECRET` | same value as on VPS |
| `JWT_SECRET` | same value as on VPS |
| `TZ` | `Asia/Jakarta` |

3. Domains → add `admin.gayatri.example.com`.

---

## 7. Pair WhatsApp

1. Open `https://admin.gayatri.example.com`.
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

- [ ] Domain registered, nameservers pointing to Cloudflare
- [ ] CF DNS: `api` A record to VPS IP, `@` + `admin` CNAME to Vercel
- [ ] VPS SSH hardened (no root, no password)
- [ ] UFW firewall: 22, 80, 443 only
- [ ] Docker + compose installed
- [ ] Repo cloned, `deploy/.env.production` filled with real secrets
- [ ] `docker compose up -d --build` runs clean
- [ ] `curl https://api.<domain>/v1/health` returns `ok`
- [ ] DB seeded, first admin created
- [ ] Vercel web project deployed, custom domain attached
- [ ] Vercel admin project deployed, custom domain attached
- [ ] WA paired from `/wa/connect`
- [ ] Backup cron set
