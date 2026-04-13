---
status: partial
phase: 05-foundation-quick-wins
source: [05-VERIFICATION.md]
started: 2026-04-13T20:15:00Z
updated: 2026-04-13T20:15:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Storage Location CRUD interactive flow
expected: Location appears in list immediately; rename input auto-focuses; Enter saves; delete dialog shows affected project count; after confirm, location is removed
result: [pending]

### 2. Stitching App UI visual parity with Storage
expected: Same inline add/rename/delete behavior as Storage; Tablet icon shows instead of MapPin; back link on detail page reads "All Apps"
result: [pending]

### 3. Chart form "+ Add New" inline creation for storage/app dropdowns
expected: "+ Add New" always visible when onAddNew is wired; typing a name with spaces ("Bin A") keeps it visible; clicking creates entity via server action; dropdown immediately shows new item selected without page reload
result: [pending]

### 4. Chart form Fabric selector end-to-end
expected: Dropdown searchable; rich label format "{name} - {count}ct {type} ({brand})"; "No unassigned fabrics" + link when all assigned; saved fabric appears on chart detail page
result: [pending]

### 5. Cover image display correctness
expected: Full image visible without cropping; muted background fills letterbox areas; container is visibly taller than before (192px)
result: [pending]

### 6. Thread picker multi-add UX
expected: Picker stays open after each add; thread picker flips upward when near viewport bottom; search controls remain visible after additions; results area shows ~8 rows comfortably
result: [pending]

## Summary

total: 6
passed: 0
issues: 0
pending: 6
skipped: 0
blocked: 0

## Gaps
