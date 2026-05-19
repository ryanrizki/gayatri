# 04 — End-to-end smoke test

**Status:** ready-for-agent

## Depends on

02 (catalog wiring) + 03 (checkout POST). Run last.

## Flow to verify

1. `./scripts/services-up.sh` + `./scripts/dev.sh` (api :4010, web :3000, admin :3001).
2. Web: browse `/services` + `/products` → seeded data shows (not placeholder).
3. Web: open a service/product → `/checkout` → fill form → submit.
4. Assert: `POST /v1/checkout` 2xx; WA deep-link opens; `/checkout/success` shows.
5. Admin: login `owner@gayatri.local / gayatri123` → `/checkouts?status=NEW` → new order present.
6. Admin: confirm (set schedule/branch/therapist) → status `CONFIRMED`; product stock decremented.
7. Admin: mark ongoing → done. Status flow `NEW→CONFIRMED→ONGOING→DONE` ok.
8. WA logs: with `FONNTE_TOKEN` empty, send is skipped (worker idle) — log row may be `QUEUED/FAILED`, acceptable for v0. Note in result.

## Done when

Full path passes; deviations recorded as new issues under `.scratch/integration/issues/`.
