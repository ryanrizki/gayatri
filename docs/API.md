# Gayatri — API Reference

**Version:** 0.1
**Date:** 2026-05-18
**Base URL:** `$APP_URL_API/v1`

---

## Auth

All `/admin/*` routes require session cookie set by `POST /admin/auth/login`.  
Customer routes are public (no auth).

---

## Public — Catalog

### `GET /v1/catalog/banners`
Returns active banners ordered by `order` asc.

**Response** `BannerDto[]`
```ts
{ id, imageUrl, link, order, startAt, endAt }
```

---

### `GET /v1/catalog/services`
Returns active services.

**Response** `ServiceDto[]`
```ts
{ id, slug, name, description, priceIdr, durationMin, ageMinMonth, ageMaxMonth, imageUrl, gallery, active }
```

---

### `GET /v1/catalog/services/:slug`
**Response** `ServiceDto | 404`

---

### `GET /v1/catalog/products`
**Query** `category?: string` (category slug filter)  
**Response** `ProductDto[]`
```ts
{ id, slug, name, description, priceIdr, stock, imageUrl, categoryId, category, active }
```

---

### `GET /v1/catalog/products/:slug`
**Response** `ProductDto | 404`

---

### `GET /v1/catalog/categories`
**Response** `CategoryDto[]`
```ts
{ id, slug, name }
```

---

## Public — Checkout

### `POST /v1/checkout`
Submit booking intent. Creates `Checkout` with `status=NEW`, enqueues WA-to-admin job.

**Body**
```ts
{
  customerName: string       // max 100
  customerPhone: string      // Indonesian format 08xx / 628xx
  customerAddress?: string
  babyName: string
  babyAgeMonth?: number
  babyGender?: 'L' | 'P'
  preferredDate?: string     // ISO date
  notes?: string
  items: Array<{
    type: 'SERVICE' | 'PRODUCT'
    id: string                // service.id or product.id
    qty: number               // default 1
  }>
}
```

**Response** `201`
```ts
{ code: string, checkoutId: string, status: 'NEW' }
```

**Errors**
- `400` validation fail
- `409` duplicate submit (phone + cart_hash within 5min)
- `422` product out of stock

---

### `GET /v1/checkout/:code/status`
Status lookup. Requires phone match.

**Query** `phone: string`  
**Response**
```ts
{
  code: string
  status: CheckoutStatus
  scheduledAt?: string
  branchName?: string
  therapistName?: string
  items: { name, priceIdr, qty }[]
  totalIdr: number
}
```

---

## Admin — Auth

### `POST /v1/admin/auth/login`
**Body** `{ email, password }`  
**Response** `200` + sets httpOnly session cookie

### `POST /v1/admin/auth/logout`
Clears session cookie.

### `GET /v1/admin/me`
Returns current admin user.

---

## Admin — Dashboard

### `GET /v1/admin/dashboard`
**Response**
```ts
{
  newCount: number           // status=NEW
  todayCount: number         // scheduledAt today
  weekRevenueIdr: number     // DONE this week
  recentCheckouts: CheckoutSummaryDto[]
}
```

---

## Admin — Checkouts

### `GET /v1/admin/checkouts`
**Query** `status?, dateFrom?, dateTo?, q?` (search name/phone/code)  
**Response** `CheckoutSummaryDto[]` paginated

### `GET /v1/admin/checkouts/:id`
**Response** `CheckoutDetailDto`

### `PATCH /v1/admin/checkouts/:id`
Edit items, notes, preferred date.

### `POST /v1/admin/checkouts/:id/confirm`
**Body** `{ scheduledAt: string, branchId?: string, therapistId?: string }`  
Sets `status=CONFIRMED`, fires T-CUS-002 WA to customer.

### `POST /v1/admin/checkouts/:id/reschedule`
**Body** `{ scheduledAt: string }`  
Sets `status=RESCHEDULED`, fires T-CUS-003.

### `POST /v1/admin/checkouts/:id/cancel`
**Body** `{ reason: string }`  
Sets `status=CANCELLED`, fires T-CUS-004.

### `POST /v1/admin/checkouts/:id/ongoing`
Sets `status=ONGOING`.

### `POST /v1/admin/checkouts/:id/done`
Sets `status=DONE`, optionally fires T-CUS-007 if `sendThankYou=true`.

---

## Admin — Schedule

### `GET /v1/admin/schedule`
**Query** `from: string, to: string` (ISO dates)  
**Response** `CheckoutSummaryDto[]` with `status IN (CONFIRMED, RESCHEDULED, ONGOING)`

---

## Admin — Catalog CRUD

Pattern: `GET /list`, `GET /:id`, `POST /`, `PATCH /:id`, `DELETE /:id`

- `/v1/admin/services`
- `/v1/admin/products`
- `/v1/admin/categories`
- `/v1/admin/banners`
- `/v1/admin/branches`
- `/v1/admin/therapists`
- `/v1/admin/customers` (no DELETE, soft via notes)

---

## Admin — WA

### `GET /v1/admin/wa-templates`
### `PUT /v1/admin/wa-templates/:id`
**Body** `{ body: string, active: boolean }`

### `GET /v1/admin/wa-logs`
**Query** `checkoutId?, status?, limit?`

---

## Admin — Reports

### `GET /v1/admin/reports/revenue`
**Query** `from, to`

### `GET /v1/admin/reports/services`
Top services by booking count.

---

## Admin — Settings

### `GET /v1/admin/settings`
### `PUT /v1/admin/settings`
**Body** `{ key: string, value: string }[]`

Keys: `admin_wa_number`, `business_name`, `business_address`, `reminder_enabled`

---

## Error Format

```ts
{
  statusCode: number
  message: string | string[]
  error: string
}
```

---

## Shared DTOs

Defined in `packages/types/src/index.ts`. See [TECH.md](./TECH.md) §4 for Prisma schema.
