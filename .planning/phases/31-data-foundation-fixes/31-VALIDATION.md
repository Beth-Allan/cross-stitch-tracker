---
phase: 31
slug: data-foundation-fixes
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-24
---

# Phase 31 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.x |
| **Config file** | jest.config.ts |
| **Quick run command** | `npm test -- --testPathPattern` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~45 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --testPathPattern`
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 45 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| TBD | TBD | TBD | SERIES-01 | N/A | Auth guard on create | Unit + Integration | `npm test -- series-actions` | No | Pending |
| TBD | TBD | TBD | SERIES-03 | N/A | Auth guard on update | Unit + Integration | `npm test -- series-actions` | No | Pending |
| TBD | TBD | TBD | SERIES-04 | N/A | Auth guard on delete | Unit + Integration | `npm test -- series-actions` | No | Pending |
| TBD | TBD | TBD | SERIES-10 | N/A | Correct progress math | Unit | `npm test -- series-progress` | No | Pending |
| TBD | TBD | TBD | FIX-01 | N/A | Zero TS errors | Type check | `npx tsc --noEmit` | Yes | Pending |
| TBD | TBD | TBD | FIX-02 | N/A | allSettled resilience | Unit | `npm test -- stats` | Yes | Pending |
