---
phase: 17-image-focal-point
reviewed: 2026-05-17T20:45:00Z
depth: standard
files_reviewed: 36
files_reviewed_list:
  - prisma/schema.prisma
  - src/__tests__/mocks/factories.ts
  - src/components/features/charts/project-detail/crop-guide-overlay.tsx
  - src/components/features/charts/project-detail/focal-point-editor.test.tsx
  - src/components/features/charts/project-detail/focal-point-editor.tsx
  - src/components/features/charts/project-detail/focal-point-marker.tsx
  - src/components/features/charts/project-detail/hero-cover-banner.tsx
  - src/components/features/charts/project-detail/project-detail-hero.test.tsx
  - src/components/features/charts/project-detail/project-detail-hero.tsx
  - src/components/features/dashboard/buried-treasures-section.tsx
  - src/components/features/dashboard/currently-stitching-card.test.tsx
  - src/components/features/dashboard/currently-stitching-card.tsx
  - src/components/features/dashboard/spotlight-card.test.tsx
  - src/components/features/dashboard/spotlight-card.tsx
  - src/components/features/designers/designer-detail.tsx
  - src/components/features/gallery/gallery-card.test.tsx
  - src/components/features/gallery/gallery-card.tsx
  - src/components/features/gallery/gallery-types.ts
  - src/components/features/gallery/gallery-utils.test.ts
  - src/components/features/gallery/gallery-utils.ts
  - src/components/features/gallery/project-gallery.test.tsx
  - src/components/features/genres/genre-detail.tsx
  - src/components/features/shopping/project-accordion.test.tsx
  - src/components/features/shopping/project-accordion.tsx
  - src/components/features/shopping/shopping-cart.test.tsx
  - src/lib/actions/dashboard-actions.ts
  - src/lib/actions/designer-actions.ts
  - src/lib/actions/focal-point-actions.test.ts
  - src/lib/actions/focal-point-actions.ts
  - src/lib/actions/genre-actions.ts
  - src/lib/actions/shopping-cart-actions.ts
  - src/lib/utils/focal-point.test.ts
  - src/lib/utils/focal-point.ts
  - src/lib/validations/focal-point.ts
  - src/types/dashboard.ts
  - src/types/designer.ts
  - src/types/genre.ts
findings:
  critical: 1
  warning: 3
  info: 2
  total: 6
status: issues_found
---

# Phase 17: Code Review Report

**Reviewed:** 2026-05-17T20:45:00Z
**Depth:** standard
**Files Reviewed:** 36
**Status:** issues_found

## Summary

Phase 17 adds focal point support for cover images: schema fields (`focalPointX`/`focalPointY` on Chart), a server action with Zod validation and ownership checks, a click-to-set editor UI with crop guide preview, and propagation of focal point data through all card/list surfaces (gallery, dashboard, shopping cart, designer/genre detail).

The core architecture is sound -- auth guard is called, ownership is verified, Zod validates at the boundary, and the utility function `getObjectPositionStyle` handles null gracefully. However, the Zod schema has a data integrity gap that allows writing inconsistent state to the database, and the editor UI has a stale measurement issue that could cause visual misalignment.

## Critical Issues

### CR-01: Focal point Zod schema allows mismatched null coordinates

**File:** `src/lib/validations/focal-point.ts:3-7`
**Issue:** The `x` and `y` fields are independently nullable with no cross-field refinement. This allows inputs like `{ chartId: "c1", x: 0.5, y: null }` or `{ chartId: "c1", x: null, y: 0.3 }` to pass validation. If persisted, the database would hold a half-set focal point (one coordinate null, the other a number). While `getObjectPositionStyle` handles this gracefully by returning `undefined` when either is null, the inconsistent state is a data integrity bug -- the non-null coordinate is silently orphaned and will never be used but also never cleaned up.

The current calling code in `focal-point-editor.tsx` always sends either both-numbers or both-null, so this is not exploitable through the UI. But the server action is a public API boundary -- any caller (including future code or direct fetch) could trigger the inconsistent state.

**Fix:**
```typescript
import { z } from "zod";

export const updateFocalPointSchema = z
  .object({
    chartId: z.string().min(1, "Chart ID is required"),
    x: z.number().min(0).max(1).nullable(),
    y: z.number().min(0).max(1).nullable(),
  })
  .refine((data) => (data.x === null) === (data.y === null), {
    message: "Both x and y must be set or both must be null",
  });

export type UpdateFocalPointInput = z.infer<typeof updateFocalPointSchema>;
```

## Warnings

### WR-01: FocalPointEditor container size not updated on resize

**File:** `src/components/features/charts/project-detail/focal-point-editor.tsx:44-49`
**Issue:** `containerSize` is measured once when `isEditMode` becomes true via `useEffect`. If the user resizes the browser window or rotates a mobile device while in edit mode, `containerSize` becomes stale. The `CropGuideOverlay` uses these pixel dimensions for its positioning math, so the crop guide rectangle will be misaligned after any resize.

**Fix:** Add a ResizeObserver to keep `containerSize` current while in edit mode:
```typescript
useEffect(() => {
  if (!isEditMode || !containerRef.current) return;
  const el = containerRef.current;

  const updateSize = () => {
    const rect = el.getBoundingClientRect();
    setContainerSize({ width: rect.width, height: rect.height });
  };
  updateSize();

  const observer = new ResizeObserver(updateSize);
  observer.observe(el);
  return () => observer.disconnect();
}, [isEditMode]);
```

### WR-02: FocalPointEditor keyboard interaction on click area is a no-op

**File:** `src/components/features/charts/project-detail/focal-point-editor.tsx:158-162`
**Issue:** The click area has `role="button"` and `tabIndex={0}` for accessibility, but the `onKeyDown` handler for Enter/Space does nothing -- the comment says "Let click handler deal with mouse events only." This means keyboard-only users cannot place a focal point. The element advertises itself as interactive to assistive technology but doesn't respond to keyboard activation.

This is a WCAG 2.1 Level A violation (2.1.1 Keyboard). While placing an exact pixel coordinate via keyboard is inherently imprecise, the element should either (a) not have `role="button"` or (b) place the focal point at a default position (e.g., center, or current pending point) on Enter/Space.

**Fix:** Either remove the `role="button"` and `tabIndex={0}` (making it mouse-only and honestly representing it), or implement keyboard placement at center:
```typescript
onKeyDown={(e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    // Place at center as keyboard default
    setPendingPoint({ x: 0.5, y: 0.5 });
  }
}}
```

### WR-03: CropGuideOverlay can render taller than its container

**File:** `src/components/features/charts/project-detail/crop-guide-overlay.tsx:23`
**Issue:** `guideHeight` is computed as `guideWidth * (3/4)`. For a wide, short container (e.g., a 400x100 banner), this produces a guide rectangle taller than the container (300px > 100px). The `top` clamping on line 29 clamps to `containerHeight - guideHeight`, which becomes negative, and `Math.max(0, ...)` pins it to 0 -- but the guide itself overflows the container height. The `overflow-hidden` on the parent `div` in `hero-cover-banner.tsx` prevents visual leakage, but the crop guide no longer accurately represents the gallery card crop area.

**Fix:** Constrain `guideHeight` to the container and recalculate `guideWidth` to maintain aspect ratio:
```typescript
let guideWidth = Math.min(containerWidth * 0.6, 360);
let guideHeight = guideWidth * (3 / 4);

// If guide is taller than container, scale down to fit
if (guideHeight > containerHeight) {
  guideHeight = containerHeight;
  guideWidth = guideHeight * (4 / 3);
}
```

## Info

### IN-01: console.error in client component leaks error to browser

**File:** `src/components/features/dashboard/spotlight-card.tsx:53`
**Issue:** `console.error("Spotlight shuffle failed:", error)` in the `handleShuffle` catch block writes the full error object to the browser console. In production, this could expose stack traces or internal details. The toast already provides user-facing feedback.

**Fix:** Remove the `console.error` line or guard it behind a development check:
```typescript
} catch {
  toast.error("Could not load a new spotlight project. Try again.");
}
```

### IN-02: Focal point test mocks auth at wrong layer

**File:** `src/lib/actions/focal-point-actions.test.ts:5-8`
**Issue:** The test mocks `@/lib/auth` (the raw auth call) rather than `@/lib/auth-guard` (the `requireAuth` wrapper). This works because `requireAuth` calls `auth()` internally, so mocking `auth` effectively controls `requireAuth`. However, this creates a coupling to the internal implementation of `auth-guard.ts` -- if `requireAuth` ever changes to use a different mechanism, this test would silently stop testing auth. All other action tests in the codebase appear to follow the same pattern, so this is consistent, but worth noting for future refactoring.

**Fix:** No immediate fix needed -- this is a project-wide pattern. If refactored, mock `@/lib/auth-guard` directly:
```typescript
vi.mock("@/lib/auth-guard", () => ({
  requireAuth: mockAuth,
}));
```

---

_Reviewed: 2026-05-17T20:45:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
