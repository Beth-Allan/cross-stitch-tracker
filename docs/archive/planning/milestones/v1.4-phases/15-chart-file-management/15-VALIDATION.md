---
phase: 15
slug: chart-file-management
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-16
nyquist_verified: 2026-05-17
---

# Phase 15 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.1.1 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 15-01-01 | 01 | 1 | FILE-01 | T-15-01 | requireAuth() on addChartFile | unit | `npx vitest run src/lib/actions/chart-file-actions.test.ts -t "creates"` | ✅ | ✅ green |
| 15-01-01-auth | 01 | 1 | FILE-01 | T-15-01 | addChartFile rejects unauthenticated caller | unit | `npx vitest run src/lib/actions/chart-file-actions-auth.test.ts` | ✅ | ✅ green |
| 15-01-02 | 01 | 1 | FILE-01 | — | N/A | unit | `npx vitest run src/components/features/charts/form-primitives/chart-file-upload.test.tsx` | ✅ | ✅ green |
| 15-02-01 | 02 | 1 | FILE-02 | T-15-02 | Ownership check before delete | unit | `npx vitest run src/lib/actions/chart-file-actions.test.ts -t "delete"` | ✅ | ✅ green |
| 15-02-02 | 02 | 1 | FILE-02 | T-15-03 | Reject unauthorized user | unit | `npx vitest run src/lib/actions/chart-file-actions-auth.test.ts` | ✅ | ✅ green |
| 15-02-03 | 02 | 1 | FILE-02 | — | N/A | unit | `npx vitest run src/components/features/charts/project-detail/delete-file-dialog.test.tsx` | ✅ | ✅ green |
| 15-02-04 | 02 | 1 | FILE-02 | — | R2 failure is non-blocking for deleteChartFile | unit | `npx vitest run src/lib/actions/chart-file-actions-r2-failure.test.ts` | ✅ | ✅ green |
| 15-03-01 | 03 | 2 | FILE-03 | — | N/A | unit | `npx vitest run src/components/features/charts/project-detail/chart-file-list.test.tsx` | ✅ | ✅ green |
| 15-03-01-sort | 03 | 2 | FILE-03 | — | Files render newest-first (D-03) | unit | `npx vitest run src/components/features/charts/project-detail/chart-file-list-sort.test.tsx` | ✅ | ✅ green |
| 15-03-02 | 03 | 2 | FILE-03 | — | N/A | unit | `npx vitest run src/components/features/charts/project-detail/overview-tab.test.tsx -t "file"` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `src/lib/actions/chart-file-actions.test.ts` — covers FILE-01, FILE-02 (9 tests)
- [x] `src/lib/actions/chart-file-actions-auth.test.ts` — covers T-15-01/03/04 unauthenticated rejection (3 tests) [Nyquist gap]
- [x] `src/lib/actions/chart-file-actions-r2-failure.test.ts` — covers D-07 non-blocking R2 failure (1 test) [Nyquist gap]
- [x] `src/lib/utils/format-file-size.test.ts` — covers formatFileSize utility (6 tests)
- [x] `src/components/features/charts/form-primitives/chart-file-upload.test.tsx` — covers FILE-01 (6 tests)
- [x] `src/components/features/charts/project-detail/chart-file-list.test.tsx` — covers FILE-03 (3 tests)
- [x] `src/components/features/charts/project-detail/chart-file-list-sort.test.tsx` — covers D-03 sort order (1 test) [Nyquist gap]
- [x] `src/components/features/charts/project-detail/delete-file-dialog.test.tsx` — covers FILE-02 (4 tests)
- [x] `src/components/features/charts/project-detail/overview-tab.test.tsx` — covers FILE-03 kitting integration (30 tests)

*Existing infrastructure covers test framework setup.*

---

## Nyquist Gap Resolution

Three behavioral gaps were identified and filled during adversarial review:

| Gap | Behavior | Test File | Status |
|-----|----------|-----------|--------|
| Auth rejection | addChartFile/deleteChartFile/getChartFileDownloadUrl throw "Unauthorized" when session is null | `chart-file-actions-auth.test.ts` | FILLED |
| D-03 sort order | ChartFileList renders files newest-first regardless of prop array order | `chart-file-list-sort.test.tsx` | FILLED |
| D-07 non-blocking R2 | deleteChartFile returns success and removes DB record even when R2 DeleteObjectCommand throws | `chart-file-actions-r2-failure.test.ts` | FILLED |

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| File downloads/opens in new tab | FILE-03 | Browser behavior, no JSDOM equivalent | Click file row → verify new tab opens with file |
| R2 presigned URL generates correctly | FILE-01 | Requires live R2 credentials | Upload file in dev → verify file accessible via returned URL |

---

## Test Totals

| File | Tests | Status |
|------|-------|--------|
| `chart-file-actions.test.ts` | 10 | green |
| `chart-file-actions-auth.test.ts` | 3 | green |
| `chart-file-actions-r2-failure.test.ts` | 1 | green |
| `format-file-size.test.ts` | 6 | green |
| `chart-file-upload.test.tsx` | 6 | green |
| `chart-file-list.test.tsx` | 3 | green |
| `chart-file-list-sort.test.tsx` | 1 | green |
| `delete-file-dialog.test.tsx` | 4 | green |
| `overview-tab.test.tsx` | 30 | green |
| **Total** | **64** | **all green** |

Run all phase 15 tests:
```
npx vitest run src/lib/actions/chart-file-actions.test.ts src/lib/actions/chart-file-actions-auth.test.ts src/lib/actions/chart-file-actions-r2-failure.test.ts src/lib/utils/format-file-size.test.ts src/components/features/charts/form-primitives/chart-file-upload.test.tsx src/components/features/charts/project-detail/chart-file-list.test.tsx src/components/features/charts/project-detail/chart-file-list-sort.test.tsx src/components/features/charts/project-detail/delete-file-dialog.test.tsx src/components/features/charts/project-detail/overview-tab.test.tsx --reporter=verbose
```

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 30s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** verified 2026-05-17 — all 65 tests green, 3 adversarial gaps filled
