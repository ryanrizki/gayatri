import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { existsSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { webcrypto } from 'node:crypto'
import * as QR from 'qrcode'

/**
 * In-process WhatsApp session, managed via admin UI.
 *
 * Lifecycle:
 *   DISCONNECTED -> connect() -> CONNECTING -> PENDING_QR -> CONNECTED
 *                                         \-> ERROR
 *   CONNECTED -> logout() -> LOGGED_OUT (creds wiped, must reconnect)
 *
 * Auto-reconnects on transient drops. Auto-resumes from cached session on boot.
 * Single-instance only (creds dir is filesystem-local).
 */
type SessionState =
  | 'DISCONNECTED'
  | 'CONNECTING'
  | 'PENDING_QR'
  | 'CONNECTED'
  | 'LOGGED_OUT'
  | 'ERROR'

@Injectable()
export class WaSessionService implements OnModuleInit {
  private readonly logger = new Logger('WaSession')
  private readonly sessionDir = join(process.cwd(), '.wa-session-api')

  private state: SessionState = 'DISCONNECTED'
  private currentQr: string | null = null
  private currentQrPng: string | null = null
  private meId: string | null = null
  private lastError: string | null = null
  private sock: unknown = null
  // Track reconnect so admin sees CONNECTING after transient drop.
  private reconnectTimer: NodeJS.Timeout | null = null

  async onModuleInit() {
    // Polyfill for Node <19: Baileys uses globalThis.crypto.subtle.
    if (!globalThis.crypto) (globalThis as { crypto: unknown }).crypto = webcrypto

    // Auto-resume if existing creds — admin doesn't need to click Connect again
    // after every API restart.
    if (existsSync(join(this.sessionDir, 'creds.json'))) {
      this.logger.log('found cached creds — auto-resuming')
      this.connect().catch((e) => this.logger.warn(`auto-resume failed: ${e instanceof Error ? e.message : e}`))
    }
  }

  status() {
    return {
      state: this.state,
      qr: this.currentQr,
      qrPng: this.currentQrPng, // data:image/png;base64,... for direct <img src>
      meId: this.meId,
      lastError: this.lastError
    }
  }

  async connect(): Promise<void> {
    if (
      this.state === 'CONNECTING' ||
      this.state === 'PENDING_QR' ||
      this.state === 'CONNECTED'
    ) {
      this.logger.log(`connect ignored (state=${this.state})`)
      return
    }
    this.state = 'CONNECTING'
    this.lastError = null
    this.currentQr = null
    this.currentQrPng = null

    try {
      // Dynamic import keeps Baileys (heavy) out of cold-start when WA_PROVIDER!=internal.
      const baileys = await import('@whiskeysockets/baileys')
      const makeWASocket = baileys.default as unknown as (opts: unknown) => unknown
      const { useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason } = baileys

      const { state: authState, saveCreds } = await useMultiFileAuthState(this.sessionDir)
      const { version } = await fetchLatestBaileysVersion()
      const sock = makeWASocket({
        version,
        auth: authState,
        printQRInTerminal: false,
        browser: ['Gayatri Admin', 'Chrome', '1.0.0']
      }) as {
        ev: {
          on: (
            event: string,
            cb: (u: { qr?: string; connection?: string; lastDisconnect?: { error?: { output?: { statusCode?: number } } } }) => void
          ) => void
        }
        user?: { id?: string }
        sendMessage: (jid: string, content: { text: string }) => Promise<{ key?: { id?: string } }>
        logout: () => Promise<void>
      }
      this.sock = sock

      sock.ev.on('creds.update', () => {
        void saveCreds()
      })

      sock.ev.on('connection.update', (u) => {
        if (u.qr) {
          this.currentQr = u.qr
          this.state = 'PENDING_QR'
          // Cache QR PNG for the UI (~3KB base64); regen only when qr changes.
          QR.toDataURL(u.qr, { width: 300, margin: 1 })
            .then((png) => {
              this.currentQrPng = png
            })
            .catch((e: unknown) => this.logger.warn(`qr render failed: ${e instanceof Error ? e.message : String(e)}`))
          this.logger.log('QR ready — scan via WhatsApp Linked Devices')
        }
        if (u.connection === 'open') {
          this.state = 'CONNECTED'
          this.currentQr = null
          this.currentQrPng = null
          this.meId = sock.user?.id ?? null
          this.lastError = null
          this.logger.log(`connected as ${this.meId}`)
        }
        if (u.connection === 'close') {
          const code = u.lastDisconnect?.error?.output?.statusCode
          const loggedOut = code === DisconnectReason.loggedOut
          this.sock = null
          if (loggedOut) {
            this.state = 'LOGGED_OUT'
            this.meId = null
            this.logger.warn('logged out — re-scan QR to reconnect')
          } else {
            this.state = 'CONNECTING'
            this.logger.warn(`disconnected (code=${code}) — reconnecting in 2s`)
            this.scheduleReconnect()
          }
        }
      })
    } catch (err) {
      this.state = 'ERROR'
      this.lastError = err instanceof Error ? err.message : String(err)
      this.logger.error(`connect failed: ${this.lastError}`)
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      // reset to DISCONNECTED so connect() proceeds
      this.state = 'DISCONNECTED'
      this.connect().catch((e) => this.logger.error(`reconnect failed: ${e instanceof Error ? e.message : e}`))
    }, 2000)
  }

  async logout(): Promise<void> {
    if (this.sock) {
      try {
        await (this.sock as { logout: () => Promise<void> }).logout()
      } catch (e) {
        this.logger.warn(`sock.logout error (ignored): ${e instanceof Error ? e.message : e}`)
      }
    }
    this.sock = null
    this.state = 'LOGGED_OUT'
    this.currentQr = null
    this.currentQrPng = null
    this.meId = null
    try {
      rmSync(this.sessionDir, { recursive: true, force: true })
    } catch {
      /* ignore */
    }
    this.logger.log('logged out + session wiped')
  }

  async send(to: string, message: string): Promise<{ ok: boolean; providerRef?: string; error?: string }> {
    if (this.state !== 'CONNECTED' || !this.sock) {
      return { ok: false, error: `wa not connected (state=${this.state})` }
    }
    // Normalize: 08xx/+62xx -> 62xx; Baileys jid format.
    let digits = String(to).replace(/[^\d]/g, '')
    if (digits.startsWith('0')) digits = '62' + digits.slice(1)
    if (!digits) return { ok: false, error: 'invalid recipient' }
    const jid = `${digits}@s.whatsapp.net`
    try {
      const r = await (this.sock as {
        sendMessage: (j: string, c: { text: string }) => Promise<{ key?: { id?: string } }>
      }).sendMessage(jid, { text: String(message) })
      return { ok: true, providerRef: r?.key?.id ?? 'unknown' }
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) }
    }
  }
}
