---
phase: 36-type-safety
plan: 03
subsystem: types
tags: [typescript, type-safety, non-empty-tuple, discriminated-union, refactor]

requires:
  - phase: 25-shopping-cart
    provides: SupplyOverview, ProjectAccordion, shopping cart components
  - phase: 27-designer-fixes
    provides: InlineDesignerDialog controlled-mode usage

provides:
  - OnUpdateAcquired shared callback type in src/types/shopping.ts
  - Non-empty tuple type on AggregatedSupply.items
  - Controlled-only InlineDesignerDialog (no dead code paths)
  - Type-safe LocalStateAdapter.updateQuantity (no cast)

affects: [shopping, supply-table, chart-form]

tech-stack:
  added: []
  patterns:
    - "Non-empty tuple [T, ...T[]] for aggregation results with at-least-one invariant"
    - "Shared callback type aliases in src/types/ for cross-component prop deduplication"

key-files:
  created:
    - src/types/shopping.ts
  modified:
    - src/components/features/shopping/supply-overview.tsx
    - src/components/features/shopping/project-accordion.tsx
    - src/components/features/charts/inline-designer-dialog.tsx
    - src/components/features/supply-table/local-state-adapter.ts
    - src/components/features/charts/chart-merged-form.test.tsx

key-decisions:
  - "OnUpdateAcquired uses lowercase supply types (thread/bead/specialty) matching existing consumer signatures"
  - "InlineDesignerDialog uses useEffect+useRef for initialName sync instead of useState ref hack"
  - "LocalStateAdapter field narrowed to stitchCount|need|have (excluding isNeedOverridden which is boolean, not number)"

patterns-established:
  - "Non-empty tuple: use [T, ...T[]] when aggregation guarantees at-least-one item"
  - "Controlled-only dialogs: remove uncontrolled paths when only one caller exists and uses controlled mode"

requirements-completed: [QUAL-07, QUAL-08]

duration: 5min
completed: 2026-07-01
---

# Phase 36 Plan 03: Collection Types & Controlled Dialog Summary

**Shared OnUpdateAcquired callback type, non-empty tuple for aggregated supplies, controlled-only InlineDesignerDialog, and type-safe LocalStateAdapter field indexing**

## Performance

- **Duration:** 5 min
- **Started:** 2026-07-02T00:45:02Z
- **Completed:** 2026-07-02T00:49:42Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Created `OnUpdateAcquired` shared type alias, replacing 5 inline callback definitions across 2 files
- Tightened `AggregatedSupply.items` to `[ShoppingSupplyNeed, ...ShoppingSupplyNeed[]]` non-empty tuple
- Simplified InlineDesignerDialog to controlled-only: removed trigger prop, uncontrolled state, isControlled branching, DialogTrigger
- Replaced `useState` ref hack with proper `useEffect` + `useRef` for initialName sync
- Narrowed `LocalStateAdapter.updateQuantity` field parameter from `string` to `"stitchCount" | "need" | "have"`, removing `as unknown as Record<string, unknown>` cast

## Task Commits

Each task was committed atomically:

1. **Task 1: Create OnUpdateAcquired shared type and tighten AggregatedSupply.items** - `be9d8c9` (refactor)
2. **Task 2: Simplify InlineDesignerDialog to controlled-only and fix LocalStateAdapter cast** - `6e31628` (refactor)

## Files Created/Modified
- `src/types/shopping.ts` - New shared callback type for shopping cart supply updates
- `src/components/features/shopping/supply-overview.tsx` - OnUpdateAcquired import, non-empty tuple on items
- `src/components/features/shopping/project-accordion.tsx` - OnUpdateAcquired import replacing 2 inline types
- `src/components/features/charts/inline-designer-dialog.tsx` - Controlled-only simplification
- `src/components/features/supply-table/local-state-adapter.ts` - Type-safe field indexing
- `src/components/features/charts/chart-merged-form.test.tsx` - Updated mock type to match required props

## Decisions Made
- OnUpdateAcquired uses lowercase supply type strings (`"thread" | "bead" | "specialty"`) matching existing consumer signatures rather than the uppercase `SupplyType` enum
- LocalStateAdapter field union excludes `isNeedOverridden` since it's boolean (not assignable from the number `value` parameter)
- Used `useEffect` + `useRef` pattern for initialName sync instead of the previous `useState` ref hack which performed state updates during render

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Updated test mock type for InlineDesignerDialog**
- **Found during:** Task 2 (InlineDesignerDialog simplification)
- **Issue:** chart-merged-form.test.tsx mock had `open?: boolean` and `onOpenChange?: (open: boolean) => void` as optional props, which would be incorrect after making them required
- **Fix:** Changed mock type annotations to `open: boolean` and `onOpenChange: (open: boolean) => void` (required)
- **Files modified:** src/components/features/charts/chart-merged-form.test.tsx
- **Verification:** npm test passes (2399 tests)
- **Committed in:** 6e31628 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Test mock type alignment was necessary for type consistency. No scope creep.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All QUAL-07 and QUAL-08 requirements satisfied
- Shopping cart types are tighter with compile-time invariant enforcement
- InlineDesignerDialog has no dead code paths remaining
- LocalStateAdapter indexing is type-safe without casts

## Self-Check: PASSED

- All created files exist on disk
- Both commit hashes (be9d8c9, 6e31628) found in git log
- All 4 must-have truths verified against source files
- 2399 tests passing, no regressions

---
*Phase: 36-type-safety*
*Completed: 2026-07-01*
