---
status: complete
phase: 06-gallery-cards-view-modes
source: [06-01-SUMMARY.md, 06-02-SUMMARY.md, 06-03-SUMMARY.md, 06-04-SUMMARY.md]
started: 2026-04-13T21:00:00Z
updated: 2026-04-13T21:15:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Gallery Card Display
expected: Navigate to /charts (Projects page). Charts display as gallery cards in a responsive grid. Each card shows: cover image (or gradient placeholder with scissors icon), project name as link, designer name, genre tags (max 3 visible with +N overflow), and size badge in top-right corner.
result: pass

### 2. Status-Specific Card Footers
expected: WIP cards show a progress bar with percentage and supply count. Unstarted cards show kitting dots (green check = fulfilled, red circle = needed, amber dot = partial). Finished/FFO cards show a celebration border effect.
result: pass

### 3. View Mode Toggle
expected: Above the gallery, a segmented toggle shows Cards / List / Table. Clicking List switches to compact rows with thumbnails and stats. Clicking Table switches to a sortable table with columns. Cards view shows the gallery cards.
result: pass

### 4. View Mode URL Persistence
expected: Switch to List view. The URL updates with a view parameter. Reload the page — List view persists (not reset to gallery).
result: issue
reported: "Yes, BUT a next.js error showed up: Hydration failed because the server rendered HTML didn't match the client. As a result this tree will be regenerated on the client."
severity: major

### 5. Sort Charts
expected: Sort dropdown shows current sort field (default: Date Added). Click it to see 6 options: Date Added, Name, Designer, Status, Size, Stitch Count. Select a different field — charts reorder. Direction arrow toggles asc/desc.
result: pass

### 6. Search by Name and Designer
expected: Type part of a project name in the search box — only matching projects appear. Clear and type a designer name — projects by that designer appear. Search matches both project name and designer name.
result: pass

### 7. Status and Size Filters
expected: Status dropdown opens a multi-select with 7 statuses (checkboxes). Select one or more — only matching charts shown. Size dropdown works the same with 5 size categories. Both can be active simultaneously.
result: pass

### 8. Filter Chips and Clear All
expected: When filters are active, chips appear below the filter bar showing each active filter. Clicking X on a chip removes that specific filter. "Clear all filters" link removes all active filters at once.
result: pass

### 9. Empty Filter State
expected: Apply filters that match no charts (e.g., a status with no projects). Instead of a blank grid, a message appears with suggestion text and a "Clear all filters" button.
result: pass

### 10. Sidebar Navigation Label
expected: The sidebar navigation shows "Projects" as the label for the charts section (previously said "Charts").
result: pass

## Summary

total: 10
passed: 9
issues: 1
pending: 0
skipped: 0
blocked: 0

## Gaps

- truth: "View mode persists in URL without errors on page reload"
  status: failed
  reason: "User reported: Yes, BUT a next.js error showed up: Hydration failed because the server rendered HTML didn't match the client. As a result this tree will be regenerated on the client."
  severity: major
  test: 4
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""
