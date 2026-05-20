// Real WhatsApp bridge using @whiskeysockets/baileys (WhatsApp WebSocket protocol).
// No Chromium / no UI scraping — talks the WA Multi-Device protocol directly.
// Exposes the OpenWaAdapter contract so the API's WA drain can send REAL messages.
//
//   POST /api/messages/send   header X-Api-Key: <key>   body {to,message} -> {id}
//   GET  /healthz             -> {ok, connected}
//
// First run prints a QR — scan with WhatsApp on your phone:
//   Settings -> Linked Devices -> Link a Device
// Session is cached in `.wa-session/` (gitignored); no rescan unless logged out.
//
// Env:
//   WA_OPENWA_PORT  default 9099  (must match OPENWA_URL port in .env)
//   WA_OPENWA_KEY   default local-test  (must match OPENWA_API_KEY in .env)
//
// Run:  node scripts/wa-openwa-bridge.mjs
import { createServer } from 'node:http'
import { webcrypto } from 'node:crypto'

// Baileys uses globalThis.crypto.subtle which isn't auto-exposed on Node <19.
// Polyfill BEFORE importing baileys.
if (!globalThis.crypto) globalThis.crypto = webcrypto

const baileysPkg = (await import('@whiskeysockets/baileys')).default
const qrcode = (await import('qrcode-terminal')).default

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion
} = baileysPkg

const PORT = Number(process.env.WA_OPENWA_PORT ?? 9099)
const KEY = process.env.WA_OPENWA_KEY ?? 'local-test'
const SESSION_DIR = '.wa-session'

// 08xx / +62 / 62 -> bare international digits for Baileys jid (@s.whatsapp.net).
function toJid(raw) {
  let d = String(raw).replace(/[^\d]/g, '')
  if (d.startsWith('0')) d = '62' + d.slice(1)
  return `${d}@s.whatsapp.net`
}

let sock = null
let connected = false

function readJson(req) {
  return new Promise((resolve) => {
    let b = ''
    req.on('data', (c) => (b += c))
    req.on('end', () => {
      try {
        resolve(JSON.parse(b || '{}'))
      } catch {
        resolve({})
      }
    })
  })
}

const server = createServer(async (req, res) => {
  const json = (code, obj) => {
    res.writeHead(code, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify(obj))
  }

  if (req.method === 'GET' && req.url === '/healthz') {
    return json(200, { ok: true, connected })
  }

  if (req.method === 'POST' && req.url === '/api/messages/send') {
    if (req.headers['x-api-key'] !== KEY) return json(401, { error: 'bad api key' })
    if (!sock || !connected) return json(503, { error: 'whatsapp not connected' })
    const { to, message } = await readJson(req)
    if (!to || !message) return json(400, { error: 'to and message required' })
    try {
      const result = await sock.sendMessage(toJid(to), { text: String(message) })
      return json(200, { id: result?.key?.id ?? 'unknown' })
    } catch (err) {
      return json(502, { error: err instanceof Error ? err.message : 'send failed' })
    }
  }

  json(404, { error: 'not found' })
})

async function start() {
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR)
  const { version } = await fetchLatestBaileysVersion()
  console.log(`[openwa-bridge] starting Baileys (WA web v${version.join('.')})`)

  sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false, // render ourselves
    browser: ['Gayatri Bridge', 'Chrome', '1.0.0']
  })

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', (u) => {
    if (u.qr) {
      console.log('[openwa-bridge] scan this QR with WhatsApp (Linked Devices):')
      qrcode.generate(u.qr, { small: true })
    }
    if (u.connection === 'open') {
      connected = true
      console.log('[openwa-bridge] WhatsApp connected ✓')
    }
    if (u.connection === 'close') {
      connected = false
      const code = u.lastDisconnect?.error?.output?.statusCode
      const loggedOut = code === DisconnectReason.loggedOut
      console.log(`[openwa-bridge] disconnected (code=${code}, loggedOut=${loggedOut})`)
      if (loggedOut) {
        console.log('[openwa-bridge] logged out — delete .wa-session/ and restart to re-pair')
        process.exit(1)
      } else {
        console.log('[openwa-bridge] reconnecting...')
        setTimeout(start, 2000)
      }
    }
  })

  server.listening || server.listen(PORT, () =>
    console.log(`[openwa-bridge] HTTP listening :${PORT} — waiting for WA connect`)
  )
}

start().catch((e) => {
  console.error('[openwa-bridge] start failed:', e)
  process.exit(1)
})
