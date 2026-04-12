---
status: diagnosed
phase: 05-foundation-quick-wins
source: [05-VERIFICATION.md]
started: 2026-04-11T23:59:00Z
updated: 2026-04-12T00:00:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Storage Location CRUD Flow
expected: Location appears in list after create; rename input auto-focuses; Enter saves; delete dialog shows project count; after confirm, location disappears
result: issue
reported: "Four Next.js errors on /storage page refresh: (1) Prisma invalid invocation — Unknown field `storageLocation` for include on model `Project` in getCharts(). (2-4) Three TypeError: Cannot read properties of undefined (reading 'findMany') in different locations on /storage page."
severity: blocker

### 2. Stitching App UI Parity
expected: Visual and interactive parity with storage pages — same inline add/rename/delete but with Stitching Apps heading, Tablet icon, and All Apps back link
result: issue
reported: "Same Prisma errors on /apps page as /storage. Page looks correct visually but can't add an app — functionality broken."
severity: blocker

### 3. Chart Form Fabric Selector
expected: Dropdown searchable; rich label format ({name} - {count}ct {type} ({brand})); empty state shows link to /fabric; saved fabric appears on chart detail
result: issue
reported: "Three Next.js errors on /charts page. No 'Add Storage Location' or 'Add Stitching App' options in chart form dropdowns (edit or add). Fabric dropdown interaction triggers 5 Next.js errors — can't test fabric selector functionality."
severity: blocker

### 4. Cover Image Display
expected: Full image visible without cropping; muted background fills letterbox areas; container is 192px tall
result: blocked
blocked_by: prior-phase
reason: "Can't add a new chart due to Prisma errors on /charts page, and no existing chart with cover image in local dev DB to test against."

### 5. Thread Picker Multi-Add with Scroll
expected: Picker stays open after each add; search input scrolls into view after each addition
result: blocked
blocked_by: prior-phase
reason: "Can't add a new project due to Prisma errors — no way to reach the thread picker."

## Summary

total: 5
passed: 0
issues: 3
pending: 0
skipped: 0
blocked: 2

## Gaps

- truth: "Storage location CRUD works — create, rename, delete all function; /storage page loads without errors"
  status: failed
  reason: "User reported: Four Next.js errors on /storage page refresh: (1) Prisma invalid invocation — Unknown field `storageLocation` for include on model `Project` in getCharts(). (2-4) Three TypeError: Cannot read properties of undefined (reading 'findMany') in different locations on /storage page."
  severity: blocker
  test: 1
  root_cause: "Prisma client is stale — schema has storageLocation/stitchingApp on Project (lines 79-82) but generated client doesn't recognize them. Likely prisma generate not run after schema migration. Also getStorageLocationDetail() in storage-location-actions.ts has potentially malformed nested select (lines 100-109). Cascading findMany errors from failed getCharts() call that pages share."
  artifacts:
    - path: "src/lib/actions/chart-actions.ts"
      issue: "getCharts() line 292 includes storageLocation on Project — fails with stale client"
    - path: "src/lib/actions/storage-location-actions.ts"
      issue: "getStorageLocationDetail() lines 100-109 nested select may reference invalid fields"
  missing:
    - "Run prisma generate to sync client with schema"
    - "Verify all Prisma includes/selects match actual generated types"
  debug_session: ""

- truth: "Stitching apps page has full CRUD parity with storage locations — add, rename, delete all work"
  status: failed
  reason: "User reported: Same Prisma errors on /apps page as /storage. Page looks correct visually but can't add an app — functionality broken."
  severity: blocker
  test: 2
  root_cause: "Same stale Prisma client issue as test 1. getStitchingAppDetail() in stitching-app-actions.ts has identical nested select structure (lines 100-109)."
  artifacts:
    - path: "src/lib/actions/stitching-app-actions.ts"
      issue: "getStitchingAppDetail() lines 100-109 mirrors storage-location-actions issue"
  missing:
    - "Run prisma generate"
    - "Fix nested select in getStitchingAppDetail()"
  debug_session: ""

- truth: "Chart form fabric selector is searchable, shows rich labels, has empty state link, and saves correctly"
  status: failed
  reason: "User reported: Three Next.js errors on /charts page. No 'Add Storage Location' or 'Add Stitching App' in chart form dropdowns. Fabric dropdown interaction triggers 5 Next.js errors — can't test."
  severity: blocker
  test: 3
  root_cause: "Two issues: (1) Same stale Prisma client causes getCharts() to fail on /charts page. (2) project-setup-section.tsx SearchableSelect for Storage Location and Stitching App has no onAddNew handler — so no inline 'Add New' option appears in dropdowns. Fabric dropdown errors cascade from the Prisma failures."
  artifacts:
    - path: "src/components/features/charts/sections/project-setup-section.tsx"
      issue: "SearchableSelect for storage/app dropdowns missing onAddNew handler"
    - path: "src/lib/actions/chart-actions.ts"
      issue: "getCharts() line 289 fails with stale Prisma client"
  missing:
    - "Add onAddNew handlers to storage location and stitching app SearchableSelect components"
    - "Run prisma generate to fix cascading errors"
  debug_session: ""
