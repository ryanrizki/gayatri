import cron from 'node-cron'
import { Queue } from 'bullmq'
import IORedis from 'ioredis'
import { prisma } from '@gayatri/db'
import { renderTemplate, normalizePhone } from '@gayatri/wa'

const QUEUE = 'wa-send'

interface ReminderRow {
  id: string
  code: string
  scheduledAt: Date
  customer: { name: string; phone: string }
  child: { name: string } | null
  branch: { address: string } | null
}

function range(centerMs: number, halfWindowMs: number) {
  return { gte: new Date(centerMs - halfWindowMs), lte: new Date(centerMs + halfWindowMs) }
}

async function enqueueReminder(
  queue: Queue,
  c: ReminderRow,
  templateCode: 'T-CUS-005' | 'T-CUS-006',
  vars: Record<string, string>
) {
  const tpl = await prisma.waTemplate.findUnique({ where: { code: templateCode } })
  if (!tpl || !tpl.active) return
  const phone = normalizePhone(c.customer.phone)
  if (!phone) return
  const body = renderTemplate(tpl.body, vars)

  const log = await prisma.waLog.create({
    data: {
      checkoutId: c.id,
      to: phone,
      template: templateCode,
      payload: vars as object,
      status: 'QUEUED',
      provider: process.env.WA_PROVIDER ?? 'fonnte'
    }
  })

  await queue.add(templateCode, { logId: log.id, to: phone, body }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5_000 }
  })
}

export function startReminderCron() {
  const url = process.env.REDIS_URL ?? 'redis://localhost:6379'
  const connection = new IORedis(url, { maxRetriesPerRequest: null })
  const queue = new Queue(QUEUE, { connection })
  const HALF_WINDOW = 7.5 * 60_000 // 15min total window

  cron.schedule('*/15 * * * *', async () => {
    const now = Date.now()
    try {
      // H-1: 24h ahead
      const h1Window = range(now + 24 * 3600_000, HALF_WINDOW)
      const h1List = await prisma.checkout.findMany({
        where: {
          status: { in: ['CONFIRMED', 'RESCHEDULED'] },
          reminderH1Sent: false,
          scheduledAt: h1Window
        },
        include: { customer: true, child: true, branch: true }
      })
      for (const c of h1List) {
        await enqueueReminder(queue, c as unknown as ReminderRow, 'T-CUS-005', {
          hour: c.scheduledAt!.toLocaleTimeString('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit' }),
          baby_name: c.child?.name ?? c.customer.name,
          address: c.branch?.address ?? '-'
        })
        await prisma.checkout.update({ where: { id: c.id }, data: { reminderH1Sent: true } })
      }

      // H-3jam: 3h ahead
      const h3Window = range(now + 3 * 3600_000, HALF_WINDOW)
      const h3List = await prisma.checkout.findMany({
        where: {
          status: { in: ['CONFIRMED', 'RESCHEDULED'] },
          reminderH3Sent: false,
          scheduledAt: h3Window
        },
        include: { customer: true, child: true, branch: true }
      })
      for (const c of h3List) {
        await enqueueReminder(queue, c as unknown as ReminderRow, 'T-CUS-006', {
          baby_name: c.child?.name ?? c.customer.name
        })
        await prisma.checkout.update({ where: { id: c.id }, data: { reminderH3Sent: true } })
      }

      if (h1List.length || h3List.length) {
        console.log(`[reminder.cron] H1=${h1List.length} H3=${h3List.length}`)
      }
    } catch (err) {
      console.error('[reminder.cron] error', err)
    }
  }, { timezone: process.env.TZ ?? 'Asia/Jakarta' })

  console.log('[reminder.cron] scheduled */15 * * * *')
}
