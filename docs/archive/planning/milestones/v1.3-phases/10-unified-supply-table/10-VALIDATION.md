---
phase: 10
slug: unified-supply-table
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-03
---

# Phase 10 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npm test -- --reporter=verbose` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --reporter=verbose`
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| TBD | TBD | TBD | SUPTBL-01 | — | N/A | unit | `npm test` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | SUPTBL-02 | — | N/A | unit | `npm test` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | SUPTBL-03 | — | N/A | unit | `npm test` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | SUPTBL-04 | — | N/A | unit | `npm test` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | SUPENT-01 | — | N/A | unit | `npm test` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | SUPENT-02 | — | N/A | unit | `npm test` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | SUPENT-03 | — | N/A | unit | `npm test` | ❌ W0 | ⬜ pending |
| TBD | TBD | TBD | SUPENT-04 | — | N/A | unit | `npm test` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] New test files for supply-table components — stubs for SUPTBL-01 through SUPTBL-04, SUPENT-01 through SUPENT-04
- [ ] Test factories for local-state adapter mock data

*Existing infrastructure covers test framework and shared mocks.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Keyboard flow feels responsive | SUPENT-01 | UX feel cannot be automated | Tab through add row, type code, arrow through autocomplete, Enter to commit |
| SVG donut visual proportions | SUPTBL-04 | Visual correctness | Inspect donut rings at 0%, 50%, 100% fill levels |
| Portal autocomplete positioning | SUPENT-02 | Stacking context behavior | Scroll table, verify dropdown stays anchored to input |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
