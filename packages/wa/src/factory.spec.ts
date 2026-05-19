import { createGateway } from './factory.ts'
import { FonnteAdapter } from './fonnte.ts'
import { OpenWaAdapter } from './openwa.ts'

describe('createGateway', () => {
  it('returns FonnteAdapter for provider=fonnte with token', () => {
    const gw = createGateway({ WA_PROVIDER: 'fonnte', FONNTE_TOKEN: 't' })
    expect(gw).toBeInstanceOf(FonnteAdapter)
  })

  it('returns null when fonnte token missing', () => {
    expect(createGateway({ WA_PROVIDER: 'fonnte' })).toBeNull()
  })

  it('returns OpenWaAdapter for provider=openwa with url+key', () => {
    const gw = createGateway({ WA_PROVIDER: 'openwa', OPENWA_URL: 'http://x', OPENWA_API_KEY: 'k' })
    expect(gw).toBeInstanceOf(OpenWaAdapter)
  })

  it('returns null when openwa url/key missing', () => {
    expect(createGateway({ WA_PROVIDER: 'openwa', OPENWA_URL: 'http://x' })).toBeNull()
  })

  it('defaults provider to fonnte', () => {
    expect(createGateway({ FONNTE_TOKEN: 't' })).toBeInstanceOf(FonnteAdapter)
  })

  it('throws on unknown provider', () => {
    expect(() => createGateway({ WA_PROVIDER: 'sms' })).toThrow('Unsupported WA provider: sms')
  })
})
