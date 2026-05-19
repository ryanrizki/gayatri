import { Worker } from 'bullmq'
import IORedis from 'ioredis'
import { prisma } from '@gayatri/db'
import { FonnteAdapter } from '@gayatri/wa'

const QUEUE = 'wa-send'

function gateway() {
  const provider = process.env.WA_PROVIDER ?? 'fonnte'
  if (provider === 'fonnte') {
    const token = process.env.FONNTE_TOKEN
    if (!token) return null
    return new FonnteAdapter({ token })
  }
  throw new Error(`Unsupported WA provider: ${provider}`)
}

export function startSendWorker() {
  const gw = gateway()
  if (!gw) {
    console.warn('[wa-send] WA provider not configured (FONNTE_TOKEN empty) — worker idle')
    return
  }
  const url = process.env.REDIS_URL ?? 'redis://localhost:6379'
  const connection = new IORedis(url, { maxRetriesPerRequest: null })

  const worker = new Worker<{ logId: string; to: string; body: string }>(
    QUEUE,
    async (job) => {
      const { logId, to, body } = job.data
      const res = await gw.send(to, body)
      if (res.ok) {
        await prisma.waLog.update({
          where: { id: logId },
          data: { status: 'SENT', sentAt: new Date(), providerRef: res.providerRef ?? null }
        })
      } else {
        await prisma.waLog.update({
          where: { id: logId },
          data: { status: 'FAILED', error: res.error ?? 'unknown' }
        })
        throw new Error(res.error ?? 'send failed')
      }
    },
    { connection, concurrency: 4 }
  )

  worker.on('failed', (job, err) => {
    console.error(`[wa:send] job ${job?.id} failed:`, err.message)
  })
  worker.on('completed', (job) => {
    console.log(`[wa:send] job ${job.id} sent`)
  })

  console.log(`[wa:send] worker started (provider=${gw.name})`)
}
