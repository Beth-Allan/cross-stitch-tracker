# Quick Task 260411-iwm: Fix thread sort to use numeric ordering

**Date:** 2026-04-11
**Status:** Complete

## What Changed

### Task 1: Natural sort utility
- Created `src/lib/utils/natural-sort.ts` — reusable `naturalSortByCode` comparator
- Created `src/lib/utils/natural-sort.test.ts` — 42 lines of test coverage
- Commit: `d91e168`

### Task 2: Apply numeric sort to supply-actions
- Modified `src/lib/actions/supply-actions.ts` — applied `naturalSortByCode` to `getThreads()` and `getProjectSupplies()` queries
- Updated `src/lib/actions/supply-actions.test.ts` — added sort verification tests
- Commit: `2c0afc6`

## Files Changed

| File | Action |
|------|--------|
| `src/lib/utils/natural-sort.ts` | Created |
| `src/lib/utils/natural-sort.test.ts` | Created |
| `src/lib/actions/supply-actions.ts` | Modified |
| `src/lib/actions/supply-actions.test.ts` | Modified |
