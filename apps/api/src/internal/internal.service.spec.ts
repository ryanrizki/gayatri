import { InternalService } from './internal.service'

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

describe('CLAIM_SQL (lease + crash-safety)', () => {
  it('reclaims stale SENDING rows and sets a lease on claim', () => {
    const { CLAIM_SQL } = require('./internal.service')
    expect(CLAIM_SQL).toContain('FOR UPDATE SKIP LOCKED')
    expect(CLAIM_SQL).toContain("'SENDING'")
    expect(CLAIM_SQL).toMatch(/status\s*=\s*'SENDING'/)
    expect(CLAIM_SQL).toMatch(/SET\s+status\s*=\s*'SENDING'/i)
    expect(CLAIM_SQL).toMatch(/interval\s+'10 minutes'/i)
  })
})
