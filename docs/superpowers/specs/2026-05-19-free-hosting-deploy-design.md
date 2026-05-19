# Free Hosting Deploy — Design

**Date:** 2026-05-19
**Status:** Approved (brainstorming) — pending implementation plan

## Constraints

- **Target:** real production (real customers booking + paying)
- **Budget:** absolute $0, **no credit card anywhere** (no Oracle/Fly/Railway identity verification)
- **Volume:** tiny — <20 bookings/day, <100 WhatsApp messages/day, low concurrency

## Core Decision

Free, no-card PaaS does not offer always-on background processes. Therefore **collapse `apps/worker`, Redis, and BullMQ into the api**, driven by an external free cron service. Every always-on need becomes either request-driven or poll-driven.

## Topology

```
Customer ─▶ web   (Cloudflare Pages) ─┐
Admin ────▶ admin (Cloudflare Pages) ─┼─▶ api  NestJS (Render free, kept warm)
                                       │     │
                          cron-job.org │     ├─ Postgres (Neon free)
                          every 2 min ─┘     └─ POST /internal/tick
                                                   │
                                                   ├─ drain WaJob queue ─▶ OpenWA (Render free, on-demand)
                                                   └─ scan reminders            └─ session ▶ MongoDB Atlas M0 free
```

| Piece | Host (all $0, no card) | Notes |
|---|---|---|
| web, admin | Cloudflare Pages | Commercial use OK (Vercel Hobby is non-commercial — rejected) |
| api | Render free web service | Pinged every 2 min to stay awake |
| OpenWA | Render free, on-demand | Woken by tick HTTP call when jobs pending |
| Postgres | Neon free | 0.5 GB, instant resume |
| WA session | MongoDB Atlas M0 free | whatsapp-web.js RemoteAuth → survives container restarts |
| Cron trigger | cron-job.org free | Hits `/internal/tick` |

### Top Risk

Render free = **750 instance-hours/month shared across the whole account**. A 24/7-warm api alone ≈ 730h; adding OpenWA hours exceeds the budget and the api dies mid-month. Mitigations: (a) separate Render account per service, or (b) host OpenWA on a different free provider (Koyeb free, 1 service). To be resolved during implementation planning.

## Data Flow

1. Customer books → api `POST /bookings`. Same Prisma transaction writes `Booking` + inserts `WaJob` (status `pending`). No queue, no Redis.
2. cron-job.org → `POST /internal/tick` every 2 min, authenticated with `X-Tick-Secret` header; reject otherwise.
3. `tick`:
   - **drainWaJobs()** — claim pending rows via `SELECT … FOR UPDATE SKIP LOCKED LIMIT N`, send through `WaGateway` (OpenWA adapter), mark `sent`/`failed`, bump `attempts`.
   - **scanReminders()** — existing worker reminder logic, moved verbatim; finds due bookings, inserts `WaJob` rows.
4. tick's HTTP call to OpenWA wakes it (Render on-demand); OpenWA restores session from MongoDB RemoteAuth, sends.

## Data Model

```prisma
model WaJob {
  id          String   @id @default(cuid())
  to          String
  body        String
  status      WaJobStatus @default(pending)   // pending | sent | failed | dead
  attempts    Int      @default(0)
  providerRef String?
  error       String?
  nextRunAt   DateTime @default(now())
  createdAt   DateTime @default(now())
  sentAt      DateTime?
  @@index([status, nextRunAt])
}
```

**Retry policy:** on failure `attempts++`, `nextRunAt = now + attempts*5min`. At `attempts >= 5` → `dead`, surfaced in admin. `SKIP LOCKED` makes overlapping ticks safe (no double-send).

## Refactor Scope

1. Add `WaJob` model + migration.
2. Strip BullMQ + `node-cron` + Redis deps/config from api and worker.
3. Replace every `queue.add(...)` call site → `prisma.waJob.create(...)`.
4. New api module `internal`: `POST /internal/tick` (secret-guarded) → `drainWaJobs()` + `scanReminders()`.
5. Move `apps/worker` reminder-scan logic into `internal` service. Remove `apps/worker` from build/turbo.
6. New adapter `packages/wa/src/openwa.ts` implementing `WaGateway`; POSTs OpenWA REST send; export from `packages/wa/src/index.ts`. Provider selected via env (`WA_PROVIDER=openwa|fonnte`).
7. Deploy config: OpenWA service with `RemoteAuth` → Mongo Atlas; cron-job.org job.
8. Update README.md / docs/TECH.md stack lines (Redis, BullMQ, worker removed).

## Error Handling

| Failure | Behavior |
|---|---|
| OpenWA cold/asleep | Send throws → job stays `pending` → next tick retries. Tiny volume tolerates delay. |
| OpenWA session lost (QR) | Sends fail; jobs accumulate `pending`. Admin alert on growing pending count. RemoteAuth/Mongo should prevent. |
| tick overlap | `FOR UPDATE SKIP LOCKED` → second tick skips locked rows. No double-send. |
| tick called by attacker | Missing/bad `X-Tick-Secret` → 401. Secret in env, never in URL/logs. |
| cron-job.org down | Nothing sends until resume. Mitigation: second free cron (UptimeRobot) hitting same idempotent endpoint. |
| Neon paused/slow resume | Prisma retries; tick re-runs next cycle. |
| Render 750h exhausted | api 503s. Detect via UptimeRobot health alert. Real fix = Section 1 hours split. |
| Partial send (sent, crash before mark) | At-least-once → rare duplicate WA message. Accepted for notifications (not payments). |

## Testing

- **Unit** — `WaJob` state machine: pending→sent; fail→attempts++→backoff; attempts≥5→dead.
- **Unit** — OpenWA adapter contract test against `WaGateway` (mock HTTP); maps OpenWA response → `WaSendResult`.
- **Integration** — enqueue WaJob → `/internal/tick` (mock OpenWA HTTP) → assert row `sent` + `providerRef`.
- **Integration** — `scanReminders()`: seed due booking → tick → WaJob created, not duplicated on second tick.
- **Auth** — `/internal/tick` rejects missing/wrong secret.
- **Concurrency** — two parallel tick calls → each row sent exactly once (SKIP LOCKED).
- Migrate existing worker reminder tests: repoint from BullMQ to WaJob assertions.

## Open Assumptions To Verify In Planning

1. OpenWA exposes/permits `RemoteAuth` (MongoDB) session storage, or can be patched to.
2. Render free request-wake latency + OpenWA session restore stays within acceptable notification delay (minutes) for tiny volume.
3. Render 750h split strategy (separate account vs alternate host for OpenWA).
