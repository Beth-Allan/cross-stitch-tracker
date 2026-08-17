# PR #7 Review — Round 3

**Date:** 2026-04-12
**Branch:** `feature/phase-5-foundation-quick-wins`
**Scope:** 129 files | +14k/-2k | 567 tests passing
**Agents:** code-reviewer, pr-test-analyzer, silent-failure-hunter, type-design-analyzer, comment-analyzer

---

## Critical Issues (must fix before merge)

### C1: `updateChart` thumbnail failure returns no warning to user
**File:** `src/lib/actions/chart-actions.ts` (updateChart, ~line 202-208)
**Found by:** Silent Failure Hunter

`createChart` correctly returns `thumbnailWarning` on thumbnail failure, which the client shows via `toast.warning`. But `updateChart` catches the same error, logs it, and returns `{ success: true }` with no warning field. User gets zero feedback when editing a chart's cover image and thumbnail generation fails.

**Fix:** Add `warning` field to `updateChart` return, mirror the `createChart` pattern. Wire `use-chart-form.ts` edit path to check `response.warning`.

---

### C2: Stale "Phase 5" hint visible to users
**File:** `src/components/features/charts/sections/genre-section.tsx:25`
**Found by:** Comment Analyzer

Series field shows `hint="Available in Phase 5"`. Phase 5 is this PR — text will be stale on merge. Per design reference, Series is Phase 6.

**Fix:** Change to `"Coming soon"` or remove the phase number.

---

## Important Issues (should fix)

### I1: `DeleteChartDialog` closes on failure
**File:** `src/components/features/charts/chart-detail.tsx:210-225`
**Found by:** Silent Failure Hunter

`setOpen(false)` runs after both success and failure paths, closing the dialog when deletion fails. Inconsistent with `DeleteEntityDialog` which stays open on error for retry.

**Fix:** Move `setOpen(false)` inside the success branch only.

---

### I2: `InlineNameEdit` empty catch with no logging
**File:** `src/components/features/storage/inline-name-edit.tsx:42-49`
**Found by:** Silent Failure Hunter

`catch {}` stays in edit mode (correct) but has no `console.error`. Relies on implicit contract that callers toast before throwing.

**Fix:** Add `console.error("InlineNameEdit save failed:", err)` in catch.

---

### I3: `DeleteEntityDialog` empty catch with no logging
**File:** `src/components/features/storage/delete-entity-dialog.tsx:34-41`
**Found by:** Silent Failure Hunter

Same pattern as I2. Comment documents the contract but no defensive logging.

**Fix:** Add `console.error` in catch block.

---

### I4: Cover image silently falls back to upload zone on presigned URL failure
**File:** `src/components/features/charts/form-primitives/cover-image-upload.tsx:42-65`
**Found by:** Silent Failure Hunter

When R2 presigned URL resolution fails, shows empty upload zone with no feedback. User might think their image was deleted and re-upload.

**Fix:** Show "Could not load cover image" error state instead of silent fallback.

---

### I5: `createChart` fabric ownership rejection untested
**File:** `src/lib/actions/chart-actions.ts:66-74`
**Found by:** Test Analyzer

The fabric ownership check in `createChart` has no direct test. `updateChart` fabric ownership IS tested. If someone refactors `createChart` and weakens the check, no test fails.

**Fix:** Add test verifying `createChart` rejects fabric belonging to another user.

---

### I6: Fabric ownership comment imprecise
**File:** `src/lib/actions/fabric-actions.ts:87-89`
**Found by:** Comment Analyzer

Comment omits that `chart-actions.ts` also performs fabric ownership checks during link/unlink. Could mislead future maintainer into thinking all checks are in fabric-actions.

**Fix:** Expand comment to mention chart-actions.ts also checks ownership.

---

## Suggestions

| # | Source | Finding | Location |
|---|--------|---------|----------|
| S1 | type-design | `interface` vs `type` inconsistency — storage.ts uses `interface`, rest uses `type` | `src/types/storage.ts` |
| S2 | type-design | `EntityProject.fabric.type` is `string` but domain has `FABRIC_TYPES` union | `src/types/storage.ts` |
| S3 | type-design | `EntityProject` name too generic for a narrowed view model | `src/types/storage.ts` |
| S4 | silent-failure | `EditableNumber` silently discards invalid input with no feedback | `project-supplies-tab.tsx:60-82` |
| S5 | silent-failure | SearchToAdd error says "Try again" but has no retry button | `search-to-add.tsx:248-251` |
| S6 | silent-failure | `id` parameters on mutation actions lack Zod validation | Multiple action files |
| S7 | comment | Chart-actions fabric comment says "their project" (singular) but allows any user-owned project | `chart-actions.ts:67` |
| S8 | comment | `suppressUnloadRef` comment appears after all usage | `use-chart-form.ts:355` |
| S9 | comment | `needsBorder` luminance function duplicated in 2 files with no comment | `search-to-add.tsx:19` + `project-supplies-tab.tsx:31` |
| S10 | comment | `InlineNameDialog` `useState({value:false})[0]` pattern needs more context | `inline-name-dialog.tsx:36-41` |
| S11 | test | `chart-detail.tsx` (395 lines) has no test file | `chart-detail.tsx` |

---

## Strengths

- **Security model is solid** — `requireAuth()` on every action, userId scoping on all new entities, `$transaction` for multi-step ops
- **Convention compliance excellent** — zero violations of CLAUDE.md conventions found by code reviewer
- **Test coverage thorough** — 567 tests, systematic auth guard coverage, ownership scoping verified
- **Type design clean** — good `WithStats`/`Detail` split, dead types removed, Zod schemas aligned with conventions
- **Good "why" comments** — click-outside 200ms guard, empty callback docs, fabric ownership model

---

## Verdict

PR is in good shape. 2 critical findings are quick fixes (both under 10 lines each). Important findings are mostly defensive logging and one dialog behavior fix. No security issues, no convention violations, no logic bugs in core business logic.
