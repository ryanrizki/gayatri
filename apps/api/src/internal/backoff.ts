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
    return { attempts, status: 'DEAD', nextRunAt: new Date(now.getTime()) }
  }
  return { attempts, status: 'FAILED', nextRunAt: new Date(now.getTime() + attempts * 5 * 60_000) }
}
