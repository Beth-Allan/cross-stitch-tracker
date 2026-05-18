---
phase: 20
slug: activity-visualization-calendar
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-17
---

# Phase 20 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.x (jsdom environment) |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm test -- --reporter=verbose` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~45 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --reporter=verbose`
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 45 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 20-01-01 | 01 | 1 | VIZ-06 | — | N/A | unit | `npx vitest run src/lib/queries/stats/pace-metrics.test.ts -x` | ❌ W1 | ⬜ pending |
| 20-01-02 | 01 | 1 | INS-04 | — | N/A | unit | `npx vitest run src/lib/queries/stats/pace-metrics.test.ts -x` | ❌ W1 | ⬜ pending |
| 20-01-03 | 01 | 1 | VIZ-01 | — | N/A | unit | `npx vitest run src/lib/queries/stats/monthly-totals.test.ts -x` | ❌ W1 | ⬜ pending |
| 20-01-04 | 01 | 1 | VIZ-05 | — | N/A | unit | `npx vitest run src/lib/queries/stats/day-of-week.test.ts -x` | ❌ W1 | ⬜ pending |
| 20-02-01 | 02 | 1 | VIZ-01 | — | N/A | unit | `npx vitest run src/components/features/stats/monthly-stitch-chart.test.tsx -x` | ❌ W1 | ⬜ pending |
| 20-02-02 | 02 | 1 | VIZ-05 | — | N/A | unit | `npx vitest run src/components/features/stats/day-of-week-chart.test.tsx -x` | ❌ W1 | ⬜ pending |
| 20-02-03 | 02 | 1 | VIZ-07 | — | N/A | unit | `npx vitest run src/components/features/stats/pace-cards.test.tsx -x` | ❌ W1 | ⬜ pending |
| 20-03-01 | 03 | 2 | VIZ-02, VIZ-03 | — | N/A | unit | `npx vitest run src/components/features/stats/stitching-calendar.test.tsx -x` | ❌ W2 | ⬜ pending |
| 20-03-02 | 03 | 2 | VIZ-04 | — | N/A | unit | `npx vitest run src/components/features/stats/session-history-table.test.tsx -x` | ❌ W2 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] Install shadcn `table` component: `npx shadcn@latest add table`
- [ ] Install shadcn `pagination` component: `npx shadcn@latest add pagination`

*Existing Vitest setup, recharts mocks, nuqs testing adapter, and Prisma mock patterns all apply.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Bar chart click navigates to monthly drill-down | VIZ-01 | onClick handler triggers client-side navigation | Click any bar → verify drill-down panel shows that month's daily data |
| Calendar month navigation is smooth | VIZ-03 | Visual/interaction feedback quality | Navigate prev/next months → verify no flicker or layout shift |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 45s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
