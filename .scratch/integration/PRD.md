# Integration: Customer Web ↔ API + E2E

**Status:** pending (paused 2026-05-19)

## Goal

Wire customer web FE to real API, persist checkouts to DB, verify end-to-end flow against seeded data.

## Current state

- API (NestJS) + Postgres (`:5434`) + Redis (`:6380`) running, DB seeded (`owner@gayatri.local`).
- Admin FE fully wired to API (auth, checkout workflow, catalog CRUD, settings, WA).
- Customer web FE calls `/v1/catalog/*` but wraps in `.catch(() => [])` → silently falls back to hardcoded placeholder arrays. Not verified against real data.
- Checkout submit is **v0**: builds `wa.me` deep-link + `window.open`, then `router.push('/checkout/success')`. No `POST /v1/checkout`; orders never reach DB or admin checkout list.
- `create-admin` script exists (`pnpm db:create-admin`), shell wrapper added (`scripts/db-create-admin.sh`); README row pending.

## Scope (4 issues)

1. create-admin runner — finish (README only)
2. Customer web ↔ API — verify/align catalog endpoints, decide placeholder fallback
3. Checkout POST v1 — persist orders to DB from web form
4. End-to-end smoke test — catalog → checkout → admin → status flow

## Out of scope

Payment gateway, real WA gateway send (Fonnte token empty), reports/exports.
