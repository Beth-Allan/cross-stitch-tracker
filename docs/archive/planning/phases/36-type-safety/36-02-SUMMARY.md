---
phase: 36-type-safety
plan: 02
subsystem: types
tags: [type-safety, focal-point, discriminated-union]
dependency_graph:
  requires: []
  provides: [OptionalFocalPoint-union, mapFocalPoint]
  affects: [dashboard-actions, project-dashboard-actions, shopping-cart-actions, series-actions, genre-actions, designer-actions, gallery-utils]
tech_stack:
  added: []
  patterns: [discriminated-union, query-boundary-mapper]
key_files:
  created:
    - src/types/focal-point.test.ts
  modified:
    - src/types/focal-point.ts
    - src/types/dashboard.ts
    - src/components/features/gallery/gallery-types.ts
    - src/__tests__/mocks/factories.ts
    - src/lib/actions/dashboard-actions.ts
    - src/lib/actions/project-dashboard-actions.ts
    - src/lib/actions/shopping-cart-actions.ts
    - src/lib/actions/series-actions.ts
    - src/lib/actions/genre-actions.ts
    - src/lib/actions/designer-actions.ts
    - src/components/features/gallery/gallery-utils.ts
    - src/components/features/dashboard/bucket-project-row.test.tsx
    - src/components/features/dashboard/buried-treasures-section.test.tsx
    - src/components/features/dashboard/currently-stitching-card.test.tsx
    - src/components/features/dashboard/spotlight-card.test.tsx
    - src/components/features/dashboard/progress-breakdown-tab.test.tsx
    - src/components/features/shopping/project-accordion.test.tsx
decisions:
  - "D-07: OptionalFocalPoint as discriminated union (both-or-neither)"
  - "D-08: mapFocalPoint co-located in focal-point.ts"
  - "D-09: All 10 query mapping sites use mapFocalPoint spread"
  - "D-10 deviation: Consumer types changed from interface-extends to type-intersection (TS limitation)"
metrics:
  duration: "11m"
  completed: "2026-07-02T00:55:22Z"
  tasks_completed: 2
  tasks_total: 2
  tests_added: 5
  tests_total: 2404
  files_changed: 17
---

# Phase 36 Plan 02: OptionalFocalPoint Discriminated Union Summary

Discriminated union type enforcing both-or-neither focal point semantics, with mapFocalPoint boundary mapper wired into all 10 query sites across 7 action files.

## Task Results

| Task | Name | Commit | Key Changes |
|------|------|--------|-------------|
| 1 | Replace OptionalFocalPoint with discriminated union + mapFocalPoint | 8b1740a (RED), e0cf3b2 (GREEN) | Union type, mapFocalPoint helper, 5 tests, consumer type migration |
| 2 | Wire mapFocalPoint into all query mapping sites | f52730b | 10 mapping sites across 7 files |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] TypeScript does not support interface-extends-union (TS2312)**
- **Found during:** Task 1 GREEN phase
- **Issue:** The plan assumed `interface X extends OptionalFocalPoint` would work with a union type (D-10: "no changes needed to these files"). TypeScript error TS2312: "An interface can only extend an object type or intersection of object types with statically known members."
- **Fix:** Converted 7 consumer types from `interface X extends OptionalFocalPoint` to `type X = OptionalFocalPoint & { ... }` (intersection pattern). The intersection with a union works correctly and preserves property access.
- **Files modified:** src/types/dashboard.ts (6 types: CurrentlyStitchingProject, StartNextProject, BuriedTreasure, SpotlightProject, BucketProject, ShoppingCartProject), src/components/features/gallery/gallery-types.ts (GalleryCardData)
- **Commit:** e0cf3b2

**2. [Rule 3 - Blocking] Test factory Partial<UnionType> spread incompatibility**
- **Found during:** Task 1 GREEN phase
- **Issue:** Test factories using `Partial<SeriesChart>` (etc.) with spread overrides fail type-checking because `Partial` distributes over the union, making the spread result ambiguous to TypeScript.
- **Fix:** Added `as T` casts on 9 test factory return values (4 in shared factories.ts, 5 in per-file test factories). This is acceptable for test utilities since type safety is enforced at the domain level.
- **Files modified:** src/__tests__/mocks/factories.ts, 5 test files
- **Commit:** e0cf3b2

## Implementation Details

### Type Definition

```typescript
export type OptionalFocalPoint =
  | { focalPointX: number; focalPointY: number }
  | { focalPointX: null; focalPointY: null };
```

An object literal `{ focalPointX: 42, focalPointY: null }` is now a compile-time error when assigned to any type that includes OptionalFocalPoint.

### Boundary Mapper

```typescript
export function mapFocalPoint(
  x: number | null | undefined,
  y: number | null | undefined,
): OptionalFocalPoint
```

Normalizes raw Prisma results (independent nullable Int fields) into the validated union. Mismatched or undefined inputs produce the both-null variant.

### Query Site Coverage

| File | Sites | Pattern |
|------|-------|---------|
| dashboard-actions.ts | 4 | currently-stitching, start-next, buried-treasures, spotlight |
| project-dashboard-actions.ts | 1 | bucket projects |
| shopping-cart-actions.ts | 1 | cart projects |
| series-actions.ts | 1 | series detail charts |
| genre-actions.ts | 1 | genre detail charts |
| designer-actions.ts | 1 | designer detail charts |
| gallery-utils.ts | 1 | gallery cards |
| **Total** | **10** | |

## Verification

- 2404 tests pass (210 files), 5 new tests added
- Zero focal-point-related type errors in `tsc --noEmit`
- Invalid state `{ focalPointX: 42, focalPointY: null }` is a compile-time error

## Self-Check: PASSED

- [x] src/types/focal-point.ts exists and exports OptionalFocalPoint + mapFocalPoint
- [x] src/types/focal-point.test.ts exists with 5 tests
- [x] Commit 8b1740a (RED) exists
- [x] Commit e0cf3b2 (GREEN) exists
- [x] Commit f52730b (Task 2) exists

## TDD Gate Compliance

- RED gate: test(36-02) commit 8b1740a -- 5 failing tests
- GREEN gate: feat(36-02) commit e0cf3b2 -- all 5 tests passing
- No REFACTOR gate needed (implementation is minimal)
