# ADR-0003 — Rename settings key `wa_number` → `admin_wa_number`

**Status:** accepted, 2026-05-20

## Context

`Setting` (key/value) rows store editable business config.
`wa.service.notifyAdmin*` reads the admin recipient from key
`admin_wa_number`. The admin UI's Settings form, however, exposed a key
named `wa_number`. Editing it appeared to succeed but **silently did
nothing** for admin notifications — the system continued to read a
separate, hidden key.

Additionally, `SettingsUpsert` was a permissive `z.record(string, string)`
with a refine for "unknown settings key" — error path was `[]`, giving
the UI no field to highlight.

## Decision

1. Rename the form key and `SETTINGS_KEYS` entry from `wa_number` to
   `admin_wa_number` (matches the runtime reader).
2. Replace the permissive schema with a `z.object({...}).strict()` listing
   each known key with its own rule:
   - `admin_wa_number`: regex `^62\d{8,14}$` (or empty).
   - `business_email`: regex (or empty).
   - all others: bounded `max`.
3. Client filters PUT body to known keys only — avoids echoing back
   read-only rows from `listSettings` (e.g. `reminder_h*_enabled`).
4. Surface `issues[].path` + `issues[].message` in admin toasts.

## Consequences

- "Edit admin WA in /settings" now actually changes who gets notified.
- 400 responses carry a precise `path` per field — UI can flag it inline.
- Existing DB rows named `wa_number` (if any) become orphans (UI ignores
  them). Cleanup with `DELETE FROM "Setting" WHERE key='wa_number';`.
- System keys not editable in UI (`reminder_h1_enabled`,
  `reminder_h3_enabled`) remain in DB and are still consumed by reminder
  logic — they just won't be sent on PUT from the form anymore.
