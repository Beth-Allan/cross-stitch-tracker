---
phase: 18
slug: stats-engine-charting-foundation
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-05-17
---

# Phase 18 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.1.1 |
| **Config file** | vitest.config.ts |
| **Quick run command** | `npx vitest run src/lib/queries/stats/ src/components/features/stats/ --reporter=verbose` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/lib/queries/stats/ src/components/features/stats/ --reporter=verbose`
- **After every plan wave:** Run `npx vitest run`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 18-01-01 | 01 | 1 | STAT-03, STAT-04 | — | N/A | unit | `npx vitest run src/lib/queries/stats/timezone.test.ts src/lib/chart-configs.test.ts` | ❌ W0 | ⬜ pending |
| 18-01-02 | 01 | 1 | STAT-04 | — | N/A | unit | `npx vitest run src/lib/chart-configs.test.ts` | ❌ W0 | ⬜ pending |
| 18-02-01 | 02 | 2 | STAT-01, STAT-02 | — | N/A | unit | `npx vitest run src/lib/queries/stats/hero-stats.test.ts src/lib/queries/stats/collection-breakdown.test.ts` | ❌ W0 | ⬜ pending |
| 18-02-02 | 02 | 2 | STAT-02 | — | N/A | unit | `npx vitest run src/lib/actions/session-actions.test.ts` | ✅ | ⬜ pending |
| 18-03-01 | 03 | 3 | STAT-04 | — | N/A | unit | `npx vitest run src/components/features/stats/collection-status-chart.test.tsx` | ❌ W0 | ⬜ pending |
| 18-03-02 | 03 | 3 | STAT-01 | — | requireAuth() called before queries | unit | `npx vitest run src/app/(dashboard)/stats/page.test.ts src/components/features/stats/stats-page-shell.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/queries/stats/timezone.test.ts` — timezone boundary tests for STAT-03
- [ ] `src/lib/chart-configs.test.ts` — chart config CSS variable token tests for STAT-04
- [ ] `src/lib/queries/stats/hero-stats.test.ts` — hero stats aggregation tests for STAT-01
- [ ] `src/lib/queries/stats/collection-breakdown.test.ts` — collection breakdown tests for STAT-01
- [ ] `src/components/features/stats/collection-status-chart.test.tsx` — chart rendering tests for STAT-04
- [ ] `src/app/(dashboard)/stats/page.test.ts` — page auth + Promise.all orchestration for STAT-01
- [ ] `src/components/features/stats/stats-page-shell.test.tsx` — tab shell rendering tests

*Existing test infrastructure (vitest, test-utils, mock factories) covers framework needs.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Chart renders with design system colors | STAT-04 | Visual verification | Open stats page, confirm emerald/amber/stone tokens match globals.css --chart-* vars |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
