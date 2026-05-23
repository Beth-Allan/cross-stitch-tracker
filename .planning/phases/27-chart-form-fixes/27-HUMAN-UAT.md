---
status: partial
phase: 27-chart-form-fixes
source: [27-01-SUMMARY.md, 27-02-SUMMARY.md]
started: 2026-05-21T21:30:00Z
updated: 2026-05-23T17:25:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Designer inline creation dialog (BUG-01)
Navigate to /charts/new. In the Designer field, type a new name and click Add New. Verify InlineDesignerDialog opens with the search term pre-filled. Submit the dialog and verify the new designer is auto-selected.
expected: Dialog opens with name pre-filled; after submit, designer appears selected without page reload
result: pass

### 2. Tab-to-type focus (BUG-02)
Navigate to /charts/new. Tab into the Designer field. Immediately type a letter (e.g., 'K'). Verify the popover opens and the search input is pre-seeded with the typed character.
expected: Popover opens immediately on first keystroke; typed character appears in search input; matching designers filter in real time
result: pass

### 3. Supply stitch total hint (BUG-05)
Navigate to /charts/new. Add thread supplies with stitch counts (e.g., 1500). Switch back to Details view. Scroll to the Total Stitch Count field. Verify 'Supply total: 1,500 stitches' hint is visible and updates reactively.
expected: Hint reads 'Supply total: N stitches' with comma formatting; updates as stitch counts change
result: pass
note: Hint only visible in Details mode, not supply mode. User confirmed it works after switching back. Discoverability concern logged as backlog 999.73.

### 4. Designer detail thumbnails (BUG-04)
Navigate to /designers/{id} for a designer with charts that have cover images. Verify each chart row shows its own thumbnail (not wrong images or placeholders).
expected: Each chart row shows its own cover image; charts without cover show placeholder icon
result: blocked
blocked_by: third-party
reason: "R2 signing not configured on dev server"

### 5. Need column width (BUG-06)
Navigate to /charts/new, add a thread supply, and inspect the Need column. Enter enough skeins to produce a 3-digit value. Verify the number, 'sk' label, and Sparkles icon display without truncation.
expected: Full skeins display with label and icon, no clipping or overflow
result: pass

## Summary

total: 5
passed: 4
issues: 0
pending: 0
skipped: 0
blocked: 1

## Gaps
