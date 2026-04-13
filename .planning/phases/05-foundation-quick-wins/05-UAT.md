---
status: complete
phase: 05-foundation-quick-wins
source: [05-01-SUMMARY.md, 05-02-SUMMARY.md, 05-03-SUMMARY.md, 05-04-SUMMARY.md, 05-05-SUMMARY.md, 05-06-SUMMARY.md]
started: 2026-04-12T12:00:00Z
updated: 2026-04-12T12:10:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Storage Location CRUD
expected: Navigate to /storage from sidebar. Page loads without errors. Click "+ Add" row — input appears, type a name, press Enter — new location appears in list. Click pencil icon on a location — input auto-focuses with current name selected; rename and press Enter — name updates. Click trash icon — delete confirmation dialog shows project count; confirm — location disappears from list.
result: pass

### 2. Stitching App CRUD
expected: Navigate to /apps from sidebar. Page loads without errors. Same inline add/rename/delete flow as storage locations but with Tablet icon and "Stitching Apps" heading. Create, rename, and delete an app — all work without errors.
result: pass

### 3. Chart Form Dropdowns (Storage + App + Fabric)
expected: Open chart create or edit form. In the Project Setup section, Storage Location, Stitching App, and Fabric dropdowns are live (not disabled). Each is searchable. Each has an "Add New" option that creates the entity inline and selects it. Fabric dropdown shows rich labels ({name} - {count}ct {type} ({brand})). If no fabrics exist, an empty state message or link to /fabric appears.
result: issue
reported: "Adding a new location from the chart details/edit page gives an error and doesn't add: Name is required is the error. Trying to quick add a stitching app does the same. Otherwise all looks good"
severity: major

### 4. Cover Image Display
expected: View a chart that has a cover image (or upload one). The image displays without cropping — full image visible with muted background filling letterbox areas. Container is taller than before (h-48 vs old h-32).
result: blocked
blocked_by: server
reason: "Can't upload a cover photo on the local dev server. 'File storage is not configured'."

### 5. Thread Picker Multi-Add
expected: On a project's supply section, open the thread picker. Add a thread colour — picker stays open (doesn't auto-close). The search input scrolls into view after each addition so it remains accessible while adding multiple threads.
result: issue
reported: "It isn't great - it's so far down the page, only about three colours show up before scrolling off the page. Yes, it scrolls to keep those three lines on the page, but it's very tight and not user friendly still."
severity: minor

### 6. Sidebar Navigation
expected: Sidebar shows "Storage" (MapPin icon) and "Apps" (Tablet icon) entries between Fabric and Sessions in the nav. Both link to /storage and /apps respectively. Navigation grouped into labeled sections.
result: pass

## Summary

total: 6
passed: 3
issues: 2
pending: 0
skipped: 0
blocked: 1

## Gaps

- truth: "Chart form 'Add New' for storage location and stitching app creates entity inline and selects it"
  status: failed
  reason: "User reported: Adding a new location from the chart details/edit page gives an error and doesn't add: Name is required is the error. Trying to quick add a stitching app does the same. Otherwise all looks good"
  severity: major
  test: 3
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""

- truth: "Thread picker multi-add has usable viewport — search input and results remain comfortably accessible while adding multiple threads"
  status: failed
  reason: "User reported: It isn't great - it's so far down the page, only about three colours show up before scrolling off the page. Yes, it scrolls to keep those three lines on the page, but it's very tight and not user friendly still."
  severity: minor
  test: 5
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""
