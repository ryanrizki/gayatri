import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '../prisma.service'
import { createGateway, renderTemplate } from '@gayatri/wa'
import type { WaGateway } from '@gayatri/wa'
import { computeRetry, MAX_ATTEMPTS } from './backoff'

const CLAIM_BATCH = 20

/**
 * Claims due WhatsApp jobs with row-level locking.
 * Lease model (crash-safety): claiming sets nextRunAt = now() + 10 min AND
 * increments attempts atomically (attempts = attempts + 1), so a process crash
 * mid-send still advances the row toward DEAD without needing a separate update.
 * Eligible rows: QUEUED/FAILED past their backoff (attempts < MAX_ATTEMPTS), OR
 * SENDING rows whose lease expired and attempts < MAX_ATTEMPTS (bounds crashed
 * rows so they cannot be reclaimed forever).
 * SKIP LOCKED makes concurrent ticks safe (no double-claim).
 *
 * CLAIM_SQL is a fully static string (CLAIM_BATCH and MAX_ATTEMPTS are code
 * constants, not user input), so $queryRawUnsafe is safe here.
 * Known terminal state: a row that crashes on its final (MAX_ATTEMPTS-th) attempt stays status=SENDING with attempts=MAX_ATTEMPTS and is never reclaimed (bounded — no loop, no slot consumption). Operational queries for stuck/dead jobs must check status='DEAD' OR (status='SENDING' AND attempts>=MAX_ATTEMPTS).
 */
export const CLAIM_SQL = `
WITH claimed AS (
  SELECT id FROM "WaLog"
  WHERE "nextRunAt" <= now()
    AND (
      (status IN ('QUEUED','FAILED') AND attempts < ${MAX_ATTEMPTS})
      OR (status = 'SENDING' AND attempts < ${MAX_ATTEMPTS})
    )
  ORDER BY "nextRunAt" ASC
  LIMIT ${CLAIM_BATCH}
  FOR UPDATE SKIP LOCKED
)
UPDATE "WaLog" w
SET status = 'SENDING', attempts = attempts + 1, "nextRunAt" = now() + interval '10 minutes'
FROM claimed
WHERE w.id = claimed.id
RETURNING w.id, w."to" AS "to", w.template, w.payload, w.attempts`

interface ClaimedRow {
  id: string
  to: string
  template: string
  // pg driver auto-parses JSON/JSONB columns into JS objects (Prisma $queryRawUnsafe returns parsed payload)
  payload: Record<string, unknown>
  attempts: number
}

// M5: exported so Task 8 NestJS wiring can reference the type
export type GatewayFactory = () => WaGateway | null

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

      if (!tpl) {
        // Template DELETED — permanent failure, must NOT retry
        await this.db.waLog.update({
          where: { id: row.id },
          data: {
            status: 'DEAD',
            attempts: row.attempts,
            nextRunAt: new Date(),
            error: 'template deleted'
          }
        })
        failed++
        continue
      }

      if (!tpl.active) {
        // Template deactivated by admin — reversible, retry via backoff
        const r = computeRetry(row.attempts)
        await this.db.waLog.update({
          where: { id: row.id },
          data: {
            status: r.status,
            attempts: r.attempts,
            nextRunAt: r.nextRunAt,
            error: 'template inactive'
          }
        })
        failed++
        continue
      }

      const body = renderTemplate(tpl.body, row.payload as Record<string, string | number | undefined | null>)
      const res = await gw.send(row.to, body)

      if (res.ok) {
        await this.db.waLog.update({
          where: { id: row.id },
          data: { status: 'SENT', sentAt: new Date(), provider: gw.name, providerRef: res.providerRef ?? null }
        })
        sent++
      } else {
        const r = computeRetry(row.attempts)
        await this.db.waLog.update({
          where: { id: row.id },
          data: {
            status: r.status,
            attempts: r.attempts,
            nextRunAt: r.nextRunAt,
            provider: gw.name,
            error: res.error ?? 'unknown'
          }
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
