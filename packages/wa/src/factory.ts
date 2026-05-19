import type { WaGateway } from './gateway.ts'
import { FonnteAdapter } from './fonnte.ts'
import { OpenWaAdapter } from './openwa.ts'

export type WaEnv = {
  WA_PROVIDER?: string
  FONNTE_TOKEN?: string
  OPENWA_URL?: string
  OPENWA_API_KEY?: string
  OPENWA_SEND_PATH?: string
  OPENWA_API_KEY_HEADER?: string
}

/** Returns null when the selected provider is not configured (caller logs + idles). */
// process.env is structurally compatible (all fields string|undefined); cast is safe
export function createGateway(env: WaEnv = process.env as WaEnv): WaGateway | null {
  const provider = env.WA_PROVIDER ?? 'fonnte'
  if (provider === 'fonnte') {
    if (!env.FONNTE_TOKEN) return null
    return new FonnteAdapter({ token: env.FONNTE_TOKEN })
  }
  if (provider === 'openwa') {
    if (!env.OPENWA_URL || !env.OPENWA_API_KEY) return null
    return new OpenWaAdapter({
      baseUrl: env.OPENWA_URL,
      apiKey: env.OPENWA_API_KEY,
      sendPath: env.OPENWA_SEND_PATH,
      apiKeyHeader: env.OPENWA_API_KEY_HEADER
    })
  }
  throw new Error(`Unsupported WA provider: ${provider}`)
}
