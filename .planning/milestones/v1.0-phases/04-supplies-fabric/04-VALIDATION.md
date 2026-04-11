---
phase: 4
slug: supplies-fabric
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-10
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm test -- --reporter=verbose` |
| **Full suite command** | `npm test -- --reporter=verbose` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --reporter=verbose`
- **After every plan wave:** Run `npm test -- --reporter=verbose`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 4-01-01 | 01 | 1 | SUPP-01 | — | N/A | unit | `npm test` | ❌ W0 | ⬜ pending |
| 4-01-02 | 01 | 1 | SUPP-02 | — | N/A | unit | `npm test` | ❌ W0 | ⬜ pending |
| 4-02-01 | 02 | 1 | SUPP-03 | — | Auth guard on actions | unit | `npm test` | ❌ W0 | ⬜ pending |
| 4-02-02 | 02 | 1 | SUPP-04 | — | Auth guard on actions | unit | `npm test` | ❌ W0 | ⬜ pending |
| 4-03-01 | 03 | 1 | REF-01 | — | N/A | unit | `npm test` | ❌ W0 | ⬜ pending |
| 4-03-02 | 03 | 1 | REF-02 | — | N/A | unit | `npm test` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- Existing test infrastructure covers all phase requirements (vitest, test-utils, mocks already established in Phases 2-3)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| DMC color swatches render correctly | SUPP-01 | Visual color accuracy | Browse thread catalog, verify hex colors match expected DMC colors |
| Shopping list grouping UX | SUPP-04 | Layout/grouping visual | Navigate to shopping list, verify items grouped by project |
| Fabric size auto-calculation display | REF-02 | Computed value presentation | Create fabric with dimensions, verify calculated size shows correctly |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
