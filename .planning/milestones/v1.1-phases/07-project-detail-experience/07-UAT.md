---
status: diagnosed
phase: 07-project-detail-experience
source: 07-01-SUMMARY.md, 07-02-SUMMARY.md, 07-03-SUMMARY.md, 07-04-SUMMARY.md, 07-05-SUMMARY.md, 07-06-SUMMARY.md
started: 2026-04-16T00:45:00Z
updated: 2026-04-16T01:15:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Project Detail Page Layout
expected: Navigate to /charts/[id] for an existing chart. Page shows hero section at top (chart name, designer, stitch count with exact/estimated indicator, dimensions, status badge), two tabs (Overview, Supplies), Overview tab active by default with section cards.
result: pass
notes: Designer name not linked in hero (only in Pattern Details) — test expectation was wrong, not a bug. User also noted celebration ring (violet border) on hero feels redundant vs gallery cards — design feedback for /gsd-explore session.

### 2. Hero Cover Image
expected: For a chart WITH a cover image: blurred background fill behind the image, sharp image centered with object-contain. For a chart WITHOUT a cover image: no banner area shown (graceful absence, not a broken image placeholder).
result: blocked
blocked_by: third-party
reason: "R2 Cloudflare storage not connected in dev environment — no cover images available to test"

### 3. Change Project Status
expected: Click the status badge on the hero. A dropdown appears with all status options. Select a different status. Badge updates immediately (optimistic). Overview sections reorder to match the new status context (e.g. switching to IN_PROGRESS shows Progress section prominently).
result: issue
reported: "The only not quite right piece is that the Finished status doesn't have the project setup card. It probably should."
severity: minor

### 4. Delete Chart from Detail Page
expected: Click the three-dot kebab menu (top-right of hero). Click "Delete". Confirmation dialog appears. Confirm deletion. Redirected back to gallery/charts page. Chart is gone.
result: pass

### 5. Tab Navigation with URL State
expected: Click "Supplies" tab. URL updates to include ?tab=supplies. Content switches to supplies view. Click "Overview" tab. URL updates to ?tab=overview. Refresh the page with ?tab=supplies in URL -- Supplies tab is active on load.
result: pass

### 6. Overview Tab Content
expected: Overview tab shows relevant sections based on project status. For an IN_PROGRESS project: Progress section (progress bar, completed/remaining stitches), Pattern Details (stitch count, dimensions, designer, genres), Dates (date added, start date), Project Setup (fabric, storage location, stitching app). Sections display in a two-column grid on desktop.
result: pass
notes: Start date only shows Date Added because no start date has been set — correct behavior. User requested backlog item for auto-setting start date when status changes to IN_PROGRESS.

### 7. Supplies Tab with Calculator
expected: Click Supplies tab. See supply sections (Threads, Beads, Specialty Items). Each supply row shows color swatch, code, name, stitches -> skeins calculation, Need, Have, fulfillment status icon. If any thread has stitch counts entered, the Calculator Settings Bar appears at top.
result: issue
reported: "It matches, but we need to work on the design of it (it doesn't match the overview page even a little bit) AND the skein calculation is very wrong."
severity: major

### 8. Edit Supply Quantities Inline
expected: On a supply row, click a number (stitch count, need, or have). Field becomes editable. Type a new value and press Enter. Value saves (optimistic update). Press Escape to cancel without saving.
result: pass

### 9. Calculator Settings Adjust Skeins
expected: In the Calculator Settings Bar, change the Strands value (e.g. from 2 to 1). The "Skeins" column on all thread rows recalculates immediately. Change Waste % and see skeins adjust again. Changes persist (server action saves to project settings).
result: pass

### 10. Add Existing Supply to Project
expected: In a supply section, click "+ Add threads" (or beads/specialty). SearchToAdd panel opens ABOVE the button (not overlaying existing rows). Type to search catalog. Select an item. It appears in the supply list. Panel stays open for multi-add.
result: issue
reported: "There's a + + Add threads (duplicate plus icon). Add beads and add specialty items is centre aligned while add threads is left aligned. The search threads by code or name box is effed up — it doesn't show the colour dropdown and it looks like it's overflowing the thread card."
severity: major

### 11. Create New Supply Inline
expected: In SearchToAdd, type a name that doesn't exist in the catalog. A "+ Create [name]" button appears. Click it. Dialog opens with name pre-filled. Submit. New item is created in catalog AND added to the project. Dialog closes.
result: blocked
blocked_by: other
reason: "Can't test because SearchToAdd dropdown is buried under the card due to overflow issue from test 10"

### 12. Remove Supply from Project
expected: On a supply row, click the trash icon. Supply is removed from the project immediately (optimistic). The row disappears. Section counts update. Footer totals update.
result: pass

## Summary

total: 12
passed: 7
issues: 3
pending: 0
skipped: 0
blocked: 2

## Gaps

- truth: "FINISHED status should show Project Setup section in Overview tab"
  status: failed
  reason: "User reported: The only not quite right piece is that the Finished status doesn't have the project setup card. It probably should."
  severity: minor
  test: 3
  root_cause: "SECTION_ORDER in types.ts line 110 excludes 'projectSetup' for FINISHED and FFO statuses"
  artifacts:
    - path: "src/components/features/charts/project-detail/types.ts"
      issue: "SECTION_ORDER.FINISHED missing 'projectSetup', same for FFO"
  missing:
    - "Add 'projectSetup' to SECTION_ORDER arrays for FINISHED and FFO statuses"
  debug_session: ""

- truth: "Supplies tab design should be consistent with overview page, and skein calculation should be correct"
  status: failed
  reason: "User reported: It matches, but we need to work on the design of it (it doesn't match the overview page even a little bit) AND the skein calculation is very wrong."
  severity: major
  test: 7
  root_cause: "Skein formula uses INCHES_PER_STITCH_UNIT=6 as raw multiplier instead of 6/fabricCount. Produces 9 skeins for 1000 stitches (should be ~2). Formula is ~4x too high. Design inconsistency is a separate visual concern."
  artifacts:
    - path: "src/lib/utils/skein-calculator.ts"
      issue: "threadPerStitch formula: (strandCount * 6) / effectiveCount overestimates by ~4x"
  missing:
    - "Correct the skein formula to match community-standard calculation (1000 stitches @ 2 strands over 2 on 14ct ≈ 1-2 skeins)"
    - "Design pass on supplies tab to match overview page visual consistency"
  debug_session: ""

- truth: "Add supply buttons should show single + prefix, consistent alignment, and SearchToAdd panel should display correctly without overflow"
  status: failed
  reason: "User reported: duplicate + + Add threads, alignment inconsistency between add buttons, search box overflows the card and colour dropdown is missing"
  severity: major
  test: 10
  root_cause: "4 issues: (1) supply-section.tsx lines 88,108 render Plus icon AND hardcoded '+' in text. (2) Non-empty sections use 'relative mt-3' (left-aligned) while empty sections use 'relative flex justify-center'. (3) supply-section.tsx line 37 has overflow-hidden which clips the absolutely-positioned SearchToAdd panel. (4) SearchToAdd component lacks colorFamily filter prop/UI."
  artifacts:
    - path: "src/components/features/charts/project-detail/supply-section.tsx"
      issue: "Duplicate + (lines 88,108), alignment inconsistency (lines 78,98), overflow-hidden (line 37)"
    - path: "src/components/features/supplies/search-to-add.tsx"
      issue: "No colorFamily filter prop or dropdown UI"
  missing:
    - "Remove hardcoded '+' from button text (lines 88, 108)"
    - "Consistent alignment on add button containers (lines 78, 98)"
    - "Change overflow-hidden to overflow-visible on line 37"
    - "Add colorFamily filter dropdown to SearchToAdd for thread type"
  debug_session: ""
