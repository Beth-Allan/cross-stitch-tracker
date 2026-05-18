---
phase: 21
slug: records-insights-celebrations
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-18
---

# Phase 21 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.1.1 + @testing-library/react 16.3.2 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm test -- --testPathPattern=stats` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~45 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run src/lib/queries/stats/ src/components/features/stats/`
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 45 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 21-01-01 | 01 | 1 | REC-01 | — | requireAuth() on query | unit | `npx vitest run src/lib/queries/stats/personal-bests.test.ts` | ❌ W0 | ⬜ pending |
| 21-01-02 | 01 | 1 | REC-02 | — | projectId/chartId validated | unit | `npx vitest run src/lib/queries/stats/personal-bests.test.ts` | ❌ W0 | ⬜ pending |
| 21-01-03 | 01 | 1 | REC-04 | — | year param validated via nuqs | unit | `npx vitest run src/lib/queries/stats/personal-bests.test.ts` | ❌ W0 | ⬜ pending |
| 21-01-04 | 01 | 1 | REC-05 | — | requireAuth() on query | unit | `npx vitest run src/lib/queries/stats/fastest-completions.test.ts` | ❌ W0 | ⬜ pending |
| 21-02-01 | 02 | 1 | REC-03 | — | record detection post-insert only | unit | `npx vitest run src/lib/queries/stats/record-detection.test.ts` | ❌ W0 | ⬜ pending |
| 21-02-02 | 02 | 1 | REC-03 (UI) | — | N/A | unit | `npx vitest run src/components/features/stats/record-celebration.test.tsx` | ❌ W0 | ⬜ pending |
| 21-03-01 | 03 | 1 | INS-01 | — | requireAuth() on query | unit | `npx vitest run src/lib/queries/stats/thread-insights.test.ts` | ❌ W0 | ⬜ pending |
| 21-03-02 | 03 | 1 | INS-02 | — | requireAuth() on query | unit | `npx vitest run src/lib/queries/stats/designer-insights.test.ts` | ❌ W0 | ⬜ pending |
| 21-03-03 | 03 | 1 | INS-03 | — | requireAuth() on query | unit | `npx vitest run src/lib/queries/stats/genre-insights.test.ts` | ❌ W0 | ⬜ pending |
| 21-04-01 | 04 | 2 | INS-05 | — | requireAuth() on query | unit | `npx vitest run src/lib/queries/stats/completion-estimates.test.ts` | ❌ W0 | ⬜ pending |
| 21-04-02 | 04 | 2 | REC-01 (UI) | — | N/A | unit | `npx vitest run src/components/features/stats/records-table.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/queries/stats/personal-bests.test.ts` — stubs for REC-01, REC-02, REC-04
- [ ] `src/lib/queries/stats/fastest-completions.test.ts` — stubs for REC-05
- [ ] `src/lib/queries/stats/record-detection.test.ts` — stubs for REC-03
- [ ] `src/lib/queries/stats/thread-insights.test.ts` — stubs for INS-01
- [ ] `src/lib/queries/stats/designer-insights.test.ts` — stubs for INS-02
- [ ] `src/lib/queries/stats/genre-insights.test.ts` — stubs for INS-03
- [ ] `src/lib/queries/stats/completion-estimates.test.ts` — stubs for INS-05
- [ ] `src/lib/queries/stats/available-years.test.ts` — stubs for year detection
- [ ] Install: `npm install canvas-confetti@1.9.4 && npm install -D @types/canvas-confetti@1.9.0`

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Confetti burst visual quality | REC-03 | Canvas animation timing | Log session that breaks a record, verify confetti fires from center-top with gold/amber/emerald particles, fades within 2 seconds |
| Toast stacking for multiple records | REC-03 | Sonner stacking behavior | Log session breaking 2+ records, verify toasts stack without overlapping |
| Year scope toggle reactivity | REC-04 | URL state + server re-render | Toggle between years, verify all sections update simultaneously |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 45s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
