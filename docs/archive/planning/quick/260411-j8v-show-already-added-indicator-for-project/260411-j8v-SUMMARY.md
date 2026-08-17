# Quick Task 260411-j8v: Show "already added" indicator for project supplies

**Date:** 2026-04-11
**Status:** Complete

## What Changed

### Task 1: Tests for already-added indicator (RED)
- Created `src/components/features/supplies/search-to-add.test.tsx` — 7 tests
- Commit: `c4ddaec`

### Task 2: Implement already-added indicator (GREEN)
- Modified `src/components/features/supplies/search-to-add.tsx` — partitions items into addable + already-added, renders both in dropdown
- Already-added items shown greyed out with "Already added" label, disabled buttons
- Keyboard navigation skips disabled items
- "No matches" only appears when API returns zero results
- Commit: `d5d4d8e`

## Files Changed

| File | Action |
|------|--------|
| `src/components/features/supplies/search-to-add.tsx` | Modified |
| `src/components/features/supplies/search-to-add.test.tsx` | Created |
