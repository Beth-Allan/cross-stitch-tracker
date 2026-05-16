---
status: complete
phase: 13-supply-takeover
source: [13-04-SUMMARY.md, 13-05-SUMMARY.md]
started: 2026-05-16T00:00:00Z
updated: 2026-05-16T12:40:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Fabric dropdown opens on first click
expected: Navigate to /charts/new. Enter a chart name. Click "Add supplies" to switch to supply mode. Click the fabric dropdown in CalculatorCard WITHOUT changing any other field first. The dropdown should open immediately on first click.
result: pass

### 2. Create bead via quick-add
expected: In supply mode, switch to "Beads" tab in the supply table. Type a bead name in the search box. Click "+ Create [name]". The bead should be created successfully and appear as a row in the supply table (no error toast).
result: pass
note: Required additional fix — buildCreateFn sent empty productCode (failed Zod min(1)) and standalone create actions didn't resolve "default" brandId. Fixed inline during retest.

### 3. Create specialty item via quick-add
expected: In supply mode, switch to "Specialty" tab in the supply table. Type a specialty item name in the search box. Click "+ Create [name]". The specialty item should be created successfully and appear as a row in the supply table (no error toast).
result: pass
note: Same root cause as test 2 — fixed together.

### 4. Skein recalculation on stitch count edit
expected: In supply mode with a fabric selected and at least one thread added, edit the stitch count on a thread row. The "Need" column should recalculate automatically based on the new stitch count and current calc settings (over, count, strands, waste).
result: pass

### 5. Skein recalculation on calc settings change
expected: With threads already in the supply table (with stitch counts set), change a calc setting in the CalculatorCard (e.g., change Over from 2 to 1, or change Waste %). All non-overridden thread rows should recalculate their "Need" values automatically.
result: pass

### 6. Draft auto-save on navigation away
expected: Fill in a chart name and add at least one supply. Navigate away from /charts/new (e.g., click a nav link). Then navigate back to /charts/new. The draft should be restored — form values and supply rows should reappear.
result: pass

## Summary

total: 6
passed: 6
issues: 0
pending: 0
skipped: 0
blocked: 0

## Additional Fixes During Retest

### Fix 1: createFn empty productCode + unresolved brandId
- buildCreateFn: changed `data.code ?? ""` to `data.code || "CUSTOM"` for all three types
- createThread, createBead, createSpecialtyItem: added resolveDefaultBrandId call
- Files: chart-merged-form.tsx, supply-actions.ts

### Fix 2: SegmentedTypeToggle dead space
- Added `w-fit` to prevent flex-col stretch from widening toggle beyond content
- File: segmented-type-toggle.tsx

## Gaps

[none]
