---
phase: 39-accessibility-performance
reviewed: 2026-07-02T04:33:51Z
depth: standard
files_reviewed: 8
files_reviewed_list:
  - src/components/features/apps/stitching-app-list.tsx
  - src/components/features/apps/stitching-app-list.test.tsx
  - src/components/features/shopping/supply-overview.tsx
  - src/components/features/shopping/supply-overview.test.tsx
  - src/components/features/storage/storage-location-list.tsx
  - src/components/features/storage/storage-location-list.test.tsx
  - src/components/features/supplies/supply-catalog.tsx
  - src/components/features/supplies/supply-catalog.test.tsx
findings:
  critical: 1
  warning: 4
  info: 2
  total: 7
status: issues_found
---

# Phase 39: Code Review Report

**Reviewed:** 2026-07-02T04:33:51Z
**Depth:** standard
**Files Reviewed:** 8
**Status:** issues_found

## Summary

Phase 39 introduced two changes: (1) ARIA-compliant stretched-link card rows in StorageLocationList and StitchingAppList, and (2) useMemo memoization in SupplyOverview plus SSR-safe localStorage reading in SupplyCatalog.

The ARIA refactors are well-implemented with comprehensive test coverage. The memoization work is correct. However, there is one critical bug in SupplyCatalog's delete handler (dialog closes on failure, preventing retry), four warnings (comment convention violations, fire-and-forget async calls, and duplicate code), and two informational items.

## Narrative Findings (AI reviewer)

## Critical Issues

### CR-01: SupplyCatalog handleDelete does not throw on failure, causing dialog to close prematurely

**File:** `src/components/features/supplies/supply-catalog.tsx:438-460`
**Issue:** The `handleDelete` function in SupplyCatalog completes normally (does not throw) when the server action returns `{ success: false }` or when the catch block runs. The `DeleteConfirmationDialog` calls `onOpenChange(false)` after `onConfirm()` resolves, closing the dialog before the user can retry. This is inconsistent with the identical pattern in `stitching-app-list.tsx:63-78` and `storage-location-list.tsx:63-78`, which both throw `new Error("Delete failed")` after the error toast so the dialog stays open for retry.

**Fix:**
```typescript
async function handleDelete() {
    if (!deletingItem) return;
    try {
      let result: { success: boolean; error?: string };
      if (deletingItem.type === "thread") {
        result = await deleteThread(deletingItem.id);
      } else if (deletingItem.type === "bead") {
        result = await deleteBead(deletingItem.id);
      } else {
        result = await deleteSpecialtyItem(deletingItem.id);
      }

      if (result.success) {
        toast.success("Supply deleted");
        router.refresh();
        return;
      }
      toast.error(result.error ?? "Something went wrong. Please try again.");
    } catch (error) {
      console.error("Delete supply failed:", error);
      toast.error("Something went wrong. Please try again.");
    }
    throw new Error("Delete failed");
  }
```

## Warnings

### WR-01: Section marker comments in supply-catalog.tsx violate comment-conventions

**File:** `src/components/features/supplies/supply-catalog.tsx:19,32,48,62,88,176`
**Issue:** Six `/* --- Section Name --- */` markers exist in this component file. The comment-conventions rule allows `// --- ... ---` separators only in type-bundle files (files containing only interface/type declarations). `supply-catalog.tsx` is a component file, and Phase 35 specifically removed 190+ section markers from 48 files. These markers appear to have survived that cleanup or were re-introduced.

**Fix:** Remove the six section marker comments at lines 19, 32, 48, 62, 88, and 176. The constants and types are self-documenting via their names (`TAB_CONFIG`, `THREAD_COLUMNS`, `COLOR_FAMILY_DISPLAY`, etc.).

### WR-02: Section marker comments in stitching-app-list.tsx and storage-location-list.tsx

**File:** `src/components/features/apps/stitching-app-list.tsx:137,200`
**File:** `src/components/features/storage/storage-location-list.tsx:137,200`
**Issue:** Both files use `/* ---- Inline Add Row ---- */` and `/* ---- App/Location Row ---- */` section markers between sub-component definitions. While these are at module scope (not inside function bodies), they follow the same pattern that Phase 35 cleaned up. The sub-component function names (`InlineAddRow`, `AppRow`, `LocationRow`) already serve as navigation landmarks.

**Fix:** Remove the four section marker comments (2 per file).

### WR-03: InlineAddRow onAdd callback is fire-and-forget on async handler

**File:** `src/components/features/apps/stitching-app-list.tsx:155,188-189`
**File:** `src/components/features/storage/storage-location-list.tsx:155,188-189`
**Issue:** The `onAdd` prop is typed as `(name: string) => void`, but `handleCreate` is an async function returning `Promise<void>`. In `handleKeyDown` (line 155) and the Add button's onClick (line 188), the promise is called without `await` and without `.catch()`. Currently safe because `handleCreate` wraps everything in try/catch, but any future modification that adds a throw path outside the try/catch would produce an unhandled promise rejection. The `onAdd` type signature should reflect the async nature if the return value matters.

**Fix:** Either await the promise or add a `.catch()` safety net:
```typescript
// Option A: Change type and await
onAdd: (name: string) => Promise<void>;

// Then in handleKeyDown:
async function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && name.trim()) {
      await onAdd(name.trim());
    } else if (e.key === "Escape") {
      onCancel();
    }
  }
```

### WR-04: Substantial code duplication between stitching-app-list.tsx and storage-location-list.tsx

**File:** `src/components/features/apps/stitching-app-list.tsx`
**File:** `src/components/features/storage/storage-location-list.tsx`
**Issue:** These two files are structurally identical -- same component architecture (list + inline add row + entity row + delete dialog), same state management, same error handling patterns, same ARIA structure, same test structure. The only differences are entity names, icons (Tablet vs MapPin), placeholder text, route paths, and server action imports. This duplication means any bug fix or pattern change must be applied to both files independently. A shared `EntityList` component parameterized by entity type would eliminate approximately 200 lines of duplicated code.

**Fix:** Extract a shared `EntityList` component that accepts entity-specific configuration (icon, labels, routes, server actions) as props or a config object. Both test files would also benefit from a shared test factory. Consider adding as a backlog item if not in scope for this phase.

## Info

### IN-01: SupplyCatalog color family filter not exposed for Beads tab despite schema support

**File:** `src/components/features/supplies/supply-catalog.tsx:590`
**Issue:** The `colorFamilyFilter` select is only rendered when `activeTab === "threads"` (line 590), but the Prisma `Bead` model has a `colorFamily: ColorFamily` field, and `filteredBeads` does not apply the color family filter (line 269-279). The filter state is correctly cleared on tab switch (line 222), so this is not a bug. However, it represents an inconsistency that could surprise users who expect uniform filtering across supply types. This may be an intentional design decision.

**Fix:** Either expose the color family filter on the Beads tab (add the select rendering and filter logic) or document the decision as intentional.

### IN-02: SupplyCatalog test coverage limited to rendering and SSR hydration

**File:** `src/components/features/supplies/supply-catalog.test.tsx`
**Issue:** The test file covers basic rendering (tab labels, counts, thread items, empty state) and SSR hydration safety (3 tests), but does not test tab switching, brand/color filtering, search filtering, edit/delete modal interactions, or view mode toggle behavior. While the SSR hydration tests added in this phase are valuable, the overall test coverage for this large component (706 lines) is thin relative to its complexity.

**Fix:** Consider adding test coverage for tab switching, filtering, and modal interactions in a future phase. Not blocking for this phase since the component predates Phase 39.

---

_Reviewed: 2026-07-02T04:33:51Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
