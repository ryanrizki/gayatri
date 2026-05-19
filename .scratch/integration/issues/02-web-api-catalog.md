# 02 — Customer web ↔ API catalog wiring

**Status:** ready-for-agent

## Context

Web calls (`apps/web/src/lib/api.ts`, base `NEXT_PUBLIC_API_URL` → `http://localhost:4010`):
- `/v1/catalog/services`, `/v1/catalog/services/:slug`
- `/v1/catalog/products`
- `/v1/catalog/banners`

Each wrapped `.catch(() => [])` → hardcoded `PLACEHOLDER_*` arrays render even when API up but returns empty/errors. Masks integration bugs.

API public catalog controller: `apps/api/src/catalog/catalog.controller.ts` (verify route shapes + DTO match web's `ServiceDto/ProductDto/BannerDto` from `@gayatri/types`).

## Tasks

- Diff web expected shape vs `catalog.service.ts` output (slug lookup, active filter, gallery).
- Confirm seeded data returns: `curl http://localhost:4010/v1/catalog/services` etc.
- Decide placeholder policy: keep as offline/dev fallback but log a visible dev warning when used, OR drop placeholders and render proper empty state.
- Confirm ISR `revalidate = 60` so admin CRUD reflects on web within 60s (or document the lag).

## Done when

Seeded services/products/banners render on web from API (placeholders not silently masking). Slug detail page resolves real record. Empty state shown when truly empty.
