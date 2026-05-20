// Local fake WhatsApp gateway for testing — speaks the OpenWA REST contract.
// POST /api/messages/send  { to, message }  ->  { id: "stub-<n>" }
// Logs every message to stdout + /tmp/wa-stub.log. NO real WhatsApp is sent.
//
// Run:  node scripts/wa-stub.mjs            (port 9099 default)
//       WA_STUB_PORT=9100 node scripts/wa-stub.mjs
import { createServer } from 'node:http'
import { appendFileSync } from 'node:fs'

const PORT = Number(process.env.WA_STUB_PORT ?? 9099)
const LOG = '/tmp/wa-stub.log'
let n = 0

const server = createServer((req, res) => {
  if (req.method !== 'POST') {
    res.writeHead(404).end()
    return
  }
  let raw = ''
  req.on('data', (c) => (raw += c))
  req.on('end', () => {
    let parsed
    try {
      parsed = JSON.parse(raw || '{}')
    } catch {
      parsed = { raw }
    }
    const id = `stub-${++n}`
    const line = `${new Date().toISOString()} #${id} -> ${parsed.to}\n${parsed.message}\n---`
    console.log(line)
    try {
      appendFileSync(LOG, line + '\n')
    } catch {
      /* ignore */
    }
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ id }))
  })
})

server.listen(PORT, () => {
  console.log(`[wa-stub] listening :${PORT}  (log: ${LOG})  — fake WA, nothing real sent`)
})
