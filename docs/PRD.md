# Gayatri — Product Requirements Document

**App:** Gayatri (Baby Spa)
**Version:** 0.2 (Flow revised)
**Date:** 2026-05-18
**Owner:** Samsul

---

## 1. Vision

Online catalog + WA-funnel platform for baby spa. Customer browse service/product and submit checkout intent. Admin handle scheduling and confirmation via WhatsApp end-to-end.

## 2. Goals

- Replace manual DM/chat order intake with structured FE catalog
- Admin schedule from single panel, auto-WA customer on every state change
- Cut no-show via auto H-1 + H-3jam reminder
- Centralize customer + child + order history

## 3. Non-Goals (v1)

- Online payment (Midtrans/QRIS) — handled offline via WA
- Customer self-slot picking — admin owns schedule
- Customer login/OTP — guest checkout via phone+name
- Native mobile app
- Multi-tenant SaaS
- Loyalty program, live chat, AI rec

## 4. Users

| Role | Description |
|------|-------------|
| Customer | Browse, checkout, receive WA notif. No login. |
| Admin | Owner/staff. Manage catalog, handle checkout, schedule, send WA |
| Therapist | (Phase 2) View own schedule, mark done |

## 5. User Stories

### Customer
- Browse service + product catalog with image, price, desc
- Add to cart (mix service + product allowed)
- Submit checkout with phone, name, baby info, preferred date, notes
- Receive WA confirmation from admin within X hours
- Receive H-1 + H-3jam reminder before service
- Reschedule/cancel via WA reply (admin handles in panel)

### Admin
- CRUD service, product, banner, branch, therapist
- View incoming checkout list (newest first), filter by status
- Open checkout detail → edit items/price/notes
- Set scheduled date + time + branch + therapist
- Click "Confirm" → auto-WA customer
- Reschedule action → auto-WA customer
- Cancel with reason → auto-WA customer
- Mark Ongoing → Done; optional thank-you WA
- View today + upcoming schedule (calendar view)
- See WA log per checkout (audit trail)
- Monthly revenue + top service report
- Stock alert when product < threshold

## 6. Features

### 6.1 Customer Frontend (`@gayatri/web`)

| ID | Feature | Priority |
|----|---------|----------|
| F1 | Hero banner carousel (admin-managed) | P0 |
| F2 | Service list (grid: img, name, price, duration) | P0 |
| F3 | Service detail (gallery, desc, benefit, age range, CTA add to cart) | P0 |
| F4 | Product list + filter category | P0 |
| F5 | Product detail (img, desc, price, qty, CTA add to cart) | P0 |
| F6 | Cart (service + product combined, edit qty, remove) | P0 |
| F7 | Checkout form (name, phone, baby name + age, address, preferred date, notes) | P0 |
| F8 | Submit → success screen "tunggu konfirmasi WA admin" | P0 |
| F9 | Track status via link (phone + code) — optional v1 | P1 |
| F10 | Search service/product | P2 |
| F11 | About / contact / FAQ page | P1 |
| F12 | WhatsApp floating button (direct chat fallback) | P0 |

### 6.2 Admin Backend (`@gayatri/admin`)

| ID | Module | Priority |
|----|--------|----------|
| A1 | Login (email + password) | P0 |
| A2 | Dashboard (NEW checkout count, today schedule, revenue) | P0 |
| A3 | Checkout list (filter status, date, search phone/name) | P0 |
| A4 | Checkout detail (edit items, set schedule, confirm/reschedule/cancel) | P0 |
| A5 | Schedule calendar view (day/week, drag-edit) | P1 |
| A6 | Service CRUD | P0 |
| A7 | Product CRUD + stock | P0 |
| A8 | Category CRUD | P0 |
| A9 | Banner CRUD (img, link, order, period) | P0 |
| A10 | Branch CRUD | P1 |
| A11 | Therapist CRUD + assign | P2 |
| A12 | Customer list (auto-aggregated by phone) + history | P1 |
| A13 | WA log viewer (per checkout + global) | P0 |
| A14 | WA template editor | P1 |
| A15 | Settings (business hour, address, contact, admin WA number) | P0 |
| A16 | Promo code (optional) | P2 |
| A17 | Report: revenue, top service, repeat rate | P1 |
| A18 | Admin user/role mgmt | P1 |

### 6.3 WhatsApp Notification Engine

| Event | Trigger | Recipient | Template ID |
|-------|---------|-----------|-------------|
| New checkout | FE submit success | Admin | T-ADM-001 |
| Checkout received ack | FE submit success | Customer | T-CUS-001 |
| Confirm | Admin click Confirm | Customer | T-CUS-002 |
| Reschedule | Admin change scheduled_at | Customer | T-CUS-003 |
| Cancel | Admin click Cancel | Customer | T-CUS-004 |
| Reminder H-1 | Cron 24h before scheduled_at | Customer | T-CUS-005 |
| Reminder H-3jam | Cron 3h before scheduled_at | Customer | T-CUS-006 |
| Done | Admin mark Done | Customer | T-CUS-007 |
| Low stock | Stock < threshold | Admin | T-ADM-002 |

Template content: see [FLOW.md](./FLOW.md#wa-messages-catalog)

## 7. Success Metrics

- Checkout → confirm rate > 70%
- Admin response time (NEW → CONFIRMED) median < 2 hour
- WA delivery rate > 95%
- No-show rate < 10%
- Repeat customer rate > 30%

## 8. Constraints & Risks

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Unofficial WA gateway banned | Notif down | Pace send + retry queue, plan migrate Meta official |
| Duplicate checkout submit | Spam admin WA | Dedupe (phone + cart_hash, 5min window) |
| Customer no WA | No notif | Show phone fallback + email field optional |
| Admin slow respond | Customer churn | Dashboard SLA alert (NEW >2h highlight red) |
| Image upload large | Slow page | CDN + auto resize transform |
| WA template change rejected by Meta (future) | Notif fail | Keep raw template, version log |

## 9. Out of Scope (Future)

- Online payment
- Customer self-slot picker
- Mobile native
- Multi-tenant
- Loyalty/referral
- Therapist commission
- Review/rating

## 10. Localization

- Default: Indonesian (Bahasa)
- Currency: IDR
- Timezone: Asia/Jakarta (WIB)

## 11. Open Questions

- Customer phone fallback if no WA? → Allow but show warning, fallback SMS phase 2
- Lead time min/max for preferred_date? → Min 1 day, max 30 day (configurable)
- Reschedule limit per customer? → Soft limit 3, alert admin if exceed
- Stock decrement when? → On admin Confirm (not on FE checkout)
