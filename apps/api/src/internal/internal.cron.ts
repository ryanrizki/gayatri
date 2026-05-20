import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { InternalService } from './internal.service'

/**
 * Self-cron for WA drain + reminders. Enabled in dev by default so checkouts
 * deliver WhatsApp automatically without an external scheduler.
 *
 * Set INTERNAL_CRON_ENABLED=false to disable (e.g. when using cron-job.org
 * to hit /v1/internal/tick instead, to avoid double-firing in prod).
 */
@Injectable()
export class InternalCron {
  private readonly logger = new Logger('InternalCron')
  private readonly enabled = (process.env.INTERNAL_CRON_ENABLED ?? 'true') !== 'false'
  private running = false

  constructor(private readonly svc: InternalService) {
    this.logger.log(`self-cron ${this.enabled ? 'ENABLED' : 'DISABLED'}`)
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async tick() {
    if (!this.enabled || this.running) return
    this.running = true
    try {
      const drain = await this.svc.drainWaJobs()
      const reminders = await this.svc.scanReminders()
      if (drain.claimed > 0 || reminders.h1 > 0 || reminders.h3 > 0) {
        this.logger.log(
          `tick: drained=${drain.claimed} sent=${drain.sent} failed=${drain.failed} h1=${reminders.h1} h3=${reminders.h3}`
        )
      }
    } catch (err) {
      this.logger.error('tick failed', err instanceof Error ? err.stack : String(err))
    } finally {
      this.running = false
    }
  }
}
