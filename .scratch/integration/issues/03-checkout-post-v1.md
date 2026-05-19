# 03 — Checkout POST /v1/checkout (v0 → v1)

**Status:** ready-for-agent

## Context

`apps/web/src/app/checkout/checkout-form.tsx`: v0 builds `wa.me?text=` deep-link, `window.open`, `router.push('/checkout/success')`. Order never persisted; admin checkout list stays empty.

API has `apps/api/src/checkout/checkout.controller.ts` + `CheckoutSubmit` Zod schema in `@gayatri/types` (customer{name,phone,email?,address?}, child?{name,ageMonth?,gender?}, items[]{type,serviceId|productId,qty}, preferredDate?, notes?).

## Tasks

- On submit: `POST {NEXT_PUBLIC_API_URL}/v1/checkout` with `CheckoutSubmit` body; map form state → schema (serviceId/productId cuid, phone regex `^(?:\+?62|0)8...`).
- On 2xx: keep WA deep-link open (still useful) then `router.push('/checkout/success')`. On error: inline message, do not navigate.
- Verify `CORS_ORIGINS` includes web origin `http://localhost:3000` (already default).
- Confirm new checkout appears in admin `/checkouts?status=NEW`.

## Risks

- Web cart/checkout state shape may not carry cuid ids (placeholder data has fake ids). Depends on #02 real catalog wiring — sequence after 02.

## Done when

Web checkout submit creates a `NEW` checkout row visible in admin; WA deep-link still offered; success page shows.
