---
phase: 7
slug: project-detail-experience
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-04-15
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.1.1 |
| **Config file** | `vitest.config.ts` (root) |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 07-01-01 | 01 | 1 | CALC-02 | T-07-01 | Zod validates strandCount, overCount, wastePercent ranges | unit | `npx vitest run src/lib/utils/skein-calculator.test.ts` | ❌ W0 | ⬜ pending |
| 07-01-02 | 01 | 1 | CALC-01 | — | N/A | unit | `npx vitest run src/lib/actions/supply-actions.test.ts -t "stitch count"` | ❌ W0 | ⬜ pending |
| 07-02-01 | 02 | 1 | — | T-07-02 | requireAuth + ownership on updateProjectSettings | unit + integration | `npx vitest run src/components/features/charts/project-detail/project-detail-hero.test.tsx` | ❌ W0 | ⬜ pending |
| 07-03-01 | 03 | 2 | CALC-01, CALC-03 | T-07-03 | IDOR check on supply mutation | unit + integration | `npx vitest run src/components/features/charts/project-detail/supply-row.test.tsx` | ❌ W0 | ⬜ pending |
| 07-03-02 | 03 | 2 | CALC-04 | — | N/A | unit | `npx vitest run src/components/features/charts/project-detail/supplies-tab.test.tsx -t "total"` | ❌ W0 | ⬜ pending |
| 07-03-03 | 03 | 2 | CALC-05 | — | N/A | unit + integration | `npx vitest run src/components/features/charts/project-detail/calculator-settings-bar.test.tsx` | ❌ W0 | ⬜ pending |
| 07-04-01 | 04 | 2 | SUPP-01 | — | N/A | unit | `npx vitest run src/lib/actions/supply-actions.test.ts -t "insertion order"` | ❌ W0 | ⬜ pending |
| 07-04-02 | 04 | 2 | — | T-07-04 | Zod trim+min on inline create names, XSS prevention | unit | `npx vitest run src/components/features/supplies/search-to-add.test.tsx -t "create"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/utils/skein-calculator.test.ts` — stubs for calculateSkeins() pure function (CALC-02)
- [ ] `src/components/features/charts/project-detail/supply-row.test.tsx` — stubs for stitch count entry, override detection (CALC-01, CALC-03)
- [ ] `src/components/features/charts/project-detail/supplies-tab.test.tsx` — stubs for section totals, insertion order (CALC-04, SUPP-01)
- [ ] `src/components/features/charts/project-detail/calculator-settings-bar.test.tsx` — stubs for inline editing, project settings save (CALC-05)
- [ ] `src/components/features/charts/project-detail/project-tabs.test.tsx` — stubs for URL state sync, tab switching
- [ ] `src/components/features/charts/project-detail/overview-tab.test.tsx` — stubs for status-aware section ordering
- [ ] `src/components/features/charts/project-detail/project-detail-hero.test.tsx` — stubs for cover image rendering, no-image fallback, status badge

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Hero cover image blurred bg fill | D-01 | Visual rendering quality | Navigate to a project with a square/vertical cover image; verify blurred background fill appears behind object-contain image |
| Status-aware overview section order | D-06 | Layout ordering depends on visual inspection | Check WIP project shows progress first; Unstarted shows kitting checklist; Finished shows celebration |
| Settings bar progressive disclosure | D-17 | UI timing/visibility | Add a supply with no stitch count — settings bar hidden; enter stitch count — settings bar appears |
| Two-line supply row visual density | D-14 | Visual layout quality | Verify swatch+code+name on line 1, numbers on line 2, dense but readable |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
