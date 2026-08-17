---
phase: 32
slug: series-management-pages
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-24
---

# Phase 32 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.x + @testing-library/react |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npm test -- --run src/components/features/series/ src/lib/actions/series-actions.test.ts` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --run src/components/features/series/ src/lib/actions/series-actions.test.ts`
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 32-01-01 | 01 | 1 | SERIES-02 | — | N/A | unit | `npm test -- --run src/components/features/series/series-list.test.tsx` | ❌ W0 | ⬜ pending |
| 32-01-02 | 01 | 1 | SERIES-02 | — | N/A | unit | `npm test -- --run src/components/features/series/series-form-modal.test.tsx` | ❌ W0 | ⬜ pending |
| 32-02-01 | 02 | 1 | SERIES-05 | — | N/A | unit | `npm test -- --run src/components/features/series/series-detail.test.tsx` | ❌ W0 | ⬜ pending |
| 32-02-02 | 02 | 1 | SERIES-05 | — | N/A | unit | `npm test -- --run src/lib/actions/series-actions.test.ts` | ✅ | ⬜ pending |
| 32-03-01 | 03 | 1 | SERIES-02 | — | N/A | unit | `npm test -- --run src/components/features/series/series-list.test.tsx` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/components/features/series/series-list.test.tsx` — covers SERIES-02 rendering, sorting, empty state, delete
- [ ] `src/components/features/series/series-detail.test.tsx` — covers SERIES-05 rendering, inline edit, chart rows, sort
- [ ] `src/components/features/series/series-form-modal.test.tsx` — covers create modal validation, submission, error handling
- [ ] Mock factory: `createMockSeriesWithStats` and `createMockSeriesChart` helpers in `@/__tests__/mocks/factories.ts`

*Existing infrastructure covers series-actions.test.ts (Phase 31).*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Loading skeleton displays card-shaped placeholders | SERIES-02 (D-13) | Visual appearance not unit-testable | Navigate to /series, observe skeleton during load |
| Progress bar visual width matches percentage | SERIES-02, SERIES-05 | CSS width rendering | Inspect progress bars across series with varying completion |
| Nav item appears in correct sidebar section | SERIES-02 (D-11) | Shell integration | Verify "Series" appears in Projects nav section |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
