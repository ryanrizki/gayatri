# ADR-0001 — WhatsApp gateway: Baileys via local bridge

**Status:** accepted, 2026-05-20
**Supersedes:** initial assumption (open-wa via puppeteer; Fonnte as fallback)

## Context

API enqueues outbound WhatsApp into `WaLog` and drains via `WaGateway.send()`.
`WA_PROVIDER=openwa` is the default in `.env.example`; `fonnte` is the alternative.

Three concrete gateways were tried locally:

1. **Fonnte** (hosted) — provided account token rejected by `/validate` and
   `/send`: `{"reason":"invalid token"}`. Fonnte's send API requires a
   per-device token issued from Device → Token, plus a connected WhatsApp
   device. Also recurring cost.
2. **@open-wa/wa-automate 4.76.0** (latest) — installed, launched real Chrome,
   page loaded, then `puppeteer.waitForFunction` timed out at 30s. Library has
   not kept up with current WhatsApp Web UI; no newer release available.
3. **Baileys** (`@whiskeysockets/baileys`) — speaks the WhatsApp Multi-Device
   WebSocket protocol directly. No Chromium, no UI scraping, actively
   maintained.

## Decision

Use **Baileys** for local/dev WA sending, wrapped in a tiny bridge
(`scripts/wa-openwa-bridge.mjs`) that exposes the existing `OpenWaAdapter`
contract:

```
POST /api/messages/send   X-Api-Key: <key>   body {to,message} -> {id}
```

The bridge means we keep `WA_PROVIDER=openwa` and the existing
`OpenWaAdapter` unchanged — Baileys is a Node-only implementation detail
behind the same REST surface as a real OpenWA server.

`scripts/wa-stub.mjs` honours the same contract for tests without scanning
a QR.

Fonnte remains supported (`WA_PROVIDER=fonnte`) for users who already have
a device token and prefer a hosted gateway.

## Consequences

**Pros**
- Free, no third-party dependency.
- ~300MB Chromium dep avoided (open-wa).
- Same wire contract — no API code changes when swapping bridge ↔ stub
  ↔ a remote OpenWA install.

**Cons**
- Baileys is unofficial → small risk of WhatsApp banning the linked
  number. Use a dedicated/burner number.
- Bridge process must stay running and online for sends to leave the box.
- Session lives in `.wa-session/` (gitignored) — relink on logout.
- Baileys ≥6.7.18 declares Node ≥20. On Node 18 we polyfill
  `globalThis.crypto` (see bridge script) and install with
  `pnpm add --ignore-scripts`.

## Notes

Phone normalisation: API enqueues `to` as digits, bridge converts to
Baileys jid `<digits>@s.whatsapp.net`. Both `08…` and `+62…` inputs are
normalised to `62…`.
