---
status: complete
phase: 16-input-dashboard-fixes
source: [16-01-SUMMARY.md, 16-02-SUMMARY.md]
started: 2026-05-17T05:10:00.000Z
updated: 2026-05-17T05:15:00.000Z
---

## Current Test

[testing complete]

## Tests

### 1. Keystroke timing regression
expected: Type "310" fast in the supplies add row — all 3 characters appear without drops
result: pass

### 2. Spotlight visual proportions
expected: Card looks balanced and less dominant on the dashboard (320px image, not half-width)
result: pass

### 3. Dark mode button colors
expected: "Check It Out" button shows correct primary color in dark mode; both buttons are same size
result: issue
reported: "Check It Out and Shuffle buttons are two different sizes"
severity: cosmetic

### 3a. Dark mode button colors (retest after fix)
expected: Both buttons render at the same height and width, consistent styling
result: pass

## Summary

total: 3
passed: 3
issues: 1 (fixed inline)
pending: 0
skipped: 0
blocked: 0

## Gaps

[none — issue found in test 3 was fixed inline during UAT]

## Inline Fix Applied

- **Issue:** "Check It Out" (LinkButton + buttonVariants) and "Shuffle Spotlight" (raw button) rendered at different sizes due to mismatched styling approaches
- **Root cause:** LinkButton used CVA concatenation without twMerge, so `h-8` from buttonVariants conflicted with `py-2.5` override. Shuffle button bypassed buttonVariants entirely.
- **Fix:** Updated LinkButton to use `cn()` with twMerge for proper class merging. Converted Shuffle to use `Button` component with `variant="outline"`. Added `h-auto` to both for content-based sizing.
- **Files changed:** `link-button.tsx`, `spotlight-card.tsx`, `spotlight-card.test.tsx`
