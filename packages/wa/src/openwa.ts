/**
 * ASSUMPTION: REST contract for OpenWA gateway
 *
 * Request:  POST {baseUrl}{sendPath}
 *           Header: {apiKeyHeader}: <key>   (default header: X-Api-Key)
 *           Body (JSON): { "to": "<628..>", "message": "<text>" }
 *
 * Success:  HTTP 2xx  AND  JSON body { "id": "<ref>" }
 *           OR JSON body { "data": { "id": "<ref>" } }
 *
 * Failure:  HTTP non-2xx  →  { "error": "..." } | { "reason": "..." }
 *           - If the non-2xx body is missing/unparseable, error falls back to "http <status>".
 *
 * Defaults:
 *   sendPath    = /api/messages/send   (env-overridable via constructor config)
 *   apiKeyHeader = X-Api-Key           (env-overridable via constructor config)
 */

import type { WaGateway, WaSendResult } from './gateway.ts'
import { normalizePhone } from './phone.ts'

export interface OpenWaConfig {
  baseUrl: string
  apiKey: string
  sendPath?: string
  apiKeyHeader?: string
}

export class OpenWaAdapter implements WaGateway {
  readonly name = 'openwa'
  private baseUrl: string
  private apiKey: string
  private sendPath: string
  private apiKeyHeader: string

  constructor(cfg: OpenWaConfig) {
    if (!cfg.baseUrl) throw new Error('OpenWaAdapter: baseUrl required')
    if (!cfg.apiKey) throw new Error('OpenWaAdapter: apiKey required')
    this.baseUrl = cfg.baseUrl.replace(/\/$/, '')
    this.apiKey = cfg.apiKey
    this.sendPath = cfg.sendPath ?? '/api/messages/send'
    this.apiKeyHeader = cfg.apiKeyHeader ?? 'X-Api-Key'
  }

  async send(to: string, body: string): Promise<WaSendResult> {
    const target = normalizePhone(to)
    if (!target) return { ok: false, error: 'invalid phone' }
    try {
      const res = await fetch(`${this.baseUrl}${this.sendPath}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', [this.apiKeyHeader]: this.apiKey },
        body: JSON.stringify({ to: target, message: body })
      })
      const json = (await res.json().catch(() => ({}))) as {
        id?: string
        data?: { id?: string }
        error?: string
        reason?: string
      }
      if (!res.ok) {
        return { ok: false, error: json.error ?? json.reason ?? `http ${res.status}` }
      }
      const ref = json.id ?? json.data?.id
      return { ok: true, providerRef: ref }
    } catch (err) {
      return { ok: false, error: err instanceof Error ? err.message : 'unknown' }
    }
  }
}
