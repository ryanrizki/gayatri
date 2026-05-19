import { InternalController } from './internal.controller'

describe('InternalController', () => {
  it('tick runs drain + reminders and returns combined result', async () => {
    const svc = {
      drainWaJobs: jest.fn().mockResolvedValue({ claimed: 2, sent: 2, failed: 0 }),
      scanReminders: jest.fn().mockResolvedValue({ h1: 1, h3: 0 })
    } as any
    const out = await new InternalController(svc).tick()
    expect(svc.scanReminders).toHaveBeenCalled()
    expect(svc.drainWaJobs).toHaveBeenCalled()
    expect(out).toEqual({ ok: true, reminders: { h1: 1, h3: 0 }, drain: { claimed: 2, sent: 2, failed: 0 } })
  })
})
