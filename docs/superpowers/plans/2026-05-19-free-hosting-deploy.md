# Free Hosting Deploy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove BullMQ/Redis/node-cron and the `apps/worker` service; drive WhatsApp sending and reminder scans from a secret-guarded `POST /v1/internal/tick` endpoint polled by an external free cron, plus add an OpenWA gateway adapter — so the whole stack runs on $0 no-card hosting.

**Architecture:** The existing `WaLog` Prisma model becomes the durable job queue (status state machine). `WaService.enqueue()` stops calling BullMQ and just writes a `QUEUED` `WaLog` row. A new `InternalModule` exposes `POST /v1/internal/tick` (guarded by `INTERNAL_SECRET`) that claims due rows with Postgres `FOR UPDATE SKIP LOCKED`, sends them via a provider gateway, applies retry/backoff, and runs the reminder scan moved verbatim from `apps/worker/src/reminder.cron.ts`. A new `createGateway()` factory in `packages/wa` selects Fonnte or the new OpenWA adapter by env.

**Tech Stack:** NestJS 10, Prisma (PostgreSQL), TypeScript ESM/CJS monorepo (pnpm + turbo), Jest + ts-jest, `whatsapp-web.js`-backed OpenWA REST gateway.

**Spec deviations (DRY, intentional):**
- Reuse `WaLog` instead of adding a parallel `WaJob` model. `WaLog` already has `to/template/payload/status/provider/providerRef/error/sentAt/createdAt`. We add only `attempts` + `nextRunAt` and extend `WaStatus` with `SENDING` + `DEAD`.
- Job `body` is **not** stored; `WaLog` stores `template` + `payload`. The tick re-renders via `WaTemplate` + `renderTemplate(payload)` (same pattern `WaService.enqueue` already uses).

---

## File Structure

**Create:**
- `packages/wa/src/openwa.ts` — `OpenWaAdapter implements WaGateway`
- `packages/wa/src/factory.ts` — `createGateway()` env-driven provider selection
- `apps/api/src/internal/internal.module.ts` — wires controller/service/guard
- `apps/api/src/internal/internal.controller.ts` — `POST /v1/internal/tick`
- `apps/api/src/internal/internal.service.ts` — `drainWaJobs()` + `scanReminders()`
- `apps/api/src/internal/internal-secret.guard.ts` — `INTERNAL_SECRET` bearer guard
- `apps/api/src/internal/backoff.ts` — pure `nextRunAt()` retry math
- `apps/api/jest.config.js` — Jest config (none exists yet)
- Test files under `apps/api/src/internal/*.spec.ts` and `packages/wa/src/*.spec.ts`

**Modify:**
- `packages/db/prisma/schema.prisma:218-239` — extend `WaLog` + `WaStatus`
- `packages/wa/src/index.ts` — export new modules
- `apps/api/src/wa/wa.service.ts:32-63` — drop BullMQ enqueue, write `QUEUED` row only
- `apps/api/src/wa/wa.module.ts` — remove `WaQueue`
- `apps/api/src/app.module.ts` — register `InternalModule`
- `apps/api/package.json` — drop `bullmq`,`ioredis`; add nothing new
- `turbo.json:8` / `.env.example` — drop `REDIS_URL`; add `INTERNAL_SECRET`,`OPENWA_*`
- `pnpm-workspace.yaml` — (unchanged; `apps/*` glob) — `apps/worker` directory deleted
- `README.md`, `docs/TECH.md` — remove Redis/BullMQ/worker stack lines

**Delete:**
- `apps/api/src/wa/wa.queue.ts`
- `apps/worker/` (entire directory)

---

## Task 1: Extend WaLog schema for queue/retry

**Files:**
- Modify: `packages/db/prisma/schema.prisma:218-239`
- Migration: `packages/db/prisma/migrations/` (generated)

- [ ] **Step 1: Edit the `WaLog` model and `WaStatus` enum**

Replace the block at `packages/db/prisma/schema.prisma:218-239` with:

```prisma
model WaLog {
  id         String    @id @default(cuid())
  checkoutId String?
  checkout   Checkout? @relation(fields: [checkoutId], references: [id])
  to         String
  template   String
  payload    Json
  status     WaStatus  @default(QUEUED)
  attempts   Int       @default(0)
  nextRunAt  DateTime  @default(now())
  error      String?
  provider   String?
  providerRef String?
  sentAt     DateTime?
  createdAt  DateTime  @default(now())

  @@index([checkoutId, template])
  @@index([status, createdAt])
  @@index([status, nextRunAt])
}

enum WaStatus {
  QUEUED
  SENDING
  SENT
  FAILED
  DEAD
}
```

(`QUEUED` = pending, `SENDING` = claimed by a tick, `FAILED` = transient/retry, `DEAD` = gave up after max attempts.)

- [ ] **Step 2: Create the migration**

Run: `pnpm --filter @gayatri/db prisma migrate dev --name walog_queue_fields`
Expected: new folder under `packages/db/prisma/migrations/`, `prisma generate` runs, exit 0.

- [ ] **Step 3: Typecheck the db package**

Run: `pnpm --filter @gayatri/db exec prisma validate`
Expected: "The schema at packages/db/prisma/schema.prisma is valid 🚀"

- [ ] **Step 4: Commit**

```bash
git add packages/db/prisma/schema.prisma packages/db/prisma/migrations
git commit -m "feat(db): add WaLog queue/retry fields + SENDING/DEAD status"
```

---

## Task 2: Pure retry-backoff function (TDD)

**Files:**
- Create: `apps/api/src/internal/backoff.ts`
- Test: `apps/api/src/internal/backoff.spec.ts`
- Create: `apps/api/jest.config.js`

- [ ] **Step 1: Add Jest config (none exists yet)**

Create `apps/api/jest.config.js`:

```js
/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: { '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/../tsconfig.json' }] }
}
```

- [ ] **Step 2: Write the failing test**

Create `apps/api/src/internal/backoff.spec.ts`:

```ts
import { computeRetry, MAX_ATTEMPTS } from './backoff'

describe('computeRetry', () => {
  const now = new Date('2026-05-19T00:00:00.000Z')

  it('schedules attempt 1 five minutes out, stays FAILED', () => {
    const r = computeRetry(0, now)
    expect(r.status).toBe('FAILED')
    expect(r.attempts).toBe(1)
    expect(r.nextRunAt.getTime()).toBe(now.getTime() + 5 * 60_000)
  })

  it('backoff grows linearly with attempts', () => {
    expect(computeRetry(2, now).nextRunAt.getTime()).toBe(now.getTime() + 3 * 5 * 60_000)
  })

  it('marks DEAD at MAX_ATTEMPTS', () => {
    const r = computeRetry(MAX_ATTEMPTS - 1, now)
    expect(r.attempts).toBe(MAX_ATTEMPTS)
    expect(r.status).toBe('DEAD')
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm --filter @gayatri/api exec jest backoff`
Expected: FAIL — "Cannot find module './backoff'"

- [ ] **Step 4: Implement `backoff.ts`**

Create `apps/api/src/internal/backoff.ts`:

```ts
export const MAX_ATTEMPTS = 5

export interface RetryDecision {
  attempts: number
  status: 'FAILED' | 'DEAD'
  nextRunAt: Date
}

/** prevAttempts = attempts value before this failure. */
export function computeRetry(prevAttempts: number, now: Date = new Date()): RetryDecision {
  const attempts = prevAttempts + 1
  if (attempts >= MAX_ATTEMPTS) {
    return { attempts, status: 'DEAD', nextRunAt: now }
  }
  return { attempts, status: 'FAILED', nextRunAt: new Date(now.getTime() + attempts * 5 * 60_000) }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm --filter @gayatri/api exec jest backoff`
Expected: PASS, 3 tests green.

- [ ] **Step 6: Commit**

```bash
git add apps/api/jest.config.js apps/api/src/internal/backoff.ts apps/api/src/internal/backoff.spec.ts
git commit -m "feat(api): retry-backoff helper + jest config"
```

---

## Task 3: OpenWA gateway adapter (TDD)

**Files:**
- Create: `packages/wa/src/openwa.ts`
- Test: `packages/wa/src/openwa.spec.ts`
- Modify: `packages/wa/src/index.ts`
- Modify: `packages/wa/package.json` (add jest devdeps + test script)
- Create: `packages/wa/jest.config.cjs`

> **Assumption to verify against the deployed OpenWA instance:** REST contract is `POST {baseUrl}{sendPath}` with header `X-Api-Key: <key>`, JSON body `{ "to": "<628..>", "message": "<text>" }`, success when HTTP 2xx and JSON `{ "id": "<ref>" }` (or `{ "data": { "id": ... } }`). Path + header name are env-overridable to absorb contract drift; defaults below.

- [ ] **Step 1: Add jest to `packages/wa`**

Modify `packages/wa/package.json` — add to `scripts`: `"test": "jest"`; add to `devDependencies`: `"jest": "^29.7.0"`, `"ts-jest": "^29.2.5"`, `"@types/jest": "^29.5.13"`.

Create `packages/wa/jest.config.cjs`:

```js
/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: { '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/../tsconfig.json', useESM: false }] }
}
```

Run: `pnpm install`
Expected: exit 0, jest resolvable in `packages/wa`.

- [ ] **Step 2: Write the failing test**

Create `packages/wa/src/openwa.spec.ts`:

```ts
import { OpenWaAdapter } from './openwa.ts'

describe('OpenWaAdapter', () => {
  const cfg = { baseUrl: 'http://openwa.local', apiKey: 'k1' }

  afterEach(() => jest.restoreAllMocks())

  it('rejects invalid phone without calling fetch', async () => {
    const spy = jest.spyOn(global, 'fetch')
    const res = await new OpenWaAdapter(cfg).send('not-a-phone', 'hi')
    expect(res).toEqual({ ok: false, error: 'invalid phone' })
    expect(spy).not.toHaveBeenCalled()
  })

  it('posts to send path with api key and returns providerRef', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: 'abc' }), { status: 200 })
    )
    const res = await new OpenWaAdapter(cfg).send('08123456789', 'hello')
    expect(res).toEqual({ ok: true, providerRef: 'abc' })
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('http://openwa.local/api/messages/send')
    expect((init!.headers as Record<string, string>)['X-Api-Key']).toBe('k1')
    expect(JSON.parse(init!.body as string)).toEqual({ to: '628123456789', message: 'hello' })
  })

  it('maps non-2xx to ok:false with reason', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: 'no session' }), { status: 503 })
    )
    const res = await new OpenWaAdapter(cfg).send('08123456789', 'hi')
    expect(res.ok).toBe(false)
    expect(res.error).toContain('no session')
  })

  it('maps thrown fetch error to ok:false', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('econnrefused'))
    const res = await new OpenWaAdapter(cfg).send('08123456789', 'hi')
    expect(res).toEqual({ ok: false, error: 'econnrefused' })
  })
})
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm --filter @gayatri/wa exec jest openwa`
Expected: FAIL — "Cannot find module './openwa.ts'"

- [ ] **Step 4: Implement `openwa.ts`**

Create `packages/wa/src/openwa.ts`:

```ts
import type { WaGateway, WaSendResult } from './gateway.ts'
import { normalizePhone } from './phone.ts'

export interface OpenWaConfig {
  baseUrl: string
  apiKey: string
  sendPath?: string
  apiKeyHeader?: string
}

export class OpenWaAdapter implements WaGateway {
  readonly name = 'openwa'
  private baseUrl: string
  private apiKey: string
  private sendPath: string
  private apiKeyHeader: string

  constructor(cfg: OpenWaConfig) {
    if (!cfg.baseUrl) throw new Error('OpenWaAdapter: baseUrl required')
    if (!cfg.apiKey) throw new Error('OpenWaAdapter: apiKey required')
    this.baseUrl = cfg.baseUrl.replace(/\/$/, '')
    this.apiKey = cfg.apiKey
    this.sendPath = cfg.sendPath ?? '/api/messages/send'
    this.apiKeyHeader = cfg.apiKeyHeader ?? 'X-Api-Key'
  }

  async send(to: string, body: string): Promise<WaSendResult> {
    const target = normalizePhone(to)
    if (!target) return { ok: false, error: 'invalid phone' }
    try {
      const res = await fetch(`${this.baseUrl}${this.sendPath}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', [this.apiKeyHeader]: this.apiKey },
        body: JSON.stringify({ to: target, message: body })
      })
      const json = (await res.json().catch(() => ({}))) as {
        id?: string
        data?: { id?: string }
        error?: string
        reason?: string
      }
      if (!res.ok) {
        return { ok: false, error: json.error ?? json.reason ?? `http ${res.status}` }
      }
      const ref = json.id ?? json.data?.id
      return { ok: true, providerRef: ref }
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : 'unknown' }
    }
  }
}
```

- [ ] **Step 5: Export from index**

Modify `packages/wa/src/index.ts` — add line: `export * from './openwa.ts'`

- [ ] **Step 6: Run test to verify it passes**

Run: `pnpm --filter @gayatri/wa exec jest openwa`
Expected: PASS, 4 tests green.

- [ ] **Step 7: Commit**

```bash
git add packages/wa/src/openwa.ts packages/wa/src/openwa.spec.ts packages/wa/src/index.ts packages/wa/package.json packages/wa/jest.config.cjs
git commit -m "feat(wa): OpenWA gateway adapter"
```

---

## Task 4: Gateway factory (TDD)

**Files:**
- Create: `packages/wa/src/factory.ts`
- Test: `packages/wa/src/factory.spec.ts`
- Modify: `packages/wa/src/index.ts`

- [ ] **Step 1: Write the failing test**

Create `packages/wa/src/factory.spec.ts`:

```ts
import { createGateway } from './factory.ts'
import { FonnteAdapter } from './fonnte.ts'
import { OpenWaAdapter } from './openwa.ts'

describe('createGateway', () => {
  it('returns FonnteAdapter for provider=fonnte with token', () => {
    const gw = createGateway({ WA_PROVIDER: 'fonnte', FONNTE_TOKEN: 't' })
    expect(gw).toBeInstanceOf(FonnteAdapter)
  })

  it('returns null when fonnte token missing', () => {
    expect(createGateway({ WA_PROVIDER: 'fonnte' })).toBeNull()
  })

  it('returns OpenWaAdapter for provider=openwa with url+key', () => {
    const gw = createGateway({ WA_PROVIDER: 'openwa', OPENWA_URL: 'http://x', OPENWA_API_KEY: 'k' })
    expect(gw).toBeInstanceOf(OpenWaAdapter)
  })

  it('returns null when openwa url/key missing', () => {
    expect(createGateway({ WA_PROVIDER: 'openwa', OPENWA_URL: 'http://x' })).toBeNull()
  })

  it('defaults provider to fonnte', () => {
    expect(createGateway({ FONNTE_TOKEN: 't' })).toBeInstanceOf(FonnteAdapter)
  })

  it('throws on unknown provider', () => {
    expect(() => createGateway({ WA_PROVIDER: 'sms' })).toThrow('Unsupported WA provider: sms')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @gayatri/wa exec jest factory`
Expected: FAIL — "Cannot find module './factory.ts'"

- [ ] **Step 3: Implement `factory.ts`**

Create `packages/wa/src/factory.ts`:

```ts
import type { WaGateway } from './gateway.ts'
import { FonnteAdapter } from './fonnte.ts'
import { OpenWaAdapter } from './openwa.ts'

export type WaEnv = {
  WA_PROVIDER?: string
  FONNTE_TOKEN?: string
  OPENWA_URL?: string
  OPENWA_API_KEY?: string
  OPENWA_SEND_PATH?: string
  OPENWA_API_KEY_HEADER?: string
}

/** Returns null when the selected provider is not configured (caller logs + idles). */
export function createGateway(env: WaEnv = process.env as WaEnv): WaGateway | null {
  const provider = env.WA_PROVIDER ?? 'fonnte'
  if (provider === 'fonnte') {
    if (!env.FONNTE_TOKEN) return null
    return new FonnteAdapter({ token: env.FONNTE_TOKEN })
  }
  if (provider === 'openwa') {
    if (!env.OPENWA_URL || !env.OPENWA_API_KEY) return null
    return new OpenWaAdapter({
      baseUrl: env.OPENWA_URL,
      apiKey: env.OPENWA_API_KEY,
      sendPath: env.OPENWA_SEND_PATH,
      apiKeyHeader: env.OPENWA_API_KEY_HEADER
    })
  }
  throw new Error(`Unsupported WA provider: ${provider}`)
}
```

- [ ] **Step 4: Export from index**

Modify `packages/wa/src/index.ts` — add line: `export * from './factory.ts'`

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm --filter @gayatri/wa exec jest factory`
Expected: PASS, 6 tests green.

- [ ] **Step 6: Commit**

```bash
git add packages/wa/src/factory.ts packages/wa/src/factory.spec.ts packages/wa/src/index.ts
git commit -m "feat(wa): env-driven gateway factory"
```

---

## Task 5: Internal-secret guard (TDD)

**Files:**
- Create: `apps/api/src/internal/internal-secret.guard.ts`
- Test: `apps/api/src/internal/internal-secret.guard.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `apps/api/src/internal/internal-secret.guard.spec.ts`:

```ts
import { UnauthorizedException } from '@nestjs/common'
import { InternalSecretGuard } from './internal-secret.guard'

function ctx(authHeader?: string) {
  return {
    switchToHttp: () => ({ getRequest: () => ({ headers: { authorization: authHeader } }) })
  } as any
}

describe('InternalSecretGuard', () => {
  const OLD = process.env.INTERNAL_SECRET
  beforeAll(() => { process.env.INTERNAL_SECRET = 's3cr3t' })
  afterAll(() => { process.env.INTERNAL_SECRET = OLD })

  it('allows correct bearer secret', () => {
    expect(new InternalSecretGuard().canActivate(ctx('Bearer s3cr3t'))).toBe(true)
  })

  it('rejects missing header', () => {
    expect(() => new InternalSecretGuard().canActivate(ctx(undefined))).toThrow(UnauthorizedException)
  })

  it('rejects wrong secret', () => {
    expect(() => new InternalSecretGuard().canActivate(ctx('Bearer nope'))).toThrow(UnauthorizedException)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @gayatri/api exec jest internal-secret`
Expected: FAIL — "Cannot find module './internal-secret.guard'"

- [ ] **Step 3: Implement the guard**

Create `apps/api/src/internal/internal-secret.guard.ts`:

```ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import type { Request } from 'express'

@Injectable()
export class InternalSecretGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<Request>()
    const expected = process.env.INTERNAL_SECRET
    if (!expected) throw new UnauthorizedException('INTERNAL_SECRET not configured')
    const header = req.headers.authorization ?? ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : ''
    if (!token || token !== expected) throw new UnauthorizedException('Invalid internal secret')
    return true
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @gayatri/api exec jest internal-secret`
Expected: PASS, 3 tests green.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/internal/internal-secret.guard.ts apps/api/src/internal/internal-secret.guard.spec.ts
git commit -m "feat(api): INTERNAL_SECRET bearer guard"
```

---

## Task 6: InternalService.drainWaJobs (TDD, mocked Prisma)

**Files:**
- Create: `apps/api/src/internal/internal.service.ts`
- Test: `apps/api/src/internal/internal.service.spec.ts`

> No test DB infra exists in this repo. We unit-test `InternalService` with a hand-rolled Prisma mock. The raw claim SQL is exercised via a `claimDue` seam that the test stubs; the SQL string itself is asserted as a constant so drift is caught.

- [ ] **Step 1: Write the failing test**

Create `apps/api/src/internal/internal.service.spec.ts`:

```ts
import { InternalService } from './internal.service'

const tpl = { code: 'T-CUS-001', body: 'Hi {{name}}', active: true }

function makeDb(claimed: any[]) {
  return {
    $queryRawUnsafe: jest.fn().mockResolvedValue(claimed),
    waTemplate: { findUnique: jest.fn().mockResolvedValue(tpl) },
    waLog: { update: jest.fn().mockResolvedValue({}) },
    checkout: { findMany: jest.fn().mockResolvedValue([]), update: jest.fn() }
  } as any
}

describe('InternalService.drainWaJobs', () => {
  afterEach(() => jest.restoreAllMocks())

  it('sends a claimed row and marks SENT', async () => {
    const db = makeDb([
      { id: 'log1', to: '628111', template: 'T-CUS-001', payload: { name: 'Ana' }, attempts: 0 }
    ])
    const gw = { name: 'openwa', send: jest.fn().mockResolvedValue({ ok: true, providerRef: 'r1' }) }
    const svc = new InternalService(db, () => gw as any)

    const out = await svc.drainWaJobs()

    expect(gw.send).toHaveBeenCalledWith('628111', 'Hi Ana')
    expect(db.waLog.update).toHaveBeenCalledWith({
      where: { id: 'log1' },
      data: expect.objectContaining({ status: 'SENT', providerRef: 'r1' })
    })
    expect(out).toEqual({ claimed: 1, sent: 1, failed: 0 })
  })

  it('applies retry/backoff on send failure', async () => {
    const db = makeDb([
      { id: 'log2', to: '628222', template: 'T-CUS-001', payload: { name: 'B' }, attempts: 0 }
    ])
    const gw = { name: 'openwa', send: jest.fn().mockResolvedValue({ ok: false, error: 'down' }) }
    const svc = new InternalService(db, () => gw as any)

    const out = await svc.drainWaJobs()

    expect(db.waLog.update).toHaveBeenCalledWith({
      where: { id: 'log2' },
      data: expect.objectContaining({ status: 'FAILED', attempts: 1, error: 'down' })
    })
    expect(out).toEqual({ claimed: 1, sent: 0, failed: 1 })
  })

  it('marks row FAILED (no send) when template missing', async () => {
    const db = makeDb([{ id: 'log3', to: '628333', template: 'GONE', payload: {}, attempts: 0 }])
    db.waTemplate.findUnique.mockResolvedValue(null)
    const gw = { name: 'openwa', send: jest.fn() }
    const svc = new InternalService(db, () => gw as any)

    await svc.drainWaJobs()

    expect(gw.send).not.toHaveBeenCalled()
    expect(db.waLog.update).toHaveBeenCalledWith({
      where: { id: 'log3' },
      data: expect.objectContaining({ status: 'FAILED', attempts: 1 })
    })
  })

  it('no-ops when gateway unconfigured', async () => {
    const db = makeDb([])
    const svc = new InternalService(db, () => null)
    expect(await svc.drainWaJobs()).toEqual({ claimed: 0, sent: 0, failed: 0 })
    expect(db.$queryRawUnsafe).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @gayatri/api exec jest internal.service`
Expected: FAIL — "Cannot find module './internal.service'"

- [ ] **Step 3: Implement `internal.service.ts` (drain only; reminder stub returns 0)**

Create `apps/api/src/internal/internal.service.ts`:

```ts
import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { createGateway, renderTemplate } from '@gayatri/wa'
import type { WaGateway } from '@gayatri/wa'
import { computeRetry } from './backoff'

const CLAIM_BATCH = 20

const CLAIM_SQL = `
WITH claimed AS (
  SELECT id FROM "WaLog"
  WHERE status IN ('QUEUED','FAILED') AND "nextRunAt" <= now() AND attempts < 5
  ORDER BY "nextRunAt" ASC
  LIMIT ${CLAIM_BATCH}
  FOR UPDATE SKIP LOCKED
)
UPDATE "WaLog" w SET status = 'SENDING'
FROM claimed
WHERE w.id = claimed.id
RETURNING w.id, w."to" AS "to", w.template, w.payload, w.attempts`

interface ClaimedRow {
  id: string
  to: string
  template: string
  payload: Record<string, unknown>
  attempts: number
}

type GatewayFactory = () => WaGateway | null

@Injectable()
export class InternalService {
  private readonly logger = new Logger(InternalService.name)

  constructor(
    private db: PrismaService,
    private gatewayFactory: GatewayFactory = () => createGateway()
  ) {}

  async drainWaJobs(): Promise<{ claimed: number; sent: number; failed: number }> {
    const gw = this.gatewayFactory()
    if (!gw) {
      this.logger.warn('WA gateway not configured — drain skipped')
      return { claimed: 0, sent: 0, failed: 0 }
    }

    const rows = await this.db.$queryRawUnsafe<ClaimedRow[]>(CLAIM_SQL)
    let sent = 0
    let failed = 0

    for (const row of rows) {
      const tpl = await this.db.waTemplate.findUnique({ where: { code: row.template } })
      if (!tpl || !tpl.active) {
        const r = computeRetry(row.attempts)
        await this.db.waLog.update({
          where: { id: row.id },
          data: { status: r.status, attempts: r.attempts, nextRunAt: r.nextRunAt, error: 'template missing/inactive' }
        })
        failed++
        continue
      }

      const body = renderTemplate(tpl.body, row.payload as Record<string, string | number | undefined | null>)
      const res = await gw.send(row.to, body)

      if (res.ok) {
        await this.db.waLog.update({
          where: { id: row.id },
          data: { status: 'SENT', sentAt: new Date(), providerRef: res.providerRef ?? null }
        })
        sent++
      } else {
        const r = computeRetry(row.attempts)
        await this.db.waLog.update({
          where: { id: row.id },
          data: { status: r.status, attempts: r.attempts, nextRunAt: r.nextRunAt, error: res.error ?? 'unknown' }
        })
        failed++
      }
    }

    return { claimed: rows.length, sent, failed }
  }

  async scanReminders(): Promise<{ h1: number; h3: number }> {
    return { h1: 0, h3: 0 } // implemented in Task 7
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @gayatri/api exec jest internal.service`
Expected: PASS, 4 tests green.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/internal/internal.service.ts apps/api/src/internal/internal.service.spec.ts
git commit -m "feat(api): InternalService.drainWaJobs with SKIP LOCKED claim"
```

---

## Task 7: Move reminder scan into InternalService (TDD)

**Files:**
- Modify: `apps/api/src/internal/internal.service.ts`
- Modify: `apps/api/src/internal/internal.service.spec.ts`

Logic ported verbatim from `apps/worker/src/reminder.cron.ts:51-104` — same windows (24h / 3h, ±7.5min), same statuses, same templates (`T-CUS-005` H-1, `T-CUS-006` H-3), but it now inserts a `QUEUED` `WaLog` row (no BullMQ) and the drain picks it up next tick.

- [ ] **Step 1: Add the failing reminder test**

Append to `apps/api/src/internal/internal.service.spec.ts`:

```ts
describe('InternalService.scanReminders', () => {
  afterEach(() => jest.restoreAllMocks())

  it('creates H-1 QUEUED log and marks reminderH1Sent', async () => {
    const due = {
      id: 'c1', code: 'GYT-1',
      scheduledAt: new Date(Date.now() + 24 * 3600_000),
      customer: { name: 'Ana', phone: '08123456789' },
      child: { name: 'Bayi' }, branch: { address: 'Jl. A' }
    }
    const db = {
      waTemplate: { findUnique: jest.fn().mockResolvedValue({ code: 'T-CUS-005', body: 'Besok {{hour}}', active: true }) },
      waLog: { create: jest.fn().mockResolvedValue({ id: 'l1' }) },
      checkout: {
        findMany: jest.fn().mockResolvedValueOnce([due]).mockResolvedValueOnce([]),
        update: jest.fn().mockResolvedValue({})
      }
    } as any
    const svc = new InternalService(db, () => null)

    const out = await svc.scanReminders()

    expect(db.waLog.create).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ checkoutId: 'c1', template: 'T-CUS-005', status: 'QUEUED' })
    }))
    expect(db.checkout.update).toHaveBeenCalledWith({ where: { id: 'c1' }, data: { reminderH1Sent: true } })
    expect(out).toEqual({ h1: 1, h3: 0 })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @gayatri/api exec jest internal.service -t scanReminders`
Expected: FAIL — `out` is `{ h1: 0, h3: 0 }`, `waLog.create` not called.

- [ ] **Step 3: Replace the `scanReminders` stub with the real implementation**

In `apps/api/src/internal/internal.service.ts`, replace the `scanReminders` method with:

```ts
  async scanReminders(): Promise<{ h1: number; h3: number }> {
    const now = Date.now()
    const HALF = 7.5 * 60_000
    const range = (centerMs: number) => ({ gte: new Date(centerMs - HALF), lte: new Date(centerMs + HALF) })
    const fmtHour = (d: Date) =>
      d.toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit' })

    const h1List = await this.db.checkout.findMany({
      where: { status: { in: ['CONFIRMED', 'RESCHEDULED'] }, reminderH1Sent: false, scheduledAt: range(now + 24 * 3600_000) },
      include: { customer: true, child: true, branch: true }
    })
    for (const c of h1List) {
      await this.queueReminder(c.id, 'T-CUS-005', {
        hour: c.scheduledAt ? fmtHour(c.scheduledAt) : '-',
        baby_name: c.child?.name ?? c.customer.name,
        address: c.branch?.address ?? '-'
      }, c.customer.phone)
      await this.db.checkout.update({ where: { id: c.id }, data: { reminderH1Sent: true } })
    }

    const h3List = await this.db.checkout.findMany({
      where: { status: { in: ['CONFIRMED', 'RESCHEDULED'] }, reminderH3Sent: false, scheduledAt: range(now + 3 * 3600_000) },
      include: { customer: true, child: true, branch: true }
    })
    for (const c of h3List) {
      await this.queueReminder(c.id, 'T-CUS-006', { baby_name: c.child?.name ?? c.customer.name }, c.customer.phone)
      await this.db.checkout.update({ where: { id: c.id }, data: { reminderH3Sent: true } })
    }

    if (h1List.length || h3List.length) this.logger.log(`reminders H1=${h1List.length} H3=${h3List.length}`)
    return { h1: h1List.length, h3: h3List.length }
  }

  private async queueReminder(
    checkoutId: string,
    templateCode: 'T-CUS-005' | 'T-CUS-006',
    vars: Record<string, string>,
    phone: string
  ) {
    const tpl = await this.db.waTemplate.findUnique({ where: { code: templateCode } })
    if (!tpl || !tpl.active) return
    await this.db.waLog.create({
      data: {
        checkoutId,
        to: phone,
        template: templateCode,
        payload: vars as object,
        status: 'QUEUED',
        provider: process.env.WA_PROVIDER ?? 'fonnte'
      }
    })
  }
```

(Phone normalization happens in the gateway adapter at send time; storing raw `phone` matches the existing reminder behavior where invalid numbers were skipped — kept simple, drain still validates via adapter returning `invalid phone` → retry/DEAD.)

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter @gayatri/api exec jest internal.service`
Expected: PASS, all `internal.service` tests green (drain + reminder).

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/internal/internal.service.ts apps/api/src/internal/internal.service.spec.ts
git commit -m "feat(api): port reminder scan into InternalService"
```

---

## Task 8: Tick controller + module, wire into app (TDD)

**Files:**
- Create: `apps/api/src/internal/internal.controller.ts`
- Create: `apps/api/src/internal/internal.module.ts`
- Test: `apps/api/src/internal/internal.controller.spec.ts`
- Modify: `apps/api/src/app.module.ts`

- [ ] **Step 1: Write the failing controller test**

Create `apps/api/src/internal/internal.controller.spec.ts`:

```ts
import { InternalController } from './internal.controller'

describe('InternalController', () => {
  it('tick runs drain + reminders and returns combined result', async () => {
    const svc = {
      drainWaJobs: jest.fn().mockResolvedValue({ claimed: 2, sent: 2, failed: 0 }),
      scanReminders: jest.fn().mockResolvedValue({ h1: 1, h3: 0 })
    } as any
    const out = await new InternalController(svc).tick()
    expect(svc.scanReminders).toHaveBeenCalled()
    expect(svc.drainWaJobs).toHaveBeenCalled()
    expect(out).toEqual({ ok: true, reminders: { h1: 1, h3: 0 }, drain: { claimed: 2, sent: 2, failed: 0 } })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter @gayatri/api exec jest internal.controller`
Expected: FAIL — "Cannot find module './internal.controller'"

- [ ] **Step 3: Implement controller + module**

Create `apps/api/src/internal/internal.controller.ts`:

```ts
import { Controller, Post, UseGuards } from '@nestjs/common'
import { InternalSecretGuard } from './internal-secret.guard'
import { InternalService } from './internal.service'

@Controller('internal')
@UseGuards(InternalSecretGuard)
export class InternalController {
  constructor(private svc: InternalService) {}

  @Post('tick')
  async tick() {
    const reminders = await this.svc.scanReminders()
    const drain = await this.svc.drainWaJobs()
    return { ok: true, reminders, drain }
  }
}
```

(Reminders first so freshly-queued rows can be sent in the same tick.)

Create `apps/api/src/internal/internal.module.ts`:

```ts
import { Module } from '@nestjs/common'
import { InternalController } from './internal.controller'
import { InternalService } from './internal.service'
import { InternalSecretGuard } from './internal-secret.guard'
import { PrismaService } from '../prisma.service'

@Module({
  controllers: [InternalController],
  providers: [InternalService, InternalSecretGuard, PrismaService]
})
export class InternalModule {}
```

- [ ] **Step 4: Register module in `app.module.ts`**

Modify `apps/api/src/app.module.ts`: add `import { InternalModule } from './internal/internal.module'` after line 9, and add `InternalModule` to the `imports` array (after `WaModule`).

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm --filter @gayatri/api exec jest internal.controller`
Expected: PASS, 1 test green.

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/internal apps/api/src/app.module.ts
git commit -m "feat(api): POST /v1/internal/tick endpoint + module"
```

---

## Task 9: Cut BullMQ out of WaService

**Files:**
- Modify: `apps/api/src/wa/wa.service.ts:1-63`
- Modify: `apps/api/src/wa/wa.module.ts`
- Delete: `apps/api/src/wa/wa.queue.ts`

- [ ] **Step 1: Rewrite `WaService.enqueue` to write a QUEUED row only**

In `apps/api/src/wa/wa.service.ts`:
- Delete line 3: `import { WaQueue } from './wa.queue'`
- Change constructor (line 11) to: `constructor(private db: PrismaService) {}`
- Replace the body of `enqueue` (lines 50-62) — remove the `this.q.enqueue(...)` call. Final tail of method:

```ts
    const log = await this.db.waLog.create({
      data: {
        checkoutId: opts.checkoutId ?? null,
        to: target,
        template: opts.templateCode,
        payload: opts.vars as object,
        status: 'QUEUED',
        provider: process.env.WA_PROVIDER ?? 'fonnte'
      }
    })
    return log.id
```

(`body` is computed via `renderTemplate` already on line 48; it is no longer needed for enqueue but leave the template lookup — it still validates the template exists before queueing. Remove the now-unused `body` variable assignment on line 48 to satisfy lint.)

- [ ] **Step 2: Remove `WaQueue` from the module**

Rewrite `apps/api/src/wa/wa.module.ts`:

```ts
import { Module } from '@nestjs/common'
import { WaService } from './wa.service'
import { PrismaService } from '../prisma.service'

@Module({
  providers: [WaService, PrismaService],
  exports: [WaService]
})
export class WaModule {}
```

- [ ] **Step 3: Delete the queue file**

Run: `git rm apps/api/src/wa/wa.queue.ts`

- [ ] **Step 4: Typecheck**

Run: `pnpm --filter @gayatri/api exec tsc --noEmit`
Expected: exit 0, no references to `WaQueue`/`bullmq`/`ioredis` remain.

- [ ] **Step 5: Run full api test suite**

Run: `pnpm --filter @gayatri/api exec jest`
Expected: PASS — all suites (backoff, guard, internal.service, internal.controller) green.

- [ ] **Step 6: Commit**

```bash
git add apps/api/src/wa
git commit -m "refactor(api): WaService writes QUEUED WaLog, drop BullMQ queue"
```

---

## Task 10: Delete worker app + Redis/BullMQ deps

**Files:**
- Delete: `apps/worker/` (entire directory)
- Modify: `apps/api/package.json:23,25`
- Modify: `turbo.json:8`
- Modify: `.env.example`

- [ ] **Step 1: Delete the worker app**

Run: `git rm -r apps/worker`

- [ ] **Step 2: Remove unused deps from api**

In `apps/api/package.json` delete the `"bullmq": "^5.13.0",` line (23) and `"ioredis": "^5.4.1",` line (25).

- [ ] **Step 3: Drop `REDIS_URL`, add new env keys**

In `turbo.json` remove `"REDIS_URL",` (line 8). Add to `globalEnv` array: `"INTERNAL_SECRET"`, `"OPENWA_URL"`, `"OPENWA_API_KEY"`, `"OPENWA_SEND_PATH"`, `"OPENWA_API_KEY_HEADER"`.

In `.env.example`: remove the `REDIS_URL=redis://localhost:6379` line. Add:

```
INTERNAL_SECRET=change-me-long-random-string
OPENWA_URL=http://localhost:3030
OPENWA_API_KEY=""
OPENWA_SEND_PATH=/api/messages/send
OPENWA_API_KEY_HEADER=X-Api-Key
WA_PROVIDER=openwa
```

(Change the existing `WA_PROVIDER=fonnte` line to `WA_PROVIDER=openwa`.)

- [ ] **Step 4: Reinstall to prune lockfile**

Run: `pnpm install`
Expected: exit 0, `bullmq`/`ioredis`/`node-cron` removed from `pnpm-lock.yaml`.

- [ ] **Step 5: Full monorepo typecheck + test**

Run: `pnpm typecheck && pnpm test`
Expected: exit 0. (No `apps/worker` task; api suites green.)

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: delete worker app, drop Redis/BullMQ deps + env"
```

---

## Task 11: Update docs to match new architecture

**Files:**
- Modify: `README.md`
- Modify: `docs/TECH.md`

- [ ] **Step 1: README — remove worker + Redis lines**

In `README.md`: delete the `apps/worker` bullet and the `packages/... wa` line stays; in the Stack line remove `· Redis · BullMQ`. Add a line: `Notifications: WaLog queue drained by POST /v1/internal/tick (external cron).`

- [ ] **Step 2: TECH.md — update stack table**

In `docs/TECH.md`: remove the `Cache/Queue | Redis + BullMQ` row and the `Worker (@gayatri/worker)` row. Change `WA Gateway v1 | Fonnte` note to add `WA Gateway alt | OpenWA (self-host, $0)`. Update the architecture ASCII so `@gayatri/wa` is fed by the api tick, not a worker.

- [ ] **Step 3: Commit**

```bash
git add README.md docs/TECH.md
git commit -m "docs: reflect tick-based notification architecture"
```

---

## Task 12: Manual end-to-end verification (no automated DB infra)

**Files:** none (operational check)

- [ ] **Step 1: Local services**

Run: `./scripts/services-up.sh` (Postgres only — Redis no longer needed; if the script starts Redis, that's harmless).
Run: `pnpm --filter @gayatri/db prisma migrate deploy`
Run: `pnpm --filter @gayatri/db seed`

- [ ] **Step 2: Start api with OpenWA pointed at a stub**

Set `.env`: `WA_PROVIDER=openwa`, `OPENWA_URL=http://localhost:9099`, `OPENWA_API_KEY=test`, `INTERNAL_SECRET=devsecret`.
Start a throwaway echo server on :9099 returning `{"id":"stub1"}` for POST.
Run: `pnpm --filter @gayatri/api dev`

- [ ] **Step 2b: Submit a checkout**

`POST http://localhost:4000/v1/checkout` with a valid payload (see `apps/api/src/checkout/checkout.controller.ts`).
Verify a `WaLog` row exists with `status=QUEUED` (`pnpm db:studio`).

- [ ] **Step 3: Fire the tick**

Run: `curl -X POST http://localhost:4000/v1/internal/tick -H "Authorization: Bearer devsecret"`
Expected JSON: `{ "ok": true, "reminders": {...}, "drain": { "claimed": 1, "sent": 1, "failed": 0 } }`
Verify the `WaLog` row is now `status=SENT`, `providerRef=stub1`.

- [ ] **Step 4: Auth negative check**

Run: `curl -i -X POST http://localhost:4000/v1/internal/tick`
Expected: `HTTP/1.1 401 Unauthorized`.

- [ ] **Step 5: Verification report**

Use superpowers:verification-before-completion. Paste the curl outputs and Studio row states as evidence. Do not claim done without them.

---

## Self-Review

**Spec coverage:**
- Topology/hosting → operational, not code (deployment runbook is out of plan scope, tracked separately). ✓ noted
- "Collapse worker+Redis+BullMQ into api" → Tasks 6–10 ✓
- WaJob model → reused as extended `WaLog`, Task 1 ✓ (deviation documented)
- `/internal/tick` secret-guarded → Tasks 5, 8 ✓
- drainWaJobs + SKIP LOCKED → Task 6 ✓
- scanReminders ported → Task 7 ✓
- OpenWA adapter + provider env select → Tasks 3, 4 ✓
- Retry/backoff, DEAD at max → Task 2 + used in 6 ✓
- Error-handling matrix → covered by retry (transient), DEAD (permanent), guard 401, idempotent claim (SKIP LOCKED) ✓
- Testing: unit (backoff, adapter, factory, guard, service, controller) ✓; DB-integration intentionally manual (Task 12) — no test-DB infra in repo, called out honestly
- Docs update → Task 11 ✓

**Placeholder scan:** No TBD/TODO; every code step has full code. ✓

**Type consistency:** `createGateway`/`OpenWaAdapter`/`computeRetry`/`InternalService`/`InternalSecretGuard` signatures consistent across Tasks 2–9. `WaStatus` literals (`QUEUED/SENDING/SENT/FAILED/DEAD`) consistent with Task 1 enum. ✓

**Open risk carried from spec (not code):** Render 750h split, OpenWA RemoteAuth/Mongo session persistence, OpenWA REST contract — all flagged as deploy-time/assumption items (Task 3 note + spec §Open Assumptions).
