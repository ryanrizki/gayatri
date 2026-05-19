# Gayatri — Design System & Stitch Workflow

**Version:** 0.3
**Date:** 2026-05-18
**Aligned with:** Stitch project "Website Gayatri Baby Spa" (`6049441620894300885`)

---

## 1. Brand

**Name:** Gayatri Baby Spa
**Tone:** Ketenangan, kelembutan, premium, professional care, maternal warmth
**Audience:** Ibu muda 25-40, urban, IG-savvy, peduli wellness bayi
**Concept:** *Tender Luxury* — sage botanical sanctuary, airy + minimalist + soft tactility

## 2. Design Principles

| Principle | Apply |
|-----------|-------|
| Calm & airy | Sage + warm cream palette, expansive whitespace, no harsh contrast |
| Mobile-first | 80%+ traffic dari WA share → mobile, 20px side margin |
| Photo-first | Soft-focus foto skin-to-skin, botanical, water; copy secukupnya |
| Tappable | Min target 48x48px, pill buttons |
| WA-native | CTA WA prominent (floating button + checkout link) |
| Reassuring | Trust badges (sertifikasi, foto therapist) |
| Soft tactility | Tonal layers + ambient sage-tinted glow (no hard dropshadow) |

## 3. Color Tokens

Tailwind `gayatri.*` (sage scale) + `peach` + `cream`. See [apps/web/tailwind.config.ts](../apps/web/tailwind.config.ts).

```
# Sage (primary brand)
gayatri-50   #f3f6f3   bg subtle, chip bg
gayatri-100  #e1ebe0   card hover, outline-variant tint
gayatri-300  #b0ceae   inverse primary, soft accent
gayatri-500  #8ba889   primary container, brand marker
gayatri-600  #4a654a   primary button, link, heading accent
gayatri-700  #243d25   strong heading, on-primary-container

# Warm tones
cream        #fbf9f8   page background (surface)
cream-100    #f5f3f3   surface-container-low
peach-100    #f7dac9   secondary container, chip/badge bg
peach-500    #f2d5c4   gentle peach accent

# Neutrals
charcoal     #1b1c1c   on-surface (body text)
charcoal-soft #4a4a4a  secondary text
outline      #737971   borders, dividers
outline-soft #c3c8bf   subtle 1px stroke

# Semantic
success:     emerald-500 (WA confirm)
warning:     amber-500
danger:      #ba1a1a    (Material error)
```

## 4. Typography

Fonts via `next/font/google` in [apps/web/src/app/layout.tsx](../apps/web/src/app/layout.tsx):

```
headline/display: Literata (500, 600)   — editorial serif, soft authority
body/label:       Plus Jakarta Sans (400, 500, 600) — rounded grotesque

scale (Stitch tokens):
  display-lg:        48/56 px, -0.02em   (mobile: 36/44)
  headline-md:       32/40 px            (mobile: 28/36)
  title-lg:          22/28 px, 600
  body-lg:           18/28 px, 400
  body-md:           16/24 px, 400
  label-md:          14/20 px, 600, 0.01em
  caption:           12/16 px, 400

prose: bahasa Indonesia formal-hangat — "Bunda & Ayah", "Si Kecil"
```

## 5. Spacing & Radius

```
spacing: 8px base unit (Stitch token)
  gutter:               24px
  section-gap:          64px
  container-mobile px:  20px
  container-desktop px: 80px

radius: ROUND_EIGHT (Stitch)
  sm:  0.25rem  (4px)
  md:  0.5rem   (8px) — buttons, inputs, chips
  lg:  0.75rem  (12px)
  xl:  1rem     (16px) — cards
  2xl: 1.5rem   (24px) — featured containers
  full: 9999px  — pill buttons, chips, badges

shadow:
  none on Level 1 surfaces (use 1px outline-soft stroke instead)
  Level 2 float: very soft sage-tinted glow, 20-40px spread, 5-8% opacity
  modal backdrop: cream-tinted blur (no black)
```

## 6. Component Inventory

### Customer FE (`@gayatri/web`)

| Component | File | Status |
|-----------|------|--------|
| `<TopNav>` | `src/components/site-shell.tsx` | ✓ Done |
| `<Footer>` | `src/components/site-shell.tsx` | ✓ Done |
| `<WaFloating>` | `src/components/site-shell.tsx` | ✓ Done |
| `<HeroBanner>` | inline in `src/app/page.tsx` | ✓ Done (static, no carousel yet) |
| `<ServiceCard>` | inline in `src/app/services/page.tsx` | ✓ Done |
| `<ServiceDetail>` | `src/app/services/[slug]/page.tsx` | ✓ Done |
| `<StickyMobileCta>` | inline in `src/app/services/[slug]/page.tsx` | ✓ Done |
| `<CheckoutForm>` | `src/app/checkout/checkout-form.tsx` | ✓ Done (WA deep-link v0) |
| `<ProductCard>` | — | TODO |
| `<ProductDetail>` | — | TODO |
| `<CheckoutSuccess>` | — | TODO |
| `<StatusTracker>` | — | TODO (P1) |
| `<CartDrawer>` | — | TODO (skipped v0 — no cart in WA model) |

### Admin FE (`@gayatri/admin`)

| Component | Purpose | Status |
|-----------|---------|--------|
| `<LoginForm>` | Email/password | TODO |
| `<Sidebar>` | Nav: dashboard/checkout/catalog | TODO |
| `<DashboardCards>` | NEW count, today, revenue | TODO |
| `<CheckoutTable>` | List w/ filter + status badge | TODO |
| `<CheckoutDetail>` | Items + customer + actions | TODO |
| `<ScheduleModal>` | Date+time picker | TODO |
| `<ConfirmDialog>` | Cancel reason input | TODO |
| `<CalendarView>` | Day/week schedule | TODO |
| `<CatalogTable>` | Service/product CRUD table | TODO |
| `<MediaUploader>` | Image upload | TODO |
| `<WaTemplateEditor>` | Edit body with var preview | TODO |
| `<WaLogViewer>` | Recent send log | TODO |

## 7. Key Screens (FE)

### Customer

1. **Home** — banner carousel → services grid → products grid → about section → footer
2. **Service Detail** — gallery, name, price, duration, age range, benefit list, "Tambah ke Keranjang" CTA
3. **Product Detail** — image, name, desc, price, qty stepper, add to cart
4. **Cart** — list items, edit qty, remove, total, "Checkout" CTA
5. **Checkout Form** — customer info (name, phone, address), baby info (name, age), preferred date (calendar), notes textarea, submit
6. **Checkout Success** — code, status pending, "Cek status" link, WA admin button
7. **Status Page** — `?code=GYT-XX&phone=08xx` → timeline (NEW→CONFIRMED→DONE)

### Admin

1. **Login**
2. **Dashboard** — 3 stat cards (NEW count, today schedule, week revenue) + recent checkout list
3. **Checkout List** — filterable table (status, date, search) → row click → detail
4. **Checkout Detail** — left: customer+items+notes; right: schedule form + action buttons (Confirm/Reschedule/Cancel/Ongoing/Done) + WA log
5. **Schedule Calendar** — month/week view of CONFIRMED+ONGOING bookings
6. **Catalog** — tabs (Services / Products / Banners / Categories) with CRUD tables
7. **WA Templates** — list + edit body, var preview
8. **Settings** — business info, admin WA number, reminder toggle

## 8. Stitch MCP Workflow

### What is Stitch
Google Stitch = AI-powered UI design tool. Generates UI mockups from text prompt or image input. Outputs Figma frame + production-ready code (React/HTML/Tailwind).

MCP server: `https://stitch.googleapis.com/mcp` (configured in [.mcp.json](../.mcp.json) — gitignored).

### How to Use for Gayatri

**Existing Stitch project:** `Website Gayatri Baby Spa` (id `6049441620894300885`).
Design system already configured: sage primary `#8ba889`, Literata + Plus Jakarta Sans, ROUND_EIGHT.

1. **MCP loaded** in this session (`mcp__stitch__*` tools available)
2. **Prompt pattern** (Indonesian + sage tokens):
   ```
   Design [screen name] for Gayatri Baby Spa premium baby spa booking.
   Style: Tender Luxury — sage botanical, warm cream surface,
   minimalism + soft tactility, mobile-first.
   Primary #8ba889 (sage), surface #fbf9f8 (cream), secondary peach #f2d5c4.
   Fonts: Literata headlines, Plus Jakarta Sans body.
   Shapes: rounded-md buttons, rounded-2xl cards, pill chips.
   No hard dropshadow — use 1px outline-soft stroke + sage-tinted glow.
   Reference: [paste service/product data].
   Output: Next.js 14 App Router + Tailwind. Indonesian copy.
   ```
3. **Generate per screen** in order: Home → Service Detail → Cart → Checkout → Admin Login → Admin Dashboard → Checkout Detail
4. **Paste generated TSX** into `apps/web/src/app/...` or `apps/admin/src/app/...`
5. **Wire data** via `@/lib/api` calls (already stubbed)
6. **Verify** with `pnpm --filter @gayatri/web dev` → :3000

### Per-Screen Stitch Prompt Examples

**Service Detail**
```
Design service detail page for Gayatri Baby Spa (sage Tender Luxury).
Hero image full-bleed top, rounded-2xl bottom corners.
Below: name (Literata display-lg), price (Plus Jakarta Sans 600 sage #4a654a),
peach pill chips for duration + age range, description paragraph,
benefit list (5 items with sage check icons),
sticky bottom bar with qty stepper + "Tambah ke Keranjang" pill button (sage solid).
Mobile 390px first, tablet 768px, desktop 1280px.
Tech: Next.js App Router + Tailwind. Output single .tsx file.
```

**Checkout Form**
```
Design checkout form for baby spa booking (Gayatri sage palette).
Sections: Bunda & Ayah (name + phone + address),
Si Kecil (name + usia bulan + jenis kelamin),
Tanggal preferensi (date picker, sage selected state),
Catatan (textarea).
Bottom: total summary card (cream-100 bg, 1px outline-soft) + submit pill button "Kirim ke Admin".
Validate phone Indonesia format. Show success screen on submit
with order code + WA admin button (emerald-500).
Style: warm cream surface, ample whitespace, large tap targets (48px), mobile-first.
```

**Admin Checkout Detail**
```
Design admin checkout detail page (Gayatri sage admin theme).
Two-column on desktop (8/4 split), stacked on mobile.
Left: customer card + items list + notes + cart hash + audit log.
Right: status pill badge (sage/peach/emerald variants), schedule form
(date+time picker, branch dropdown, therapist dropdown),
action buttons (Konfirmasi sage solid, Reschedule sage outline, Batalkan danger outline).
Below: WA log timeline with template code + status + timestamp.
Style: cream-100 bg, white cards rounded-xl, 1px outline-soft borders, Literata h1.
```

## 9. Component Library Choice

**shadcn/ui** for both web and admin:
- Customer FE: use Button, Input, Card, Dialog, Sheet (drawer), Toast
- Admin FE: add Table, DataTable, Calendar, Select, Tabs, Badge, Form

Install per app (one-time):
```bash
cd apps/web
npx shadcn@latest init
npx shadcn@latest add button input card dialog sheet toast

cd ../admin
npx shadcn@latest init
npx shadcn@latest add button input card dialog sheet toast table tabs badge select calendar form
```

## 10. Image Assets

Source: Cloudinary or Supabase Storage (TBD per [TECH.md](./TECH.md)).
Specs:
- Banner: 1200x500, < 200KB JPEG
- Service: 800x600, < 150KB
- Product: 600x600 (square), < 100KB
- Gallery: max 5 per item

Use `next/image` for auto-optimize.

## 11. Accessibility

- Alt text wajib for all images
- Form labels visible (no placeholder-only)
- Min contrast WCAG AA (4.5:1)
- Focus ring visible (`ring-2 ring-gayatri-600`)
- Bahasa Indonesia default, lang=id on `<html>`

## 12. Loading / Empty / Error States

| State | Pattern |
|-------|---------|
| Loading | Skeleton card (shimmer), not spinner |
| Empty | Illustration + helpful copy + CTA |
| Error | Toast (transient) + inline form error |
| Offline | Banner top "Tidak ada koneksi" |

## 13. Animations

- Page transition: none (Next default)
- Card hover: `transition shadow-md`
- Modal: fade + scale 0.95→1, 150ms
- Toast: slide from top, 200ms
- Cart badge: bounce on add

Library: `framer-motion` if needed (defer until first complex anim).

## 14. Progress & Next Steps

### ✓ Done
- Design system tokens (Tailwind, `tailwind.config.ts`) — sage + cream + peach + charcoal
- `site-shell.tsx` — TopNav, Footer, WaFloating, getWaNumber
- `/` Home page — HeroBanner, ServicesSection, PromoSlider, AboutSection, Testimonials, CtaSection
- `/services` — responsive 2/2/3-col grid, mobile h-scroll category chips
- `/services/[slug]` — dual desktop/mobile hero, sticky pricing sidebar, StickyMobileCta
- `/checkout` — 3-step form, date calendar, time slots, WA deep-link submit (v0)
- `src/lib/format.ts` — formatIdr, formatIdrShort, formatDuration, formatAgeRange

### Next (Customer FE)
1. `/checkout/success` — order code display, status pending copy, WA admin button
2. Product pages: `/products`, `/products/[slug]`
3. `/status` — lookup by code + phone, timeline view (P1)
4. Install shadcn/ui per app (see section 9)

### Next (Admin FE)
1. Stitch prompts for admin screens (Login, Dashboard, Checkout Detail)
2. `/admin/login` — email/password form
3. `/admin/dashboard` — stat cards + recent checkouts
4. `/admin/checkouts` — filterable table
5. `/admin/checkouts/[id]` — detail + confirm/reschedule/cancel actions

### Next (Backend)
1. `@gayatri/api` NestJS scaffold
2. `@gayatri/db` Prisma schema + seed
3. Wire `POST /checkout` API → replace WA deep-link v0
4. WA worker + Fonnte adapter
