---
status: complete
phase: 17-image-focal-point
source: [17-01-SUMMARY.md, 17-02-SUMMARY.md, 17-03-SUMMARY.md]
started: 2026-05-17T18:00:00Z
updated: 2026-05-17T18:15:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Focal point trigger button
expected: On a project detail page with a cover image, a small crosshair icon button appears in the top-right corner of the hero banner. It's a dark semi-transparent circle (~32px) with a crosshair icon. Hovering darkens it slightly.
result: pass

### 2. Enter edit mode
expected: Clicking the crosshair trigger enters edit mode — cursor changes to crosshair over the image, and an action bar slides in at the bottom of the hero banner with Save (disabled until you click), Cancel, and Reset to Center buttons.
result: pass

### 3. Click-to-place marker
expected: Click anywhere on the hero image — a crosshair marker appears at that position with a 4:3 crop guide overlay (dimmed area outside the crop zone). Click a different spot and the marker + crop guide move to follow.
result: pass

### 4. Save focal point
expected: After placing a marker, click Save. Toast says "Focal point saved", edit mode exits. Reload the page — re-enter edit mode and the marker should appear at the previously saved position.
result: pass

### 5. Focal point affects gallery crop
expected: After saving a focal point (ideally off-center), navigate to a gallery view showing that chart. The cover thumbnail crop should visibly shift toward the focal point instead of default center crop.
result: pass

### 6. Reset to center
expected: Re-enter edit mode on the same chart, click "Reset to Center". Toast says "Focal point reset", edit mode exits. Gallery card for that chart reverts to default center crop.
result: pass

### 7. Escape key cancels
expected: Enter edit mode, click to place a point somewhere new, then press Escape. Edit mode exits WITHOUT saving — re-entering edit mode shows the original focal point (or no point if none was saved).
result: pass

## Summary

total: 7
passed: 7
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps
