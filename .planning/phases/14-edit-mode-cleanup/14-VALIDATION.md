---
phase: 14
slug: edit-mode-cleanup
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-16
---

# Phase 14 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 3.1.4 + @testing-library/react 16.3.0 |
| **Config file** | `vitest.config.ts` |
| **Quick run command** | `npx vitest run --reporter=dot` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | ~20 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=dot`
- **After every plan wave:** Run `npm run build && npm test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 20 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 14-01-01 | 01 | 1 | CLEAN-01 | — | N/A | build | `npm run build` | N/A | ⬜ pending |
| 14-02-01 | 02 | 2 | EDIT-01 | — | N/A | unit | `npx vitest run src/components/features/charts/chart-merged-form.test.tsx -t "edit mode"` | ❌ W0 | ⬜ pending |
| 14-02-02 | 02 | 2 | EDIT-01 | — | N/A | unit | `npx vitest run src/components/features/charts/form-primitives/sticky-save-bar.test.tsx -t "edit mode"` | ❌ W0 | ⬜ pending |
| 14-02-03 | 02 | 2 | EDIT-01 | — | N/A | unit | `npx vitest run src/components/features/charts/manage-supplies-link.test.tsx` | ❌ W0 | ⬜ pending |
| 14-02-04 | 02 | 2 | EDIT-01 | — | Draft skip in edit mode | unit | `npx vitest run src/components/features/charts/chart-merged-form.test.tsx -t "draft"` | ❌ W0 | ⬜ pending |
| 14-02-05 | 02 | 2 | EDIT-02 | — | N/A | unit | `npx vitest run src/components/features/charts/list-row-kebab-menu.test.tsx` | ❌ W0 | ⬜ pending |
| 14-02-06 | 02 | 2 | EDIT-02 | — | N/A | unit | `npx vitest run src/components/features/charts/chart-list.test.tsx` | ✅ | ⬜ pending |
| 14-03-01 | 03 | 3 | CLEAN-01 | — | N/A | build | `npm run build` | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/components/features/charts/list-row-kebab-menu.test.tsx` — stubs for EDIT-02a/b/c
- [ ] `src/components/features/charts/manage-supplies-link.test.tsx` — stubs for EDIT-01c
- [ ] Edit mode test cases in existing `chart-merged-form.test.tsx` — stubs for EDIT-01a/d/e
- [ ] Edit mode test cases in existing `sticky-save-bar.test.tsx` — stubs for EDIT-01b

*Existing infrastructure covers test framework and config — only new test files and cases needed.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Edit form visual parity with creation form | EDIT-01 | Visual layout comparison | Open create form and edit form side-by-side, verify same field groups and spacing |
| Post-save redirect + toast | EDIT-01 | Navigation + toast integration | Edit a chart, save, verify redirect to project detail with success toast |
| Kebab menu in list view | EDIT-02 | Visual verification | Switch to list view, verify kebab appears on each row |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 20s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
