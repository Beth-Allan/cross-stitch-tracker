---
phase: 11
slug: supply-table-on-project-detail
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-10
---

# Phase 11 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.1.2 + @testing-library/react 16.3.0 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run --reporter=verbose src/components/features/supply-table/server-action-adapter.test.ts src/components/features/charts/project-detail/supplies-tab.test.tsx` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~45 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose src/components/features/supply-table/server-action-adapter.test.ts src/components/features/charts/project-detail/supplies-tab.test.tsx`
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 45 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 11-01-01 | 01 | 1 | DETAIL-02 | T-11-01 / inherited | requireAuth + ownership check on all supply mutations | unit | `npx vitest run src/components/features/supply-table/server-action-adapter.test.ts -x` | ❌ W0 | ⬜ pending |
| 11-01-02 | 01 | 1 | DETAIL-02 | — | N/A | unit | `npx vitest run src/components/features/supply-table/server-action-adapter.test.ts -x` | ❌ W0 | ⬜ pending |
| 11-02-01 | 02 | 1 | DETAIL-01 | — | N/A | unit | `npx vitest run src/components/features/supply-table/types.ts -x` | ✅ | ⬜ pending |
| 11-03-01 | 03 | 2 | DETAIL-01 | — | N/A | integration | `npx vitest run src/components/features/charts/project-detail/supplies-tab.test.tsx -x` | ❌ W0 | ⬜ pending |
| 11-03-02 | 03 | 2 | DETAIL-01 | — | N/A | integration | `npx vitest run src/components/features/charts/project-detail/supplies-tab.test.tsx -x` | ❌ W0 | ⬜ pending |
| 11-04-01 | 04 | 2 | D-07/D-10 | — | N/A | unit | `npx vitest run src/components/features/supply-table/server-action-adapter.test.ts -x` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/components/features/supply-table/server-action-adapter.test.ts` — stubs for DETAIL-02, D-07/D-10
- [ ] `src/components/features/charts/project-detail/supplies-tab.test.tsx` — full rewrite for new component (covers DETAIL-01)

*Existing infrastructure covers test framework setup, mock factories, and all Phase 10 supply-table component tests.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Slide-in animation visible on new row add | D-09 | CSS animation timing is visual | Add a supply, observe row appears with fade+slide animation |
| Sort toggle visual placement matches old tab | D-04 | Layout positioning is visual | Compare old and new tab sort toggle placement |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 45s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
