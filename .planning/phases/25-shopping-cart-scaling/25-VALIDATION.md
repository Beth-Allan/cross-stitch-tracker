---
phase: 25
slug: shopping-cart-scaling
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-18
---

# Phase 25 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx vitest run src/components/features/shopping/ --reporter=verbose` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~45 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/components/features/shopping/ --reporter=verbose`
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 45 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 25-01-01 | 01 | 1 | CRIT-02 | — | N/A | unit | `npx vitest run src/components/features/shopping/project-search-input.test.tsx src/components/features/shopping/supply-search-input.test.tsx` | ✅ | ⬜ pending |
| 25-01-02 | 01 | 1 | CRIT-02 | — | N/A | unit | `npx vitest run src/components/features/shopping/status-group.test.tsx src/components/features/shopping/selection-counter.test.tsx` | ✅ | ⬜ pending |
| 25-02-01 | 02 | 2 | CRIT-02 | — | N/A | unit | `npx vitest run src/components/features/shopping/shopping-cart.test.tsx` | ✅ | ⬜ pending |
| 25-02-02 | 02 | 2 | CRIT-02 | — | N/A | unit | `npx vitest run src/components/features/shopping/project-accordion.test.tsx src/components/features/shopping/supply-overview.test.tsx` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements. New test files are created as part of Wave 1 tasks (Plan 01), not as pre-existing Wave 0 infrastructure.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Shopping cart responsive with 75+ projects | CRIT-02 | Performance perception is subjective | Load shopping cart with 75+ projects, verify no visible lag on filter/search |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 45s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-05-18
