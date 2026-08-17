---
phase: 13
slug: supply-takeover
status: draft
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-13
---

# Phase 13 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.x |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npm test -- src/components/features/charts/creation-flow-adapter src/components/features/charts/summary-bar src/components/features/charts/calculator-card src/lib/actions/chart-actions` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~45 seconds |

---

## Sampling Rate

- **After every task commit:** Run quick command (phase-scoped tests)
- **After every plan wave:** Run full suite
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 45 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 13-01-01 | 01 | 1 | TAKE-03 | — | N/A | unit | `npm test -- src/components/features/charts/creation-flow-adapter` | TDD creates | ⬜ pending |
| 13-01-02 | 01 | 1 | TAKE-04 | — | Atomic save prevents orphan records | integration | `npm test -- src/lib/actions/chart-actions` | TDD creates | ⬜ pending |
| 13-02-01 | 02 | 1 | TAKE-02 | — | N/A | unit | `npm test -- src/components/features/charts/summary-bar` | TDD creates | ⬜ pending |
| 13-02-02 | 02 | 1 | TAKE-03 | — | N/A | unit | `npm test -- src/components/features/charts/calculator-card` | TDD creates | ⬜ pending |
| 13-03-01 | 03 | 2 | TAKE-01 | — | N/A | integration | `npm test -- src/components/features/charts/chart-merged-form` | TDD creates | ⬜ pending |
| 13-03-02 | 03 | 2 | TAKE-02 | — | N/A | visual | Manual checkpoint | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*No Wave 0 stubs needed — all plans use TDD (tests written before implementation within each task). Existing infrastructure (Vitest, test-utils, shared mocks) covers framework needs.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Mode toggle feels instant (no flash/spinner) | TAKE-01 | Visual timing perception | Click "Add supplies →", verify immediate transition with no loading state |
| Sticky summary bar layering | TAKE-02 | CSS stacking context | Scroll in supply mode, verify summary bar stays visible above content |
| "← Details" returns without scroll reset | TAKE-02 | Scroll position preservation | Toggle to details, verify page position preserved |

*Activity toggle preserves DOM state — automated tests verify state, manual tests verify perception.*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 45s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
