export const MAX_ATTEMPTS = 5

export interface RetryDecision {
  attempts: number
  status: 'FAILED' | 'DEAD'
  nextRunAt: Date
}

/** attempts = the current attempt count (already incremented at claim time). */
export function computeRetry(attempts: number, now: Date = new Date()): RetryDecision {
  if (attempts >= MAX_ATTEMPTS) {
    return { attempts, status: 'DEAD', nextRunAt: new Date(now.getTime()) }
  }
  return { attempts, status: 'FAILED', nextRunAt: new Date(now.getTime() + attempts * 5 * 60_000) }
}
