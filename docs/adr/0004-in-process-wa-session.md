# ADR-0004 — In-process WhatsApp session managed from admin UI

**Status:** accepted, 2026-05-20
**Builds on:** [ADR-0001](0001-baileys-over-fonnte-and-openwa.md)

## Context

ADR-0001 added a standalone Baileys bridge (`scripts/wa-openwa-bridge.mjs`)
that the API talks to over HTTP via `OpenWaAdapter`. Pairing required SSH +
`node scripts/wa-openwa-bridge.mjs` in a terminal, scanning the QR there.

That is fine for developers but bad for operators ("admin"). They want to
pair the WhatsApp number from the admin web UI like any other setting.

## Decision

Embed the Baileys session inside the API process itself:

- New `WaSessionModule` (`apps/api/src/wa-session/`).
- `WaSessionService` — singleton with state machine
  `DISCONNECTED | CONNECTING | PENDING_QR | CONNECTED | LOGGED_OUT | ERROR`,
  cached in `.wa-session-api/` (gitignored). Auto-resumes from cached creds
  on API boot.
- `WaSessionController` exposes admin-only endpoints under
  `/v1/admin/wa-session/{status,connect,logout}`.
- `InternalWaGateway` implements `WaGateway` by calling
  `WaSessionService.send()` — no HTTP hop for the drain.
- `GATEWAY_FACTORY` in `InternalModule` switches between gateways at runtime:
  `WA_PROVIDER=internal` → `InternalWaGateway`, otherwise → `createGateway()`
  (existing openwa/fonnte path).
- Admin page `/wa/connect` (apps/admin) polls `/status` every 2s, renders
  the QR as a PNG (`qrcode` npm), and offers Connect / Logout buttons.

## Consequences

**Pros**
- Operator-grade UX — no terminal needed.
- Single process owns the session; one less moving part.
- Drain skips an HTTP hop on every send.
- Existing bridge script remains as a dev/testing alternative
  (`WA_PROVIDER=openwa` still works).

**Cons**
- Baileys + ~570 transitive deps live inside the API now.
- Node ≥20 expected; on Node 18 we polyfill `globalThis.crypto` in
  `wa-session.service.ts`.
- API restart drops the WS briefly — drain pauses; queue durable, no loss.
- Single-instance only. Multi-replica deployments must pick one replica
  as the WA owner (leader election out of scope here).

## Notes

- Session cred dir for in-process mode is `.wa-session-api/`, separate from
  the bridge's `.wa-session/` so both can coexist for testing.
- Admin auth: `WaSessionController` reuses `AdminAuthGuard` + `AdminRolesGuard`
  via `AdminModule` exports — same flow as other admin endpoints.
- Phone normalisation in `WaSessionService.send()`: `08…`/`+62…` → `62…`,
  appended with `@s.whatsapp.net` for Baileys jid.
