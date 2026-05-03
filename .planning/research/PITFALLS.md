# Domain Pitfalls

**Domain:** Form & Supply Overhaul -- merging chart creation/edit form, supply takeover mode, unified grouped table with keyboard-first entry, dual-mode form reuse
**Researched:** 2026-05-03
**Confidence:** HIGH (codebase analysis of existing components + validated sketch findings + external research on each specific interaction pattern)

## Critical Pitfalls

Mistakes that cause rewrites or major issues.

### Pitfall 1: Form State Lost During Takeover Collapse/Restore

**What goes wrong:**
The supply takeover design collapses the entire form into a sticky summary bar, then restores it when the user clicks "Details." If the collapsed form component unmounts, all form state (field values, dirty tracking, validation errors, inline-created entities like new designers/genres) is destroyed. The user returns to a blank form.

**Why it happens:**
React destroys component state on unmount. The natural implementation of "show form OR show supply table" uses conditional rendering (`{showSupplies ? <SupplyTable /> : <ChartForm />}`), which unmounts the form. The existing `useChartForm` hook stores all state locally -- `values`, `errors`, `isDirty`, `designers`, `genres`, `storageLocationsList`, `stitchingAppsList` -- in `useState` inside the hook. Unmounting the form component destroys all of this.

**Consequences:**
- User fills out 15+ fields, switches to supplies, switches back -- everything gone
- Inline-created designers/genres still exist in the database but are no longer selected in the form
- `isDirty` resets to false, so the beforeunload warning disappears despite unsaved changes
- Possibly the single worst UX bug this feature could ship with

**Prevention:**
Lift form state above the view toggle. Two approaches (recommendation: option A):

**A. CSS visibility toggle (recommended):**
Render both form and supply table simultaneously. Use CSS `display: none` (or `hidden` attribute) on the inactive view. The form component never unmounts, so all React state survives. The sticky summary bar and supply table render on top.
```
// Both always mounted, visibility toggled
<div className={showSupplies ? "hidden" : ""}>
  <ChartForm ... />
</div>
<div className={showSupplies ? "" : "hidden"}>
  <SummaryBar onBackToDetails={() => setShowSupplies(false)} />
  <SupplyTable ... />
</div>
```
Benefits: zero refactoring of useChartForm. Focus position and scroll position also preserved. No additional state management complexity.
Tradeoff: both components exist in the DOM simultaneously, but since neither is rendering 1000+ rows, this is negligible.

**B. Lift state to parent:**
Extract form state from the component into a parent-level state holder or context. `useChartForm` values/errors/dirty would live above both views. More architecturally "clean" but requires refactoring the existing hook and threading state through props.

**Detection:**
Test: fill every field in the form, switch to supply view, switch back. All fields must retain their values, including genre chip selections, pattern type card selection, cover image preview, and inline-created entities.

**Phase to address:**
The very first phase that implements supply takeover mode. This must be the architectural decision before any UI code is written.

---

### Pitfall 2: Dual-Mode Form (Create/Edit) Initialization Bugs

**What goes wrong:**
The same form component is used for both creating new charts and editing existing ones. When navigating from edit back to create (or opening create after closing an edit modal), the form shows stale data from the previous edit because React does not re-initialize `useState` when props change -- it only uses the initial value on mount.

**Why it happens:**
The existing `useChartForm` hook uses `useMemo(() => buildInitialValues(initialData), [initialData])` to compute initial values, then `useState(initial)` for the live state. This works correctly today because:
- Create is a full page (`/charts/new`) -- always fresh mount
- Edit is a modal (`ChartEditModal`) -- opens/closes trigger mount/unmount

But the v1.3 overhaul changes the architecture:
- The new merged form replaces the separate create page AND the edit modal
- Edit mode may now be a full page (`/charts/[id]/edit`) using the same component
- If the component stays mounted between route changes (e.g., client-side navigation), `useState` will not reinitialize

Additionally, the edit modal currently resets state via unmount (dialog close destroys component). If the new design uses a persistent page instead of a modal, that free cleanup disappears.

**Consequences:**
- Editing Chart A, then navigating to edit Chart B shows Chart A's data
- Creating a new chart after editing shows the edited chart's values
- `isDirty` shows false even though form has data (because "initial" matches "current" from the previous chart)

**Prevention:**
1. Use React's `key` prop tied to the chart ID to force remount on navigation: `<ChartForm key={chartId ?? "new"} .../>`. This is the simplest and most reliable approach.
2. If key-based remount is too expensive (because it also remounts the supply table), add a `useEffect` in `useChartForm` that resets state when `initialData` changes:
   ```typescript
   useEffect(() => {
     setValues(buildInitialValues(initialData));
     setErrors({});
   }, [initialData?.id]);
   ```
3. The existing `buildInitialValues` function already handles both cases (with/without data) -- the function is correct, the issue is about when it runs.

**Detection:**
Test: edit Chart A, navigate to Chart B's edit page, verify all fields show Chart B's data. Test: edit a chart, navigate to "Add New Chart," verify form is completely empty.

**Phase to address:**
The phase that implements the merged single-page form. Must be decided during architectural planning.

---

### Pitfall 3: Portal Autocomplete Detaches From Trigger During Scroll

**What goes wrong:**
The autocomplete dropdown uses `position: fixed` with coordinates from `getBoundingClientRect()` to escape the table's stacking context. When the user scrolls the page or the table container while the dropdown is open, the dropdown stays at its original viewport position while the trigger input scrolls away. The dropdown floats in mid-air, disconnected from the field it belongs to.

**Why it happens:**
`position: fixed` positions relative to the viewport, not the document. `getBoundingClientRect()` returns viewport-relative coordinates at the moment it is called. If the page scrolls after the dropdown opens, the trigger moves but the dropdown does not. The existing `SearchToAdd` component uses `position: absolute` (relative to its parent), which does not have this problem because it scrolls with its container. The sketch-validated design specifies `position: fixed` for the new table-embedded autocomplete.

**Consequences:**
- Dropdown appears to "float" away from the input during scroll
- User cannot tell which field the dropdown belongs to
- Clicking a dropdown option might be misaligned with what is visually shown
- Particularly bad on mobile where scroll is constant

**Prevention:**
1. **Recalculate on scroll:** Add a scroll event listener (on both `window` and any scrollable ancestor) that recalculates the dropdown position using `getBoundingClientRect()` on the trigger element. Throttle with `requestAnimationFrame` to avoid jank:
   ```typescript
   useEffect(() => {
     if (!isOpen || !triggerRef.current) return;
     const update = () => {
       const rect = triggerRef.current!.getBoundingClientRect();
       setPosition({ top: rect.bottom, left: rect.left, width: rect.width });
     };
     update();
     const raf = () => requestAnimationFrame(update);
     window.addEventListener("scroll", raf, { passive: true });
     // Also listen on scrollable ancestors
     return () => window.removeEventListener("scroll", raf);
   }, [isOpen]);
   ```
2. **Close on scroll (simpler alternative):** Close the dropdown when the page scrolls more than ~10px. This is how many native `<select>` elements behave. Simpler to implement and avoids the positioning complexity entirely. Given the keyboard-first design (user types code, Enter selects), the dropdown being open during scroll is rare.
3. **Floating UI library:** Consider `@floating-ui/react` which handles scroll/resize repositioning automatically. However, adding a dependency for one use case may be overkill when option 2 (close on scroll) matches the interaction model better.

The sketch notes already specify the portal pattern using `getBoundingClientRect()`, so this is a known interaction that needs scroll handling.

**Detection:**
Test: open autocomplete in a table row near the bottom of a long supply list, scroll the page, verify dropdown follows or closes.

**Phase to address:**
The phase that implements the unified supply table with in-table autocomplete.

---

### Pitfall 4: Keyboard Trap in Dense Table With Mixed Input Types

**What goes wrong:**
The unified table has three different row schemas (thread: code + stitches + need; bead: code + bead count + need; specialty: code + need) plus the add row at the top with a segmented type toggle. Tab/Enter keyboard navigation gets confused because:
- The add row has different fields depending on the active type
- Data rows have editable cells (stitches, need, have) that toggle between display and input mode
- The autocomplete dropdown captures keyboard events (arrow keys, Enter)
- Section divider rows are non-interactive but sit between data rows

The user gets trapped: they Tab into a cell, the cell becomes editable, but pressing Tab again does not advance to the next cell because focus is inside an input within a cell that has a different DOM structure than adjacent cells.

**Why it happens:**
HTML tables have no built-in keyboard navigation for editable cells. The existing `EditableNumber` component (used in supply rows) renders a clickable span that becomes an input on interaction. When focus enters the input, the browser's tab order follows DOM order, which may skip cells if they are wrapped in different element structures. The add row has a completely different DOM structure than data rows, so Tab does not flow naturally between them.

The existing project detail supply rows use a vertical card layout (not a table), so this keyboard navigation issue does not exist yet. The new design switches to a true `<table>` layout where row-to-row and cell-to-cell keyboard flow is expected.

**Consequences:**
- User cannot Tab through cells efficiently -- defeats the "spreadsheet-feel" keyboard-first goal
- Focus jumps unpredictably between add row, section dividers, and data rows
- Arrow keys in the add row's autocomplete conflict with arrow keys for navigating between table rows
- Escape in the autocomplete (intended to close dropdown) might also reset the add row or exit edit mode

**Prevention:**
1. **Implement roving tabindex on the table:** Only one cell in the table has `tabIndex={0}` at a time. All other interactive cells have `tabIndex={-1}`. Arrow keys move the "active cell" indicator. Enter activates edit mode on the active cell.
2. **Separate keyboard contexts:** The add row and the data table are two separate keyboard zones. Tab from the add row's last field commits the row and returns focus to the add row's first field (the keyboard loop described in the sketch). Tab from a data row cell moves to the next editable cell in the same row. Arrow Up/Down moves between rows.
3. **Skip section dividers:** Section divider rows should have no focusable elements and should be skipped by arrow key navigation.
4. **Autocomplete captures conditionally:** When the dropdown is open, Arrow Up/Down navigate options. When closed, Arrow Up/Down navigate table rows. Use a state flag (`isDropdownOpen`) to switch behavior.
5. **Escape layers:** Escape in dropdown closes dropdown (returns to input). Escape in input cancels edit (returns to display mode / reverts value). Escape with no active edit does nothing.

**Detection:**
Test: starting from the add row, press Tab repeatedly. Focus should cycle through add row fields, never escape into the data rows. Test: arrow down from add row into first data row, arrow down through rows, verify section dividers are skipped. Test: open autocomplete, press arrow down to navigate options, press Escape, verify focus returns to the code input (not to a different cell).

**Phase to address:**
The phase that implements the unified supply table. This is significant interaction design work and should be allocated dedicated plan tasks for the keyboard navigation layer.

---

### Pitfall 5: Supply Table Data Contract Mismatch Between Create and Detail Contexts

**What goes wrong:**
The unified supply table must work in two contexts:
1. **Project detail page** -- supplies already saved in the database, mutations go through server actions, data refreshed via `router.refresh()`
2. **Creation form** -- supplies exist only in local state, no project ID yet (project does not exist), cannot call server actions that require `projectId`

If the table component assumes server-action-backed CRUD (like the current `SuppliesTab` does), it will not function during creation because there is no project to link supplies to.

**Why it happens:**
The existing supply management is entirely server-action-based. `SearchToAdd.handleSelect` calls `addThreadToProject({ projectId, threadId, ... })`. `SupplyRow.handleNeedSave` calls `updateProjectSupplyQuantity(id, type, { quantityRequired })`. `handleRemove` calls `removeProjectThread(id)`. All of these require a persisted project.

During chart creation, the project does not exist yet. Supplies need to be collected in local state and submitted as part of the `createChart` server action payload.

**Consequences:**
- Table renders but "Add" button errors with "Project not found" during creation
- Alternatively, if the table silently works in create mode but uses a different state model, edits made during creation behave differently from edits on the detail page (inconsistent UX)
- Supply data shapes diverge between "local state supply" and "server-fetched supply" causing type errors

**Prevention:**
Design the supply table with a **data adapter pattern**:
```typescript
interface SupplyTableAdapter {
  supplies: SupplyRowData[];
  onAdd: (item: CatalogItem, type: SupplyType) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: string, value: number) => void;
  existingIds: string[];
}
```
- **Detail page adapter:** wraps server actions (add calls `addThreadToProject`, remove calls `removeProjectThread`, refresh via router)
- **Creation form adapter:** manages local state array (add pushes to array, remove filters array, update modifies array item)
- Both adapters produce `SupplyRowData[]` -- the table component does not know which adapter is in use
- On creation form submit, local supplies array is included in the `createChart` payload and saved as part of the Prisma transaction

This also solves the "same table on project detail AND in creation flow" requirement cleanly.

**Detection:**
Test: add 5 threads to a new chart during creation, submit, verify all 5 are saved with correct stitch counts and need values. Test: open existing project detail, verify same table renders with server-fetched data and mutations persist.

**Phase to address:**
Must be the architectural foundation of the supply table -- define the adapter interface before building any table UI.

---

### Pitfall 6: Three Junction Tables Make Bulk Supply Operations Expensive

**What goes wrong:**
The schema uses three separate junction tables (`ProjectThread`, `ProjectBead`, `ProjectSpecialty`). The unified table displays all three types together and needs to support operations across all of them: loading all supplies for a project, saving all supplies during creation, deleting all supplies during a project delete. Each operation requires three separate Prisma queries.

During creation, if the user adds 30 threads, 5 beads, and 2 specialty items, the `createChart` action needs to create 37 junction table records across 3 tables within a single transaction. If any one fails (e.g., duplicate thread), the error message is ambiguous about which supply failed.

**Why it happens:**
The three-table design is a correct Prisma-idiomatic choice (documented in Key Decisions). It avoids polymorphic tables and gives type safety. But it means every "all supplies" operation is tripled.

**Consequences:**
- Loading supplies requires 3 `findMany` calls (already the case in `supplies-tab.tsx` -- line 144-156 constructs sections from three separate arrays)
- Saving 37 supplies during creation requires 3 `createMany` calls within a `$transaction`
- Error reporting is vague: "Failed to save supplies" does not tell user which specific supply had an issue
- Re-rendering the table on any single supply change requires rebuilding all three sections

**Prevention:**
1. **Load in parallel:** Use `Promise.all([getThreads(), getBeads(), getSpecialty()])` to fetch all three in a single round trip (the existing `SuppliesTab` already does this implicitly through its props)
2. **Batch create in transaction:** For creation flow, collect all supplies locally, then submit as a structured payload:
   ```typescript
   { threads: [...], beads: [...], specialty: [...] }
   ```
   The server action uses `prisma.$transaction([createManyThreads, createManyBeads, createManySpecialty])` to save atomically.
3. **Granular error messages:** If a `createMany` fails, catch per-table and report which supply type had the issue
4. **Memoize section construction:** The `useMemo` in `SuppliesTab` that transforms raw data into sections (line 145-180) should continue this pattern -- only recompute when the specific supply type changes, not on every render

**Detection:**
Test: create a chart with 30+ threads, 5 beads, and 2 specialty items. All save correctly. Test: create a chart with a duplicate thread (same project + same thread ID). Error message identifies the specific thread.

**Phase to address:**
The phase that implements the creation flow supply saving. The data loading pattern already works; the creation batch save needs new server action support.

---

## Moderate Pitfalls

### Pitfall 7: SVG Donut Status Indicators Invisible at Small Sizes

**What goes wrong:**
The sketch design specifies 16x16px SVG donut rings with 2px stroke width. At this size, the proportional fill is barely visible. The difference between "30% acquired" and "50% acquired" is a matter of 2-3 pixels of arc -- indistinguishable at a glance, especially on high-DPI displays where anti-aliasing further blurs the arc boundary.

**Prevention:**
1. Use the SVG donut for the overall visual indicator but rely on color changes as the primary signal: empty ring = border-light color, any partial = amber, fulfilled = green
2. Add a hover tooltip showing "X of Y" (already in the sketch spec: `<title>1 of 2</title>`)
3. Consider increasing to 20x20px if the table density allows it -- test with real data
4. Ensure the `stroke-dashoffset` calculation rounds to whole pixels to avoid sub-pixel rendering artifacts:
   ```typescript
   const circumference = 2 * Math.PI * 6; // 37.7
   const offset = Math.round(circumference * (1 - ratio));
   ```

**Detection:**
Visual inspection: with 10+ rows visible, can you tell at a glance which supplies are partially fulfilled vs. unfulfilled?

---

### Pitfall 8: Fabric-to-Calculator Cascade Creates Confusion

**What goes wrong:**
When the user assigns a fabric in the form, the fabric's `count` should auto-populate the skein calculator's `fabricCount` setting. But the user might have already manually adjusted `fabricCount` in the supply takeover view. If switching fabrics silently overwrites the manual adjustment, the user's carefully set calculator values change without notice. If it does NOT overwrite, the calculator settings are stale.

**Prevention:**
1. Fabric assignment updates `fabricCount` only if the user has not manually overridden it (similar to the `isNeedOverridden` pattern on threads)
2. Show a toast or inline indicator when fabric changes the calculator settings: "Fabric count updated to 28 from [Fabric Name]"
3. The supply takeover summary bar should display the active fabric info so the user can see the connection
4. When returning from supply view to form and changing fabric, the calculator settings should update live (not deferred to next save)
5. The existing `CalculatorSettings` type already has `fabricCount` as a number -- the cascade just needs to set this value when fabric selection changes

**Detection:**
Test: assign fabric with count 28, switch to supplies, verify calculator shows 28. Change calculator to 32 manually. Go back to form, change fabric to count 14. Switch to supplies -- what does the calculator show? The answer should depend on whether the user's manual override is preserved or not (document the chosen behavior).

---

### Pitfall 9: Existing Edit Modal Transition Strategy

**What goes wrong:**
The current edit experience uses `ChartEditModal` -- a dialog with tabs (Basic Info / Details). The new design replaces this with a full-page edit form (same component as create, pre-populated with data). If both exist during development, users may encounter the old modal in some contexts and the new page in others, creating an inconsistent experience.

More critically, the edit modal is opened from:
- Project detail page's kebab menu (HeroKebabMenu)
- Potentially other locations (gallery card actions)

Each of these locations will need to change from "open dialog" to "navigate to edit page." If any location is missed, the old modal surfaces.

**Prevention:**
1. Audit all locations that open `ChartEditModal` before starting implementation (current: `HeroKebabMenu`, `edit-client.tsx`)
2. Plan the migration: either replace the modal everywhere in one phase, or add a feature flag that controls which edit experience is used
3. The `/charts/[id]/edit` route already exists (edit-client.tsx wraps ChartEditModal) -- reuse this route, just change the page content from modal to full-page form
4. After migration, remove `ChartEditModal` entirely to prevent drift
5. The `useChartForm` hook (shared between create and edit) should not need changes -- it already supports both modes

**Detection:**
Test: navigate to every location that offers "Edit" functionality. Verify they all go to the new full-page form, not the old modal.

---

### Pitfall 10: Segmented Type Toggle State Persistence Across Adds

**What goes wrong:**
The design specifies the type toggle (Thread/Beads/Specialty) is "sticky" -- it stays on the current type between adds so users can blast through 30+ threads without re-selecting the type. If the toggle state resets after each add (e.g., because the add row component re-renders), the user has to click the type toggle before every single entry.

**Prevention:**
1. Store the selected type in the parent state (not inside the add row component): `const [activeType, setActiveType] = useState<SupplyType>("thread")`
2. The add row receives `activeType` as a prop -- it cannot reset independently
3. After committing an add, clear the input fields but explicitly preserve `activeType`
4. When switching type, clear the code/name search field but preserve any partial input in quantity fields
5. Test the keyboard loop: after Enter commits a row, focus should return to the code search field with the same type selected

**Detection:**
Test: set type to Bead, add 5 beads rapidly using keyboard. Verify type never resets to Thread between adds.

---

### Pitfall 11: Table Re-renders on Every Keystroke in Add Row

**What goes wrong:**
The add row has search input, stitch count input, and need input. As the user types in the search field, the autocomplete fires with debounced search. If the entire table (including all data rows and section dividers) re-renders on every keystroke, performance degrades with 100+ rows.

**Why it happens:**
If the table state is a single object containing both the add row form state and the data rows, any change to the add row triggers a re-render of the entire table. The existing `SuppliesTab` uses `useMemo` for section data, but the add row state is separate -- this pattern needs to continue.

**Prevention:**
1. **Separate state domains:** Add row form state (`searchValue`, `stitchCount`, `needOverride`, `selectedItem`) must be in a separate `useState` from the data rows
2. **Memoize data rows:** Wrap data row components in `React.memo` so they do not re-render when add row state changes
3. **Memoize section construction:** Continue the `useMemo` pattern from the existing `SuppliesTab` -- sections only recompute when `supplies` or `settings` change, not on add row keystrokes
4. **Debounce autocomplete queries:** Already validated in the sketch design; the existing `SearchToAdd` uses a 150ms debounce (line 132) -- replicate this pattern

**Detection:**
React DevTools Profiler: type a character in the add row search field. Only the add row and the autocomplete dropdown should re-render. Data rows should not.

---

### Pitfall 12: Supply Data Shape Drift Between Existing and New Components

**What goes wrong:**
The existing supply system has multiple data shapes:
- `ProjectThreadWithThread` (Prisma type with nested relations)
- `SupplyRowData` (flat type used in supply row rendering)
- `ThreadWithBrand` (used in SearchToAdd)
- Plus whatever the new table adapter uses

If the new unified table introduces yet another shape, there are now 4+ supply data types, and conversions between them are error-prone (missing fields, wrong field names).

**Prevention:**
1. **Converge on `SupplyRowData`** as the canonical display type -- it already has all fields needed for rendering
2. The adapter pattern (Pitfall 5) should produce `SupplyRowData[]` regardless of source
3. Add a `catalogItemId` field to `SupplyRowData` to track the underlying thread/bead/specialty ID (needed for duplicate detection in the add flow)
4. Keep the Prisma types (`ProjectThreadWithThread`, etc.) as the server-side contract -- adapters transform to `SupplyRowData` at the boundary
5. Delete or deprecate any intermediate types that become redundant after the refactor

**Detection:**
TypeScript strict mode catches most shape mismatches. Additionally, test that sorting, filtering, and display all work with data from both the creation adapter and the server adapter.

---

## Minor Pitfalls

### Pitfall 13: Sticky Summary Bar Z-index Conflicts

**What goes wrong:**
The summary bar during supply takeover has `position: sticky; top: 48px; z-index: 90` (per sketch). The existing top bar uses z-index values, and the autocomplete portal uses `z-index: 9000`. If the summary bar's z-index is wrong, it either covers the autocomplete dropdown or slides under the top bar during scroll.

**Prevention:**
Establish a z-index scale: top bar (50), summary bar (40 -- below top bar since it sticks below it), autocomplete portal (9000), sticky save bar (100 -- fixed bottom). Test by scrolling with the autocomplete open.

---

### Pitfall 14: Save Bar Obscures Bottom Table Rows

**What goes wrong:**
The sticky save bar is `position: fixed; bottom: 0`. The last few table rows may be hidden behind it, unreachable by scroll.

**Prevention:**
Add bottom padding to the page container equal to the save bar height plus margin (e.g., `pb-20`). This is the same pattern used by many fixed-bottom-bar layouts. Test with a table that fills the viewport.

---

### Pitfall 15: New-Row Animation Conflict With Section Auto-Sort

**What goes wrong:**
The sketch specifies a slideIn animation for newly added rows. But the design also specifies that new items auto-sort into their correct section (Thread/Beads/Specialty). If the user adds a thread, the row first appears at the top of the table (where the add row is), then immediately jumps to the Thread section. The animation plays in the wrong position.

**Prevention:**
Animate the row in its final position within the correct section, not at the add row position. The add flow should: (1) commit the item to state, (2) sections recompute with the new item sorted into its section, (3) the new item in its section renders with the slideIn animation. Use a `isNew` flag on the row data that triggers the animation class, cleared after animation completes.

---

### Pitfall 16: beforeunload Warning During Supply Server Actions

**What goes wrong:**
The existing `useChartForm` has a `suppressUnloadRef` that temporarily disables the beforeunload warning during server actions (because Next.js revalidation can trigger navigation-like events). In the new design, supply mutations happen while the form is dirty. If the supply server action triggers beforeunload, the user sees a spurious "Leave page?" warning while adding supplies.

**Prevention:**
The existing `suppressUnloadRef` pattern must be extended to cover supply mutations in the takeover view. When a supply add/remove/update server action is in progress, suppress beforeunload. The form is still dirty (and should warn on genuine navigation), but server-action-triggered revalidation should not trigger the warning.

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Merged form architecture | State lost during takeover (#1), dual-mode init bugs (#2) | CSS visibility toggle for takeover; key prop for mode switching |
| Supply table component | Keyboard traps (#4), data contract mismatch (#5), re-render performance (#11) | Adapter pattern, roving tabindex, separate state domains |
| In-table autocomplete | Portal detachment on scroll (#3) | Close-on-scroll or recalculate-on-scroll; test in scrollable context |
| Supply table on project detail | Data shape drift (#12), server action integration | Reuse adapter interface, converge on SupplyRowData type |
| Creation flow supply saving | Three junction tables (#6), batch operations | $transaction with createMany for all three tables |
| Skein calculator integration | Fabric cascade confusion (#8) | Override tracking flag, toast on auto-update |
| Edit form migration | Old modal lingering (#9) | Audit all edit entry points, migrate all in one phase |
| SVG donuts | Visibility at small size (#7) | Color as primary signal, tooltip for precision |
| Keyboard flow | Type toggle reset (#10), context switching | Parent-owned type state, conditional keyboard handler routing |
| Save/layout | Z-index conflicts (#13), save bar obscuring (#14), animation position (#15) | Established z-index scale, bottom padding, animate in final position |

## "Looks Done But Isn't" Checklist

- [ ] **Takeover state preservation:** Fill every form field, switch to supplies, switch back -- all values intact including cover image preview and genre selections
- [ ] **Dual-mode initialization:** Edit Chart A, navigate to edit Chart B -- all fields show Chart B's data, not Chart A's
- [ ] **Create after edit:** Edit a chart, navigate to "Add New Chart" -- form is completely empty
- [ ] **Keyboard loop:** In add row, press Enter to commit a supply, verify focus returns to code search with same type selected
- [ ] **Section divider skip:** Arrow down through table rows -- focus skips section divider rows
- [ ] **Autocomplete scroll:** Open autocomplete, scroll page -- dropdown either follows or closes cleanly
- [ ] **100-row performance:** Add 100 thread supplies, type in add row search -- no visible lag
- [ ] **Creation supply save:** Add 30+ supplies during creation, submit -- all save with correct quantities
- [ ] **Server-fetched supply edit:** On project detail, edit a supply's stitch count -- persists to database, calculator updates
- [ ] **Fabric cascade:** Assign fabric with count 28 in form, switch to supplies -- calculator shows 28
- [ ] **SVG donut readability:** With 10+ rows, glance test -- can you distinguish unfulfilled vs. partial at a glance?
- [ ] **Save bar clearance:** Scroll to bottom of table -- last row fully visible above save bar
- [ ] **No old edit modal:** Every "Edit" entry point leads to new full-page form
- [ ] **beforeunload:** During supply adds in takeover, no spurious "Leave page?" warnings

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Form state lost in takeover (#1) | HIGH | Refactor to CSS visibility toggle; requires changing view switching logic and testing all form field preservation |
| Dual-mode init bugs (#2) | LOW | Add `key={chartId ?? "new"}` to form component; one-line fix |
| Portal detachment (#3) | LOW | Add close-on-scroll behavior; small event listener addition |
| Keyboard traps (#4) | HIGH | Requires implementing roving tabindex across the entire table; cannot be patched incrementally |
| Data contract mismatch (#5) | HIGH | Requires introducing adapter pattern retroactively if table was built with direct server action calls |
| Junction table batch save (#6) | MEDIUM | Add $transaction batch save to creation action; may need payload restructuring |
| SVG donut visibility (#7) | LOW | Increase size or add color coding; CSS-only change |
| Fabric cascade (#8) | LOW | Add override tracking; small state addition |
| Old modal lingering (#9) | LOW | Grep for ChartEditModal, replace all usages |
| Type toggle reset (#10) | LOW | Lift state to parent; small refactor |
| Table re-renders (#11) | MEDIUM | Add React.memo wrappers and separate state; may need component restructuring |

## Sources

- Codebase analysis: `src/components/features/charts/use-chart-form.ts` -- existing form state management, dual-mode support, inline entity creation, dirty tracking, beforeunload suppression
- Codebase analysis: `src/components/features/charts/chart-add-form.tsx` -- current create form using useChartForm hook with 8 section components
- Codebase analysis: `src/components/features/charts/chart-edit-modal.tsx` -- current edit modal with tab layout, discard confirmation, same useChartForm hook
- Codebase analysis: `src/components/features/supplies/search-to-add.tsx` -- existing autocomplete with position: absolute, viewport flip detection, 150ms debounce, keyboard navigation, click-outside handling
- Codebase analysis: `src/components/features/charts/project-detail/supplies-tab.tsx` -- existing supply management with server actions, router.refresh(), calculator settings, sort, three-section rendering
- Codebase analysis: `src/components/features/charts/project-detail/supply-row.tsx` -- existing supply row with EditableNumber, optimistic updates, isNeedOverridden tracking
- Codebase analysis: `prisma/schema.prisma` -- three junction tables (ProjectThread, ProjectBead, ProjectSpecialty) with unique constraints
- Sketch findings: `.claude/skills/sketch-findings-cross-stitch-tracker/references/supply-data-entry.md` -- table layout, autocomplete portal pattern, keyboard flow, SVG donut specs
- Sketch findings: `.claude/skills/sketch-findings-cross-stitch-tracker/references/project-creation-form.md` -- merged form, supply takeover, sticky summary bar, save bar
- [React: Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state) -- official docs on when React preserves vs. destroys state
- [Smashing Magazine: Dropdowns Inside Scrollable Containers](https://www.smashingmagazine.com/2026/03/dropdowns-scrollable-containers-why-break-how-fix/) -- portal positioning in scroll contexts
- [FreeCodeCamp: Keyboard Accessibility for Complex React Experiences](https://www.freecodecamp.org/news/designing-keyboard-accessibility-for-complex-react-experiences/) -- roving tabindex, focus management patterns
- [Material React Table: Accessibility / Keyboard Navigation](https://www.material-react-table.com/docs/guides/accessibility) -- table keyboard shortcuts and cell focus patterns
- [DEV Community: Portal Dropdown for Tables](https://dev.to/parth24072001/dropdown-open-in-portal-for-using-table-in-react-2odd) -- portal pattern for table-embedded dropdowns
- [Medium: 3 Race Conditions in Next.js Server Actions](https://medium.com/@mehran.khanjan/3-race-conditions-hiding-in-your-next-js-server-actions-i-shipped-all-3-07a8daf7f515) -- stale data, concurrent mutations, premature redirect

---
*Pitfalls research for: v1.3 Form & Supply Overhaul milestone -- merged form, supply takeover, unified grouped table, keyboard-first entry, dual-mode forms*
*Researched: 2026-05-03*
