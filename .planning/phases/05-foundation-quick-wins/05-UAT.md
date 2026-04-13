---
status: complete
phase: 05-foundation-quick-wins
source: [05-01-SUMMARY.md, 05-02-SUMMARY.md, 05-03-SUMMARY.md, 05-04-SUMMARY.md, 05-05-SUMMARY.md, 05-06-SUMMARY.md, 05-07-SUMMARY.md]
started: 2026-04-12T12:00:00Z
updated: 2026-04-13T02:50:00Z
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

### 3. Chart Form "Add New" for Storage Location & Stitching App (re-test)
expected: Open chart create or edit form. In the Project Setup section, type a name in the Storage Location dropdown search — an "Add {name}" option appears. Click it — the new location is created and selected. The "Add" option should NOT appear when the search box is empty. Same behavior for Stitching App dropdown.
result: issue
reported: "Adding with a space in the name (e.g. 'Bin A') causes the Add option to disappear — cmdk filters it out. Also, requiring search text to show Add New is inconsistent with other dropdowns which always show + Add New."
severity: major

### 4. Cover Image Display
expected: View a chart that has a cover image (or upload one). The image displays without cropping — full image visible with muted background filling letterbox areas. Container is taller than before (h-48 vs old h-32).
result: blocked
blocked_by: server
reason: "Can't upload a cover photo on the local dev server. 'File storage is not configured'."

### 5. Thread Picker Multi-Add (re-test)
expected: On a project's supply section, open the thread picker. Add a thread colour — picker stays open (doesn't auto-close). The results list is comfortably tall (not cramped to 3 rows). You can add multiple threads without the picker closing between each one.
result: issue
reported: "Multi-add works (picker stays open), but viewport clipping still an issue — only ~3 rows visible because picker opens downward at bottom of page and gets clipped by viewport edge. Needs upward-flip when near bottom."
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

- truth: "Chart form 'Add New' for storage location and stitching app creates entity inline and selects it — including names with spaces"
  status: failed
  reason: "User reported: Adding with a space in the name (e.g. 'Bin A') causes the Add option to disappear — cmdk filters it out. Also, requiring search text to show Add New is inconsistent with other dropdowns which always show + Add New."
  severity: major
  test: 3
  root_cause: "Plan 05-07 over-corrected: (1) Added search.trim() guard on line 81 that hides Add New unless user types — inconsistent with other dropdowns. (2) cmdk's built-in fuzzy filter removes the Add CommandItem when search contains spaces because it can't match 'Bin A' against the item's generated value. Fix: revert to always-visible '+ Add New', keep handler guards, add forceMount or keywords to prevent cmdk filtering."
  artifacts:
    - path: "src/components/features/charts/form-primitives/searchable-select.tsx"
      issue: "Line 81: search.trim() guard hides Add New unnecessarily; cmdk filter removes Add item on space-containing searches"
  missing:
    - "Remove search.trim() guard — always show '+ Add New' when onAddNew provided"
    - "Add forceMount or keywords prop to Add CommandItem to prevent cmdk filtering"
    - "Keep existing handler guards in project-setup-section.tsx (belt without broken suspenders)"
  debug_session: ""

- truth: "Thread picker multi-add has usable viewport — search input and results remain comfortably accessible while adding multiple threads"
  status: partial
  reason: "User reported: Multi-add works (picker stays open), but viewport clipping still an issue — only ~3 rows visible because picker opens downward at bottom of page and gets clipped by viewport edge. Needs upward-flip when near bottom."
  severity: minor
  test: 5
  root_cause: "Multi-add fix (no-op handleAdded, max-h-72) is working. Remaining issue: absolute top-full positioning on line 202 of search-to-add.tsx always opens downward. When the picker is near the viewport bottom, the browser clips it. Needs collision detection to flip upward (bottom-full) when insufficient space below."
  artifacts:
    - path: "src/components/features/supplies/search-to-add.tsx"
      issue: "Line 202: absolute top-full always opens downward — needs viewport collision detection to flip upward when near bottom"
  missing:
    - "Add useEffect/useLayoutEffect to measure available space below vs above the trigger"
    - "If space below < max-h-72, position with bottom-full instead of top-full"
  debug_session: ""
