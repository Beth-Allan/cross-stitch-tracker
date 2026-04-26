---
phase: 08-session-logging-pattern-dive
plan: 06
subsystem: pattern-dive-data
tags: [server-actions, tdd, pattern-dive, kitting, fabric, storage]
dependency_graph:
  requires: ["08-01 (session types)", "08-05 (pattern dive shell)"]
  provides: ["getWhatsNextProjects", "getFabricRequirements", "getStorageGroups", "assignFabricToProject"]
  affects: ["charts/page.tsx (Pattern Dive tabs)", "project detail (fabric assignment)"]
tech_stack:
  added: []
  patterns: ["kitting percentage calculation", "3-inch margin fabric formula", "storage location grouping"]
key_files:
  created:
    - src/lib/actions/pattern-dive-actions.ts
    - src/lib/actions/pattern-dive-actions.test.ts
  modified: []
decisions:
  - "Fabric always counts as 1 required supply item for kitting % -- 0% if not linked, contributes to denominator even with no other supplies"
  - "Fabric matching uses either-edge comparison (fabric can be rotated) for fitsWidth/fitsHeight"
  - "Unassigned fabrics visible to all users in storage view (linkedProjectId=null filter has no userId scope)"
metrics:
  duration: "5 minutes"
  completed: "2026-04-17T00:22:05Z"
  tasks: 2
  tests: 28
  files_created: 2
  files_modified: 0
---

# Phase 08 Plan 06: Pattern Dive Query Actions Summary

Four server-side query actions for Pattern Dive tabs with TDD, kitting percentage calculation, 3-inch margin fabric formula, and storage location grouping -- all with user ownership filtering.

## Task Completion

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 (RED) | Failing tests for getWhatsNextProjects | b2ea86e | pattern-dive-actions.test.ts |
| 1 (GREEN) | Implement getWhatsNextProjects | f9ec64d | pattern-dive-actions.ts, pattern-dive-actions.test.ts |
| 2 (RED) | Failing tests for 3 remaining actions | 0b96935 | pattern-dive-actions.test.ts |
| 2 (GREEN) | Implement getFabricRequirements, getStorageGroups, assignFabricToProject | 32ab1f1 | pattern-dive-actions.ts |

## What Was Built

### getWhatsNextProjects (D-07, D-08)
- Queries only UNSTARTED and KITTED projects filtered by authenticated user
- Calculates kitting percentage: `(sum(min(acquired, required)) + fabricAcquired) / (sum(required) + fabricRequired) * 100`
- Fabric counts as 1 required supply item (1 acquired if linked, 0 if not)
- Sort: wantToStartNext desc, kittingPercent desc, dateAdded asc
- Returns `WhatsNextProject[]` typed shape

### getFabricRequirements (PDIV-04)
- Returns all projects with positive stitch dimensions
- Calculates required fabric size: `stitches / fabricCount + 6` (3" margin per side)
- Rounds to 1 decimal place
- Populates assignedFabric when project has linked fabric
- Matches unassigned fabrics by count with fitsWidth/fitsHeight flags (either-edge comparison for rotation)

### getStorageGroups (PDIV-05)
- Groups projects by storage location with chart name and status
- Fabrics always placed in "No Location" group (no storageLocationId on Fabric model)
- Projects without storage location also in "No Location"
- Named locations sorted alphabetically, "No Location" always last

### assignFabricToProject (PDIV-04)
- Verifies project ownership before any mutation (T-08-14)
- Unlinks previous fabric if one was already linked
- Links new fabric to project
- Revalidates `/charts/{chartId}` and `/charts`

## Test Coverage

28 tests across 4 action groups:
- **getWhatsNextProjects:** 10 tests (auth, status filter, 3-tier sort, kitting %, fabric as supply, shape)
- **getFabricRequirements:** 7 tests (auth, dimensions filter, formula, null handling, assigned fabric, matching, fits flags)
- **getStorageGroups:** 5 tests (auth, grouping, fabric placement, no-location projects, sort order)
- **assignFabricToProject:** 6 tests (auth, ownership, not found, link, unlink previous, revalidation)

## Decisions Made

1. **Fabric as supply item:** Fabric always counts as 1 required item in kitting percentage. A project with zero supplies but no fabric = 0% kitted (not 100%). This matches the "ready to stitch" intent of the What's Next tab.
2. **Either-edge comparison:** fitsWidth/fitsHeight compare the required dimension against EITHER edge of the fabric (shortest or longest), since fabric can be oriented either way.
3. **Unassigned fabric visibility:** `fabric.findMany({ where: { linkedProjectId: null } })` returns all unassigned fabrics regardless of user. In a single-user app this is correct, but noted for multi-user awareness.

## Threat Mitigations

| Threat ID | Status | Implementation |
|-----------|--------|----------------|
| T-08-14 | Mitigated | assignFabricToProject checks `project.userId === user.id` before mutation |
| T-08-15 | Mitigated | getFabricRequirements filters charts by `project.userId` |
| T-08-16 | Mitigated | getStorageGroups filters projects by `userId`, fabrics by `linkedProject.userId` |

## Deviations from Plan

None -- plan executed exactly as written.

## TDD Gate Compliance

- RED gate: `test(08-06)` commits b2ea86e and 0b96935 (failing tests before implementation)
- GREEN gate: `feat(08-06)` commits f9ec64d and 32ab1f1 (implementation making tests pass)
- REFACTOR gate: Not needed -- code was clean on first pass

## Self-Check: PASSED

All files verified present, all 4 commit hashes confirmed in git log.
