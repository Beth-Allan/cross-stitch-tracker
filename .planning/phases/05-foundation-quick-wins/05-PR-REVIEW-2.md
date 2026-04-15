# PR #7 Review — Round 2

**Date:** 2026-04-12
**Branch:** `feature/phase-5-foundation-quick-wins`
**Scope:** 83 source files | +13.6k/-1.9k | 546 tests passing
**Agents:** code-reviewer, pr-test-analyzer, silent-failure-hunter, type-design-analyzer, comment-analyzer

---

## Critical Issues (must fix before merge)

### C1: `createFabric` missing ownership check on `linkedProjectId` [security]
**File:** `src/lib/actions/fabric-actions.ts:88-118`
**Found by:** Silent Failure Hunter

`createFabric` calls `requireAuth()` but discards the user. It accepts a `linkedProjectId` and creates a fabric without verifying the project belongs to the authenticated user. Compare with `updateFabric` which properly checks `linkedProject.userId !== user.id`.

**Fix:** Add project ownership verification before creating fabric with a linked project:
```ts
if (validated.linkedProjectId) {
  const project = await prisma.project.findUnique({
    where: { id: validated.linkedProjectId },
    select: { userId: true },
  });
  if (!project || project.userId !== user.id) {
    return { success: false as const, error: "Project not found" };
  }
}
```

---

### C2: Read-only actions in `designer-actions.ts` and `genre-actions.ts` still swallow errors
**Files:** `src/lib/actions/designer-actions.ts:93-174`, `src/lib/actions/genre-actions.ts:93-166`
**Found by:** Silent Failure Hunter

PR description says "C1-C2: Removed try/catch from 12 read-only actions" but 6 read-only functions still have try/catch returning `null`/`[]` on failure:
- `getDesigner` → returns `null`
- `getDesignersWithStats` → returns `[]`
- `getDesigners` → returns `[]`
- `getGenre` → returns `null`
- `getGenresWithStats` → returns `[]`
- `getGenres` → returns `[]`

When the database is down, users see "No designers yet" / "No genres yet" instead of an error page.

**Note:** These files aren't in this PR's diff — they're pre-existing. But since the PR claims this fix was made, the gap should be closed.

**Fix:** Remove try/catch from all 6 functions, let errors propagate to error boundaries. Match the pattern used in storage-location-actions.ts and stitching-app-actions.ts read-only functions.

---

### C3: `InlineNameEdit` exits edit mode on save failure
**File:** `src/components/features/storage/inline-name-edit.tsx:39-47`
**Found by:** Silent Failure Hunter

`handleSave` calls `await onSave(trimmed)` inside `startTransition` with no try/catch. The callers (`handleRename` in list/detail components) catch errors and show toast but don't re-throw. So `InlineNameEdit` always proceeds to `setIsEditing(false)` — the edit UI closes even when the rename failed.

**Impact:** User sees a brief toast error but the edit input is already gone. They must click the pencil again to retry.

**Fix option A (preferred):** Wrap `onSave` in try/catch in `InlineNameEdit`, only call `setIsEditing(false)` on success.
**Fix option B:** Have callers re-throw after showing the toast, then add try/catch in `InlineNameEdit` to stay in edit mode.

---

## Important Issues (should fix)

### I1: No happy-path test for `createChart` server action
**File:** `src/lib/actions/chart-actions.ts:11-102`
**Found by:** Test Analyzer

Error paths and auth guards are tested, but nothing verifies that `createChart` with valid data calls `prisma.chart.create` with the correct shape (especially `userId: user.id` on the nested project create) and returns `{ success: true, chartId: "..." }`.

**Fix:** Add a happy-path test to `chart-actions-errors.test.ts` (or a new `chart-actions.test.ts`) that:
- Mocks `requireAuth()` to return a user
- Calls `createChart` with valid form data
- Asserts `prisma.chart.create` was called with `project: { create: { userId: user.id } }`
- Asserts the return value is `{ success: true, chartId: "..." }`

---

### I2: No happy-path test for `updateChart` fabric link/unlink logic
**File:** `src/lib/actions/chart-actions.ts:105-218`
**Found by:** Test Analyzer

The `$transaction` with fabric unlinking/relinking/swap is complex logic with zero action-level test coverage. Only the ownership rejection path is tested.

**Fix:** Add tests for:
- Update with new fabric link (no previous fabric)
- Update swapping fabric A → fabric B (unlinks A, links B)
- Update removing fabric link (unlinks, no new link)
- Verify `$transaction` calls in correct order

---

### I3: `handleDelete` functions have no try/catch for thrown server action errors
**Files:** `src/components/features/storage/storage-location-list.tsx:59-68`, `src/components/features/apps/stitching-app-list.tsx:59-68`, plus detail page variants (`storage-location-detail.tsx:39-47`, `stitching-app-detail.tsx:36-44`)
**Found by:** Silent Failure Hunter

If the server action throws (network error, auth expiry) rather than returning a structured error, `DeleteEntityDialog`'s catch block silently swallows it with no toast. The user sees the dialog stay open with zero feedback.

**Fix:** Wrap the server action call in `handleDelete` with try/catch, show toast for thrown errors:
```ts
async function handleDelete() {
  if (!deleteTarget) return;
  try {
    const result = await deleteStorageLocation(deleteTarget.id);
    if (result.success) {
      toast.success("Location deleted");
      router.refresh();
    } else {
      toast.error(result.error ?? "Failed to delete location");
      throw new Error("retry");
    }
  } catch {
    toast.error("Something went wrong. Please try again.");
    throw new Error("retry"); // keeps dialog open
  }
}
```
Apply to all 4 files (storage list, storage detail, app list, app detail).

---

### I4: Hardcoded color scales in `global-error.tsx`
**File:** `src/app/global-error.tsx:14-35`
**Found by:** Code Reviewer

Uses `border-neutral-200`, `bg-red-100`, `text-red-600`, etc. instead of semantic tokens. The `<body>` already uses `bg-background text-foreground`, suggesting CSS vars are expected to work.

**Fix:** Replace hardcoded colors with semantic tokens: `border-border`, `bg-destructive/10`, `text-destructive`, `text-muted-foreground`, `bg-primary text-primary-foreground`, etc.

---

### I5: `getStitchingAppsWithStats` auth guard not tested
**File:** `src/lib/actions/stitching-app-actions.test.ts`
**Found by:** Test Analyzer

Auth guard tests cover create/delete/update/getDetail but miss the list endpoint.

**Fix:** Add auth guard test for `getStitchingAppsWithStats` matching the pattern of the other auth guard tests in the file.

---

### I6: Stitch count auto-calculation untested at action level
**File:** `src/lib/actions/chart-actions.ts:19-24`
**Found by:** Test Analyzer

Server-side auto-calculation (`if stitchCount === 0 && stitchesWide > 0 && stitchesHigh > 0`) has no action-level test. Tested in client hook but server does this independently.

**Fix:** Add test cases in chart actions tests:
- `stitchCount: 0, stitchesWide: 100, stitchesHigh: 150` → expects calculated count + `isApproximate: true`
- `stitchCount: 5000` → expects that value used, no auto-calc

---

### I7: Unused `Pencil` import
**File:** `src/components/features/storage/storage-location-detail.tsx:6`
**Found by:** Code Reviewer

`Pencil` imported from `lucide-react` but unused. `InlineNameEdit` handles its own icon.

**Fix:** Remove `Pencil` from the import statement.

---

### I8: Thumbnail failure has no user feedback
**File:** `src/lib/actions/chart-actions.ts:86-91, 200-205`
**Found by:** Silent Failure Hunter

When thumbnail generation fails, it's `console.warn`'d but the user gets no indication. Charts save fine but thumbnails silently never appear in list views.

**Fix:** Change `console.warn` to `console.error` for monitoring visibility. Optionally return a warning flag in the success response that the client can use to show a toast: `{ success: true, chartId: "...", warning: "Thumbnail could not be generated" }`.

---

## Suggestions (improvements to make)

### S1: Flatten `_count.projects` to `projectCount`
**File:** `src/types/storage.ts`
**Found by:** Type Analyzer

The `_count: { projects: number }` structure leaks Prisma's query shape into the UI layer. Every consumer writes `location._count.projects`.

**Fix:** Change both `StorageLocationWithStats` and `StitchingAppWithStats` to use `projectCount: number`. Update the server actions to map: `projectCount: raw._count.projects`. Update component references (~4 files).

---

### S2: Extract shared `EntityProject` type
**File:** `src/types/storage.ts`
**Found by:** Type Analyzer

`StorageLocationDetail` and `StitchingAppDetail` have 100% identical project sub-types (anonymous inline).

**Fix:** Extract to a named type:
```ts
type EntityProject = {
  id: string;
  chart: { id: string; name: string; coverThumbnailUrl: string | null };
  status: ProjectStatus;
  fabric: { name: string; count: number; type: string } | null;
};
```
Then both detail types reference `projects: EntityProject[]`.

---

### S3: Add `.trim()` to `description` fields in Zod schemas
**File:** `src/lib/validations/storage.ts`
**Found by:** Type Analyzer

Name fields have `.trim().min(1)` but description has only `.max(500)`. Whitespace-only descriptions get stored as-is.

**Fix:** Add `.trim()`: `description: z.string().trim().max(500, "Description too long").nullable().default(null)`

---

### S4: Investigate/remove `as ProjectStatus` casts
**Files:** `src/components/features/storage/storage-location-detail.tsx:110`, `src/components/features/apps/stitching-app-detail.tsx:107`
**Found by:** Type Analyzer

The interface already types `status` as `ProjectStatus`, so the cast shouldn't be necessary. Either fix the type inference or remove the cast.

---

### S5: Audit `ChartListItem` and `ChartDetail` for dead code
**File:** `src/types/chart.ts`
**Found by:** Type Analyzer

`ChartListItem` may be unused (`ChartList` takes `ChartWithProject[]`). `ChartDetail` extends `ChartWithProject` with computed fields but may not be constructed anywhere. Remove if dead.

---

### S6: Add `SearchableSelect` clear button tests
**File:** `src/components/features/charts/form-primitives/searchable-select.test.tsx`
**Found by:** Test Analyzer

Clear button (X icon) behavior is untested: appears when value set, calls `onChange(null)`, hidden when disabled.

---

### S7: Add `DeleteEntityDialog` error-keeps-dialog-open test
**File:** `src/components/features/storage/delete-entity-dialog.test.tsx`
**Found by:** Test Analyzer

The error path (dialog stays open when `onConfirm` throws) is untested. Should verify button re-enables and dialog remains visible.

---

### S8: Remove stale Prisma boilerplate comment
**File:** `prisma/schema.prisma:4`
**Found by:** Comment Analyzer

"Get a free hosted Postgres database in seconds: npx create-db" is scaffold boilerplate. Project uses Neon.

---

### S9: Add comment documenting fabric ownership model
**File:** `src/lib/actions/fabric-actions.ts` (near line 86)
**Found by:** Comment Analyzer

Fabric has no direct `userId` — ownership is inferred through `linkedProject.userId`. Unlinked fabrics have no owner and are accessible to all authenticated users. This design decision should be documented.

---

## Summary Scorecard

| Aspect | Agent | Verdict |
|--------|-------|---------|
| Convention compliance | Code Reviewer | Clean — 2 minor findings |
| Test coverage | Test Analyzer | Good — 2 critical gaps in chart action happy-paths |
| Error handling | Silent Failure Hunter | 3 HIGH issues — authz bypass, swallowed errors, UX bug |
| Type design | Type Analyzer | 5.6/10 avg — Zod strong (7.5), manual types weak (4.5) |
| Comment quality | Comment Analyzer | Excellent — 0 incorrect comments, strong "why" discipline |

## Fix Order Recommendation

1. C1 → C2 → C3 (critical — security + correctness)
2. I1 → I2 (test gaps for complex logic)
3. I3 → I4 → I5 → I6 → I7 → I8 (remaining important)
4. S1 → S2 → S3 → S4 → S5 → S6 → S7 → S8 → S9 (suggestions)
