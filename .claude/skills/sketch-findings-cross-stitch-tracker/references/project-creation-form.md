# Project Creation Form

## Design Decisions

### Winner: Synthesis — Merged Form + Supply Takeover (Sketch 003, Variant D)

**Layout:** Single continuous page (`max-width: 720px`) with no section cards or numbered steps. Field groups separated by subtle `<hr>` dividers. No Chart/Project split — one merged flow.

**Field groups (with dividers):**
1. **Identity:** Chart Name (required), Designer, Cover Image upload, Genres (chip selector)
2. **Pattern:** Width/Height/Stitch Count (3-column grid), Pattern Type cards, Onion skinning toggle
3. **Workflow:** Status (required), Storage Location, Stitching App, Digital File
4. **Timeline:** Start/Finish/FFO Dates, Notes, Want to start next toggle

**Required fields indicator:** Green dot (6px circle) before the label text. Only Chart Name and Status are required. Everything else is implicitly optional — no "optional" tags.

**Pattern type cards:** Selectable card-style toggles in a 2-column grid (Chart Only, Kit, Digital Only, Subscription). Selecting "Kit" expands to show "Colours in kit" numeric input. Cards have a radio-style check circle in the top-right.

**Supply takeover mode:** After project details are filled in, a milestone marker appears: "Project details filled in. Ready for supplies?" with an "Add supplies →" action. Clicking it:
1. Collapses the form into a sticky summary bar ("Woodland Sampler · Ink Circles · Kitting · 54,800 stitches")
2. The supply table fills the page below the summary bar
3. "← Details" link in the summary bar returns to the form

**Sticky save bar:** Fixed to bottom of page. Shows save-readiness hint on the left ("Chart name entered — ready to save at any point"), Save Draft and Create buttons on the right.

**Skein Calculator panel:** Styled card with segmented controls (not flat settings bar). Labelled inputs for Strands Over, Fabric Count, Waste %. Lives in the supply takeover area, not the form.

**Onion skinning:** Toggle lives in the Pattern section (it's a chart property, not a workflow step).

**Autocomplete:** Reuses the proven portal pattern from sketch 002 (`position: fixed` + `getBoundingClientRect()`).

## CSS Patterns

### Page layout
```css
.page-wrap { max-width: 720px; margin: 0 auto; padding: var(--space-6) var(--space-4); }
.page-title { font-family: var(--font-heading); font-size: var(--text-2xl); font-weight: 600; }
.page-subtitle { font-size: var(--text-sm); color: var(--color-text-muted); margin-bottom: var(--space-8); }
```

### Form fields
```css
.field-group { margin-bottom: var(--space-5); }
.field-row { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4); }
.field-row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: var(--space-4); }
.field-label { font-size: var(--text-sm); font-weight: 500; margin-bottom: var(--space-1); }
.field-input {
  width: 100%; border: 1px solid var(--color-border);
  border-radius: var(--radius-md); padding: 8px 12px;
  font-size: var(--text-sm); font-family: var(--font-sans);
  background: var(--color-surface); color: var(--color-text);
  transition: border-color 0.15s, box-shadow 0.15s;
}
.field-input:focus {
  outline: none; border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(5,150,105,0.15);
}
```

### Required field dot
```css
.req::before {
  content: '';
  display: inline-block;
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--color-primary);
  margin-right: 6px;
  vertical-align: middle;
  position: relative; top: -1px;
}
```

### Pattern type cards
```css
.pattern-cards { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-3); }
.pattern-card {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  cursor: pointer; transition: all 0.15s;
  background: var(--color-surface);
}
.pattern-card.selected {
  border-color: var(--color-primary);
  background: rgba(5,150,105,0.03);
  box-shadow: 0 0 0 1px var(--color-primary);
}
.pattern-card-check {
  width: 18px; height: 18px; border-radius: 50%;
  border: 2px solid var(--color-border);
}
.pattern-card.selected .pattern-card-check {
  border-color: var(--color-primary); background: var(--color-primary); color: white;
}
.pattern-card-expand {
  overflow: hidden; max-height: 0; opacity: 0;
  transition: max-height 0.25s ease, opacity 0.2s ease;
}
.pattern-card.selected .pattern-card-expand { max-height: 80px; opacity: 1; }
```

### Milestone marker
```css
.milestone-marker {
  display: flex; align-items: center; gap: var(--space-3);
  padding: var(--space-4) var(--space-6);
  border-radius: var(--radius-lg);
  background: var(--color-primary-light);
  border: 1px solid rgba(5,150,105,0.15);
}
.milestone-check {
  width: 24px; height: 24px; border-radius: 50%;
  background: var(--color-primary); color: white;
  display: flex; align-items: center; justify-content: center;
  font-size: 14px;
}
```

### Summary bar (supply takeover)
```css
.summary-bar {
  position: sticky; top: 48px; z-index: 90;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border-light);
  padding: var(--space-3) var(--space-4);
  display: flex; align-items: center; gap: var(--space-3);
}
```

### Sticky save bar
```css
.sticky-bar {
  position: fixed; bottom: 0; left: 0; right: 0;
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  padding: var(--space-3) var(--space-4);
  display: flex; align-items: center; justify-content: flex-end; gap: var(--space-3);
  z-index: 100;
}
.sticky-bar .save-hint { margin-right: auto; font-size: var(--text-xs); color: var(--color-text-subtle); }
```

### Chip selectors (genres)
```css
.chip {
  padding: 4px 12px; border-radius: var(--radius-full);
  border: 1px solid var(--color-border); font-size: var(--text-sm);
  cursor: pointer; transition: all 0.15s;
}
.chip.selected {
  background: var(--color-primary-light); border-color: var(--color-primary);
  color: var(--color-primary); font-weight: 500;
}
```

### Section dividers
```css
.section-divider {
  border: none; border-top: 1px solid var(--color-border-light);
  margin: var(--space-6) 0;
}
```

## HTML Structures

### Form page
```
page-wrap (720px max)
  back-link ("← Charts")
  page-title + page-subtitle
  form
    field-group: Chart Name (req), Designer, Cover Image upload, Genres chips
    hr.section-divider
    field-group: Width/Height/Stitch Count (3-col), Pattern Type cards, Onion skinning toggle
    hr.section-divider
    field-group: Status (req), Storage Location, Stitching App, Digital File
    hr.section-divider
    field-group: Start/Finish/FFO dates, Notes, Want to start next toggle
    milestone-marker ("Ready for supplies?")
  sticky-bar (save-hint + Save Draft + Create)
```

### Supply takeover
```
summary-bar (sticky: "← Details" + "Project Name · Designer · Status · Stitches")
supply-section
  skein-calculator-card (segmented controls)
  supply-table (from supply-data-entry.md)
sticky-bar
```

## What to Avoid

- **Section cards with numbered steps** (Variant A) — too static, no progressive depth. Feels like a wall of fields.
- **Chart/Project split** — artificial distinction between chart metadata and project metadata. One merged form is more natural.
- **"Optional" labels** — clutters every field. Green required dot on the few required fields is cleaner.
- **Sidebar navigation** (Variant C) — too heavy for a form. Good for docs, overkill for data entry.
- **Flat settings bar for calc panel** — feels disconnected. Styled card with segmented controls is more intentional.
- **Onion skinning in workflow section** — it's a chart preparation step (does the chart need layers?), not a project workflow state.

## Origin
Synthesized from sketch: 003
Source files available in: sources/003-wizard-flow/
