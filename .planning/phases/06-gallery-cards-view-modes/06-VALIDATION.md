---
phase: 6
slug: gallery-cards-view-modes
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-13
---

# Phase 6 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.x (via next/jest) |
| **Config file** | `jest.config.ts` |
| **Quick run command** | `npm test -- --testPathPattern=gallery\|view-mode\|filter` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --testPathPattern=gallery\|view-mode\|filter`
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| TBD | TBD | TBD | GLRY-01 | — | N/A | unit+integration | `npm test` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Gallery card component tests — stubs for GLRY-01
- [ ] View mode switching tests — stubs for GLRY-02
- [ ] Sort logic tests — stubs for GLRY-03
- [ ] Search/filter tests — stubs for GLRY-04, GLRY-05

*Existing test infrastructure (jest, test-utils, mocks) covers all framework requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Gallery card visual appearance matches DesignOS | GLRY-01 | Visual fidelity check | Compare rendered cards against gallery-cards.png screenshot |
| Celebration border/glow on Finished cards | GLRY-01 | CSS visual effect | Verify violet/rose glow ring visible on Finished/FFO cards |
| Responsive grid layout at breakpoints | GLRY-01 | Viewport-dependent | Resize browser, verify 1/2/3/4 column layouts |
| Cover image aspect ratio in gallery cards | GLRY-01 | Visual check | Verify 4:3 aspect with object-cover, no distortion |

*All other behaviors have automated verification.*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
