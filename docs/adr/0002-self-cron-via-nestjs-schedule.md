# ADR-0002 — In-process cron via @nestjs/schedule

**Status:** accepted, 2026-05-20
**Supersedes:** initial assumption (external cron-job.org calls `POST /v1/internal/tick`)

## Context

`InternalService` has two periodic jobs:

- `drainWaJobs()` — claim QUEUED `WaLog` rows, send via gateway, mark
  SENT/FAILED with backoff.
- `scanReminders()` — enqueue T-CUS-005 (H-1) / T-CUS-006 (H-3) reminders
  for confirmed checkouts within the upcoming window.

Both are exposed via `POST /v1/internal/tick` (guarded by
`InternalSecretGuard`). The original plan was an external scheduler
(cron-job.org) calling this every few minutes.

In practice for dev (and many small prod deployments):

- No external scheduler was configured → queue piled up, nothing sent.
- "Plumbing works but never fires" is a frequent foot-gun.

## Decision

Add `@nestjs/schedule` to the API and register `InternalCron` running
`drainWaJobs()` + `scanReminders()` **every 30 seconds**, single-flight
guarded.

Default `INTERNAL_CRON_ENABLED=true`. Operators using an external
scheduler can set it to `false` to avoid double-firing.

## Consequences

**Pros**
- Zero-config WA delivery in dev and most prod setups.
- ~30s p95 from `enqueue` to send vs whatever the external cadence was.
- Manual `POST /v1/internal/tick` still works (e.g. tests, ops nudges).

**Cons**
- Won't fan out across multiple API replicas without coordination — but
  the drain already uses Postgres `FOR UPDATE SKIP LOCKED` + a 10-minute
  lease, so replicas safely race on the same queue.
- Reminder scan runs every 30s instead of every few minutes — slightly
  more DB load. Acceptable; scan is indexed and cheap.
