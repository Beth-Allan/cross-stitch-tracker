---
phase: 12
slug: merged-form
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-10
---

# Phase 12 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.x (via next/jest) |
| **Config file** | jest.config.ts |
| **Quick run command** | `npm test -- --testPathPattern="merged-form\|pattern-type\|sticky-save\|draft"` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --testPathPattern="merged-form\|pattern-type\|sticky-save\|draft"`
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 12-01-01 | 01 | 1 | FORM-01 | — | N/A | unit | `npm test -- --testPathPattern="merged-form"` | ❌ W0 | ⬜ pending |
| 12-02-01 | 02 | 1 | FORM-02 | — | N/A | unit | `npm test -- --testPathPattern="pattern-type"` | ❌ W0 | ⬜ pending |
| 12-03-01 | 03 | 1 | FORM-03 | — | N/A | unit | `npm test -- --testPathPattern="sticky-save\|draft"` | ❌ W0 | ⬜ pending |
| 12-04-01 | 04 | 2 | FORM-04 | — | N/A | unit | `npm test -- --testPathPattern="digital-working-copy\|upload"` | ❌ W0 | ⬜ pending |
| 12-05-01 | 05 | 2 | FORM-05 | — | N/A | integration | `npm test -- --testPathPattern="create-chart"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Test stubs for merged form page component
- [ ] Test stubs for PatternTypeCards component
- [ ] Test stubs for StickySaveBar component
- [ ] Test stubs for draft persistence hook
- [ ] Shared mock fixtures for form data in `@/__tests__/mocks/`

*Existing test infrastructure (jest, test-utils, mock patterns) covers framework needs.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Sticky save bar stays visible on scroll | FORM-03 | CSS position:fixed layout behavior | Scroll form on mobile viewport (375px) and desktop (1024px), verify bar stays at bottom |
| 2x2 card grid visual layout | FORM-02 | Grid visual alignment | View pattern type cards at 375px and 720px widths, verify 2x2 layout |
| Green dot indicator visibility | FORM-03 | Visual indicator styling | Check required fields show green dots, verify contrast ratio |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
