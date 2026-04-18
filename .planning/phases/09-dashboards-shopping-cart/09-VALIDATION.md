---
phase: 9
slug: dashboards-shopping-cart
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-17
---

# Phase 9 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest 3.1.1 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose` (affected files)
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 09-01-01 | 01 | 1 | DASH-01 | — | userId filter on all queries | unit | `npx vitest run src/lib/actions/dashboard-actions.test.ts -t "currently stitching"` | ❌ W0 | ⬜ pending |
| 09-01-02 | 01 | 1 | DASH-02 | — | userId filter on all queries | unit | `npx vitest run src/lib/actions/dashboard-actions.test.ts -t "start next"` | ❌ W0 | ⬜ pending |
| 09-01-03 | 01 | 1 | DASH-03 | — | userId filter on all queries | unit | `npx vitest run src/lib/actions/dashboard-actions.test.ts -t "buried treasures"` | ❌ W0 | ⬜ pending |
| 09-01-04 | 01 | 1 | DASH-04 | — | userId filter on all queries | unit | `npx vitest run src/lib/actions/dashboard-actions.test.ts -t "spotlight"` | ❌ W0 | ⬜ pending |
| 09-01-05 | 01 | 1 | DASH-05 | — | userId filter on all queries | unit | `npx vitest run src/lib/actions/dashboard-actions.test.ts -t "collection stats"` | ❌ W0 | ⬜ pending |
| 09-02-01 | 02 | 1 | PROJ-01 | — | userId filter on all queries | unit | `npx vitest run src/lib/actions/project-dashboard-actions.test.ts -t "hero stats"` | ❌ W0 | ⬜ pending |
| 09-02-02 | 02 | 1 | PROJ-02 | — | userId filter on all queries | unit | `npx vitest run src/lib/actions/project-dashboard-actions.test.ts -t "progress buckets"` | ❌ W0 | ⬜ pending |
| 09-02-03 | 02 | 1 | PROJ-04 | — | userId filter on all queries | unit | `npx vitest run src/lib/actions/project-dashboard-actions.test.ts -t "finished"` | ❌ W0 | ⬜ pending |
| 09-03-01 | 03 | 1 | SHOP-01 | — | N/A (client-side) | unit | `npx vitest run src/components/features/shopping/shopping-cart.test.tsx -t "project selection"` | ❌ W0 | ⬜ pending |
| 09-03-02 | 03 | 1 | SHOP-02 | — | N/A (client-side) | unit | `npx vitest run src/components/features/shopping/shopping-cart.test.tsx -t "supply aggregation"` | ❌ W0 | ⬜ pending |
| 09-03-03 | 03 | 1 | SHOP-03 | T-09-01 | IDOR check: verify junction ownership | unit | `npx vitest run src/lib/actions/shopping-cart-actions.test.ts -t "update acquired"` | ❌ W0 | ⬜ pending |
| 09-03-04 | 03 | 1 | SHOP-04 | — | N/A (client-side) | unit | `npx vitest run src/components/features/shopping/shopping-cart.test.tsx -t "badge counts"` | ❌ W0 | ⬜ pending |
| 09-04-01 | 04 | 2 | DASH-06 | — | N/A | unit | `npx vitest run src/components/features/dashboard/quick-add-menu.test.tsx` | ❌ W0 | ⬜ pending |
| 09-04-02 | 04 | 2 | PROJ-03 | — | N/A | unit | `npx vitest run src/components/features/dashboard/progress-breakdown-tab.test.tsx` | ❌ W0 | ⬜ pending |
| 09-04-03 | 04 | 2 | PROJ-05 | — | N/A | unit | `npx vitest run src/components/features/dashboard/finished-tab.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/actions/dashboard-actions.test.ts` — stubs for DASH-01 through DASH-05
- [ ] `src/lib/actions/project-dashboard-actions.test.ts` — stubs for PROJ-01, PROJ-02, PROJ-04
- [ ] `src/lib/actions/shopping-cart-actions.test.ts` — stubs for SHOP-03
- [ ] `src/components/features/dashboard/quick-add-menu.test.tsx` — stubs for DASH-06
- [ ] `src/components/features/dashboard/progress-breakdown-tab.test.tsx` — stubs for PROJ-03
- [ ] `src/components/features/dashboard/finished-tab.test.tsx` — stubs for PROJ-05
- [ ] `src/components/features/shopping/shopping-cart.test.tsx` — stubs for SHOP-01, SHOP-02, SHOP-04
- [ ] `src/types/dashboard.ts` — shared TypeScript interfaces
- [ ] Extend `src/__tests__/mocks/factories.ts` with dashboard mock data factories

*Existing infrastructure covers framework/config. Wave 0 creates test stubs and interfaces only.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Horizontal scroll with arrow buttons on Currently Stitching | DASH-01 | CSS scroll-snap behavior + visual layout | Verify cards scroll horizontally with snap, arrows appear on hover |
| Stacked bar chart visual rendering | PROJ-02 | Visual/CSS fidelity | Verify bar segments are proportional and use correct bucket colors |
| localStorage persistence across page refreshes | SHOP-01 | Browser state persistence | Select projects, refresh page, verify selections persist |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
