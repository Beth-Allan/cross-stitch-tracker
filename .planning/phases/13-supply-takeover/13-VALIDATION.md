---
phase: 13
slug: supply-takeover
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-13
---

# Phase 13 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.x (via next/jest) |
| **Config file** | jest.config.ts |
| **Quick run command** | `npm test -- --testPathPattern="supply-takeover\|creation-flow-adapter\|batch-add\|calculator-card\|summary-bar"` |
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
| 13-01-01 | 01 | 1 | TAKE-01 | — | N/A | unit | `npm test -- --testPathPattern="creation-flow-adapter"` | ❌ W0 | ⬜ pending |
| 13-01-02 | 01 | 1 | TAKE-01 | — | N/A | unit | `npm test -- --testPathPattern="summary-bar"` | ❌ W0 | ⬜ pending |
| 13-02-01 | 02 | 1 | TAKE-03 | — | N/A | unit | `npm test -- --testPathPattern="calculator-card"` | ❌ W0 | ⬜ pending |
| 13-02-02 | 02 | 1 | TAKE-03 | — | N/A | unit | `npm test -- --testPathPattern="fabric-picker"` | ❌ W0 | ⬜ pending |
| 13-03-01 | 03 | 2 | TAKE-04 | — | Atomic save prevents orphan records | integration | `npm test -- --testPathPattern="batch-add-supplies"` | ❌ W0 | ⬜ pending |
| 13-03-02 | 03 | 2 | TAKE-02 | — | N/A | unit | `npm test -- --testPathPattern="supply-takeover"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Test stubs for CreationFlowAdapter (implements SupplyTableAdapter interface)
- [ ] Test stubs for SummaryBar component (live form binding)
- [ ] Test stubs for CalculatorCard component (fabric assignment + segmented controls)
- [ ] Test stubs for batchAddSupplies server action (atomic $transaction)
- [ ] Test stubs for draft persistence v2 (supply row backup + restore)

*Existing infrastructure (jest, test-utils, shared mocks) covers framework needs.*

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
