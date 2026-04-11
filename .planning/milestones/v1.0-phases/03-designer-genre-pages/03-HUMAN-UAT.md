---
status: partial
phase: 03-designer-genre-pages
source: [03-VERIFICATION.md]
started: 2026-04-08T17:20:00.000Z
updated: 2026-04-08T17:20:00.000Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Designer list — sort interaction
expected: Visual feedback on active column, chevron icon, sort direction toggles on click
result: [pending]

### 2. Designer list — delete from row
expected: Clicking trash icon opens DeleteConfirmationDialog with designer name and chart count; confirming deletes and refreshes list
result: [pending]

### 3. Genre list — delete from row
expected: Clicking trash icon opens DeleteConfirmationDialog (not browser confirm()); shows genre name, chart count, and "Charts will NOT be deleted" warning
result: [pending]

### 4. Designer detail — computed stats
expected: Started/Finished/Top Genre stats computed from live DB data; amber badge renders for specific conditions
result: [pending]

### 5. Detail page chart list
expected: Thumbnails render, status badges show correct colors, chart names link to /charts/[id]
result: [pending]

### 6. Mobile responsive layout
expected: Card layout below 768px breakpoint; table layout above; CSS media queries work correctly
result: [pending]

### 7. 404 for non-existent IDs
expected: Navigating to /designers/nonexistent or /genres/nonexistent shows Next.js not-found page
result: [pending]

### 8. Duplicate name validation
expected: Creating a designer/genre with an existing name shows inline error; P2002 unique constraint handled gracefully
result: [pending]

## Summary

total: 8
passed: 0
issues: 0
pending: 8
skipped: 0
blocked: 0

## Gaps
