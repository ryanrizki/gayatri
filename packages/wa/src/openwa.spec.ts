import { OpenWaAdapter } from './openwa.ts'

describe('OpenWaAdapter', () => {
  const cfg = { baseUrl: 'http://openwa.local', apiKey: 'k1' }

  afterEach(() => jest.restoreAllMocks())

  it('rejects invalid phone without calling fetch', async () => {
    const spy = jest.spyOn(global, 'fetch')
    const res = await new OpenWaAdapter(cfg).send('not-a-phone', 'hi')
    expect(res).toEqual({ ok: false, error: 'invalid phone' })
    expect(spy).not.toHaveBeenCalled()
  })

  it('posts to send path with api key and returns providerRef', async () => {
    const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: 'abc' }), { status: 200 })
    )
    const res = await new OpenWaAdapter(cfg).send('08123456789', 'hello')
    expect(res).toEqual({ ok: true, providerRef: 'abc' })
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('http://openwa.local/api/messages/send')
    expect((init!.headers as Record<string, string>)['X-Api-Key']).toBe('k1')
    expect(JSON.parse(init!.body as string)).toEqual({ to: '628123456789', message: 'hello' })
  })

  it('maps non-2xx to ok:false with reason', async () => {
    jest.spyOn(global, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ error: 'no session' }), { status: 503 })
    )
    const res = await new OpenWaAdapter(cfg).send('08123456789', 'hi')
    expect(res.ok).toBe(false)
    expect(res.error).toContain('no session')
  })

  it('maps thrown fetch error to ok:false', async () => {
    jest.spyOn(global, 'fetch').mockRejectedValue(new Error('econnrefused'))
    const res = await new OpenWaAdapter(cfg).send('08123456789', 'hi')
    expect(res).toEqual({ ok: false, error: 'econnrefused' })
  })
})
