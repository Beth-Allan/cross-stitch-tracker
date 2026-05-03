# Phase 10: Unified Supply Table - Research

**Researched:** 2026-05-03
**Domain:** React component architecture, keyboard-driven data entry, portal positioning, SVG rendering
**Confidence:** HIGH

## Summary

Phase 10 builds a standalone, data-source-agnostic supply table component for cross-stitch project supply management. The component is entirely client-side (keyboard handlers, state management, portal positioning) with persistence abstracted behind a `SupplyTableAdapter` interface. This phase builds the component and a local-state adapter for testing -- Phase 11 wires it to server actions.

The codebase already contains all the building blocks: `calculateSkeins()` for thread auto-calc, `ColorSwatch` for colour display, `EditableNumber` patterns for inline editing, full test factories for every supply type, and the three-junction-table Prisma schema with `isNeedOverridden` tracking. The existing `SearchToAdd` component demonstrates the autocomplete pattern but uses `position: absolute` -- the new `PortalAutocomplete` must use `position: fixed` with `getBoundingClientRect()` to escape table stacking contexts.

**Primary recommendation:** Build the new `supply-table/` directory within `src/components/features/`, importing existing primitives directly. Extract `EditableNumber` into a shared location during this phase. Use Vitest + RTL for comprehensive component testing with mock adapters. Zero new npm dependencies.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Portal autocomplete with `position: fixed` + `getBoundingClientRect()` for coordinates -- escapes table stacking context
- **D-02:** Include inline create ("+ Create X") that appears only when zero results match and search text exists -- handles non-seeded supplies (Weeks Dye Works, Mill Hill, etc.) without navigating away
- **D-03:** After inline create dialog completes, auto-add the newly created supply and refocus the search input -- keeps transcription flow unbroken
- **D-04:** No color family filter -- this is a transcription tool, not a browsing tool. The user always has the code from the pattern. Color browsing belongs in a future supply exploration surface
- **D-05:** Already-added items shown as disabled with "Added" label in the autocomplete dropdown
- **D-06:** Component accepts optional `calcParams` prop (Partial<CalcParams>) with sensible defaults: fabricCount=14, strandCount=2, overCount=1, wastePercent=20
- **D-07:** Use the real `calculateSkeins()` function from `src/lib/utils/skein-calculator.ts` -- do NOT implement the sketch's "divide by 3000" shorthand as a separate code path
- **D-08:** Phase 11 will pass `fabricCount` from the project's assigned fabric. Phase 13 will add the full calculator card UI. The prop boundary is the clean seam between phases
- **D-09:** Hybrid build -- new `supply-table/` directory with fresh components, import existing primitives (`EditableNumber`, `ColorSwatch`) from their current locations
- **D-10:** Do NOT touch existing supply components (`project-supplies-tab.tsx`, `SearchToAdd`, `supply-grid-view`, `supply-table-view`) -- they remain live until Phase 14 cleanup
- **D-11:** `needsBorder` helper may be duplicated one more time in the new component -- acceptable debt cleaned in Phase 14

### Claude's Discretion
- Component file structure within `supply-table/`
- Test strategy and mocking approach for the adapter pattern
- SVG donut implementation details (the visual spec is locked by sketches)
- Loading/empty states
- Exact keyboard navigation implementation
- Error handling for failed server actions (relevant when wired in Phase 11)

### Deferred Ideas (OUT OF SCOPE)
- Color family browsing for supply exploration -- future supply detail surface (backlog 999.1)
- `needsBorder` consolidation to a single canonical location -- Phase 14 cleanup removes the old copies
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SUPTBL-01 | User sees supplies grouped in Thread/Beads/Specialty sections with divider headers and count badges | Section divider component, grouped data rendering, count badge styling -- all spec'd in UI-SPEC and sketch findings |
| SUPTBL-02 | User can add supplies via a persistent add row at the top of the table with a segmented type toggle that stays sticky between adds | SegmentedTypeToggle component with `role="radiogroup"`, sticky state via React useState, add row always visible at table top |
| SUPTBL-03 | User can add supplies via keyboard-first flow (type code -> autocomplete -> Enter -> qty -> Enter to commit) | PortalAutocomplete with `role="listbox"`, keyboard event handling, focus management via refs |
| SUPTBL-04 | User sees proportional SVG donut rings showing have/need ratio for each supply row | StatusDonut SVG component, stroke-dasharray/dashoffset math, three states (empty/partial/complete) |
| SUPENT-01 | User searches supplies via portal autocomplete that escapes table stacking context, with already-added items disabled | `position: fixed` + `getBoundingClientRect()`, disabled item rendering, "Added" label |
| SUPENT-02 | User sees thread need auto-calculated from stitch count with visual indicator and manual override | `calculateSkeins()` integration, sparkle indicator, `isNeedOverridden` flag tracking |
| SUPENT-03 | User can click to edit stitches, need, and have values inline on existing supply rows | EditableNumber component pattern (already exists), click-to-edit with Enter/Escape/Blur handling |
| SUPENT-04 | User can delete a supply row via hover-revealed delete button (no confirmation modal) | CSS `opacity: 0` -> `tr:hover opacity: 1` pattern, immediate delete via adapter, error toast only |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **Server Components by default** -- the supply table WILL be "use client" (justified: keyboard handlers, useState, portal positioning)
- **Zod validation at boundaries** -- adapter methods should validate inputs; add row should validate before calling adapter
- **Prisma schema is source of truth** -- three junction tables (ProjectThread, ProjectBead, ProjectSpecialty), not polymorphic
- **TDD mandatory** -- tests before implementation in all plans
- **Import test utils from `@/__tests__/test-utils`** -- not `@testing-library/react`
- **Import shared mocks from `@/__tests__/mocks/`** -- use existing factories
- **Colocated tests** -- `foo.test.tsx` next to `foo.tsx`
- **Pin exact versions** -- no `^` or `~` in package.json (no new deps expected)
- **Do NOT add `"use client"` unless genuinely needed** -- StatusDonut can be server-compatible (pure SVG, no hooks)
- **Semantic design tokens only** -- `bg-card`, `text-primary`, `border-border` etc. Never hardcoded scales
- **Base UI patterns** -- use existing Dialog/Tooltip from shadcn/ui, `buttonVariants` from `button-variants.ts` for server components
- **Zero new npm dependencies** (STATE.md accumulated context)

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Supply table rendering | Browser / Client | -- | Keyboard-driven, interactive state management, requires "use client" |
| Portal autocomplete | Browser / Client | -- | `position: fixed`, `getBoundingClientRect()`, keyboard navigation |
| SVG donut rendering | Browser / Client | Server-compatible | Pure SVG, no hooks -- could be server component but will be rendered inside client table |
| Skein auto-calculation | Browser / Client | -- | Real-time calculation as user types stitch count |
| Supply search | Browser / Client | API / Backend | Phase 10 uses local-state adapter (in-memory search); Phase 11 adds server-action search |
| Data persistence | -- | API / Backend | Phase 10's local-state adapter is in-memory; real persistence is Phase 11 |
| Inline supply creation | Browser / Client | API / Backend | Dialog is client-side; actual creation via adapter (Phase 11 wires to server action) |
| Inline cell editing | Browser / Client | -- | Click-to-edit pattern with focus management |

## Standard Stack

### Core (already installed -- zero new dependencies)

| Library | Version | Purpose | Why Standard | Source |
|---------|---------|---------|--------------|--------|
| React | 19.1.0 | Component rendering, hooks, refs | Framework foundation | [VERIFIED: package.json] |
| Next.js | 16.2.4 | App Router, server/client split | Project framework | [VERIFIED: package.json] |
| @base-ui/react | (via shadcn v4) | Dialog, Tooltip primitives | Already installed, project standard | [VERIFIED: ui/dialog.tsx, ui/tooltip.tsx] |
| Tailwind CSS | 4.2.3 | Styling with semantic tokens | Project standard | [VERIFIED: package.json] |
| sonner | 2.0.7 | Toast notifications | Already used for error feedback | [VERIFIED: package.json] |
| lucide-react | (installed) | Icons (Trash2, Sparkles, CircleDot, Gem, Plus, ArrowRight) | Project icon library | [VERIFIED: project-supplies-tab.tsx imports] |
| zod | 3.24.4 | Validation at adapter boundary | Project validation standard | [VERIFIED: package.json] |
| Vitest | 3.1.1 | Unit/component testing | Project test framework | [VERIFIED: vitest.config.ts] |
| @testing-library/react | (installed) | Component test rendering (via test-utils) | Project test standard | [VERIFIED: test-utils.tsx] |

### Existing Components to Reuse

| Component / Utility | Location | Verified | Usage |
|---------------------|----------|----------|-------|
| `ColorSwatch` | `src/components/features/supplies/color-swatch.tsx` | [VERIFIED: source read] | 16x16 swatch in data rows; has `needsBorder` export |
| `EditableNumber` pattern | `src/components/features/charts/project-supplies-tab.tsx` lines 40-97 | [VERIFIED: source read] | Click-to-edit cells -- extract to shared location or rebuild with same pattern |
| `calculateSkeins()` | `src/lib/utils/skein-calculator.ts` | [VERIFIED: source read, 50+ test cases] | Thread need auto-calculation |
| `EmptyState` | `src/components/ui/empty-state.tsx` | [VERIFIED: source read] | When no supplies exist |
| `Dialog` | `src/components/ui/dialog.tsx` | [VERIFIED: source read] | InlineCreateDialog wrapper |
| `Tooltip` | `src/components/ui/tooltip.tsx` | [VERIFIED: source read] | Donut hover "X of Y" |
| `Input` | `src/components/ui/input.tsx` | [VERIFIED: ui directory listing] | Add row text input |
| Test factories | `src/__tests__/mocks/factories.ts` | [VERIFIED: source read] | `createMockThread`, `createMockBead`, `createMockProjectThread`, etc. |
| Mock patterns | `src/__tests__/mocks/module-mocks.ts` | [VERIFIED: source read] | `createMockRouter`, `createMockPrisma` |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Custom portal autocomplete | Base UI Combobox | Combobox has built-in ARIA but may conflict with table keyboard handling; custom gives full control over focus flow [ASSUMED] |
| `position: fixed` portal | React Portal + `position: absolute` | absolute fails in table stacking context (proven in sketch findings); fixed with getBoundingClientRect is the right approach [VERIFIED: sketch-findings] |
| Local state for Phase 10 | Server actions immediately | Local-state adapter allows isolated testing and faster iteration; server wiring is Phase 11's job [VERIFIED: CONTEXT.md D-09] |

## Architecture Patterns

### System Architecture Diagram

```
User Input (keyboard/mouse)
    |
    v
[SupplyTable] (root client component)
    |
    +---> [SegmentedTypeToggle] -- selects THREAD | BEAD | SPECIALTY
    |
    +---> [SupplyTableAddRow]
    |         |
    |         +---> search input --> [PortalAutocomplete]
    |         |                          |
    |         |                          +---> adapter.searchSupplies()
    |         |                          +---> "Added" disabled items
    |         |                          +---> "+ Create X" --> [InlineCreateDialog]
    |         |                                                    |
    |         |                                                    +---> adapter.createSupply()
    |         +---> quantity fields (stitches, need)
    |         |
    |         +---> Enter commits --> adapter.addThread/Bead/Specialty()
    |                                    |
    |                                    +---> new row animates into section
    |
    +---> [SupplyTableSectionDivider] "Thread" (count badge)
    +---> [SupplyTableDataRow] * N
    |         |
    |         +---> [ColorSwatch] + code + name
    |         +---> [EditableNumber] cells --> adapter.updateQuantity()
    |         +---> [StatusDonut] (SVG have/need ratio)
    |         +---> delete button --> adapter.remove()
    |
    +---> [SupplyTableSectionDivider] "Beads" / "Specialty"
    +---> [SupplyTableDataRow] * N (per section)
    |
    +---> [SupplyTableFooter] (counts + keyboard hints)

Adapter Interface (abstraction layer):
    Phase 10: LocalStateAdapter (in-memory, for tests/stories)
    Phase 11: ServerActionAdapter (wired to supply-actions.ts)
    Phase 13: CreationFlowAdapter (buffers until two-phase save)
```

### Recommended Project Structure

```
src/components/features/supply-table/
  index.ts                          # Public exports
  types.ts                          # SupplyTableAdapter interface, SupplyType, CalcParams, etc.
  supply-table.tsx                  # Root component (client)
  supply-table.test.tsx             # Integration tests for full table
  supply-table-add-row.tsx          # Persistent add row (client)
  supply-table-add-row.test.tsx     # Add row keyboard/interaction tests
  supply-table-data-row.tsx         # Single supply row (client)
  supply-table-data-row.test.tsx    # Row rendering, inline edit, delete tests
  supply-table-section-divider.tsx  # Section header row
  supply-table-footer.tsx           # Running totals + keyboard hints
  portal-autocomplete.tsx           # Fixed-position portal dropdown (client)
  portal-autocomplete.test.tsx      # Search, keyboard nav, disabled items tests
  status-donut.tsx                  # 16x16 SVG donut (server-compatible)
  status-donut.test.tsx             # SVG math, states, accessibility
  segmented-type-toggle.tsx         # Three-button type toggle (client)
  segmented-type-toggle.test.tsx    # Toggle state, ARIA roles
  inline-create-dialog.tsx          # Dialog for non-seeded supply creation
  inline-create-dialog.test.tsx     # Form validation, create flow
  editable-number.tsx               # Extracted from project-supplies-tab (client)
  editable-number.test.tsx          # Edit/save/cancel/blur behavior
  local-state-adapter.ts            # In-memory adapter for testing/isolation
  local-state-adapter.test.ts       # Adapter contract tests
  use-supply-table.ts               # Custom hook for table state management
  use-supply-table.test.ts          # Hook behavior tests
```

### Pattern 1: Adapter Pattern for Data Source Abstraction

**What:** The table receives a `SupplyTableAdapter` interface object as a prop, making it agnostic to whether data comes from local state, server actions, or a buffered creation flow.

**When to use:** Always -- this is the core abstraction enabling reuse across Phase 10 (isolated), Phase 11 (project detail), and Phase 13 (creation flow).

**Example:**
```typescript
// Source: CONTEXT.md adapter interface + UI-SPEC
interface SupplyTableAdapter {
  addThread(threadId: string, stitchCount: number, need: number): Promise<Result>;
  addBead(beadId: string, quantity: number, need: number): Promise<Result>;
  addSpecialty(itemId: string, need: number): Promise<Result>;
  updateQuantity(type: SupplyType, junctionId: string, field: string, value: number): Promise<Result>;
  remove(type: SupplyType, junctionId: string): Promise<Result>;
  searchSupplies(type: SupplyType, query: string): Promise<SupplySearchResult[]>;
  createSupply(type: SupplyType, data: CreateSupplyData): Promise<SupplySearchResult>;
}

type Result = { success: true } | { success: false; error: string };
```

### Pattern 2: Portal Autocomplete Positioning

**What:** Autocomplete dropdown uses `position: fixed` with JS-calculated coordinates from `getBoundingClientRect()`, rendered via React portal to escape table stacking context.

**When to use:** Any dropdown inside a `<table>` or overflow-hidden container.

**Example:**
```typescript
// Source: D-01, sketch-findings supply-data-entry.md
function PortalAutocomplete({ anchorRef, ...props }) {
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    setCoords({
      top: rect.bottom + 4,  // 4px gap
      left: rect.left,
      width: Math.max(320, rect.width),
    });
  }, [anchorRef]);

  return createPortal(
    <div
      style={{
        position: "fixed",
        top: coords.top,
        left: coords.left,
        width: coords.width,
        zIndex: 9000,
      }}
      role="listbox"
    >
      {/* autocomplete items */}
    </div>,
    document.body,
  );
}
```

### Pattern 3: SVG Donut Ring Calculation

**What:** 16x16 SVG with proportional arc showing have/need ratio using stroke-dasharray.

**When to use:** Status indicators for supply fulfillment.

**Example:**
```typescript
// Source: UI-SPEC SVG Donut Specification, sketch-findings
const CIRCUMFERENCE = 2 * Math.PI * 6; // 37.699...

function StatusDonut({ have, need }: { have: number; need: number }) {
  const ratio = need > 0 ? Math.min(have / need, 1) : 0;
  const isComplete = have >= need && need > 0;
  const isEmpty = have === 0;

  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="false">
      <title>{have} of {need}</title>
      {/* Background ring */}
      <circle cx="8" cy="8" r="6" fill="none"
        className="stroke-muted" strokeWidth="2" />
      {/* Foreground arc (only if have > 0) */}
      {!isEmpty && (
        <circle cx="8" cy="8" r="6" fill="none"
          className={isComplete ? "stroke-primary" : "stroke-warning"}
          strokeWidth="2"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - ratio)}
          transform="rotate(-90 8 8)"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}
```

### Pattern 4: EditableNumber with Adapter Integration

**What:** Click-to-edit number cell that saves via adapter on Enter/blur, reverts on Escape.

**When to use:** Inline editing of stitches, need, and have values in data rows.

**Example:**
```typescript
// Source: existing EditableNumber in project-supplies-tab.tsx lines 40-97
// Enhanced with: aria-label, hover indicator, adapter error handling
function EditableNumber({
  value,
  onSave,
  ariaLabel,
}: {
  value: number;
  onSave: (value: number) => void;
  ariaLabel: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="number"
        min={0}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          const num = parseInt(draft);
          if (!isNaN(num) && num >= 0) onSave(num);
          else setDraft(String(value)); // revert invalid
          setEditing(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          if (e.key === "Escape") {
            setDraft(String(value));
            setEditing(false);
          }
        }}
        aria-label={ariaLabel}
        className="bg-card text-foreground border-primary focus:ring-primary/40
          w-12 rounded border px-1.5 py-0.5 text-center text-sm
          focus:ring-2 focus:outline-none"
      />
    );
  }

  return (
    <button
      onClick={() => { setDraft(String(value)); setEditing(true); }}
      className="hover:bg-primary/5 cursor-text rounded px-1.5 py-0.5 transition-colors"
      title="Click to edit"
      aria-label={ariaLabel}
    >
      {value}
    </button>
  );
}
```

### Pattern 5: Keyboard Flow State Machine

**What:** Manages the add-row keyboard flow: search -> select -> stitches -> need -> commit -> refocus.

**When to use:** The add row's keyboard-first entry flow.

**State transitions:**
```
IDLE
  |-- focus search input --> SEARCHING
SEARCHING
  |-- type text --> SEARCHING (debounced search via adapter)
  |-- ArrowDown/ArrowUp --> NAVIGATING
  |-- Enter (with highlighted item) --> SELECTED
  |-- Escape --> IDLE (reset fields)
NAVIGATING
  |-- Enter (on highlighted) --> SELECTED
  |-- Escape --> SEARCHING (close dropdown, keep text)
SELECTED
  |-- (thread/bead) auto-focus stitches/qty field --> FILLING
  |-- (specialty) auto-focus need field --> FILLING
FILLING
  |-- Enter --> COMMITTED (add row via adapter, animate, refocus search)
  |-- Tab --> advance to next field (need)
  |-- Escape --> IDLE (reset)
COMMITTED
  |-- auto-transition --> SEARCHING (search refocused, type toggle sticky)
```

### Anti-Patterns to Avoid

- **Importing from `project-supplies-tab.tsx`:** This is a monolithic component. Extract what you need (EditableNumber) into the new directory, don't import from it. [VERIFIED: CONTEXT.md D-10 says don't touch existing components]
- **`position: absolute` for dropdown in table:** Fails because `<tr>` elements don't create stacking contexts. Use `position: fixed` with portal. [VERIFIED: sketch findings "What to Avoid"]
- **Separate code paths for auto-calc:** Always use `calculateSkeins()` from the utility. Don't implement the sketch's "divide by 3000" shorthand. [VERIFIED: D-07]
- **Color family filter in autocomplete:** This is a transcription tool. Users have the code. No browsing. [VERIFIED: D-04]
- **"Have" field in add row:** Adding is for transcription from pattern. "Have" is a separate shopping workflow. [VERIFIED: sketch findings, REQUIREMENTS out-of-scope]
- **Progressive reveal / steps:** Rejected in sketches. All fields visible at once. [VERIFIED: sketch findings]
- **Nested `<form>` elements:** The add row is inside a table, not a form. Use event handlers on inputs directly. [VERIFIED: base-ui-patterns.md]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dialog for inline create | Custom modal overlay | `Dialog` from `src/components/ui/dialog.tsx` (Base UI) | Focus trap, backdrop, portal, escape handling all built in [VERIFIED: dialog.tsx source] |
| Tooltip for donut hover | Custom title/hover div | `Tooltip` from `src/components/ui/tooltip.tsx` (Base UI) | Accessible, positioned, portal-based [VERIFIED: tooltip.tsx source] |
| Skein calculation | Manual formula | `calculateSkeins()` from `src/lib/utils/skein-calculator.ts` | Proven formula with 50+ test cases, handles edge cases [VERIFIED: source + tests] |
| Colour display | Custom swatch div | `ColorSwatch` from `src/components/features/supplies/color-swatch.tsx` | Handles light-colour border detection, consistent sizing [VERIFIED: source] |
| Toast notifications | Custom error display | `toast` from `sonner` | Already integrated project-wide for error/success feedback [VERIFIED: project-supplies-tab.tsx] |
| Empty state | Custom empty message | `EmptyState` from `src/components/ui/empty-state.tsx` | Consistent styling with icon, title, description slots [VERIFIED: source] |

**Key insight:** This phase is primarily about assembly and orchestration. Every hard subproblem (calculation, colour display, dialogs, tooltips, toast) already has a solved implementation in the codebase. The new work is the table structure, keyboard flow, adapter pattern, portal autocomplete, and SVG donut -- all of which are well-spec'd in UI-SPEC and sketch findings.

## Common Pitfalls

### Pitfall 1: Table Stacking Context for Dropdowns
**What goes wrong:** Autocomplete dropdown renders behind table rows or gets clipped by `overflow: hidden` on the table wrapper.
**Why it happens:** `<tr>` elements don't create stacking contexts; `z-index` on them is ignored. `overflow: hidden` on section cards clips absolutely-positioned children.
**How to avoid:** Use `position: fixed` + `getBoundingClientRect()` + React portal to `document.body`. The dropdown is completely outside the DOM hierarchy of the table.
**Warning signs:** Dropdown partially hidden, dropdown flickers, dropdown doesn't scroll with the page correctly.
[VERIFIED: sketch-findings "What to Avoid", CONTEXT.md D-01]

### Pitfall 2: Focus Management After Add
**What goes wrong:** After committing a new row, focus gets lost (body focus) or lands on the wrong element.
**Why it happens:** The autocomplete dropdown unmounts, the data rows re-render, and React doesn't know where focus should go.
**How to avoid:** After commit callback resolves, explicitly call `searchInputRef.current?.focus()` in a `requestAnimationFrame` or after state update settles. UI-SPEC specifies: "After commit -- row animates into correct section, search input refocuses, type toggle stays sticky."
**Warning signs:** User has to click/tab to get back to the add row after each addition.
[VERIFIED: UI-SPEC Interaction Contract, CONTEXT.md D-03]

### Pitfall 3: Auto-Calc vs Manual Override Confusion
**What goes wrong:** User manually edits Need, but it gets overwritten when they later change Stitches.
**Why it happens:** No tracking of whether Need was manually overridden.
**How to avoid:** Schema already has `isNeedOverridden: Boolean @default(false)`. When user manually edits Need, set this flag. When flag is true, skip auto-calc for that row's Need. When user clears Need back to auto-calc value, unset the flag.
**Warning signs:** Need value "jumps" after editing stitches on a row where user previously set Need manually.
[VERIFIED: Prisma schema line 206, UI-SPEC "Auto-calc sparkle indicator"]

### Pitfall 4: Debounce Timing on Autocomplete Search
**What goes wrong:** Every keystroke fires a search, causing UI jank and excessive adapter calls.
**Why it happens:** No debounce on the search input.
**How to avoid:** Debounce search with ~150ms delay (matches existing SearchToAdd pattern). Cancel pending searches when new input arrives.
**Warning signs:** Autocomplete flickers, stale results appear momentarily, adapter called too frequently.
[VERIFIED: search-to-add.tsx line 133 uses 150ms setTimeout]

### Pitfall 5: SVG Donut Stroke Math Off-By-One
**What goes wrong:** Donut ring doesn't visually complete at 100%, or shows a tiny gap.
**Why it happens:** Rounding errors in circumference calculation or ratio clamping.
**How to avoid:** Use exact circumference `2 * Math.PI * 6 = 37.699...`, clamp ratio to `Math.min(have/need, 1)`, and for complete state just render full ring (dashoffset 0) rather than calculating.
**Warning signs:** Complete donut has a tiny gap at the start/end.
[VERIFIED: UI-SPEC SVG Donut Specification]

### Pitfall 6: Hydration Issues with Portal
**What goes wrong:** SSR renders nothing for portal (no `document.body`), client renders the dropdown, causing mismatch.
**Why it happens:** `createPortal(el, document.body)` can't run on server.
**How to avoid:** The entire SupplyTable is a client component ("use client"), so this is avoided. But portal rendering should still guard with `typeof window !== "undefined"` or use `useEffect` for initial mount. Alternatively, only render the portal when the dropdown is open (which naturally avoids the issue since it starts closed).
**Warning signs:** Console hydration warnings about portal content.
[VERIFIED: server-client-split.md, known project pattern]

### Pitfall 7: Missing Keyboard Trap in Autocomplete
**What goes wrong:** Arrow keys scroll the page instead of navigating autocomplete items, or Tab escapes the autocomplete unexpectedly.
**Why it happens:** Keyboard events not prevented/stopped on the autocomplete.
**How to avoid:** `e.preventDefault()` on ArrowDown/ArrowUp when autocomplete is open. Let Escape close the dropdown. Enter selects highlighted item. Tab should advance to next field (not trapped in autocomplete).
**Warning signs:** Page scrolls when navigating autocomplete, or keyboard navigation feels broken.
[VERIFIED: search-to-add.tsx handleKeyDown pattern, UI-SPEC keyboard flow]

## Code Examples

### Supply Data Types for the Table

```typescript
// Source: types/supply.ts + schema.prisma (verified)
// These types are what the table receives as data

type SupplyType = "THREAD" | "BEAD" | "SPECIALTY";

interface CalcParams {
  fabricCount: number;   // default 14
  strandCount: number;   // default 2
  overCount: 1 | 2;      // default 1
  wastePercent: number;   // default 20
}

// Normalized supply row for display (type-erased for the table)
interface SupplyRow {
  id: string;           // junction table ID (pt-1, pb-1, ps-1)
  supplyId: string;     // supply catalog ID (thread.id, bead.id, etc.)
  type: SupplyType;
  code: string;         // colorCode or productCode
  name: string;         // colorName
  brandName: string;
  hexColor: string;
  stitchCount: number;  // only meaningful for threads
  need: number;         // quantityRequired
  have: number;         // quantityAcquired
  isNeedOverridden: boolean; // only meaningful for threads
}
```

### Autocomplete Search Result Type

```typescript
// Source: derived from existing ThreadWithBrand, BeadWithBrand types
interface SupplySearchResult {
  id: string;           // supply catalog ID
  type: SupplyType;
  code: string;
  name: string;
  brandName: string;
  brandId: string;
  hexColor: string;
}
```

### Inline Create Data

```typescript
// Source: derived from createAndAdd* schemas in validations/supply.ts
interface CreateSupplyData {
  name: string;
  code?: string;
  brandId: string;      // "default" triggers upsert in server action
  hexColor?: string;
}
```

### Section Divider with Count Badge

```typescript
// Source: UI-SPEC Component Inventory, sketch CSS patterns
function SupplyTableSectionDivider({
  icon: Icon,
  label,
  count,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  count: number;
}) {
  if (count === 0) return null; // hidden when empty

  return (
    <tr>
      <td colSpan={7} className="border-b-2 border-border bg-background px-3 pb-2 pt-3">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
          <Icon className="h-3.5 w-3.5" />
          <span>{label}</span>
          <span className="rounded-full bg-muted px-[7px] py-[1px] text-[10px] font-semibold text-muted-foreground">
            {count}
          </span>
        </div>
      </td>
    </tr>
  );
}
```

### New Row Slide-In Animation

```css
/* Source: UI-SPEC, sketch findings -- add to globals.css */
@keyframes slideIn {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-slide-in {
  animation: slideIn 0.2s ease;
}

/* Add to existing reduced-motion media query */
@media (prefers-reduced-motion: reduce) {
  .animate-slide-in {
    animation: none;
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `position: absolute` dropdown in table | `position: fixed` + portal | Proven in sketch 002 exploration | Eliminates stacking context issues |
| Separate add button per section | Single persistent add row + type toggle | Sketch 004 decision | Faster keyboard flow, no section switching |
| Binary status icons (check/warning) | Proportional SVG donuts | Sketch 002 decision | More informative at a glance |
| Color family filter in search | No filter (code-only search) | D-04 from CONTEXT.md | Cleaner transcription workflow |
| Separate chart + project forms | Merged form with supply takeover | Sketch 003 + v1.3 roadmap | Future phases, but influences component isolation |

**Deprecated/outdated:**
- The current `ProjectSuppliesTab` with collapsible sections and `SearchToAdd` overlay will be replaced by the unified table in Phase 11. Do NOT modify these components -- they remain live until Phase 14 cleanup. [VERIFIED: D-10]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Base UI Combobox would conflict with custom keyboard handling in the table context, so building a custom portal autocomplete is better | Standard Stack / Alternatives | LOW -- could explore Combobox, but custom gives guaranteed control over focus flow |
| A2 | `createPortal` to `document.body` is sufficient for the fixed dropdown; no need for a dedicated portal container | Architecture Patterns | LOW -- standard React pattern, works in all environments |
| A3 | 150ms debounce is adequate for the autocomplete search UX | Common Pitfalls | LOW -- matches existing SearchToAdd; adjustable if too fast/slow |

## Open Questions

1. **EditableNumber extraction approach**
   - What we know: The pattern exists in `project-supplies-tab.tsx` (lines 40-97). D-09 says "import existing primitives" but D-10 says "do NOT touch existing components."
   - What's unclear: Should we copy the component into the new directory (creating a temporary duplicate), or extract it to a truly shared location like `src/components/ui/editable-number.tsx`?
   - Recommendation: Extract to `src/components/features/supply-table/editable-number.tsx` within the new directory. This avoids modifying existing files (D-10) while avoiding a shared extraction that might break existing imports. Phase 14 cleanup can consolidate.

2. **Adapter method signatures for local-state adapter**
   - What we know: The adapter interface is defined in UI-SPEC. Phase 10 builds a local-state adapter.
   - What's unclear: Should `searchSupplies` in the local-state adapter search a hardcoded fixture set (e.g., subset of DMC threads), or accept initial data as constructor params?
   - Recommendation: Constructor params approach -- `new LocalStateAdapter(initialThreads, initialBeads, initialSpecialty)` -- so tests can control exactly what data is available.

3. **Where to render the SupplyTable for Phase 10 (no page integration yet)**
   - What we know: Phase 11 integrates into project detail. Phase 13 integrates into creation form.
   - What's unclear: Phase 10 builds the component but where does it get rendered/tested visually during development?
   - Recommendation: Build a temporary test page or storybook-like route (e.g., `/dev/supply-table`) that renders the component with the local-state adapter and fixture data. Remove in Phase 14 cleanup. Alternatively, rely purely on test assertions without a visual dev route.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 3.1.1 + @testing-library/react |
| Config file | `vitest.config.ts` (exists) |
| Quick run command | `npm test -- --run src/components/features/supply-table/` |
| Full suite command | `npm test -- --run` |

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SUPTBL-01 | Grouped sections with dividers and count badges | unit | `npx vitest run src/components/features/supply-table/supply-table.test.tsx -t "sections"` | Wave 0 |
| SUPTBL-02 | Persistent add row with sticky type toggle | unit | `npx vitest run src/components/features/supply-table/supply-table-add-row.test.tsx -t "type toggle"` | Wave 0 |
| SUPTBL-03 | Keyboard-first add flow | unit | `npx vitest run src/components/features/supply-table/supply-table-add-row.test.tsx -t "keyboard"` | Wave 0 |
| SUPTBL-04 | SVG donut rings showing have/need ratio | unit | `npx vitest run src/components/features/supply-table/status-donut.test.tsx` | Wave 0 |
| SUPENT-01 | Portal autocomplete with disabled already-added items | unit | `npx vitest run src/components/features/supply-table/portal-autocomplete.test.tsx` | Wave 0 |
| SUPENT-02 | Thread need auto-calculated with visual indicator and override | unit | `npx vitest run src/components/features/supply-table/supply-table-add-row.test.tsx -t "auto-calc"` | Wave 0 |
| SUPENT-03 | Click-to-edit inline cells | unit | `npx vitest run src/components/features/supply-table/editable-number.test.tsx` | Wave 0 |
| SUPENT-04 | Hover-revealed delete button, no confirmation | unit | `npx vitest run src/components/features/supply-table/supply-table-data-row.test.tsx -t "delete"` | Wave 0 |

### Sampling Rate
- **Per task commit:** `npm test -- --run src/components/features/supply-table/`
- **Per wave merge:** `npm test -- --run`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] All test files in `src/components/features/supply-table/` -- entire directory is new
- [ ] `@keyframes slideIn` and `.animate-slide-in` in `globals.css` -- animation CSS
- [ ] `prefers-reduced-motion` entry for slideIn in globals.css

*(Existing test infrastructure -- vitest config, test-utils, factories, mocks -- is already comprehensive. No framework gaps.)*

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | No | Phase 10 is pure client component; auth handled by adapter (Phase 11) |
| V3 Session Management | No | No session handling in this component |
| V4 Access Control | No | Adapter abstraction; Phase 11's server-action adapter calls `requireAuth()` |
| V5 Input Validation | Yes | Zod validation on add-row inputs before adapter calls; EditableNumber validates numeric input |
| V6 Cryptography | No | No crypto operations |

### Known Threat Patterns for Client-Side Component

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| XSS via supply name/code display | Tampering | React auto-escapes JSX; no raw HTML injection |
| Prototype pollution via adapter | Tampering | TypeScript strict types on adapter interface |
| DoS via rapid autocomplete requests | Denial of Service | 150ms debounce on search input |

Note: The real security boundary is in the server-action adapter (Phase 11), which validates inputs with Zod and checks auth via `requireAuth()`. Phase 10's local-state adapter has no server-side attack surface.

## Sources

### Primary (HIGH confidence)
- [VERIFIED: source read] `src/components/features/charts/project-supplies-tab.tsx` -- EditableNumber pattern, supply row rendering, section structure
- [VERIFIED: source read] `src/components/features/supplies/color-swatch.tsx` -- ColorSwatch component with needsBorder
- [VERIFIED: source read] `src/components/features/supplies/search-to-add.tsx` -- Autocomplete search pattern, debounce, keyboard handling
- [VERIFIED: source read] `src/lib/utils/skein-calculator.ts` -- calculateSkeins with full formula
- [VERIFIED: source read] `src/lib/validations/supply.ts` -- All supply Zod schemas including updateQuantitySchema, createAndAdd* schemas
- [VERIFIED: source read] `src/types/supply.ts` -- All supply type exports
- [VERIFIED: source read] `prisma/schema.prisma` -- Junction table schema with isNeedOverridden
- [VERIFIED: source read] `src/__tests__/mocks/factories.ts` -- Full test factories for all supply types
- [VERIFIED: source read] `src/components/ui/dialog.tsx`, `tooltip.tsx`, `empty-state.tsx` -- Existing UI components
- [VERIFIED: npm registry] Package versions: next 16.2.4, tailwindcss 4.2.3, vitest 3.1.1, sonner 2.0.7, zod 3.24.4
- [CITED: base-ui.com/react/components/dialog.md] Dialog API via Context7
- [CITED: base-ui.com/react/components/popover.md] Portal component API via Context7
- [VERIFIED: source read] `.planning/phases/10-unified-supply-table/10-UI-SPEC.md` -- Complete visual/interaction contract
- [VERIFIED: source read] `.claude/skills/sketch-findings-cross-stitch-tracker/references/supply-data-entry.md` -- Validated design decisions and CSS patterns

### Secondary (MEDIUM confidence)
- [VERIFIED: project test suite] 1207 tests passing -- confirms test infrastructure health

### Tertiary (LOW confidence)
- None -- all claims verified against codebase or official documentation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all packages verified installed, all reusable components verified by source read
- Architecture: HIGH -- adapter pattern validated by CONTEXT.md decisions and UI-SPEC, existing code patterns confirmed
- Pitfalls: HIGH -- derived from existing SearchToAdd issues (stacking context), schema features (isNeedOverridden), and sketch experiment findings

**Research date:** 2026-05-03
**Valid until:** 2026-06-03 (stable -- all dependencies locked, design fully spec'd)
