---
status: partial
phase: 07-project-detail-experience
source: [07-VERIFICATION.md]
started: 2026-04-16T19:20:00Z
updated: 2026-04-16T19:20:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Hero visual rendering
expected: Hero renders with cover image (blurred background fill, object-contain), chart name in Fraunces heading, status badge dropdown, Edit button, kebab menu
result: [pending]

### 2. Status badge dropdown + celebration ring
expected: Dropdown shows all 7 statuses, selection triggers optimistic update, celebration ring appears (violet) on hero container for FINISHED status
result: [pending]

### 3. Tab URL state persistence
expected: URL changes to ?tab=overview / ?tab=supplies. Refreshing the page preserves the active tab.
result: [pending]

### 4. Overview tab section ordering
expected: On a WIP project (IN_PROGRESS status): Stitching Progress section appears BEFORE Pattern Details
result: [pending]

### 5. Stitch count entry + skein auto-calculation
expected: Enter stitch count (e.g., 1000) on a thread row. Skeins auto-calculate (~1 skein for 14ct/over-1/2-strands). Calculator settings bar appears. Footer totals update.
result: [pending]

### 6. Manual override + Calc indicator
expected: Edit the Need value on an auto-calculated thread row. Calculator icon changes to "Calc: X" indicator. Override persists when stitch count changes again.
result: [pending]

### 7. Delete project dialog (cancel path)
expected: Kebab menu > Delete Project shows confirmation dialog with chart name. Cancel closes without deletion.
result: [pending]

### 8. SearchToAdd inline create flow
expected: On Supplies tab, click "+ Add threads", search for non-existent name. "+ Create [search text]" option appears. Clicking opens InlineSupplyCreate dialog pre-filled.
result: [pending]

## Summary

total: 8
passed: 0
issues: 0
pending: 8
skipped: 0
blocked: 0

## Gaps
