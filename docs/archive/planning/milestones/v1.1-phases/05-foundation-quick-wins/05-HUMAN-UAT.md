---
status: partial
phase: 05-foundation-quick-wins
source: [05-VERIFICATION.md]
started: 2026-04-13T20:15:00Z
updated: 2026-04-13T21:30:00Z
---

## Current Test

number: 6
name: Thread picker multi-add UX
expected: |
  Picker stays open after each add; thread picker flips upward when near viewport bottom; search controls remain visible after additions; results area shows ~8 rows comfortably
awaiting: debug — picker opens briefly then auto-closes on click

## Tests

### 1. Storage Location CRUD interactive flow
expected: Location appears in list immediately; rename input auto-focuses; Enter saves; delete dialog shows affected project count; after confirm, location is removed
result: pass

### 2. Stitching App UI visual parity with Storage
expected: Same inline add/rename/delete behavior as Storage; Tablet icon shows instead of MapPin; back link on detail page reads "All Apps"
result: pass

### 3. Chart form "+ Add New" inline creation for storage/app dropdowns
expected: "+ Add New" always visible when onAddNew is wired; clicking opens a dialog matching the designer pattern (name field, Cancel/Add buttons); typing a name with spaces works; entity created and selected in dropdown
result: pass

### 4. Chart form Fabric selector end-to-end
expected: Dropdown searchable; rich label format "{name} - {count}ct {type} ({brand})"; "No unassigned fabrics" + link when all assigned; saved fabric appears on chart detail page
result: pass

### 5. Cover image display correctness
expected: Full image visible without cropping; muted background fills letterbox areas; container is visibly taller than before (192px)
result: blocked
blocked_by: server
reason: "Local dev server not wired to upload files — file storage not configured"

### 6. Thread picker multi-add UX
expected: Picker stays open after each add; thread picker flips upward when near viewport bottom; search controls remain visible after additions; results area shows ~8 rows comfortably
result: issue
reported: "When I click + Add more, it tries to open for a split second and then closes."
severity: major

## Summary

total: 6
passed: 4
issues: 1
pending: 0
skipped: 0
blocked: 1

## Gaps

- truth: "Thread picker stays open when clicking + Add more"
  status: failed
  reason: "User reported: When I click + Add more, it tries to open for a split second and then closes."
  severity: major
  test: 6
  root_cause: ""
  artifacts:
    - path: "src/components/features/supplies/search-to-add.tsx"
      issue: "Picker opens then immediately auto-closes — likely click-outside handler or re-render timing issue"
    - path: "src/components/features/charts/project-supplies-tab.tsx"
      issue: "onClose={() => setAddingType(null)} unstable function reference may interact with useEffect"
  missing:
    - "Investigate click-outside mousedown handler timing vs component mount"
    - "Check if onClose prop instability causes effect re-run that catches stale event"
    - "Check if flipUp state change re-render causes containment check failure"
  debug_session: ""
