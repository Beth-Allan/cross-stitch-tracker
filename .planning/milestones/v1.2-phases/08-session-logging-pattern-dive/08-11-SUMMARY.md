---
phase: 08-session-logging-pattern-dive
plan: 11
status: complete
started: "2026-04-17T19:26:00Z"
completed: "2026-04-17T19:28:00Z"
gap_closure: true
---

# Plan 08-11 Summary: Fix Fabric Matching Catch-22 for Unassigned Projects

## What was built

Fixed `getFabricRequirements()` so projects without assigned fabric now show matching fabrics from the stash. Previously, the matching logic derived `fabricCount` from the assigned fabric -- which is always null for "Needs Fabric" projects -- making `matchingFabrics` always `[]`.

The fix adds a dual-path approach:
- **With assigned fabric (existing):** Filter unassigned fabrics by same count, check size fits
- **Without assigned fabric (new):** Iterate ALL unassigned fabrics, compute required dimensions per-fabric using each fabric's own count, include if at least one dimension fits

## Key files

### Modified
- `src/lib/actions/pattern-dive-actions.ts` -- dual-path matching logic in `getFabricRequirements()`
- `src/lib/actions/pattern-dive-actions.test.ts` -- 4 new tests (3 for unassigned matching, 1 regression guard)

## Self-Check: PASSED

- All 35 getFabricRequirements tests pass
- All 1054 project tests pass (zero regressions)
- No type changes (FabricRequirementRow shape unchanged)
- No UI changes needed (fabric-requirements-tab.tsx already renders matchingFabrics correctly)

## Deviations

None. Plan executed as written.

## Commits

1. `test(08-11): add failing tests for per-fabric matching on unassigned projects`
2. `fix(08-11): compute fabric matching per-fabric for unassigned projects`
