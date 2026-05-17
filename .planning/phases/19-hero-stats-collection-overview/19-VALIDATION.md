---
phase: 19
slug: hero-stats-collection-overview
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-17
---

# Phase 19 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | jest 29.x |
| **Config file** | `jest.config.ts` |
| **Quick run command** | `npm test -- --bail` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~45 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --bail`
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 45 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 19-01-01 | 01 | 1 | HERO-01 | — | N/A | unit | `npm test -- --testPathPattern=lifetime-counters` | ❌ W0 | ⬜ pending |
| 19-01-02 | 01 | 1 | HERO-02 | — | N/A | unit | `npm test -- --testPathPattern=metrics-bar` | ❌ W0 | ⬜ pending |
| 19-02-01 | 02 | 1 | HERO-04 | — | N/A | unit | `npm test -- --testPathPattern=size-breakdown` | ❌ W0 | ⬜ pending |
| 19-02-02 | 02 | 1 | HERO-05 | — | N/A | unit | `npm test -- --testPathPattern=designer-breakdown` | ❌ W0 | ⬜ pending |
| 19-02-03 | 02 | 1 | HERO-06 | — | N/A | unit | `npm test -- --testPathPattern=genre-breakdown` | ❌ W0 | ⬜ pending |
| 19-03-01 | 03 | 2 | INS-06 | — | N/A | unit | `npm test -- --testPathPattern=ranked-list` | ❌ W0 | ⬜ pending |
| 19-04-01 | 04 | 2 | HERO-03 | — | N/A | unit | `npm test -- --testPathPattern=overview-layout` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements — jest, testing-library, and shared mocks already in place from Phase 18.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Charts render visually correct colors/layout | HERO-03, HERO-04, HERO-05, HERO-06 | Recharts canvas rendering not inspectable by jest-dom | Visit /stats, visually confirm chart colors match chart-configs, responsive layout works at mobile/desktop |
| Entity links navigate to correct detail pages | INS-06 | End-to-end navigation flow | Click designer/genre/project links in ranked lists, confirm correct detail page loads |
| Cache invalidation on session log | HERO-02 | Requires live server + database interaction | Log a stitching session, return to /stats, confirm time-window counters update |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 45s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
