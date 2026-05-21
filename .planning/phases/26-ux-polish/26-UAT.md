---
status: partial
phase: 26-ux-polish
source: 26-01-SUMMARY.md, 26-02-SUMMARY.md, 26-03-SUMMARY.md
started: 2026-05-20T04:30:00Z
updated: 2026-05-20T04:35:00Z
---

## Current Test

[testing complete — 3 items blocked by R2]

## Tests

### 1. Keyboard-gated autocomplete highlight
expected: On the supply table add row, type a search term. Results appear but NO item is visually highlighted. Press arrow-down — first result highlights with bg-muted. aria-activedescendant only appears after arrow key use.
result: pass

### 2. EditableNumber rejection flash
expected: In a supply table row, type an invalid value (e.g. letters or negative number) in a quantity field and press Enter/blur. The input briefly flashes with a red border, shake animation, and light red background tint for ~600ms, then returns to normal.
result: pass

### 3. Visible commit button in add row
expected: On the supply table add row, select a supply from autocomplete. A checkmark (Check icon) button appears in the row. Clicking it commits the row, same as pressing Enter.
result: pass

### 4. Contextual InlineCreateDialog labels
expected: In the supply table, trigger "Create new" for different supply types. Thread shows "Create Thread" with "Color Name"/"Color Code" fields. Bead shows "Create Bead" with "Bead Name"/"Product Code". Specialty shows "Create Specialty Item" with "Product Name"/"Product Code".
result: pass

### 5. GalleryCard image click-through
expected: On the Browse tab, clicking a gallery card's cover image navigates to the project detail page (same as clicking the card title). The image link is not an extra tab stop when using keyboard navigation.
result: pass

### 6. Shopping-for bar pill styling
expected: On the Shopping page, project name pills in the "Shopping for" bar use squared-off styling (rounded-lg with border) instead of full-round pills.
result: pass

### 7. Thread insight rank numbers
expected: On the Stats page, the Thread Insights list shows visible rank numbers (1, 2, 3...) next to each thread entry, matching the visual pattern used in Designer Insights.
result: pass

### 8. What's Next gallery cards
expected: On the What's Next tab, projects display as vertical gallery cards in a responsive grid (1 col mobile, 2 cols medium, 3 cols large) instead of horizontal rows. Cards show cover image with aspect-[4/3] ratio.
result: pass

### 9. Three-state kitting labels
expected: On What's Next cards: projects at 0% kitting show "Not kitted", 1-99% show "Kitting", and 100% show "Fully kitted".
result: pass

### 10. Focal point editor action bar position
expected: On a project detail page with a cover image, enter focal point edit mode. The action bar (Save/Cancel buttons) appears below the image in normal document flow, NOT overlapping the bottom of the image. The full image is clickable for focal point placement.
result: blocked
blocked_by: third-party
reason: "R2 is not set up on the dev server"

### 11. Cover image preview aspect ratio
expected: When uploading a cover image on the chart form, the preview maintains the image's natural aspect ratio (up to a max height) instead of using a fixed square/rectangle crop.
result: blocked
blocked_by: third-party
reason: "R2 is not set up on the dev server"

### 12. BucketProject focal point styling
expected: On the Progress dashboard, bucket project cards (Currently Stitching, etc.) respect the project's focal point setting — the cover image is positioned using the saved focal point coordinates instead of default center crop.
result: blocked
blocked_by: third-party
reason: "R2 is not set up on the dev server"

### 13. Supplies page view mode persistence
expected: On the Supplies page, switch between card/table view. Refresh the page — the view mode persists without a brief flash of the wrong mode on first load.
result: pass

### 14. Fabric matching with unassigned fabric
expected: On the Pattern Dive Fabric Requirements tab, projects without assigned fabric (null fabricCount) show ALL fabric candidates with fit indicators, instead of showing zero matches.
result: pass

## Summary

total: 14
passed: 11
issues: 0
pending: 0
skipped: 0
blocked: 3

## Gaps

[none — blocked items are R2 infrastructure prerequisites, not code issues]
