---
status: diagnosed
phase: 04-supplies-fabric
source: [04-VERIFICATION.md]
started: 2026-04-12T23:05:00Z
updated: 2026-04-12T23:10:00Z
---

## Current Test

[gap closure in progress]

## Tests

### 1. Verify hydration fix on /supplies page
expected: Navigate to /supplies, toggle between grid and table view, refresh page — view persists without flicker and no Next.js hydration error appears in browser console.
result: issue — hydration error gone but view flashes from grid to list on refresh (localStorage read in useEffect causes one-frame default render)

### 2. Verify hydration fix on /fabric page
expected: Navigate to /fabric — page renders without Next.js hydration error in browser console. Tab switching (Fabrics / Brands) works correctly.
result: issue — hydration error gone but tab state (Fabrics vs Brands) does not persist on refresh

### 3. Verify inline quick-add brand in Add Fabric modal
expected: Click Add Fabric, see '+ Add Brand' link below brand dropdown, click it, type a new brand name, click Add — brand appears in dropdown and is auto-selected. Escape cancels.
result: issue — quick-add appears outside dropdown as separate link; inconsistent with designer quick-add which lives inside the SearchableSelect dropdown

### 4. Verify inline quick-add brand in Add Thread/Bead/Specialty modals
expected: Click Add Thread (or Add Bead / Add Item), see '+ Add Brand' link, click it, type a brand name, click Add — brand created with correct supplyType and auto-selected.
result: issue — same as #3, quick-add is outside dropdown instead of inside it

## Summary

total: 4
passed: 0
issues: 4
pending: 0
skipped: 0
blocked: 0

## Gaps

### Gap 1: Supplies view flash on refresh
status: failed
severity: minor
fix: Replace localStorage with URL search params (?view=table) for view persistence — available on first server render, no flash

### Gap 2: Fabric tab not persisting on refresh
status: failed
severity: minor
fix: Add URL search params (?tab=brands) for tab persistence — also makes tabs deep-linkable

### Gap 3: Brand quick-add outside dropdown (fabric modal)
status: failed
severity: minor
fix: Replace plain <select> with SearchableSelect component (matching designer pattern), wire onAddNew to InlineBrandDialog

### Gap 4: Brand quick-add outside dropdown (supply modal)
status: failed
severity: minor
fix: Same as Gap 3 — replace plain <select> with SearchableSelect, wire onAddNew
