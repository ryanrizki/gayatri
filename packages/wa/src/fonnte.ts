import type { WaGateway, WaSendResult } from './gateway.ts'
import { normalizePhone } from './phone.ts'

export interface FonnteConfig {
  token: string
  baseUrl?: string
}

export class FonnteAdapter implements WaGateway {
  readonly name = 'fonnte'
  private token: string
  private baseUrl: string

  constructor(cfg: FonnteConfig) {
    if (!cfg.token) throw new Error('FonnteAdapter: token required')
    this.token = cfg.token
    this.baseUrl = cfg.baseUrl ?? 'https://api.fonnte.com'
  }

  async send(to: string, body: string): Promise<WaSendResult> {
    const target = normalizePhone(to)
    if (!target) return { ok: false, error: 'invalid phone' }

    const form = new URLSearchParams()
    form.set('target', target)
    form.set('message', body)
    form.set('countryCode', '62')

    try {
      const res = await fetch(`${this.baseUrl}/send`, {
        method: 'POST',
        headers: {
          Authorization: this.token,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: form.toString()
      })
      const json = (await res.json().catch(() => ({}))) as {
        status?: boolean
        id?: string | string[]
        reason?: string
      }

      if (!res.ok || json.status === false) {
        return { ok: false, error: json.reason ?? `http ${res.status}` }
      }
      const ref = Array.isArray(json.id) ? json.id[0] : json.id
      return { ok: true, providerRef: ref }
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : 'unknown' }
    }
  }
}
