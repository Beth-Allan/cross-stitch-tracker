---
phase: 25-shopping-cart-scaling
fixed_at: 2026-05-20T01:30:00Z
review_path: .planning/phases/25-shopping-cart-scaling/25-REVIEW.md
iteration: 1
findings_in_scope: 5
fixed: 5
skipped: 0
status: all_fixed
---

# Phase 25: Code Review Fix Report

**Fixed at:** 2026-05-20T01:30:00Z
**Source review:** .planning/phases/25-shopping-cart-scaling/25-REVIEW.md
**Iteration:** 1

**Summary:**
- Findings in scope: 5 (1 critical, 4 warnings)
- Fixed: 5
- Skipped: 0

## Fixed Issues

### CR-01: Aggregated supply quantity change silently drops updates for multi-project supplies

**Files modified:** `src/components/features/shopping/supply-overview.tsx`
**Commit:** 6a5faa6
**Applied fix:** Replaced blind first-item update with capacity-aware targeting. Increments now find the first item with remaining capacity (`quantityAcquired < quantityRequired`), decrements find the first item with acquired > 0. Single-item supplies still update directly. This is a logic fix -- marked as requires human verification for the multi-item distribution edge case (e.g., diff larger than any single item's remaining capacity).

### WR-01: localStorage hydration race overwrites stored selection with empty set

**Files modified:** `src/components/features/shopping/shopping-cart.tsx`
**Commit:** 2a173f0
**Applied fix:** Added `initialRenderRef` guard to the persist effect in `usePersistedSelection`. After hydration sets `hydratedRef.current = true`, the first persist-effect execution is skipped (since `selectedIds` hasn't re-rendered with hydrated data yet). Subsequent changes persist normally.

### WR-02: Hardcoded text-amber-600 violates semantic token convention

**Files modified:** `src/components/features/shopping/project-accordion.tsx`, `src/components/features/shopping/supply-overview.tsx`
**Commit:** 42b2b65
**Applied fix:** Replaced `text-amber-600` with `text-warning` in both files. The `--warning` semantic token is already defined in globals.css with proper light/dark mode values (amber-600 light, amber-400 dark), and `text-warning` is used consistently throughout the codebase.

### WR-03: Dead "has fabric" UI code in project-accordion and supply-overview

**Files modified:** `src/components/features/shopping/project-accordion.tsx`, `src/components/features/shopping/supply-overview.tsx`
**Commit:** 15dcf4f
**Applied fix:** Removed unreachable "has fabric" branches from both components. The server action (`getShoppingCartData`) only includes projects where `!p.fabric`, so `hasFabric` is always `false` and `fabricName` is always `null`. Removed: conditional `cn()` styling, Check icon display, `fabricName` interpolation, and redundant `!hasFabric` guards. Also removed unused `Check` import from supply-overview.tsx. Header count simplified since all items need fabric.

### WR-04: Redundant `as ProjectStatus` type assertion

**Files modified:** `src/components/features/shopping/project-accordion.tsx`
**Commit:** a722a0b
**Applied fix:** Removed `as ProjectStatus` from `<StatusBadge status={project.status as ProjectStatus} />`. The `ShoppingCartProject.status` field is already typed as `ProjectStatus`, making the assertion redundant. Removing it ensures future type changes surface as compile errors rather than being silently suppressed.

---

_Fixed: 2026-05-20T01:30:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 1_
