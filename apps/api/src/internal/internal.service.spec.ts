import { InternalService } from './internal.service'
import { MAX_ATTEMPTS } from './backoff'

const tpl = { code: 'T-CUS-001', body: 'Hi {name}', active: true }

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
      { id: 'log1', to: '628111', template: 'T-CUS-001', payload: { name: 'Ana' }, attempts: 1 }
    ])
    const gw = { name: 'openwa', send: jest.fn().mockResolvedValue({ ok: true, providerRef: 'r1' }) }
    const svc = new InternalService(db, () => gw as any)

    const out = await svc.drainWaJobs()

    expect(gw.send).toHaveBeenCalledWith('628111', 'Hi Ana')
    expect(db.waLog.update).toHaveBeenCalledWith({
      where: { id: 'log1' },
      data: expect.objectContaining({ status: 'SENT', provider: 'openwa', providerRef: 'r1' })
    })
    expect(out).toEqual({ claimed: 1, sent: 1, failed: 0 })
  })

  it('applies retry/backoff on send failure', async () => {
    const db = makeDb([
      { id: 'log2', to: '628222', template: 'T-CUS-001', payload: { name: 'B' }, attempts: 1 }
    ])
    const gw = { name: 'openwa', send: jest.fn().mockResolvedValue({ ok: false, error: 'down' }) }
    const svc = new InternalService(db, () => gw as any)

    const out = await svc.drainWaJobs()

    expect(db.waLog.update).toHaveBeenCalledWith({
      where: { id: 'log2' },
      data: expect.objectContaining({ status: 'FAILED', attempts: 1, provider: 'openwa', error: 'down' })
    })
    expect(out).toEqual({ claimed: 1, sent: 0, failed: 1 })
  })

  it('marks row DEAD immediately when template deleted (no retry, no send)', async () => {
    const db = makeDb([{ id: 'log3', to: '628333', template: 'GONE', payload: {}, attempts: 1 }])
    db.waTemplate.findUnique.mockResolvedValue(null)
    const gw = { name: 'openwa', send: jest.fn() }
    const svc = new InternalService(db, () => gw as any)

    await svc.drainWaJobs()

    expect(gw.send).not.toHaveBeenCalled()
    expect(db.waLog.update).toHaveBeenCalledWith({
      where: { id: 'log3' },
      data: expect.objectContaining({ status: 'DEAD', error: 'template deleted' })
    })
  })

  it('retries (FAILED) when template inactive', async () => {
    const db = makeDb([
      { id: 'log4', to: '628444', template: 'T-CUS-001', payload: { name: 'C' }, attempts: 1 }
    ])
    db.waTemplate.findUnique.mockResolvedValue({ code: 'T-CUS-001', body: 'Hi {name}', active: false })
    const gw = { name: 'openwa', send: jest.fn() }
    const svc = new InternalService(db, () => gw as any)

    await svc.drainWaJobs()

    expect(gw.send).not.toHaveBeenCalled()
    expect(db.waLog.update).toHaveBeenCalledWith({
      where: { id: 'log4' },
      data: expect.objectContaining({ status: 'FAILED', attempts: 1, error: 'template inactive' })
    })
  })

  it('marks DEAD at MAX_ATTEMPTS on send failure', async () => {
    const db = makeDb([
      { id: 'log5', to: '628555', template: 'T-CUS-001', payload: { name: 'D' }, attempts: MAX_ATTEMPTS }
    ])
    const gw = { name: 'openwa', send: jest.fn().mockResolvedValue({ ok: false, error: 'down' }) }
    const svc = new InternalService(db, () => gw as any)

    await svc.drainWaJobs()

    expect(db.waLog.update).toHaveBeenCalledWith({
      where: { id: 'log5' },
      data: expect.objectContaining({ status: 'DEAD', attempts: MAX_ATTEMPTS })
    })
  })

  it('no-ops when gateway unconfigured', async () => {
    const db = makeDb([])
    const svc = new InternalService(db, () => null)
    expect(await svc.drainWaJobs()).toEqual({ claimed: 0, sent: 0, failed: 0 })
    expect(db.$queryRawUnsafe).not.toHaveBeenCalled()
  })
})

describe('CLAIM_SQL (lease + crash-safety)', () => {
  it('reclaims stale SENDING rows and sets a lease on claim', () => {
    const { CLAIM_SQL } = require('./internal.service')
    expect(CLAIM_SQL).toContain('FOR UPDATE SKIP LOCKED')
    expect(CLAIM_SQL).toContain("'SENDING'")
    expect(CLAIM_SQL).toMatch(/status\s*=\s*'SENDING'/)
    expect(CLAIM_SQL).toMatch(/SET\s+status\s*=\s*'SENDING'/i)
    expect(CLAIM_SQL).toMatch(/interval\s+'10 minutes'/i)
    expect(CLAIM_SQL).toMatch(/"nextRunAt"\s*<=\s*now\(\)/)
    expect(CLAIM_SQL).toMatch(/attempts\s*=\s*attempts\s*\+\s*1/)
    expect(CLAIM_SQL).toMatch(/OR\s*\(\s*status\s*=\s*'SENDING'\s*AND\s*attempts\s*</)
    expect(CLAIM_SQL).toMatch(/RETURNING[\s\S]*w\.attempts/)
  })
})
