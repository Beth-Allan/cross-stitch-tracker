# Supply Data Entry

## Design Decisions

### Winner: Synthesis — Table + Auto-Calc (Sketch 002, Variant 1)

**Layout:** Fixed-width table (`table-layout: fixed`) with single-line compact rows. Columns: Colour (44%), Stitches (14%), arrow (24px), Need (13%), Have (10%), Status (6%), Delete (32px). The table lives inside a `.section-card` with rounded corners and a section header showing item count and total stitches.

**Add row:** First row of the `<tbody>`, visually distinguished with a faint green tint (`rgba(5, 150, 105, 0.03)`) and a 2px primary-coloured bottom border. All input fields visible at once — no progressive reveal.

**Auto-calculated need:** When stitches are entered, the Need field auto-fills using the skein calculator formula. A sparkle badge (`✨`) appears to indicate auto-calculation. If the user manually edits Need, the badge disappears. When no stitches are entered, Need defaults to 1.

**Keyboard flow:**
- Type colour code → autocomplete dropdown → Enter/click to select
- Stitches field focuses automatically → Enter to add (fast path) or Tab to override Need
- Need field → Enter to add row
- Escape at any point resets the add row
- New items prepend to top (newest first)

**Autocomplete dropdown:** Uses `position: fixed` with JS-calculated coordinates from `getBoundingClientRect()` — a portal pattern that escapes the table's stacking context. Width is `max(320px, input width)`. Already-added colours show as disabled with "Added" label.

**Status indicators:** SVG donut rings (16x16) where fill is proportional to have/need ratio. Empty ring = 0 have, partial amber ring = partial, full green ring = fulfilled. Hover tooltip shows "X of Y".

**Delete buttons:** Hidden by default, revealed on row hover. Danger-red on hover.

**Editable cells:** Data rows have clickable cells with a subtle green hover highlight, signalling inline editability.

**Footer:** Progress summary ("N colours added" / "Total: N skeins needed") plus keyboard hint bar.

### Rejected: Ultra-Compact (Sketch 002, Variant 2)

Merged Need/Have into one column (`2/1` format), smaller swatches, tighter padding. Rejected because the density gain wasn't worth the readability trade-off — separate columns are clearer at a glance.

### Rejected: Continuous Flow Pipeline (Sketch 001, Variant B)

Progressive reveal with step indicators. Felt too guided/slow for bulk transcription. The "always see all fields" approach won.

### Rejected: Sticky Add Row alone (Sketch 001, Variant A)

Had the right idea (permanent add row, all fields visible) but lacked the table density and auto-calc of the synthesis.

## CSS Patterns

### Table structure
```css
.supply-table { width: 100%; border-collapse: collapse; font-size: var(--text-sm); table-layout: fixed; }
.supply-table thead th {
  text-align: left; padding: var(--space-2) var(--space-3);
  font-size: 11px; font-weight: 600; color: var(--color-text-muted);
  text-transform: uppercase; letter-spacing: 0.04em;
  border-bottom: 2px solid var(--color-border);
  white-space: nowrap; background: var(--color-surface);
}
.supply-table tbody td {
  padding: 5px var(--space-3);
  border-bottom: 1px solid var(--color-border-light);
  font-variant-numeric: tabular-nums; vertical-align: middle; overflow: hidden;
}
```

### Add row styling
```css
.supply-table tbody tr.add-row td {
  background: rgba(5, 150, 105, 0.03);
  border-bottom: 2px solid var(--color-primary-light);
  padding-top: 6px; padding-bottom: 6px;
}
```

### Table input fields
```css
.tbl-input {
  width: 100%; border: 1px solid var(--color-border); border-radius: 4px;
  padding: 4px 8px; font-size: var(--text-sm); font-family: var(--font-sans);
  background: var(--color-surface); color: var(--color-text); transition: border-color 0.15s;
}
.tbl-input:focus { outline: none; border-color: var(--color-primary); box-shadow: 0 0 0 2px rgba(5,150,105,0.15); }
.tbl-input:disabled { background: var(--color-bg); color: var(--color-text-subtle); cursor: not-allowed; }
```

### Autocomplete dropdown (portal pattern)
```css
.ac-dropdown {
  position: fixed; width: 320px;
  background: var(--color-surface); border: 1px solid var(--color-border);
  border-radius: 8px; box-shadow: var(--shadow-lg);
  max-height: 240px; overflow-y: auto; z-index: 9000;
}
```

### Colour cell layout
```css
.cell-colour { display: flex; align-items: center; gap: var(--space-2); min-width: 0; }
.tc-code { font-weight: 600; font-family: var(--font-mono); font-size: 12px; white-space: nowrap; }
.tc-name { color: var(--color-text-muted); font-size: var(--text-xs); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
```

### Row hover reveal (delete button)
```css
.del-btn { opacity: 0; transition: all 0.15s; }
tr:hover .del-btn { opacity: 1; }
.del-btn:hover { color: var(--color-danger); background: rgba(220,38,38,0.08); }
```

### New-row animation
```css
@keyframes slideIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
.data-row { animation: slideIn 0.2s ease; }
```

## HTML Structures

### Table with add row
```
section-card
  section-header (icon + title + count badge + total stitches)
  table.supply-table
    thead: Colour | Stitches | (arrow) | Need | Have | Status | (delete)
    tbody:
      tr.add-row (first row — inputs for code, stitches, need)
      tr.data-row (for each supply — colour swatch+code+name, stitches, arrow, need+unit, have, status donut, delete)
  progress-footer (count + total skeins)
  keyboard-hints (↑↓ navigate, Enter select/add, Tab next, Esc clear)
```

### Colour swatch
```html
<div class="colour-swatch" style="background:#C72D34; width:16px; height:16px; border-radius:2px"></div>
<!-- Add class "light" for near-white colours to get inset border -->
```

### SVG status donut
```html
<svg width="16" height="16" viewBox="0 0 16 16">
  <title>1 of 2</title>
  <circle cx="8" cy="8" r="6" fill="none" stroke="var(--color-border-light)" stroke-width="2"/>
  <circle cx="8" cy="8" r="6" fill="none" stroke="var(--color-warning)" stroke-width="2"
    stroke-dasharray="37.7" stroke-dashoffset="18.9" transform="rotate(-90 8 8)" stroke-linecap="round"/>
</svg>
<!-- ratio = have/need, circumference = 2*PI*6 = 37.7, dashoffset = circ * (1 - ratio) -->
```

## Multi-Supply Types (Sketch 004)

### Winner: C — Grouped Sections + Sticky Top Add Row

Three supply types (thread, beads, specialty) share one unified table surface. Items are visually grouped by type with section dividers. One persistent add row at the top adapts its fields based on a segmented type toggle.

**Section structure:** Thread, Beads, Specialty sections with divider headers showing icon + label + count badge. New items auto-sort into their correct section.

**Segmented type toggle:** Three-button control (🧵/📿/✦) in the add row's first cell. The toggle is **sticky** — stays on the current type between adds. User blasts through all threads, then clicks 📿 once and does beads.

**Column adaptation per type:**
| Type | Column 1 | Column 2 | Arrow | Column 3 | Column 4 | Column 5 | Column 6 |
|------|----------|----------|-------|----------|----------|----------|----------|
| Thread | Search (code/name) | Stitches | → | Need (auto-calc, sk) | Have | Status donut | Delete |
| Bead | Search (code/name) | Bead count | → | Need (manual, pkg, default 1) | Have | Status donut | Delete |
| Specialty | Search (code/name) | — | — | Need (manual, item, default 1) | Have | Status donut | Delete |

**Live auto-calc for threads:** As user types stitch count, Need auto-fills (stitches ÷ 3000, rounded up). Displayed in primary colour to indicate auto-calc. User can manually override (value sticks; `isNeedOverridden` flag in schema).

**Bead/specialty need defaults:** Need defaults to 1 package (beads) or 1 item (specialty). Editable. Future: bead auto-calc from package size.

**Same keyboard loop across all types:** search → Enter (autocomplete select) → qty field → Enter (commit row) → search refocuses. Type toggle stays sticky.

### Section Divider CSS
```css
.section-divider td {
  background: var(--color-bg);
  padding: var(--space-3) var(--space-3) var(--space-2);
  border-bottom: 2px solid var(--color-border);
}
.section-divider-content {
  display: flex; align-items: center; gap: var(--space-2);
  font-size: 11px; font-weight: 600; text-transform: uppercase;
  letter-spacing: 0.05em; color: var(--color-text-muted);
}
.section-count {
  font-size: 10px; font-weight: 600;
  background: var(--color-border-light); color: var(--color-text-muted);
  padding: 1px 7px; border-radius: var(--radius-full);
}
```

### Segmented Type Toggle CSS
```css
.type-selector {
  display: inline-flex; border: 1px solid var(--color-border); border-radius: var(--radius-md);
  overflow: hidden;
}
.type-option {
  padding: 4px 10px; cursor: pointer; border: none;
  background: var(--color-surface); color: var(--color-text-muted);
  font-family: var(--font-sans); font-size: 11px; font-weight: 600;
  transition: all 0.15s; border-right: 1px solid var(--color-border);
}
.type-option:last-child { border-right: none; }
.type-option:hover { background: var(--color-surface-hover); }
.type-option.active { background: var(--color-primary); color: var(--color-primary-text); }
```

### Section Divider HTML
```
table.supply-table
  tbody:
    tr.add-row (top — segmented toggle + search + qty/need fields)
    tr.section-divider (icon + "Thread" + count badge)
    tr.data-row (thread items...)
    tr.section-divider (icon + "Beads" + count badge)
    tr.data-row (bead items...)
    tr.section-divider (icon + "Specialty" + count badge)
    tr.data-row (specialty items...)
```

## What to Avoid

- **Progressive reveal / step indicators** — felt too guided for bulk data entry. Users transcribing from a pattern want all fields visible immediately.
- **Merged Need/Have column** — `2/1` format saves space but hurts scannability. Keep separate columns.
- **Unicode status symbols** (✓/◔/○) — can't show proportional fill. Use SVG donuts.
- **`position: absolute` on autocomplete inside tables** — z-index on `<tr>` doesn't create stacking contexts. Must use `position: fixed` with JS positioning (portal pattern).
- **"Have" field in the add flow** — when transcribing from a pattern, you don't know what you have yet. That's a separate (shopping) workflow.
- **Obscuring the existing list with a picker/modal** — the user needs to see what they've already added to avoid duplicates.
- **Per-section add buttons** (Variant A) — having to click "+ Add" on each section header breaks the keyboard flow. One persistent add row with a type toggle is faster.
- **Flat mixed list with type badges** (Variant B) — no visual grouping makes scanning by type impossible. Type badges on every row add noise.
- **Tabs for supply types** — forces switching views. All types should be visible in one scrolling surface.
- **Disabled Need field** — even for auto-calc types, the Need field should be editable for manual override.

## Origin
Synthesized from sketches: 001, 002, 004
Source files available in: sources/001-supply-add-interaction/, sources/002-supply-add-synthesis/, sources/004-multi-supply-types/
