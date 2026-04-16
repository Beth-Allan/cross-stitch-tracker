---
phase: 07-project-detail-experience
fixed_at: 2026-04-16T19:45:00Z
review_path: .planning/phases/07-project-detail-experience/07-REVIEW.md
iteration: 2
findings_in_scope: 3
fixed: 3
skipped: 0
status: all_fixed
---

# Phase 7: Code Review Fix Report

**Fixed at:** 2026-04-16T19:45:00Z
**Source review:** .planning/phases/07-project-detail-experience/07-REVIEW.md
**Iteration:** 2

**Summary:**
- Findings in scope: 3
- Fixed: 3
- Skipped: 0

## Fixed Issues

### CR-01: getProjectSupplies lacks ownership check -- any authenticated user can read any project's supplies

**Files modified:** `src/lib/actions/supply-actions.ts`, `src/lib/actions/supply-actions.test.ts`
**Commit:** 6b29492
**Applied fix:** Added project ownership verification to `getProjectSupplies` -- the function now captures the user from `requireAuth()`, looks up the project, and returns empty arrays if the project doesn't exist or isn't owned by the requesting user. This follows the same pattern used by all other junction operations in the file. Added 2 new tests (non-owner returns empty, nonexistent project returns empty) and updated 2 existing tests with ownership mocks.

### WR-01: resolveDefaultBrandId shares a single "Custom" brand across all supply types

**Files modified:** `src/lib/actions/supply-actions.ts`
**Commit:** b35b51e
**Applied fix:** Changed `resolveDefaultBrandId` to use distinct brand names per supply type: `Custom (Thread)`, `Custom (Bead)`, `Custom (Specialty)`. Each supply type now upserts its own brand record with the correct `supplyType` field, preventing the data integrity issue where all types shared a single "Custom" brand with whichever `supplyType` was created first.

### WR-02: CalculatorSettingsBar handleSettingChange captures stale currentSettings via closure

**Files modified:** `src/components/features/charts/project-detail/calculator-settings-bar.tsx`
**Commit:** 5a3a786
**Applied fix:** Added a `settingsRef` that tracks the latest `currentSettings` via `useEffect`, and updated `handleSettingChange` to read from `settingsRef.current` instead of the closure-captured `currentSettings`. Removed `currentSettings` from the `useCallback` dependency array since the ref doesn't need to be a dependency. Used `useEffect` (not direct assignment) to comply with React 19's `react-hooks/refs` ESLint rule that prohibits writing to refs during render. Status: fixed: requires human verification (logic fix).

---

_Fixed: 2026-04-16T19:45:00Z_
_Fixer: Claude (gsd-code-fixer)_
_Iteration: 2_
