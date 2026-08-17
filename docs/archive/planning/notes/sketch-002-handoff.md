# Handoff: Fix Sketch 002 Dropdown Bug + Finalize Design

## Copy-paste prompt for next conversation

```
I'm working on a design sketch for my supply-adding UX. The sketch is a self-contained HTML file at `.planning/sketches/002-supply-add-synthesis/index.html`.

## The Bug

The autocomplete dropdown in the "add row" (first row of the table) renders BEHIND the subsequent data rows. When you type a colour code and the dropdown appears, it's hidden under the table rows below. This happens in both the "Synthesis" and "Ultra-Compact" variants (same HTML file, tab-switched).

I've already tried adding `position: relative; z-index: 30` to `tr.add-row` and bumping the `.ac-dropdown` z-index to 50, but it didn't fix it. The issue is likely that `z-index` on table rows (`<tr>`) doesn't create a proper stacking context in all browsers — tables have special rendering rules.

**Likely fix approaches:**
- Pull the autocomplete dropdown OUT of the table entirely and position it with JS relative to the input (like a portal pattern)
- Or use `position: fixed` on the dropdown and calculate coordinates from the input's `getBoundingClientRect()`
- Or restructure so the add row isn't inside the `<table>` at all — put it above the table as a separate flex/grid row that visually aligns with the table columns

Please read the HTML file, fix the dropdown stacking bug, and verify it works by testing in a browser. The file is self-contained HTML with inline CSS and JS — no build step needed, just `open .planning/sketches/002-supply-add-synthesis/index.html`.

## After the fix

Once the dropdown works, I'd like to evaluate both variants (Synthesis vs Ultra-Compact) and pick a winner. The key comparison is:
- **Synthesis**: separate Need and Have columns
- **Ultra-Compact**: merged Need/Have into one column (`2/1` format), tighter rows

## Design context

This sketch explores redesigning how I add supplies (thread colours) to a cross-stitch project. The current UX requires too many clicks — the picker covers the existing list, stitch count is a separate step, and rows are 2 lines tall. 

The synthesis direction combines:
- **Table layout** — compact single-line rows (spreadsheet feel)
- **All fields visible at once** — no progressive reveal
- **No "have" in the add flow** — you're transcribing from a pattern, not shopping
- **Auto-calculated need** — entering stitches auto-fills the need (skeins) field using the skein calculator
- **Newest items at top** — so you can see what you just added

The full design exploration history is in `.planning/sketches/MANIFEST.md` and the original UX bug triage is in `.planning/notes/ux-bug-triage-2026-05-03.md`.
```

## Files involved

- `.planning/sketches/002-supply-add-synthesis/index.html` — the sketch to fix
- `.planning/sketches/002-supply-add-synthesis/README.md` — variant descriptions
- `.planning/sketches/MANIFEST.md` — sketch tracking
- `.planning/sketches/themes/default.css` — shared theme variables
- `.planning/notes/ux-bug-triage-2026-05-03.md` — original UX problem statement
