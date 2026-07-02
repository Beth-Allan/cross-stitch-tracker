---
phase: 35-error-handling-comment-cleanup
reviewed: 2026-07-01T18:00:00Z
depth: standard
files_reviewed: 6
files_reviewed_list:
  - .claude/rules/comment-conventions.md
  - src/__tests__/mocks/factories.ts
  - src/components/features/charts/chart-merged-form.tsx
  - src/components/features/charts/use-chart-form.ts
  - src/lib/actions/session-actions.ts
  - src/lib/actions/upload-actions.ts
findings:
  critical: 0
  warning: 4
  info: 2
  total: 6
status: issues_found
---

# Phase 35: Code Review Report

**Reviewed:** 2026-07-01T18:00:00Z
**Depth:** standard
**Files Reviewed:** 6
**Status:** issues_found

## Summary

Phase 35 completed error handling and comment cleanup across the codebase. Section markers were removed from all reviewed files, WHAT-comments were stripped from chart form files, and `console.warn` was added to `processAndStoreImage` failure paths. JSX comments were converted to block-style `// ...` format.

The implementation is generally solid, but I found one decision violation (D-03 localStorage logging), missing error handling in inline entity creation handlers, a setTimeout leak, and a mid-file import placement in the test factories.

## Warnings

### WR-01: localStorage catch block uses console.error in violation of D-03

**File:** `src/components/features/charts/chart-merged-form.tsx:332-333`
**Issue:** Phase 35 context decision D-03 explicitly states: "localStorage try/catch guards are intentionally silent -- leave them as-is." But the implementation added `console.error("Load chart draft failed:", error)` to the localStorage catch block. This logs noise in SSR, privacy mode, and quota-exceeded contexts where `localStorage.getItem` is expected to throw. The catch also covers `JSON.parse` (which indicates genuine data corruption), so the intent is partially reasonable, but the severity level (`console.error`) and the D-03 violation need resolution.

**Fix:** Either revert to bare catch (honoring D-03), or split the try/catch so `getItem` failures are silent while `JSON.parse` failures log at `warn` level:
```ts
const rawDraft = (() => {
  let raw: string | null;
  try {
    raw = localStorage.getItem("chart-draft");
  } catch {
    return null;
  }
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    console.warn("Chart draft JSON corrupt:", error);
    return null;
  }
})();
```

### WR-02: handleAddDesigner and handleAddGenre lack empty/whitespace name guards

**File:** `src/components/features/charts/use-chart-form.ts:327-362`
**Issue:** `handleAddStorageLocation` (line 364), `handleAddStitchingApp` (line 386), and `handleAddSeries` (line 408) all begin with `if (!name.trim()) return;` to guard against whitespace-only names. `handleAddDesigner` (line 327) and `handleAddGenre` (line 347) lack this guard. While the calling components (`InlineDesignerDialog`, `GenrePicker`) trim before calling, the inconsistency is a defense-in-depth gap. If a new caller is added that doesn't trim, whitespace-only names could be sent to the server.

**Fix:** Add the same guard to both handlers:
```ts
const handleAddDesigner = useCallback(
  async (name: string, website?: string) => {
    if (!name.trim()) return;
    // ...rest unchanged
```
```ts
const handleAddGenre = useCallback(async (name: string) => {
  if (!name.trim()) return;
  // ...rest unchanged
```

### WR-03: handleSaveDraft setTimeout not cleaned up on unmount

**File:** `src/components/features/charts/chart-merged-form.tsx:375-378`
**Issue:** `handleSaveDraft` sets a 1-second `setTimeout` to reset the "Saved!" label back to "Save Draft," but the timer is not stored in a ref and not cleared on component unmount. If the user clicks "Save Draft" then navigates away within 1 second, the `setSaveDraftLabel` and `setIsSavingDraft` calls fire after unmount. In React 18+ this is a no-op (not a crash), but it is a leak pattern that should be cleaned up for consistency -- the codebase already uses this cleanup pattern in `EditableNumber` components (fixed in Phase 26 WR-03).

**Fix:** Store the timer ID in a ref and clear it on unmount:
```ts
const saveDraftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

const handleSaveDraft = useCallback(() => {
  setIsSavingDraft(true);
  setSaveDraftLabel("Saving...");
  saveDraftV2(form.values, supplyRows, calcParams);
  setSaveDraftLabel("Saved!");
  if (saveDraftTimerRef.current) clearTimeout(saveDraftTimerRef.current);
  saveDraftTimerRef.current = setTimeout(() => {
    setSaveDraftLabel("Save Draft");
    setIsSavingDraft(false);
  }, 1000);
}, [form.values, supplyRows, calcParams]);

// In useEffect cleanup:
useEffect(() => {
  return () => {
    if (saveDraftTimerRef.current) clearTimeout(saveDraftTimerRef.current);
  };
}, []);
```

### WR-04: generateThumbnail and processAndStoreImage lack ownership validation

**File:** `src/lib/actions/upload-actions.ts:258-317, 319-359`
**Issue:** Both `generateThumbnail` and `processAndStoreImage` are exported server actions (in a `"use server"` module) callable from any client component. They call `requireAuth()` to verify the user is logged in, but neither validates that the authenticated user owns the chart/entity being modified. `generateThumbnail` writes directly to the `chart` table (line 345) without an ownership check. In a single-user application this is accepted risk, but the pattern breaks if a second user is ever added -- any authenticated user could overwrite any chart's thumbnail or process images against arbitrary entities.

**Fix:** Add ownership check before DB write in `generateThumbnail`:
```ts
const chart = await prisma.chart.findUnique({
  where: { id: chartId },
  select: { id: true, project: { select: { userId: true } } },
});
if (!chart || chart.project?.userId !== user.id) {
  return { success: false as const, error: "Chart not found" };
}
```
For `processAndStoreImage`, the callers already validate ownership, so the risk is lower. A `// Caller must validate ownership before calling` JSDoc note would suffice.

## Info

### IN-01: FormEvent imported as value instead of type

**File:** `src/components/features/charts/use-chart-form.ts:3`
**Issue:** `FormEvent` is imported alongside React hooks as a value import (`import { FormEvent, useCallback, ... }`), but it is only used as a type annotation at line 320 (`async (e: FormEvent) =>`). It should use `import type` for clarity and to signal it's erased at runtime.

**Fix:**
```ts
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
```

### IN-02: Mid-file import in test factories

**File:** `src/__tests__/mocks/factories.ts:411`
**Issue:** The `GalleryCardData` type import is placed at line 411, in the middle of the file between factory functions, instead of at the top with the other imports (lines 1-25). This is a style inconsistency that makes the import graph harder to scan.

**Fix:** Move the import to the top of the file with the other type imports:
```ts
import type { GalleryCardData } from "@/components/features/gallery/gallery-types";
```

---

_Reviewed: 2026-07-01T18:00:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
