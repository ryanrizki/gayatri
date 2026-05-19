import { Injectable, Logger } from '@nestjs/common'
import { Queue } from 'bullmq'
import IORedis from 'ioredis'

export const WA_QUEUE = 'wa-send'

@Injectable()
export class WaQueue {
  private readonly logger = new Logger(WaQueue.name)
  readonly queue: Queue

  constructor() {
    const url = process.env.REDIS_URL ?? 'redis://localhost:6379'
    const connection = new IORedis(url, { maxRetriesPerRequest: null })
    this.queue = new Queue(WA_QUEUE, { connection })
    this.logger.log(`WA queue connected: ${WA_QUEUE}`)
  }

  enqueue(jobName: string, data: { logId: string; to: string; body: string }) {
    return this.queue.add(jobName, data, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 5_000 },
      removeOnComplete: 1000,
      removeOnFail: 5000
    })
  }
}
