---
phase: 17-image-focal-point
fixed_at: 2026-05-17T10:05:00Z
review_path: .planning/phases/17-image-focal-point/17-REVIEW.md
iteration: 1
findings_in_scope: 4
fixed: 4
skipped: 0
status: all_fixed
---

# Phase 17: Code Review Fix Report

**Fixed at:** 2026-05-17T10:05:00Z
**Source review:** .planning/phases/17-image-focal-point/17-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 4
- Fixed: 4
- Skipped: 0

## Fixed Issues

### CR-01: Focal point Zod schema allows mismatched null coordinates

**Files modified:** `src/lib/validations/focal-point.ts`
**Commit:** 41a76cf
**Applied fix:** Added `.refine()` to `updateFocalPointSchema` ensuring both `x` and `y` are null or both are numbers. Prevents half-set focal point state at the API boundary. All 11 focal-point-actions tests pass.

### WR-01: FocalPointEditor container size not updated on resize

**Files modified:** `src/components/features/charts/project-detail/focal-point-editor.tsx`
**Commit:** 8ce8ecf
**Applied fix:** Replaced one-shot `getBoundingClientRect` with a `ResizeObserver` that keeps `containerSize` current while in edit mode. Observer is disconnected on cleanup (edit mode exit or unmount). All 9 focal-point-editor tests pass.

### WR-02: FocalPointEditor keyboard interaction is a no-op

**Files modified:** `src/components/features/charts/project-detail/focal-point-editor.tsx`
**Commit:** d460ef7
**Applied fix:** Implemented keyboard placement on Enter/Space that sets focal point to center (0.5, 0.5). Kept `role="button"` and `tabIndex={0}` since the element is now genuinely keyboard-interactive. Resolves WCAG 2.1.1 violation. All 9 focal-point-editor tests pass.

### WR-03: CropGuideOverlay can render taller than its container

**Files modified:** `src/components/features/charts/project-detail/crop-guide-overlay.tsx`
**Commit:** f5cc56d
**Applied fix:** Added height constraint: if `guideHeight > containerHeight`, scale down `guideHeight` to `containerHeight` and recalculate `guideWidth` as `guideHeight * (4/3)` to maintain 4:3 aspect ratio. Prevents overflow in wide, short containers. All 9 focal-point-editor tests pass (covers overlay as child component).

## Skipped Issues

None -- all findings were fixed.

---

_Fixed: 2026-05-17T10:05:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
