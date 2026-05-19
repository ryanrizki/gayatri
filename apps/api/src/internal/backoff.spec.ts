import { computeRetry, MAX_ATTEMPTS } from './backoff'

describe('computeRetry', () => {
  const now = new Date('2026-05-19T00:00:00.000Z')

  it('schedules attempt 1 five minutes out, stays FAILED', () => {
    const r = computeRetry(1, now)
    expect(r.status).toBe('FAILED')
    expect(r.attempts).toBe(1)
    expect(r.nextRunAt.getTime()).toBe(now.getTime() + 1 * 5 * 60_000)
  })

  it('backoff grows linearly with attempts', () => {
    expect(computeRetry(3, now).nextRunAt.getTime()).toBe(now.getTime() + 3 * 5 * 60_000)
  })

  it('marks DEAD at MAX_ATTEMPTS', () => {
    const r = computeRetry(MAX_ATTEMPTS, now)
    expect(r.attempts).toBe(MAX_ATTEMPTS)
    expect(r.status).toBe('DEAD')
    expect(r.nextRunAt.getTime()).toBe(now.getTime())
  })
})
