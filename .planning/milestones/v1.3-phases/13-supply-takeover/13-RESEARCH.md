# Phase 13: Supply Takeover - Research

**Researched:** 2026-05-13
**Domain:** React state management, form/supply mode orchestration, adapter pattern, atomic Prisma transactions
**Confidence:** HIGH

## Summary

Phase 13 transitions the merged creation form (Phase 12) into a two-mode UI: form mode (existing) and supply takeover mode. The form collapses to a sticky summary bar, a calculator card with fabric assignment appears, and the unified supply table (Phase 10) fills the page. All of this happens in-page via React `<Activity>` toggle -- no navigation, no route change.

The primary technical challenges are: (1) implementing `CreationFlowAdapter` to buffer supply rows in React state while delegating catalog searches to server actions, (2) extending `createChart` to atomically save both chart/project data and buffered supplies in a single `$transaction`, (3) building the calculator card with segmented controls and fabric-driven `fabricCount` auto-population, and (4) extending draft persistence to include supply rows for crash recovery.

**Primary recommendation:** Structure the work around the adapter-first pattern -- build and test `CreationFlowAdapter` independently, then wire it into the UI. The adapter is the only net-new data abstraction; everything else is composition of existing components (SupplyTable, SearchableSelect, EditableNumber, SegmentedTypeToggle patterns).

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** In-page transition using React `<Activity>` (stable in React 19.2.5, already installed). Form hides, summary bar + calculator card + supply table show. No navigation, no redirect, no new route
- **D-02:** The milestone marker "Add supplies" button triggers the mode toggle. "Details" link in summary bar toggles back. Form state preserved by Activity (no unmount)
- **D-03:** Nothing is created in the database until the user clicks the final "Create" button -- the entire flow (form fields + supplies) saves atomically
- **D-04:** New `CreationFlowAdapter` implementing `SupplyTableAdapter` -- stores supply rows in React component state (not server actions). The adapter slot is already annotated in `supply-table/types.ts` line 76
- **D-05:** Supply rows backed up to localStorage alongside the existing form draft (same `saveDraft`/`loadDraft` pattern from Phase 12). Tab close or crash is recoverable
- **D-06:** On final "Create" click: single `$transaction` wrapping `createChart` + `batchAddSupplies` (new server action). Either everything persists or nothing does -- no orphan records
- **D-07:** `batchAddSupplies` server action inserts into all three junction tables (ProjectThread, ProjectBead, ProjectSpecialty) from the buffered supply rows
- **D-08:** Supply search (`searchSupplies`, `createSupply` on the adapter) still hits server actions for catalog lookups -- only persistence is buffered
- **D-09:** One styled card containing: fabric dropdown (first row) -> Strands Over / Fabric Count / Waste % segmented controls below. Lives above the supply table in the supply takeover area
- **D-10:** Fabric selection auto-fills `fabricCount` in CalcParams. Value remains editable after selection -- fabric sets a default, not a lock
- **D-11:** Fabric picker syncs with the project's `fabricId` field (same source of truth as the form's fabric selector). Selecting fabric in the calc card = assigning it to the project
- **D-12:** Fabric dropdown shows unassigned fabrics (same `unassignedFabrics` prop already wired into `ChartMergedForm`)
- **D-13:** No flat settings bar -- styled card with segmented controls per sketch spec
- **D-14:** Live binding from `form.values` -- no snapshot, no extra state. Summary bar reads current form state directly
- **D-15:** Content: dot-separated tokens built as `[name, designerName, statusLabel, stitchCountFormatted].filter(Boolean).join(" . ")`. Empty optional fields drop out gracefully
- **D-16:** Chart name (required) and status (defaults to "Unstarted") are always present -- bar always shows at minimum "Chart Name . Unstarted"
- **D-17:** Positioned `sticky top-[48px] z-[90]` per sketch spec. No conflict with sticky save bar at `fixed bottom-0 z-[100]`

### Claude's Discretion
- CreationFlowAdapter internal structure (memory buffer format, localStorage serialization)
- `batchAddSupplies` server action implementation details and error handling
- Calculator card segmented control component (reuse SegmentedTypeToggle pattern from supply table or build new)
- Supply table empty state in creation flow
- Test strategy for the two-phase save transaction
- How existing `handleAddSupplies` callback is refactored into mode toggle
- Whether stale fabric ID detection on draft restore needs the same pattern as stale designerId

### Deferred Ideas (OUT OF SCOPE)
- Auto-infer overCount from fabric count (backlog 999.14)
- Supply takeover in edit mode -- Phase 14 uses merged form for editing
- Optimistic UI for supply mutations in creation flow -- buffer is already local, inherent
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| TAKE-01 | User transitions from form to supply mode via milestone marker -- form collapses to sticky summary bar, supply table fills the page | React Activity API (mode="visible"/"hidden"), SummaryBar component spec, ChartMergedForm mode state |
| TAKE-02 | User can return to form details via "Details" link in the summary bar with all form state preserved | Activity preserves state (no unmount/remount), mode toggle state, focus management |
| TAKE-03 | User can optionally assign fabric as the first step in the supply takeover area, which auto-populates skein calculator defaults | CalculatorCard with SearchableSelect for fabric, CalcParams.fabricCount binding, existing unassignedFabrics prop |
| TAKE-04 | User configures skein calculation via a styled card with segmented controls (Strands Over, Fabric Count, Waste %) in the supply area | CalculatorCard component with EditableNumber and over-count buttons, CalcParams state management |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Mode toggle (form/supply) | Browser / Client | -- | Pure React state + Activity component; no server involvement |
| Summary bar | Browser / Client | -- | Reads form.values directly, no server data fetch |
| Calculator card + CalcParams | Browser / Client | -- | Local state for calc params; fabric dropdown reads server-fetched prop |
| CreationFlowAdapter (supply buffer) | Browser / Client | API / Backend | Buffer is client state; catalog search delegates to server actions |
| Atomic create (chart + supplies) | API / Backend | Database / Storage | Single $transaction in server action; Prisma handles multi-table insert |
| Draft persistence (supplies) | Browser / Client | -- | localStorage serialization; extends existing draft pattern |
| Fabric assignment | Browser / Client | API / Backend | Client selects fabric ID; server action persists fabric link in transaction |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.5 | Activity component for mode toggle, state management | Already installed; Activity is stable since 19.2.0 [VERIFIED: node_modules/@types/react] |
| Next.js | 16 | App Router, server actions | Project framework [VERIFIED: CLAUDE.md] |
| Prisma | 7 | $transaction for atomic chart+supply creation, createMany for batch inserts | Project ORM; createMany with skipDuplicates verified in generated client [VERIFIED: src/generated/prisma/models/ProjectThread.ts] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| sonner | (installed) | Toast notifications for success/error | Chart creation success, draft restore, error feedback |
| lucide-react | (installed) | Icons (ArrowLeft for Details link, Check for milestone) | Already used throughout the form |
| zod | (installed) | Validation for batchAddSupplies server action input | Boundary validation on server action |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| React Activity | Conditional render (`{mode === "form" && ...}`) | Activity preserves DOM state and form inputs; conditional render destroys and rebuilds. Activity is the correct choice per D-01 |
| localStorage draft | IndexedDB | localStorage is simpler, already established in Phase 12; supply row count is bounded (hundreds at most), well within localStorage limits |
| Single $transaction | Separate createChart then batchAdd | Violates D-06 atomicity. If batch insert fails after chart creation, orphan record exists |

**Installation:**
```bash
# No new dependencies needed -- zero new npm packages
```

## Architecture Patterns

### System Architecture Diagram

```
User clicks "Add supplies" on milestone marker
  |
  v
[Mode State Toggle: "form" -> "supply"]
  |
  +-- Activity(mode="hidden"): Form fields (preserved, not unmounted)
  |
  +-- Activity(mode="visible"): Supply Takeover
        |
        +-- SummaryBar (reads form.values live via D-14)
        |     |
        |     +-- "Details" link -> toggles mode back to "form"
        |
        +-- CalculatorCard
        |     |
        |     +-- Fabric dropdown (SearchableSelect, syncs form.values.fabricId)
        |     +-- CalcParams state (fabricCount, strandCount, overCount, wastePercent)
        |     |     auto-populates fabricCount from fabric.count on selection (D-10)
        |
        +-- SupplyTable (existing Phase 10 component, unmodified)
              |
              +-- CreationFlowAdapter (implements SupplyTableAdapter)
                    |
                    +-- addThread/addBead/addSpecialty -> buffer in React state (client-side IDs)
                    +-- updateQuantity/remove -> mutate buffer
                    +-- searchSupplies -> delegates to server action (getThreads/getBeads/getSpecialtyItems)
                    +-- createSupply -> delegates to server action (createThread/createBead/createSpecialtyItem)

User clicks "Create" on StickySaveBar
  |
  v
[handleSubmit modified]
  |
  +-- Client-side Zod validation (existing)
  +-- Collects: form values + CreationFlowAdapter.getRows()
  +-- Calls: createChartWithSupplies(formData, supplyRows) server action
        |
        v
[Server: $transaction]
  +-- Create chart + project (existing createChart logic)
  +-- Link fabric (existing)
  +-- batchAddSupplies: createMany into ProjectThread/ProjectBead/ProjectSpecialty
  +-- Generate thumbnail (existing, outside transaction)
  +-- revalidatePath
  +-- Return chartId
```

### Recommended Project Structure

```
src/components/features/charts/
  chart-merged-form.tsx              # MODIFIED: Activity toggle, mode state, supply embedding
  use-chart-form.ts                  # MODIFIED: handleSubmit extended for supply payload
  use-draft-persistence.ts           # MODIFIED: supply row serialization added
  form-primitives/
    summary-bar.tsx                  # NEW: sticky summary bar component
    calculator-card.tsx              # NEW: styled card with fabric + calc params
    sticky-save-bar.tsx              # EXISTING: unchanged (props already support needed states)

src/components/features/supply-table/
  creation-flow-adapter.ts           # NEW: SupplyTableAdapter impl buffering in React state
  creation-flow-adapter.test.ts      # NEW: adapter unit tests

src/lib/actions/
  chart-actions.ts                   # MODIFIED: createChartWithSupplies or extended createChart
  supply-actions.ts                  # EXISTING: unchanged (catalog search reused as-is)

src/lib/validations/
  chart.ts                           # MODIFIED: supply rows Zod schema for batch input
```

### Pattern 1: CreationFlowAdapter (Buffered Adapter)

**What:** A `SupplyTableAdapter` implementation that stores supply rows in React component state instead of persisting to the database. Catalog search and inline creation still delegate to server actions.

**When to use:** In the creation flow where no project ID exists yet, so junction table inserts are impossible.

**Example:**
```typescript
// Source: Pattern derived from existing LocalStateAdapter (local-state-adapter.ts)
// and ServerActionAdapter (server-action-adapter.ts)
// [VERIFIED: both files read from codebase]

export class CreationFlowAdapter implements SupplyTableAdapter {
  private rows: Map<string, SupplyRow>;
  private onRowsChange: (rows: SupplyRow[]) => void;

  constructor(onRowsChange: (rows: SupplyRow[]) => void) {
    this.rows = new Map();
    this.onRowsChange = onRowsChange;
  }

  async addThread(threadId: string, stitchCount: number, need: number): Promise<Result> {
    // Generate client-side ID (crypto.randomUUID)
    // Store in buffer
    // Call onRowsChange to trigger React state update
    // Return { success: true, id }
  }

  async searchSupplies(type: SupplyType, query: string): Promise<SupplySearchResult[]> {
    // Delegate to server actions (getThreads, getBeads, getSpecialtyItems)
    // Same pattern as ServerActionAdapter.searchSupplies
  }

  getRows(): SupplyRow[] {
    // Returns serializable array for the "Create" submission
    return Array.from(this.rows.values());
  }
}
```

**Key insight:** The adapter needs a `getRows()` method (not on the interface, specific to this adapter) so `handleSubmit` can extract buffered supply rows for the server action payload. The adapter also needs a `loadRows(rows: SupplyRow[])` method for draft restore.

### Pattern 2: React Activity for Mode Toggle

**What:** React 19.2+ `<Activity>` component hides/shows children with `display: none` while preserving all React state, refs, and DOM position.

**When to use:** When switching between form view and supply view without losing state.

**Example:**
```typescript
// Source: [VERIFIED: node_modules/@types/react, React 19.2 docs via Context7]
import { Activity } from "react";

const [mode, setMode] = useState<"form" | "supply">("form");

<Activity mode={mode === "form" ? "visible" : "hidden"}>
  <form>...</form>
</Activity>

<Activity mode={mode === "supply" ? "visible" : "hidden"}>
  <SummaryBar ... />
  <CalculatorCard ... />
  <SupplyTable ... />
</Activity>
```

**Caveats:**
- When hidden, Effects are destroyed and re-created on show [CITED: React Activity docs via Context7]
- Hidden Activity children still re-render at lower priority in response to new props
- `display: none` is applied via CSS -- no DOM removal
- Text-only children inside hidden Activity render nothing (no DOM element to apply display:none to)

### Pattern 3: Atomic $transaction for Chart + Supplies

**What:** A single Prisma `$transaction` that creates the chart, project, links fabric, and inserts all supply junction records.

**When to use:** On final "Create" click in the merged form.

**Example:**
```typescript
// Source: Pattern from existing createChart in chart-actions.ts (lines 27-83)
// Extended with supply batch insert
// [VERIFIED: chart-actions.ts read from codebase]
// [VERIFIED: createMany with skipDuplicates in generated Prisma client]

await prisma.$transaction(async (tx) => {
  // 1. Create chart + project (existing logic)
  const result = await tx.chart.create({
    data: { ...chartData, project: { create: projectData } },
    include: { project: true },
  });

  // 2. Link fabric (existing logic)
  if (fabricId) {
    await tx.fabric.update({ where: { id: fabricId }, data: { linkedProjectId: result.project.id } });
  }

  // 3. Batch insert supply junction records
  const projectId = result.project!.id;

  if (threadRows.length > 0) {
    await tx.projectThread.createMany({
      data: threadRows.map(row => ({
        projectId,
        threadId: row.supplyId,
        stitchCount: row.stitchCount,
        quantityRequired: row.need,
        quantityAcquired: 0,
        isNeedOverridden: row.isNeedOverridden,
      })),
      skipDuplicates: true,
    });
  }
  // Similar for beads and specialty...

  return result;
});
```

### Anti-Patterns to Avoid

- **Creating chart first, then adding supplies in separate requests:** Violates D-06 atomicity. If batch fails after chart creation, orphan chart with no project exists. Use single `$transaction`.
- **Storing supply rows in a separate React context or zustand store:** Overengineered. The adapter pattern already handles state via constructor callback. Keep state colocated with the form component.
- **Using `useEffect` to sync fabric selection to CalcParams:** Direct event handler (`onFabricChange -> setCalcParams`) is cleaner and avoids render cycle delays. Effects should be for external synchronization, not derived state.
- **Nesting `<form>` elements:** The supply table's add row is NOT a form. It uses button handlers and keyboard events. Embedding SupplyTable inside the existing `<form>` is safe because SupplyTable doesn't render `<form>` elements.
- **Using `createAndAdd*` in CreationFlowAdapter.createSupply:** These functions create both catalog AND junction records. Since there's no project yet, the junction record would be orphaned. Use catalog-only `createThread`/`createBead`/`createSpecialtyItem` instead [VERIFIED: catalog-only actions exist at lines 57, 141, and similar in supply-actions.ts].

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Supply catalog search | Custom fetch to API routes | Existing `getThreads`/`getBeads`/`getSpecialtyItems` server actions | Already validated, auth-guarded, properly typed |
| Supply table UI | New table component | Existing `SupplyTable` from Phase 10 (import from barrel) | 238 lines, fully tested (14 test files), handles all interaction |
| Autocomplete dropdown | Custom dropdown | Existing `PortalAutocomplete` inside SupplyTable | Portal positioning, keyboard nav, disabled-item logic |
| Editable number inputs | Custom input component | Existing `EditableNumber` from charts/ | Focus management, min/max validation, display formatting |
| Searchable dropdown | Custom dropdown | Existing `SearchableSelect` from form-primitives/ | 121 lines, already used for designer/storage/app selectors |
| Skein calculation | Manual formula | Existing `calculateSkeins()` from `lib/utils/skein-calculator.ts` | Formula verified, 37 lines, fully tested |
| Draft persistence | Custom storage abstraction | Existing `saveDraft`/`loadDraft`/`clearDraft` from `use-draft-persistence.ts` | Just extend the serialization format |
| Supply type toggle | New segmented control | Existing `SegmentedTypeToggle` pattern (supply-table/) | Same visual style needed for calc card Over control |

**Key insight:** Phase 13 builds almost entirely on existing components. The only net-new abstractions are `CreationFlowAdapter`, `SummaryBar`, and `CalculatorCard`. Everything else is composition and wiring.

## Common Pitfalls

### Pitfall 1: Activity Effects Lifecycle
**What goes wrong:** Effects inside hidden Activity children are destroyed. If the supply table uses effects for search debouncing or autocomplete positioning, those effects re-run when Activity becomes visible again.
**Why it happens:** Activity destroys effects on hide and re-creates them on show. This is intentional for resource cleanup.
**How to avoid:** The SupplyTable's `useSupplyTable` hook uses `useEffect` for debounced search. When the supply Activity becomes hidden (user clicks "Details"), the debounce timer is cleaned up. When it becomes visible again, the effect re-runs -- but since `searchText` state is preserved, it will re-trigger a search if text was pending. This is generally fine. Test this flow explicitly.
**Warning signs:** Stale search results or missing autocomplete dropdown after toggling back to supply mode.

### Pitfall 2: Client-Side IDs vs. Server IDs
**What goes wrong:** CreationFlowAdapter generates client-side IDs via `crypto.randomUUID()`. After the "Create" transaction, server-side cuid IDs are assigned. If the UI tries to navigate to a supply detail using the client ID, it fails.
**Why it happens:** The adapter's `addThread` returns `{ success: true, id: clientId }`. The SupplyTable uses this for new-row animation (`newRowIds`). After creation, the page redirects, so stale client IDs are discarded.
**How to avoid:** Don't store client IDs beyond the creation session. After successful create, `clearDraft()` and redirect. The animation timeout (250ms) ensures client IDs are only used transiently.
**Warning signs:** If someone tries to add a "view supply detail" link in the creation flow table.

### Pitfall 3: Duplicate Supply in Transaction
**What goes wrong:** User adds the same thread twice in the buffer (the adapter doesn't enforce uniqueness at the adapter level). The `createMany` in the transaction fails with P2002 unique constraint violation (`@@unique([projectId, threadId])`).
**Why it happens:** CreationFlowAdapter buffers in memory without checking the DB constraint.
**How to avoid:** The adapter's `addThread`/`addBead`/`addSpecialty` should check `existingSupplyIds` (already tracked by SupplyTable) to prevent duplicate adds in the UI. Also add a defensive `skipDuplicates: true` on `createMany` [VERIFIED: available on ProjectThread/ProjectBead/ProjectSpecialty in generated Prisma client].
**Warning signs:** Transaction rollback on create with many supplies added.

### Pitfall 4: localStorage Size with Supply Rows
**What goes wrong:** Draft grows significantly when many supply rows are buffered (each row is ~200 bytes serialized; 200 rows = ~40KB). Combined with form data, this is still well within localStorage limits (typically 5-10MB per origin).
**Why it happens:** Phase 12 drafts are small (form values only). Phase 13 adds supply rows.
**How to avoid:** Not a real problem at expected scale (hundreds of supplies max). The `saveDraft` try/catch already handles localStorage full gracefully. Monitor serialized size in tests.
**Warning signs:** `saveDraft` silently failing on very large supply lists.

### Pitfall 5: Stale Fabric ID on Draft Restore
**What goes wrong:** User saves draft with fabricId "fab-1". Between sessions, that fabric is assigned to another project. On restore, fabricId "fab-1" is no longer in the `unassignedFabrics` list.
**Why it happens:** Fabric assignment is exclusive (`linkedProjectId` is `@unique`). The fabric may have been linked to another project since the draft was saved.
**How to avoid:** The existing `loadDraft` already has stale ID detection for designerId, storageId, appId, and fabricId [VERIFIED: use-draft-persistence.ts lines 41-52]. When `fabricId` isn't in `validFabricIds`, it's nulled out. This pattern is already correct. Toast the user: "Draft restored (fabric no longer available -- please reselect)" per UI-SPEC copywriting contract.
**Warning signs:** Fabric dropdown showing a selected value that's not in the options list.

### Pitfall 6: createSupply in CreationFlowAdapter Creates Catalog Records
**What goes wrong:** When a user creates an inline supply (custom thread not in catalog) via the CreationFlowAdapter, the `createSupply` method calls a server action that actually creates a catalog record in the Thread/Bead/SpecialtyItem table. If the user never clicks "Create", the catalog record exists without a project link.
**Why it happens:** D-08 states catalog lookups hit server actions. Inline creation creates a catalog entry (not a junction record). This is acceptable -- the catalog entry is reusable across projects.
**How to avoid:** Use the existing catalog-only `createThread`/`createBead`/`createSpecialtyItem` actions [VERIFIED: exist at lines 57, 141, and corresponding locations in supply-actions.ts]. These create catalog entries without junction records. Do NOT call `createAndAddThread` which creates both catalog AND junction records -- the junction record would be orphaned without a valid project.
**Warning signs:** None -- catalog-only creation is by design. The catalog entry persists independently.

## Code Examples

### SummaryBar Component
```typescript
// Source: UI-SPEC section "SummaryBar", CONTEXT.md D-14/D-15/D-16/D-17
// [VERIFIED: 13-UI-SPEC.md]

interface SummaryBarProps {
  name: string;                    // form.values.name (always present, required)
  designerName: string | null;     // resolved from form.values.designerId
  statusLabel: string;             // resolved from STATUS_CONFIG[form.values.status]
  stitchCount: number;             // form.values effective stitch count
  onDetailsClick: () => void;      // toggles mode back to "form"
}

// Token construction:
const tokens = [
  name,
  designerName,
  statusLabel,
  stitchCount > 0 ? `${stitchCount.toLocaleString()} stitches` : null,
].filter(Boolean).join(" · ");  // middle dot separator (U+00B7)
```

### CreationFlowAdapter getRows() for Submission
```typescript
// Source: Pattern from LocalStateAdapter.getRows() (local-state-adapter.ts:160-166)
// [VERIFIED: local-state-adapter.ts read from codebase]

// In handleSubmit (use-chart-form.ts or chart-merged-form.tsx):
const supplyRows = creationFlowAdapterRef.current.getRows();
const response = await createChartWithSupplies(formData, supplyRows);
```

### batchAddSupplies Server Action Shape
```typescript
// Source: Pattern from addThreadToProject/addBeadToProject/addSpecialtyToProject
// in supply-actions.ts, combined into batch operation
// [VERIFIED: supply-actions.ts and Prisma createMany both read from codebase]

interface BatchSupplyInput {
  threads: { supplyId: string; stitchCount: number; need: number; isNeedOverridden: boolean }[];
  beads: { supplyId: string; need: number }[];
  specialty: { supplyId: string; need: number }[];
}

// Inside $transaction:
if (input.threads.length > 0) {
  await tx.projectThread.createMany({
    data: input.threads.map(t => ({
      projectId,
      threadId: t.supplyId,
      stitchCount: t.stitchCount,
      quantityRequired: t.need,
      quantityAcquired: 0,
      isNeedOverridden: t.isNeedOverridden,
    })),
    skipDuplicates: true,
  });
}
```

### Draft Persistence Extension
```typescript
// Source: Existing use-draft-persistence.ts pattern
// [VERIFIED: use-draft-persistence.ts read from codebase]

// Current: localStorage stores ChartFormValues
// Phase 13: Extend to store { form: ChartFormValues, supplies: SupplyRow[], calcParams: CalcParams }

const DRAFT_KEY = "chart-draft"; // same key, expanded structure

interface DraftV2 {
  version: 2;
  form: ChartFormValues;
  supplies: SupplyRow[];
  calcParams: CalcParams;
}

// Backward compat: loadDraft checks for version field
// If missing (v1 draft), treat as { form: parsedData, supplies: [], calcParams: DEFAULT_CALC_PARAMS }
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `<div style={{display: show ? 'block' : 'none'}}>` | `<Activity mode={show ? "visible" : "hidden"}>` | React 19.2.0 (Oct 2025) | Proper effect lifecycle management, lower priority re-renders for hidden content |
| Separate create-then-redirect flow | In-page mode toggle with atomic save | Phase 13 (this phase) | No orphan records, no page navigation, preserved form state |
| Per-supply server action persistence | Buffered adapter with batch insert | Phase 13 (this phase) | No project ID needed during entry, atomic persistence |

**Deprecated/outdated:**
- The current `handleAddSupplies` callback in `chart-merged-form.tsx` (lines 75-78) creates the chart first and redirects to supplies tab. Phase 13 replaces this with a mode toggle. The `redirectToSuppliesRef` pattern is removed.

## Assumptions Log

> List all claims tagged `[ASSUMED]` in this research. The planner and discuss-phase use this
> section to identify decisions that need user confirmation before execution.

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Supply rows serialized to localStorage will stay well under 5MB limit at expected scale (< 500 supplies per creation session) | Common Pitfalls | Would need IndexedDB fallback; extremely unlikely scenario |

**Previously assumed, now verified:**
- `createMany` with `skipDuplicates: true` is available in Prisma 7 -- VERIFIED in `src/generated/prisma/models/ProjectThread.ts`
- Catalog-only `createThread`/`createBead`/`createSpecialtyItem` server actions exist -- VERIFIED in `supply-actions.ts` lines 57, 141, and corresponding locations

**If this table has one entry:** Only the localStorage size claim is unverified. This is a low-risk assumption given typical usage patterns.

## Open Questions

1. **CalcParams persistence in draft**
   - What we know: D-05 says supply rows are backed up to localStorage. CalcParams (fabricCount, strandCount, overCount, wastePercent) should also be persisted to restore the calculator state.
   - What's unclear: Whether CalcParams should be a separate localStorage key or part of the unified draft.
   - Recommendation: Include CalcParams in the draft structure (DraftV2 pattern above). Single key, versioned format, one save/load cycle.

2. **Focus management on mode toggle**
   - What we know: UI-SPEC says "on transition to supply mode, focus moves to fabric dropdown in calculator card. On return to form, focus moves to the field that was last focused."
   - What's unclear: How to track "last focused field" in the form. The form has many inputs without a central focus tracking mechanism.
   - Recommendation: Use a `lastFocusedRef` that updates on focus events within the form container. On return to form mode, call `lastFocusedRef.current?.focus()`. If null, focus chart name input as fallback.

3. **CreationFlowAdapter createSupply return shape**
   - What we know: The `createSupply` method on `SupplyTableAdapter` returns `Promise<SupplySearchResult>`. ServerActionAdapter calls `createAndAddThread` which returns both thread AND junction data.
   - What's unclear: CreationFlowAdapter should call catalog-only `createThread` which returns `{ success, thread }`. The adapter needs to map this to `SupplySearchResult` format.
   - Recommendation: Call `createThread`, extract the thread data, construct a `SupplySearchResult` from it (same mapping as ServerActionAdapter's search method). Then `selectItem` in `useSupplyTable` picks it up for add-row population.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest |
| Config file | vitest.config.ts |
| Quick run command | `npm test -- --reporter=dot` |
| Full suite command | `npm test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TAKE-01 | Mode toggle: form collapses, supply table shows | unit | `npm test -- src/components/features/charts/chart-merged-form.test.tsx -t "supply mode"` | Extend existing |
| TAKE-01 | SummaryBar renders tokens from form values | unit | `npm test -- src/components/features/charts/form-primitives/summary-bar.test.tsx` | Wave 0 |
| TAKE-02 | Details link toggles back, form state preserved | unit | `npm test -- src/components/features/charts/chart-merged-form.test.tsx -t "details"` | Extend existing |
| TAKE-03 | Fabric selection auto-populates fabricCount | unit | `npm test -- src/components/features/charts/form-primitives/calculator-card.test.tsx` | Wave 0 |
| TAKE-03 | CreationFlowAdapter buffers rows, delegates search | unit | `npm test -- src/components/features/supply-table/creation-flow-adapter.test.ts` | Wave 0 |
| TAKE-04 | Calculator card segmented controls update CalcParams | unit | `npm test -- src/components/features/charts/form-primitives/calculator-card.test.tsx` | Wave 0 |
| TAKE-04 | batchAddSupplies server action validation + auth | unit | `npm test -- src/lib/actions/chart-actions.test.ts -t "batch"` | Extend existing |
| ALL | Atomic create with supplies in $transaction | unit | `npm test -- src/lib/actions/chart-actions.test.ts -t "supplies"` | Extend existing |
| ALL | Draft persistence with supply rows | unit | `npm test -- src/components/features/charts/use-draft-persistence.test.ts -t "supply"` | Extend existing |

### Sampling Rate
- **Per task commit:** `npm test -- --reporter=dot`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/components/features/charts/form-primitives/summary-bar.test.tsx` -- covers TAKE-01
- [ ] `src/components/features/charts/form-primitives/calculator-card.test.tsx` -- covers TAKE-03, TAKE-04
- [ ] `src/components/features/supply-table/creation-flow-adapter.test.ts` -- covers TAKE-03

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | `requireAuth()` in batchAddSupplies server action |
| V3 Session Management | no | No new session logic |
| V4 Access Control | yes | Project ownership verification in server action (user.id check) |
| V5 Input Validation | yes | Zod schema for batch supply input at server boundary |
| V6 Cryptography | no | No crypto operations |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Unauthorized supply creation for another user's project | Elevation of Privilege | `requireAuth()` + ownership check in $transaction (project.userId === user.id) |
| Tampered supply IDs in batch payload | Tampering | Zod validation of all IDs as non-empty strings; Prisma FK constraints verify IDs exist |
| Oversized batch payload (DoS) | Denial of Service | Add reasonable limit to batch size in Zod schema (e.g., max 500 supplies per type) |

## Sources

### Primary (HIGH confidence)
- React Activity API types -- verified in `node_modules/@types/react/index.d.ts` lines 1986-2006
- React Activity documentation -- fetched from Context7 (/reactjs/react.dev, topic "Activity")
- Prisma createMany/skipDuplicates -- verified in `src/generated/prisma/models/ProjectThread.ts`
- Existing codebase -- all referenced files read directly:
  - `chart-merged-form.tsx` (454 lines), `use-chart-form.ts` (393 lines)
  - `use-draft-persistence.ts` (70 lines), `chart-actions.ts` (388 lines)
  - `supply-actions.ts` (828 lines), `supply-table/types.ts` (99 lines)
  - `local-state-adapter.ts` (189 lines), `server-action-adapter.ts` (248 lines)
  - `supply-table.tsx` (237 lines), `use-supply-table.ts` (237 lines)
  - `calculator-settings-bar.tsx` (183 lines), `sticky-save-bar.tsx` (55 lines)
  - `segmented-type-toggle.tsx`, `editable-number.tsx`
  - `prisma/schema.prisma` (Fabric, ProjectThread, ProjectBead, ProjectSpecialty models)
- UI-SPEC -- `.planning/phases/13-supply-takeover/13-UI-SPEC.md` (approved)
- Design specs -- `.claude/skills/sketch-findings-cross-stitch-tracker/references/project-creation-form.md` and `supply-data-entry.md`

### Secondary (MEDIUM confidence)
- None

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- zero new dependencies, all components and patterns verified in codebase
- Architecture: HIGH -- adapter pattern is established, Activity API verified in installed React, transaction pattern exists in codebase, createMany verified in Prisma generated client
- Pitfalls: HIGH -- derived from direct code reading and established patterns in this project

**Research date:** 2026-05-13
**Valid until:** 2026-06-13 (stable -- all libraries already installed and proven in prior phases)
