# Gayatri — User Flow

**Version:** 0.2
**Date:** 2026-05-18

---

## Core Concept

WA-funnel model. Customer browse + submit intent. Admin schedule + confirm via WA. No customer self-slot picking.

## v0 vs v1 Checkout Submit

| | v0 (current, live) | v1 (planned) |
|--|--|--|
| How | `wa.me` deep-link from `checkout-form.tsx` opens WA with pre-filled message | `POST /v1/checkout` API, worker sends WA to admin |
| Trade-off | No backend needed, works instantly | Structured data, proper status tracking, WA reliability |
| Status | Deployed | Phase 1 backlog |

In v0, customer taps "Kirim via WhatsApp" → their WA client opens with pre-formatted message to admin number. No order code generated server-side yet.

## End-to-End Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. CUSTOMER BROWSE (FE)                                         │
│    - View banner, service list, product list                    │
│    - Open detail page                                           │
│    - Add to cart (service / product / mixed)                    │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│ 2. CUSTOMER CHECKOUT (FE)                                       │
│    Input: name, phone, baby name, baby age, address, notes,     │
│           preferred date (optional)                             │
│    Submit → API create CheckoutRequest (status=NEW)             │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│ 3. AUTO WA → ADMIN                                              │
│    Worker pick job → format message → send to admin number      │
│    Content: customer info, items, total, preferred date, notes  │
│    Customer see "Tunggu konfirmasi admin via WA" screen         │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│ 4. ADMIN REVIEW (Admin panel)                                   │
│    - See list of NEW CheckoutRequest                            │
│    - Open detail                                                │
│    - Edit items / qty / price (negotiable)                      │
│    - Assign branch, therapist (optional)                        │
│    - Set scheduled_at (date + time)                             │
│    - Click "Confirm & Notify"                                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│ 5. AUTO WA → CUSTOMER (CONFIRMATION)                            │
│    Template: "Halo {name}, booking dikonfirmasi.                │
│               {service} {date} {hour}. Total Rp{amount}.        │
│               Alamat: {addr}. Sampai jumpa!"                    │
│    Status → CONFIRMED                                           │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│ 6. AUTO REMINDER (Cron)                                         │
│    H-1 (24h before): WA customer reminder besok                 │
│    H-3jam: WA customer reminder 3 jam lagi                      │
└──────────────────────────┬──────────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────────┐
│ 7. SERVICE DAY                                                  │
│    Admin mark status=ONGOING → DONE                             │
│    (Optional) WA thank-you + review link                        │
└─────────────────────────────────────────────────────────────────┘
```

## Alternative Flow: Reschedule

```
Admin edit scheduled_at → save → auto WA customer "jadwal diubah ke ..."
```

## Alternative Flow: Cancel

```
Admin click Cancel + reason → status=CANCELLED → auto WA customer
```

## Alternative Flow: Product-only Order

Same flow steps 1-5. Admin set scheduled_at = pickup/delivery date instead of service time. Step 6 cron skip (no spa reminder, only pickup reminder).

## States

```
CheckoutRequest:
  NEW → CONFIRMED → ONGOING → DONE
         ↓
      RESCHEDULED → CONFIRMED
         ↓
      CANCELLED
```

## WA Messages Catalog

### To Admin

**T-ADM-001 — new checkout**
```
🆕 Checkout Baru #{code}

Customer: {name} ({phone})
Bayi: {baby_name}, {baby_age}
Alamat: {address}

Items:
{items_list}

Total: Rp{total}
Tanggal preferensi: {preferred_date}
Catatan: {notes}

Buka admin: {admin_url}/checkout/{id}
```

### To Customer

**T-CUS-001 — checkout received**
```
Halo {name}, checkout #{code} diterima.
Admin akan hubungi via WA untuk konfirmasi jadwal.
Terima kasih 🙏
```

**T-CUS-002 — confirmed**
```
✅ Booking Dikonfirmasi #{code}

{service_name}
📅 {date} {hour}
📍 {branch_address}
💰 Rp{total}

Sampai jumpa, {baby_name}!
```

**T-CUS-003 — reschedule**
```
ℹ️ Jadwal Diubah #{code}
Jadwal baru: {new_date} {new_hour}
Mohon konfirmasi balas YA.
```

**T-CUS-004 — cancelled**
```
❌ Booking Dibatalkan #{code}
Alasan: {reason}
Hubungi kami jika butuh info.
```

**T-CUS-005 — H-1 reminder**
```
🔔 Reminder: besok {hour} jadwal spa {baby_name}.
Mohon hadir 10 menit sebelumnya.
Alamat: {address}
```

**T-CUS-006 — H-3jam reminder**
```
⏰ 3 jam lagi jadwal {baby_name}.
Persiapkan handuk + baju ganti ya.
```

**T-CUS-007 — done + thanks**
```
🌸 Terima kasih sudah pakai Gayatri.
Semoga {baby_name} sehat selalu.
Review kami: {review_link}
```

## Auth Model

- **Customer:** no account required. Phone+name input at checkout. Optional: lookup phone → prefill last data.
- **Admin:** email+password login. Role-protected dashboard.

## Idempotency

- CheckoutRequest has unique `code` + dedupe by (phone, cart_hash, 5min window) to prevent double-submit
- WA send dedupe by `WaLog (checkoutId, template)` unique pair where applicable
