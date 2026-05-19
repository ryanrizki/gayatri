# 01 — Reminder silently dropped when template missing/inactive at scan time

**Status:** ready-for-agent

## Context

`InternalService.scanReminders()` (`apps/api/src/internal/internal.service.ts`) ports the old worker cron behavior verbatim, including an intentional quirk preserved during the free-hosting refactor (Task 7):

`queueReminder()` early-returns without creating a `WaLog` row when the reminder template (`T-CUS-005` / `T-CUS-006`) is missing or inactive. The caller still unconditionally sets `reminderH1Sent` / `reminderH3Sent = true`. Net effect: if a template is deleted or temporarily deactivated when the scan runs, the customer permanently misses that reminder — no `WaLog`, no retry, no operator visibility.

This is locked by a test (`still marks reminderH1Sent when template missing`) so the behavior is documented and won't change by accident. Preserving it was deliberate (behavior-faithful port, avoid scope creep in Task 7).

## Remaining

Decide and implement the correct recovery behavior:

- When the template is **inactive** at scan time, do NOT mark `reminderXSent=true` — leave the flag false so the next tick re-finds the booking and queues the reminder once the template is re-activated. (Mirrors how `drainWaJobs` already treats inactive templates as a retryable FAILED.)
- When the template is **deleted** (null), decide: fail-fast (mark sent + log/alert, accept the drop) vs. treat as transient. Likely log + mark sent (a deleted template code is a config error, not transient) — but make it a deliberate, visible decision (audit log / metric), not a silent drop.
- Update/extend the `scanReminders` tests to lock the chosen behavior (replace the current "still marks when missing" expectation for the inactive case).

## Done when

A booking whose reminder template is inactive at scan time still receives its reminder after the template is re-activated (verified by test); the deleted-template path is an explicit, logged decision rather than a silent drop.
