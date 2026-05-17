---
phase: 15
slug: chart-file-management
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-16
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
| 15-01-01 | 01 | 1 | FILE-01 | T-15-01 | requireAuth() on addChartFile | unit | `npx vitest run src/lib/actions/chart-file-actions.test.ts -t "creates"` | ❌ W0 | ⬜ pending |
| 15-01-02 | 01 | 1 | FILE-01 | — | N/A | unit | `npx vitest run src/components/features/charts/form-primitives/chart-file-upload.test.tsx` | ❌ W0 | ⬜ pending |
| 15-02-01 | 02 | 1 | FILE-02 | T-15-02 | Ownership check before delete | unit | `npx vitest run src/lib/actions/chart-file-actions.test.ts -t "delete"` | ❌ W0 | ⬜ pending |
| 15-02-02 | 02 | 1 | FILE-02 | T-15-03 | Reject unauthorized user | unit | `npx vitest run src/lib/actions/chart-file-actions.test.ts -t "unauthorized"` | ❌ W0 | ⬜ pending |
| 15-02-03 | 02 | 1 | FILE-02 | — | N/A | unit | `npx vitest run src/components/features/charts/project-detail/delete-file-dialog.test.tsx` | ❌ W0 | ⬜ pending |
| 15-03-01 | 03 | 2 | FILE-03 | — | N/A | unit | `npx vitest run src/components/features/charts/project-detail/chart-file-list.test.tsx` | ❌ W0 | ⬜ pending |
| 15-03-02 | 03 | 2 | FILE-03 | — | N/A | unit | `npx vitest run src/components/features/charts/project-detail/overview-tab.test.tsx -t "file"` | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/actions/chart-file-actions.test.ts` — stubs for FILE-01, FILE-02
- [ ] `src/components/features/charts/form-primitives/chart-file-upload.test.tsx` — covers FILE-01
- [ ] `src/components/features/charts/project-detail/chart-file-list.test.tsx` — covers FILE-03
- [ ] `src/components/features/charts/project-detail/delete-file-dialog.test.tsx` — covers FILE-02

*Existing infrastructure covers test framework setup.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| File downloads/opens in new tab | FILE-03 | Browser behavior, no JSDOM equivalent | Click file row → verify new tab opens with file |
| R2 presigned URL generates correctly | FILE-01 | Requires live R2 credentials | Upload file in dev → verify file accessible via returned URL |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
