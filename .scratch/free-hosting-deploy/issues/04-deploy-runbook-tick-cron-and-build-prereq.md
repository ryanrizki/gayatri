# 04 — Deploy runbook: tick cron auth header + workspace-build prerequisite

**Status:** ready-for-human

## Context

Operational follow-ups from the free-hosting refactor. No code defect; these are gaps an operator deploying the system would hit.

## Items

1. **Cron auth header convention.** The design spec (`docs/superpowers/specs/2026-05-19-free-hosting-deploy-design.md`) mentions an `X-Tick-Secret` header. The implemented guard (`InternalSecretGuard`) uses standard `Authorization: Bearer <INTERNAL_SECRET>`. The plan doc is internally consistent on `Authorization: Bearer`, but the spec deviation was not recorded in the plan's deviations list. The external cron (cron-job.org / UptimeRobot) MUST send:
   `Authorization: Bearer <INTERNAL_SECRET>` to `POST <api>/v1/internal/tick`.
   Action: write the deploy runbook with the correct header; optionally add this deviation note to the plan/spec.

2. **Workspace-build prerequisite (depends on issue 02).** `node apps/api/dist/main.js` cannot boot until the workspace-package build gap (`.scratch/free-hosting-deploy/issues/02-workspace-packages-not-built-api-cannot-boot.md`) is resolved. The Render deploy for the API must run that build step. Cross-reference 02 in the runbook; the API deploy is blocked on 02.

3. **Manual external setup (no code) still required for the actual free deploy** — Cloudflare Pages (web/admin), Render (api + OpenWA, 750h split per design §Top Risk), Neon (Postgres), MongoDB Atlas M0 (OpenWA RemoteAuth session), cron-job.org (tick every 2 min), UptimeRobot (health + 750h alert), OpenWA QR scan. Capture as a step-by-step runbook with every env var (`DATABASE_URL`, `INTERNAL_SECRET`, `WA_PROVIDER=openwa`, `OPENWA_URL`, `OPENWA_API_KEY`, `OPENWA_SEND_PATH`, `OPENWA_API_KEY_HEADER`).

## Done when

A `docs/` deploy runbook exists covering items 1–3, and the API boot prerequisite (issue 02) is either resolved or clearly flagged as blocking in the runbook.
