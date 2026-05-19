# Gayatri — Technical Plan

**Version:** 0.2 (Flow revised)
**Date:** 2026-05-18

---

## 1. Stack

| Layer | Tech | Reason |
|-------|------|--------|
| FE Customer (`@gayatri/web`) | Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui | SSR/SEO, Stitch MCP fit |
| FE Admin (`@gayatri/admin`) | Next.js 14 + shadcn/ui + Tanstack Table + FullCalendar | Calendar view, table heavy |
| Backend (`@gayatri/api`) | NestJS + TypeScript | Modular, role guard, swagger |
| Database | PostgreSQL 16 | Relational fit |
| ORM | Prisma | Type-safe |
| Cache/Queue | Redis + BullMQ | WA send job, dedupe lock |
| Auth Admin | NextAuth v5 email+password (bcrypt) | Standard |
| Auth Customer | None (guest checkout) | Phone+name only |
| File storage | Supabase Storage / Cloudinary | CDN + transform |
| WA Gateway v1 | Fonnte (REST API) | Cheap, fast onboard |
| WA Gateway v2 | Meta WA Business API (via Wati/360dialog) | Phase 4 migrate |
| Worker (`@gayatri/worker`) | Node + BullMQ + node-cron | WA send, reminder scan |
| Hosting FE | Vercel | Next.js native |
| Hosting BE+Worker | Railway / Fly.io | Persistent Redis + cron |
| DB host | Supabase | Managed Postgres + storage |
| Monitoring | Sentry + Better Stack | Error + uptime |

## 2. Architecture

```
            ┌──────────────────┐         ┌──────────────────┐
            │  Customer (Web)  │         │  Admin (Web)     │
            │  @gayatri/web    │         │  @gayatri/admin  │
            └────────┬─────────┘         └────────┬─────────┘
                     │                            │
                     │ HTTPS REST                 │
                     └─────────────┬──────────────┘
                                   │
                          ┌────────▼─────────┐
                          │   @gayatri/api   │
                          │   NestJS         │
                          └───┬──────────┬───┘
                              │          │
                       ┌──────▼────┐ ┌───▼──────┐
                       │ Postgres  │ │  Redis   │
                       │ (Supabase)│ │ BullMQ   │
                       └───────────┘ └────┬─────┘
                                          │
                                ┌─────────▼──────────┐
                                │  @gayatri/worker   │
                                │  cron + queue      │
                                └─────────┬──────────┘
                                          │
                                ┌─────────▼──────────┐
                                │  @gayatri/wa       │
                                │  Fonnte adapter    │
                                └─────────┬──────────┘
                                          │
                                ┌─────────▼──────────┐
                                │  WhatsApp API      │
                                └────────────────────┘
```

## 3. Monorepo Structure

```
gayatri/
├── apps/
│   ├── web/              # Next.js customer FE
│   ├── admin/            # Next.js admin FE
│   ├── api/              # NestJS REST API
│   └── worker/           # Cron + BullMQ
├── packages/
│   ├── db/               # Prisma schema + client
│   ├── ui/               # shadcn shared
│   ├── wa/               # WA gateway abstraction
│   ├── types/            # Shared DTO + Zod
│   └── config/           # ESLint/TS/Tailwind preset
├── docs/
│   ├── PRD.md
│   ├── TECH.md
│   ├── FLOW.md
│   └── API.md
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

## 4. Data Model (Prisma)

```prisma
model AdminUser {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String   // bcrypt
  name      String
  role      AdminRole @default(STAFF)
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
}

enum AdminRole { OWNER ADMIN STAFF }

model Customer {
  id        String   @id @default(cuid())
  phone     String   @unique
  name      String
  email     String?
  address   String?
  notes     String?
  children  Child[]
  checkouts Checkout[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Child {
  id          String   @id @default(cuid())
  customerId  String
  customer    Customer @relation(fields: [customerId], references: [id])
  name        String
  ageMonth    Int?
  gender      String?
  notes       String?
  checkouts   Checkout[]
}

model Service {
  id          String   @id @default(cuid())
  slug        String   @unique
  name        String
  description String
  priceIdr    Int
  durationMin Int
  ageMinMonth Int
  ageMaxMonth Int
  imageUrl    String?
  gallery     String[]
  active      Boolean  @default(true)
  items       CheckoutItem[]
}

model Category {
  id       String    @id @default(cuid())
  name     String
  slug     String    @unique
  products Product[]
}

model Product {
  id          String   @id @default(cuid())
  slug        String   @unique
  name        String
  description String
  priceIdr    Int
  stock       Int
  stockThreshold Int   @default(5)
  imageUrl    String?
  categoryId  String
  category    Category @relation(fields: [categoryId], references: [id])
  active      Boolean  @default(true)
  items       CheckoutItem[]
}

model Banner {
  id       String    @id @default(cuid())
  imageUrl String
  link     String?
  order    Int       @default(0)
  startAt  DateTime?
  endAt    DateTime?
  active   Boolean   @default(true)
}

model Branch {
  id        String   @id @default(cuid())
  name      String
  address   String
  phone     String?
  active    Boolean  @default(true)
  checkouts Checkout[]
}

model Therapist {
  id        String   @id @default(cuid())
  name      String
  phone     String?
  active    Boolean  @default(true)
  checkouts Checkout[]
}

model Checkout {
  id            String   @id @default(cuid())
  code          String   @unique
  customerId    String
  customer      Customer @relation(fields: [customerId], references: [id])
  childId       String?
  child         Child?   @relation(fields: [childId], references: [id])
  items         CheckoutItem[]
  totalIdr      Int
  preferredDate DateTime?
  notes         String?

  status        CheckoutStatus @default(NEW)

  scheduledAt   DateTime?    // admin set
  branchId      String?
  branch        Branch?      @relation(fields: [branchId], references: [id])
  therapistId   String?
  therapist     Therapist?   @relation(fields: [therapistId], references: [id])

  reminderH1Sent  Boolean @default(false)
  reminderH3Sent  Boolean @default(false)
  doneAt          DateTime?
  cancelReason    String?

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  waLogs        WaLog[]

  @@index([status, scheduledAt])
  @@index([customerId])
}

enum CheckoutStatus {
  NEW           // submitted from FE, awaiting admin
  CONFIRMED     // admin confirmed + scheduled
  RESCHEDULED   // admin moved
  ONGOING       // service in progress
  DONE
  CANCELLED
}

model CheckoutItem {
  id         String   @id @default(cuid())
  checkoutId String
  checkout   Checkout @relation(fields: [checkoutId], references: [id], onDelete: Cascade)
  type       ItemType
  serviceId  String?
  service    Service? @relation(fields: [serviceId], references: [id])
  productId  String?
  product    Product? @relation(fields: [productId], references: [id])
  name       String   // snapshot
  priceIdr   Int      // snapshot
  qty        Int      @default(1)
}

enum ItemType { SERVICE PRODUCT }

model WaLog {
  id         String   @id @default(cuid())
  checkoutId String?
  checkout   Checkout? @relation(fields: [checkoutId], references: [id])
  to         String
  template   String
  payload    Json
  status     WaStatus @default(QUEUED)
  error      String?
  sentAt     DateTime?
  createdAt  DateTime @default(now())

  @@index([checkoutId, template])
  @@index([status, createdAt])
}

enum WaStatus { QUEUED SENT FAILED }

model WaTemplate {
  id        String   @id @default(cuid())
  code      String   @unique     // e.g. T-CUS-002
  name      String
  body      String                // {var} placeholders
  active    Boolean  @default(true)
  updatedAt DateTime @updatedAt
}

model Setting {
  key   String @id
  value String
}
```

## 5. API Surface (REST)

```
# Public (customer FE, no auth)
GET    /catalog/banners
GET    /catalog/services
GET    /catalog/services/:slug
GET    /catalog/products
GET    /catalog/products/:slug
GET    /catalog/categories

POST   /checkout              # submit cart + customer info
GET    /checkout/:code/status # status lookup by code + phone

# Admin (auth required, role guard)
POST   /admin/auth/login
POST   /admin/auth/logout
GET    /admin/me

GET    /admin/dashboard

GET    /admin/checkouts                  # filter status, date, q
GET    /admin/checkouts/:id
PATCH  /admin/checkouts/:id              # edit items, notes, etc
POST   /admin/checkouts/:id/confirm      # body: { scheduledAt, branchId?, therapistId? } → fire WA
POST   /admin/checkouts/:id/reschedule   # body: { scheduledAt } → fire WA
POST   /admin/checkouts/:id/cancel       # body: { reason } → fire WA
POST   /admin/checkouts/:id/ongoing
POST   /admin/checkouts/:id/done         # optional WA thank you

GET    /admin/schedule                   # calendar feed

CRUD   /admin/services
CRUD   /admin/products
CRUD   /admin/categories
CRUD   /admin/banners
CRUD   /admin/branches
CRUD   /admin/therapists
CRUD   /admin/customers                  # read mostly + edit notes
CRUD   /admin/wa-templates
GET    /admin/wa-logs
PUT    /admin/settings
GET    /admin/reports/revenue
GET    /admin/reports/services
```

## 6. WhatsApp Layer (`@gayatri/wa`)

```ts
interface WaGateway {
  send(to: string, body: string): Promise<{ ok: boolean; ref?: string; error?: string }>
}

class FonnteAdapter implements WaGateway { ... }
class MetaWaAdapter implements WaGateway { ... }   // phase 4

// service
class WaService {
  constructor(private gw: WaGateway, private db: PrismaClient) {}

  async enqueue(opts: { to: string; templateCode: string; vars: Record<string,string>; checkoutId?: string }) {
    const tpl = await this.db.waTemplate.findUnique({ where: { code: opts.templateCode } })
    const body = render(tpl.body, opts.vars)
    const log = await this.db.waLog.create({ data: { to: opts.to, template: opts.templateCode, payload: opts.vars, status: 'QUEUED', checkoutId: opts.checkoutId } })
    await queue.add('wa:send', { logId: log.id, to: opts.to, body })
  }
}
```

Worker job:
1. Pop `wa:send`
2. Call adapter `send`
3. Update `WaLog` status + sentAt
4. On error retry 3x exponential

Cron `*/15 * * * *`:
- Scan `Checkout` where `status=CONFIRMED|RESCHEDULED` and scheduledAt within next 24h±15min and `reminderH1Sent=false`
- Enqueue T-CUS-005, then set flag (transaction)
- Same for H-3jam (T-CUS-006, reminderH3Sent)

## 7. Concurrency / Dedupe

- **Double-submit checkout:** Redis lock key `checkout:dedupe:{phone}:{cart_hash}` TTL 5min. Reject duplicate.
- **WA double-send:** Unique index `WaLog(checkoutId, template)` for state-change templates (CUS-002, 005, 006, 007). Reminder flags on Checkout enforce single send.
- **Stock decrement:** Inside `confirm` transaction. Reject confirm if stock < qty for any product item.

## 8. Security

- HTTPS only, HSTS
- Admin auth: bcrypt password + httpOnly cookie session
- Role guard middleware (OWNER/ADMIN/STAFF)
- Rate limit checkout submit: 5 per IP per minute, 3 per phone per hour
- Customer phone validation (regex + length)
- Input validation Zod at API boundary
- SQL: Prisma parameterized
- XSS: React escape + CSP
- WA template injection: escape `{var}` values (strip control chars)
- File upload: type whitelist, max 5MB, server-side resize
- Secrets in env, never commit
- Audit log: all admin state-change actions logged with adminUserId

## 9. Environment

```
DATABASE_URL=
REDIS_URL=
NEXTAUTH_SECRET=
ADMIN_SESSION_SECRET=
FONNTE_TOKEN=
ADMIN_WA_NUMBER=628xxxx
CLOUDINARY_URL=  (or SUPABASE_*)
APP_URL_WEB=
APP_URL_ADMIN=
APP_URL_API=
SENTRY_DSN=
TZ=Asia/Jakarta
```

## 10. Milestone & Timeline

| Phase | Scope | Duration |
|-------|-------|----------|
| 0. Setup | Monorepo, Prisma, env, CI | 1 week |
| 1. Catalog + Checkout MVP | Service/product CRUD, FE catalog, cart, checkout submit, WA-to-admin | 3 weeks |
| 2. Admin Schedule + WA Customer | Admin checkout detail, confirm/reschedule/cancel, customer WA, reminder cron | 2 weeks |
| 3. Polish | Banner, branch, therapist, customer list, report, WA template editor | 2 weeks |
| 4. Scale | Multi-branch UI, Meta WA migrate, optional payment | 3 weeks |

**MVP go-live: ~5-6 weeks**

## 11. Decisions Locked

- API: NestJS standalone (separation, role guard)
- Admin = separate Next app (security isolation)
- DB: Supabase (Postgres + storage combo)
- WA v1: Fonnte
- Auth customer: none, guest by phone
- Payment: offline v1, Midtrans phase 4

## 12. Progress & Next Steps

### ✓ Phase 0 — Done
- Monorepo (pnpm + Turborepo) scaffolded
- `packages/types` — shared DTOs (`ServiceDto`, `ProductDto`, `BannerDto`, etc.)
- `apps/web` — Next.js 14 App Router, Tailwind design tokens, `src/lib/api.ts`, `src/lib/format.ts`
- `apps/admin` — Next.js 14 App Router bootstrapped
- Customer FE pages built: `/`, `/services`, `/services/[slug]`, `/checkout`
- Checkout v0: WA deep-link submit (no API yet) — intentional MVP shortcut

### Phase 1 — In Progress
- [ ] Remaining customer FE: `/checkout/success`, `/products`, `/products/[slug]`
- [ ] `apps/api` NestJS scaffold + `packages/db` Prisma schema + seed
- [ ] `POST /v1/checkout` API → replace WA deep-link v0
- [ ] `GET /v1/catalog/*` live (currently using placeholder fallbacks)
- [ ] `@gayatri/wa` Fonnte adapter + BullMQ worker

### Phase 2
- [ ] Admin FE: Login, Dashboard, Checkout List, Checkout Detail + action buttons
- [ ] Admin confirm/reschedule/cancel → fire WA customer
- [ ] Reminder cron (H-1, H-3jam)

### Phase 3
- [ ] Banner, branch, therapist, customer list, WA template editor, reports
- [ ] `/status` page (customer lookup)

### Phase 4
- [ ] Multi-branch UI, Meta WA API migrate, Midtrans payment
