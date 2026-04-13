---
status: diagnosed
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
  root_cause: "SearchableSelect's onAddNew passes `search` state which is empty string when user clicks 'Add New' without typing. Empty string fails Zod validation (trim + min(1)). Fix: only show 'Add New' when search.trim() is non-empty, and add guard in useChartForm handlers."
  artifacts:
    - path: "src/components/features/charts/form-primitives/searchable-select.tsx"
      issue: "Line 89: onAddNew(search) passes empty string when user hasn't typed"
    - path: "src/components/features/charts/use-chart-form.ts"
      issue: "Lines 307,328: handleAddStorageLocation/handleAddStitchingApp don't guard against empty names"
  missing:
    - "Only render 'Add New' option when search.trim() is non-empty"
    - "Change label from 'Add New' to 'Add \"{search}\"' for clarity"
    - "Add guard in handlers: if (!name.trim()) return"
  debug_session: ""

- truth: "Thread picker multi-add has usable viewport — search input and results remain comfortably accessible while adding multiple threads"
  status: failed
  reason: "User reported: It isn't great - it's so far down the page, only about three colours show up before scrolling off the page. Yes, it scrolls to keep those three lines on the page, but it's very tight and not user friendly still."
  severity: minor
  test: 5
  root_cause: "Three compounding issues: (1) max-h-48 caps results to ~4 rows (192px). (2) Absolute positioning (top-full) places picker below already-deep page content. (3) Parent's handleAdded closes picker after every add (setAddingType(null)) despite search-to-add intending to stay open."
  artifacts:
    - path: "src/components/features/supplies/search-to-add.tsx"
      issue: "Line 222: max-h-48 too small; Line 206: absolute top-full position; Line 161: scrollIntoView block:end over-scrolls"
    - path: "src/components/features/charts/project-supplies-tab.tsx"
      issue: "Lines 416-418: handleAdded unmounts picker after every add, defeating multi-add UX"
  missing:
    - "Stop closing picker on add (handleAdded should refresh data, not unmount)"
    - "Increase max-h-48 to max-h-72 or max-h-80"
    - "Change scrollIntoView to block: nearest"
  debug_session: ""
