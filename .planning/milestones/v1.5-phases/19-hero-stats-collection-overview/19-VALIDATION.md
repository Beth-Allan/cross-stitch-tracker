---
phase: 19
slug: hero-stats-collection-overview
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-05-17
---

# Phase 19 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.1.1 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run --bail 1` |
| **Full suite command** | `npm test -- --run` |
| **Estimated runtime** | ~45 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --bail 1`
- **After every plan wave:** Run `npm test -- --run`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 45 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 19-01-T1 | 01 | 1 | HERO-04, HERO-05, HERO-06 | — | N/A | unit | `npx vitest run src/lib/chart-configs.test.ts` | ❌ W0 | ⬜ pending |
| 19-01-T2 | 01 | 1 | HERO-04, HERO-05, HERO-06 | — | N/A | unit | `npx vitest run src/lib/queries/stats/size-breakdown.test.ts src/lib/queries/stats/designer-breakdown.test.ts src/lib/queries/stats/genre-breakdown.test.ts` | ❌ W0 | ⬜ pending |
| 19-02-T1 | 02 | 1 | HERO-02 | — | N/A | unit | `npx vitest run src/components/features/stats/metrics-bar.test.tsx` | ❌ W0 | ⬜ pending |
| 19-02-T2 | 02 | 1 | HERO-01 | — | N/A | unit | `npx vitest run src/components/features/stats/lifetime-counters.test.tsx` | ❌ W0 | ⬜ pending |
| 19-03-T1 | 03 | 2 | INS-06, HERO-04 | — | N/A | unit | `npx vitest run src/components/features/stats/ranked-list.test.tsx src/components/features/stats/size-category-chart.test.tsx` | ❌ W0 | ⬜ pending |
| 19-03-T2 | 03 | 2 | HERO-05, HERO-06 | — | N/A | unit | `npx vitest run src/components/features/stats/designer-breakdown-chart.test.tsx src/components/features/stats/genre-distribution-chart.test.tsx` | ❌ W0 | ⬜ pending |
| 19-03-T3 | 03 | 2 | HERO-01..06, INS-06 | — | N/A | unit | `npx vitest run src/components/features/stats/stats-overview.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

*Existing infrastructure covers all phase requirements — Vitest, testing-library, and shared mocks already in place from Phase 18.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Charts render visually correct colors/layout | HERO-03, HERO-04, HERO-05, HERO-06 | Recharts SVG rendering not fully inspectable in jsdom | Visit /stats, visually confirm chart colors match chart-configs, responsive layout works at mobile/desktop |
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
