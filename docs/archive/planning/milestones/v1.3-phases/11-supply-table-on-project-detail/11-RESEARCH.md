# Phase 11: Supply Table on Project Detail - Research

**Researched:** 2026-05-10
**Domain:** Component integration / adapter pattern / React state management
**Confidence:** HIGH

## Summary

Phase 11 is primarily an integration phase -- wiring the Phase 10 `SupplyTable` component system into the project detail page's Supplies tab. The core component system (table, add row, autocomplete, donuts, inline editing) is complete and tested with 162 tests. The work centers on three deliverables: (1) a `ServerActionAdapter` class implementing `SupplyTableAdapter` against existing server actions, (2) a new `SuppliesTab` wrapper that replaces the existing 457-line component, and (3) closing the Phase 10 deferred animation item by extending the `Result` type to carry new junction IDs.

All server actions already exist (`addThreadToProject`, `addBeadToProject`, `addSpecialtyToProject`, `updateProjectSupplyQuantity`, `removeProject*`). The existing actions already return `{ success: true, record }` with junction record IDs on success. The adapter translates between the `SupplyTableAdapter` interface contract and these existing server actions, plus transforms Prisma junction types into `SupplyRow[]` format. Data revalidation uses the established `router.refresh()` pattern.

**Primary recommendation:** Build the ServerActionAdapter as a class (mirroring LocalStateAdapter), replace the old SuppliesTab component entirely, and extend the adapter `Result` type with an optional `id` field to close the animation deferred item.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Pass saved project values as read-only `calcParams` -- build from `project.strandCount`, `project.overCount`, `project.fabric?.count ?? 14`, `project.wastePercent` at the page level
- **D-02:** No settings editing UI on project detail in this phase -- defer CalculatorSettingsBar to Phase 13's styled calculator card (TAKE-04)
- **D-03:** The existing CalculatorSettingsBar component stays in the codebase untouched (per Phase 10 D-10) but is not mounted in the new SuppliesTab
- **D-04:** Carry the Added/A-Z sort toggle from the old supplies tab into the Phase 11 wrapper component
- **D-05:** Reuse the existing `sortItems()` logic -- parent pre-sorts `SupplyRow[]` arrays before passing to `SupplyTable`
- **D-06:** The SupplyTable component itself stays sort-unaware -- sorting is the parent's responsibility
- **D-07:** Server actions (addThread, addBead, addSpecialty) return the new junction record ID on success
- **D-08:** ServerActionAdapter stores the returned ID and signals it to the table as `newRowId` (or equivalent prop)
- **D-09:** The table animates only the identified new row using the existing slideIn CSS (opacity 0->1, translateY -6px->0, 0.2s ease)
- **D-10:** This closes the Phase 10 deferred item ("slideIn animation wiring needs adapter interface change in Phase 11")

### Claude's Discretion
- ServerActionAdapter implementation details and error handling patterns
- Data transformation approach (Prisma junction types -> SupplyRow[])
- Sort toggle placement and styling within the tab wrapper
- How newRowId is cleared after animation completes (timeout vs. onAnimationEnd)
- Empty state design for the new tab
- Test strategy for the ServerActionAdapter

### Deferred Ideas (OUT OF SCOPE)
- Calculator settings editing UI -- Phase 13 (TAKE-04)
- Per-column header sorting inside SupplyTable -- future data management phase
- Optimistic UI for supply mutations -- backlog (would provide instant feedback without router.refresh())
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| DETAIL-01 | User manages supplies on the project detail Supplies tab using the same unified supply table (view + add in one surface) | SupplyTable component system is complete with all sub-components. ServerActionAdapter bridges the adapter interface to existing server actions. New SuppliesTab wrapper replaces old 457-line component. |
| DETAIL-02 | User can add missed supplies on project detail via the persistent add row without navigating away | Persistent add row is built into SupplyTable. ServerActionAdapter calls addThreadToProject/addBeadToProject/addSpecialtyToProject. router.refresh() revalidates data without navigation. |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Supply CRUD operations | API / Backend (server actions) | -- | All mutations go through existing server actions with auth guard and ownership checks |
| Supply data fetching | Frontend Server (SSR) | -- | Page-level data fetching provides `supplies` prop via server component |
| Data transformation (Prisma -> SupplyRow) | Browser / Client | -- | Adapter transforms data in the client because the SupplyTable is a client component |
| Supply search / autocomplete | API / Backend | -- | adapter.searchSupplies delegates to server actions (getThreads/getBeads/getSpecialtyItems) |
| Sort toggle state | Browser / Client | -- | UI-only state, no persistence needed |
| Animation tracking (newRowId) | Browser / Client | -- | Client-side state tracks which row ID to animate |
| CalcParams derivation | Browser / Client | -- | Derived from project props at component mount time |

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.1.0 | Component framework | Project standard [VERIFIED: package.json] |
| Next.js | 16.0.0 | App Router, server actions, router.refresh() | Project standard [VERIFIED: package.json] |
| TypeScript | 5.8.3 | Strict types, no `any` | Project standard [VERIFIED: package.json] |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| sonner | 2.0.2 | Toast notifications for error feedback | On server action failure [VERIFIED: package.json] |
| lucide-react | 0.487.0 | Icons (Palette, CircleDot, Sparkles for sections) | Section divider icons [VERIFIED: package.json] |
| vitest | 3.1.2 | Unit testing | All tests [VERIFIED: package.json] |
| @testing-library/react | 16.3.0 | Component testing | Test rendering and interactions [VERIFIED: package.json] |

### Alternatives Considered
No alternatives -- this phase uses exclusively existing project libraries with zero new dependencies. [VERIFIED: CONTEXT.md specifics]

**Installation:**
No new packages to install.

## Architecture Patterns

### System Architecture Diagram

```
Page (Server Component)
  |
  | fetches supplies via Prisma queries
  v
ProjectDetailPage (Client Component)
  |
  | passes: project, supplies, chartId
  v
SuppliesTab (NEW - Client Component)
  |
  |-- derives calcParams from project fields
  |-- manages sort state (Added/A-Z)
  |-- transforms Prisma types -> SupplyRow[]
  |-- pre-sorts SupplyRow[] arrays
  |-- tracks newRowId for animation
  |
  v
SupplyTable (Phase 10 - unchanged)
  |
  |-- renders AddRow, DataRows, SectionDividers, Footer
  |-- delegates operations to adapter
  |
  v
ServerActionAdapter (NEW - implements SupplyTableAdapter)
  |
  |-- addThread -> addThreadToProject() server action
  |-- addBead -> addBeadToProject() server action
  |-- addSpecialty -> addSpecialtyToProject() server action
  |-- updateQuantity -> updateProjectSupplyQuantity() server action
  |-- remove -> removeProjectThread/Bead/Specialty() server actions
  |-- searchSupplies -> getThreads/getBeads/getSpecialtyItems() server actions
  |-- createSupply -> createAndAddThread/Bead/Specialty() server actions
  |
  | returns Result (extended with optional id for animation)
  v
router.refresh() -> Server re-fetches -> UI re-renders with new data
```

### Recommended Project Structure
```
src/components/features/supply-table/
  server-action-adapter.ts          # NEW: ServerActionAdapter class
  server-action-adapter.test.ts     # NEW: adapter unit tests
  types.ts                          # MODIFIED: extend Result type with optional id

src/components/features/charts/project-detail/
  supplies-tab.tsx                  # REPLACED: new wrapper using SupplyTable
  supplies-tab.test.tsx             # REPLACED: new tests for new wrapper
```

### Pattern 1: ServerActionAdapter (Adapter Pattern)

**What:** A class implementing `SupplyTableAdapter` that wraps existing server actions, handles field name mapping, and manages data revalidation via `router.refresh()`.

**When to use:** When the SupplyTable needs to persist changes to a real database via server actions (as opposed to LocalStateAdapter's in-memory storage).

**Example:**
```typescript
// Source: codebase analysis of supply-actions.ts and types.ts
export class ServerActionAdapter implements SupplyTableAdapter {
  constructor(
    private projectId: string,
    private refreshFn: () => void,
  ) {}

  async addThread(threadId: string, stitchCount: number, need: number): Promise<Result> {
    const result = await addThreadToProject({
      projectId: this.projectId,
      threadId,
      stitchCount,
      quantityRequired: need,
      quantityAcquired: 0,
    });
    if (result.success) {
      this.refreshFn();
      return { success: true, id: result.record.id };
    }
    return { success: false, error: result.error ?? "Failed to add thread" };
  }

  async updateQuantity(
    type: SupplyType,
    junctionId: string,
    field: "stitchCount" | "need" | "have",
    value: number,
  ): Promise<Result> {
    // Map adapter field names to Prisma field names
    const fieldMap: Record<string, Record<string, unknown>> = {
      stitchCount: { stitchCount: value },
      need: { quantityRequired: value, isNeedOverridden: true },
      have: { quantityAcquired: value },
    };
    const typeMap: Record<SupplyType, "thread" | "bead" | "specialty"> = {
      THREAD: "thread", BEAD: "bead", SPECIALTY: "specialty",
    };
    const result = await updateProjectSupplyQuantity(junctionId, typeMap[type], fieldMap[field]);
    if (result.success) this.refreshFn();
    return result;
  }
  // ... search, remove, createSupply methods follow same pattern
}
```

### Pattern 2: Data Transformation (Prisma -> SupplyRow)

**What:** Converting Prisma junction records with includes into the normalized `SupplyRow` type that SupplyTable consumes.

**When to use:** In the SuppliesTab wrapper before passing data to SupplyTable.

**Example:**
```typescript
// Source: existing supplies-tab.tsx transformation logic + supply-table types.ts
function prismaThreadToSupplyRow(pt: ProjectThreadWithThread): SupplyRow {
  return {
    id: pt.id,                    // junction table ID
    supplyId: pt.threadId,        // supply catalog ID
    type: "THREAD",
    code: pt.thread.colorCode,
    name: pt.thread.colorName,
    brandName: pt.thread.brand.name,
    hexColor: pt.thread.hexColor,
    stitchCount: pt.stitchCount,
    need: pt.quantityRequired,
    have: pt.quantityAcquired,
    isNeedOverridden: pt.isNeedOverridden,
  };
}
```

### Pattern 3: Animation Wiring (newRowId flow)

**What:** Extending the `Result` type with an optional `id` field so the adapter can signal which row was just added. The SupplyTable's existing `newRowIds` state + `isNew` prop on DataRow + `animate-slide-in` CSS class complete the chain.

**When to use:** After a successful add operation, the adapter returns `{ success: true, id: "junction-id" }`. The parent component (SuppliesTab) captures this ID and passes it to SupplyTable (or SupplyTable extracts it from the adapter result).

**Key insight:** The animation CSS (`animate-slide-in`) and the `isNew` prop on `SupplyTableDataRow` are already implemented. The missing link is: (1) extending `Result` to carry an ID, (2) having `handleRowAdded` in SupplyTable populate `newRowIds`, and (3) clearing the set after animation completes.

**Example:**
```typescript
// types.ts change
export type Result =
  | { success: true; id?: string }
  | { success: false; error: string };

// SupplyTable handleRowAdded update
const handleRowAdded = useCallback((newId?: string) => {
  if (newId) {
    setNewRowIds(prev => new Set(prev).add(newId));
    // Clear after animation duration (200ms + buffer)
    setTimeout(() => {
      setNewRowIds(prev => {
        const next = new Set(prev);
        next.delete(newId);
        return next;
      });
    }, 250);
  }
}, []);
```

### Pattern 4: Sort Pre-Processing (Parent Responsibility)

**What:** Sorting `SupplyRow[]` arrays in the parent wrapper before passing to SupplyTable.

**When to use:** Always. SupplyTable is sort-unaware per D-06.

**Example:**
```typescript
// Source: existing supplies-tab.tsx line 108-113
function sortSupplyRows(items: SupplyRow[], sortOption: SupplySortOption): SupplyRow[] {
  if (sortOption === "alpha") {
    return [...items].sort((a, b) =>
      a.code.localeCompare(b.code, undefined, { numeric: true })
    );
  }
  return items; // "added" = insertion order (from server)
}
```

### Anti-Patterns to Avoid
- **Mounting CalculatorSettingsBar:** D-02/D-03 explicitly forbid settings UI in this phase. The old SuppliesTab mounted it, but the new one must not.
- **Making SupplyTable sort-aware:** D-06 says sorting is the parent's job. Do not add sort state or logic inside SupplyTable.
- **Passing stale calcParams:** D-01 requires reading from the actual project fields (strandCount, overCount, wastePercent, fabric.count). Do not hardcode defaults.
- **Calling server actions directly from SupplyTable:** All data operations must go through the adapter interface. SupplyTable should never import from `supply-actions.ts`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Supply table UI | Any new table components | `SupplyTable` from Phase 10 | 10 sub-components, 162 tests, keyboard flow, portal autocomplete |
| Skein calculation | Custom formula | `calculateSkeins()` from `@/lib/utils/skein-calculator` | Complex formula with edge cases |
| Data revalidation | Manual state sync or SWR | `router.refresh()` | Established pattern, server-component data refetch |
| Search debouncing | Custom debounce utility | `useSupplyTable` hook (built-in 150ms debounce) | Already handles race conditions and cancellation |
| Toast notifications | Custom notification UI | `sonner` toast | Project standard |

**Key insight:** This phase creates only 2 new files (ServerActionAdapter + new SuppliesTab wrapper). Everything else is reused from Phase 10 or existing code.

## Common Pitfalls

### Pitfall 1: Field Name Mismatch Between Adapter and Server Actions
**What goes wrong:** The `SupplyTableAdapter` interface uses `"stitchCount" | "need" | "have"` as field names, but the server action's `updateQuantitySchema` expects `stitchCount`, `quantityRequired`, `quantityAcquired`. Passing adapter field names directly to the server action fails Zod validation.
**Why it happens:** Two different naming conventions: the adapter uses UI-friendly names, the server uses database column names.
**How to avoid:** Create a field mapping in `updateQuantity()`: `need` -> `quantityRequired`, `have` -> `quantityAcquired`, `stitchCount` -> `stitchCount`.
**Warning signs:** Zod validation errors in the server action response.

### Pitfall 2: isNeedOverridden Not Set When User Manually Edits Need
**What goes wrong:** When the user manually edits the "need" value via inline editing, `isNeedOverridden` must be set to `true` in the database so the auto-calc sparkle indicator disappears. If the adapter doesn't include `isNeedOverridden: true` in the update payload, the sparkle persists even after manual override.
**Why it happens:** The `updateQuantity` field mapping for "need" must include `isNeedOverridden: true` alongside `quantityRequired`.
**How to avoid:** When field is "need", send `{ quantityRequired: value, isNeedOverridden: true }` to the server action.
**Warning signs:** Sparkle icon still showing after user manually changes the need value.

### Pitfall 3: Search Actions Return Different Shapes Than SupplySearchResult
**What goes wrong:** `getThreads()` returns `ThreadWithBrand[]` (Prisma types with `colorCode`, `colorName`, etc.), but `adapter.searchSupplies()` must return `SupplySearchResult[]` (with `code`, `name`, `brandId`, etc.). Direct passthrough fails.
**Why it happens:** The server actions predate the adapter interface and use Prisma model field names.
**How to avoid:** Map the server action results in the adapter: `thread.colorCode` -> `code`, `thread.colorName` -> `name`, `thread.id` -> `id`, etc.
**Warning signs:** TypeScript compilation errors or undefined values in autocomplete dropdown.

### Pitfall 4: Duplicate Supply Detection Not Using SupplyRow.supplyId
**What goes wrong:** The add row needs to know which supplies are already added (to show them as disabled in autocomplete). The `existingSupplyIds` prop expects supply catalog IDs (`supplyId`), not junction table IDs (`id`).
**Why it happens:** Confusion between junction ID and supply catalog ID.
**How to avoid:** Build `existingSupplyIds` from the `supplyId` field of each `SupplyRow`, not the `id` field.
**Warning signs:** Already-added supplies appearing as selectable in the autocomplete dropdown.

### Pitfall 5: router.refresh() After Server Action Revalidation Race
**What goes wrong:** Server actions call `revalidatePath()` internally, AND the adapter calls `router.refresh()`. These are complementary, not redundant -- `revalidatePath` invalidates the cache, `router.refresh()` triggers the client to re-fetch. However, calling `router.refresh()` on error causes unnecessary re-fetches.
**Why it happens:** Unclear about when to call `router.refresh()`.
**How to avoid:** Only call `router.refresh()` when the server action returns `success: true`. On failure, show a toast error without refreshing.
**Warning signs:** Unnecessary data flicker on error, or stale data after successful mutations.

### Pitfall 6: SupplyType Case Mismatch
**What goes wrong:** The adapter interface uses uppercase `SupplyType` ("THREAD", "BEAD", "SPECIALTY") but `updateProjectSupplyQuantity` expects lowercase `type` parameter ("thread", "bead", "specialty").
**Why it happens:** Two different conventions in the codebase -- the unified table uses uppercase enums, the older server actions use lowercase strings.
**How to avoid:** Map uppercase to lowercase in the adapter: `THREAD` -> `"thread"`, etc.
**Warning signs:** TypeScript errors or server action 500s from unrecognized type values.

## Code Examples

### ServerActionAdapter Complete Interface Mapping

```typescript
// Source: codebase analysis of supply-actions.ts return types
// Server action -> Adapter method mapping:

// addThreadToProject(formData)     -> adapter.addThread(threadId, stitchCount, need)
//   formData: { projectId, threadId, stitchCount, quantityRequired, quantityAcquired: 0 }
//   returns: { success: true, record: ProjectThread } | { success: false, error: string }

// addBeadToProject(formData)       -> adapter.addBead(beadId, quantity, need)
//   formData: { projectId, beadId, quantityRequired, quantityAcquired: 0 }
//   returns: { success: true, record: ProjectBead } | { success: false, error: string }

// addSpecialtyToProject(formData)  -> adapter.addSpecialty(itemId, need)
//   formData: { projectId, specialtyItemId, quantityRequired, quantityAcquired: 0 }
//   returns: { success: true, record: ProjectSpecialty } | { success: false, error: string }

// updateProjectSupplyQuantity(id, type, formData) -> adapter.updateQuantity(type, id, field, value)
//   type: "thread" | "bead" | "specialty" (lowercase!)
//   formData: { quantityRequired?, quantityAcquired?, stitchCount?, isNeedOverridden? }
//   returns: { success: true } | { success: false, error: string }

// removeProjectThread(id)   -> adapter.remove("THREAD", junctionId)
// removeProjectBead(id)     -> adapter.remove("BEAD", junctionId)
// removeProjectSpecialty(id) -> adapter.remove("SPECIALTY", junctionId)
//   returns: { success: true } | { success: false, error: string }

// getThreads(undefined, undefined, query) -> adapter.searchSupplies("THREAD", query)
// getBeads(query)                         -> adapter.searchSupplies("BEAD", query)
// getSpecialtyItems(query)                -> adapter.searchSupplies("SPECIALTY", query)
//   returns: raw Prisma types -> must map to SupplySearchResult[]

// createAndAddThread(formData)     -> adapter.createSupply("THREAD", data)
// createAndAddBead(formData)       -> adapter.createSupply("BEAD", data)
// createAndAddSpecialty(formData)   -> adapter.createSupply("SPECIALTY", data)
//   returns: { success: true, record: { thread/bead/item, link } }
//   -> must map to SupplySearchResult
```

### CalcParams Derivation Pattern

```typescript
// Source: CONTEXT.md D-01 + project-detail types
const calcParams: Partial<CalcParams> = {
  fabricCount: project.fabric?.count ?? 14,
  strandCount: project.strandCount,
  overCount: project.overCount, // already narrowed to 1 | 2 in ProjectDetailPage
  wastePercent: project.wastePercent,
};
```

### Search Result Transformation

```typescript
// Source: codebase analysis of supply types vs SupplySearchResult
// getThreads returns ThreadWithBrand: { id, colorCode, colorName, hexColor, brandId, brand: { name } }
// adapter.searchSupplies must return SupplySearchResult: { id, type, code, name, brandName, brandId, hexColor }

function threadToSearchResult(t: ThreadWithBrand): SupplySearchResult {
  return {
    id: t.id,
    type: "THREAD",
    code: t.colorCode,
    name: t.colorName,
    brandName: t.brand.name,
    brandId: t.brandId,
    hexColor: t.hexColor,
  };
}

// Similar for beads: productCode -> code, colorName -> name
// Similar for specialty: productCode -> code, colorName -> name
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Old SuppliesTab (457 lines) with SupplySection, SupplyRow, SearchToAdd, InlineSupplyCreate, CalculatorSettingsBar | New SuppliesTab (~100 lines) with SupplyTable + ServerActionAdapter | Phase 11 | Replaces 5+ component integrations with 1 component + 1 adapter |
| LocalStateAdapter only (in-memory) | ServerActionAdapter (persistent via server actions) | Phase 11 | First real adapter implementation against the database |
| Empty handleRowAdded callback | Working newRowId animation flow | Phase 11 | Closes Phase 10 deferred item D-10 |

**Deprecated/outdated after Phase 11:**
- Old `SuppliesTab` in `supplies-tab.tsx`: Replaced entirely. The old file used `SupplySection`, `SupplyFooterTotals`, `CalculatorSettingsBar`, `SearchToAdd`, and `InlineSupplyCreate` directly. These old sub-components are NOT removed yet (that's Phase 14 CLEAN-01) but will be unused by the project detail page.

## Assumptions Log

> List all claims tagged `[ASSUMED]` in this research. The planner and discuss-phase use this
> section to identify decisions that need user confirmation before execution.

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | The `Result` type can be extended with an optional `id` field without breaking existing consumers (LocalStateAdapter, useSupplyTable) | Architecture Patterns / Pattern 3 | Low -- `id` is optional, so existing code that doesn't use it is unaffected. TypeScript would catch any issues. |
| A2 | `handleRowAdded` callback in SupplyTable can be updated to accept a `newId` parameter without breaking the add-row component | Architecture Patterns / Pattern 3 | Low -- the callback currently accepts no args and does nothing. Adding an optional arg is backward compatible. |
| A3 | The `createAndAdd*` server actions return enough data to construct a `SupplySearchResult` for the `createSupply` adapter method | Code Examples | Low -- verified that they return `{ thread/bead/item, link }` with full record data. |

**If this table is empty:** Most claims were verified directly from the codebase. The three assumptions above are low-risk and can be confirmed during implementation via TypeScript compilation.

## Open Questions

1. **How should the SupplyTable receive newRowId?**
   - What we know: SupplyTable has `newRowIds` state and `handleRowAdded` callback. The adapter can return the new ID. The CONTEXT says "signals it to the table as newRowId (or equivalent prop)".
   - What's unclear: Whether to (a) add a `newRowId` prop to `SupplyTableProps` that the parent sets after adapter.add* returns, or (b) modify `handleRowAdded` to accept the ID and let SupplyTable manage it internally.
   - Recommendation: Option (b) -- modify `handleRowAdded` to accept an optional ID. This keeps the animation state internal to SupplyTable and the parent just passes the ID through. Simpler interface for the parent. The `onRowAdded` callback on `SupplyTableAddRow` already gets called after commit, so it can be threaded through.

2. **Should the new SuppliesTab replace the old file or be a new file?**
   - What we know: The old `supplies-tab.tsx` is 457 lines with many imports from old components. The new one will be ~100 lines.
   - What's unclear: Whether to overwrite the file or create alongside it.
   - Recommendation: Overwrite the existing file. The old component's sub-components (SupplySection, SupplyRow, etc.) are still used by the old tab's empty state, but Phase 14 CLEAN-01 will remove them. Overwriting now and updating imports is cleaner than maintaining two files.

3. **Animation cleanup: timeout vs onAnimationEnd?**
   - What we know: D-09 specifies 0.2s ease animation. The UI-SPEC suggests either `onAnimationEnd` callback or 250ms timeout.
   - Recommendation: Use `setTimeout(250)` -- it's simpler and the `<tr>` element doesn't easily support `onAnimationEnd` in React without a ref. A 250ms timeout (animation duration + 50ms buffer) is reliable enough.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 3.1.2 + @testing-library/react 16.3.0 |
| Config file | `vitest.config.ts` |
| Quick run command | `npx vitest run --reporter=verbose src/components/features/supply-table/server-action-adapter.test.ts src/components/features/charts/project-detail/supplies-tab.test.tsx` |
| Full suite command | `npm test` |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DETAIL-01 | Unified supply table renders on project detail Supplies tab with grouped sections, donuts, inline editing | integration | `npx vitest run src/components/features/charts/project-detail/supplies-tab.test.tsx -x` | Exists but needs rewrite for new component |
| DETAIL-01 | CalcParams derived correctly from project fields | unit | `npx vitest run src/components/features/charts/project-detail/supplies-tab.test.tsx -x` | Wave 0 |
| DETAIL-01 | Sort toggle (Added/A-Z) pre-sorts SupplyRow arrays before passing to SupplyTable | unit | `npx vitest run src/components/features/charts/project-detail/supplies-tab.test.tsx -x` | Wave 0 |
| DETAIL-02 | ServerActionAdapter.addThread calls addThreadToProject with correct data shape | unit | `npx vitest run src/components/features/supply-table/server-action-adapter.test.ts -x` | Wave 0 |
| DETAIL-02 | ServerActionAdapter.addBead calls addBeadToProject with correct data shape | unit | `npx vitest run src/components/features/supply-table/server-action-adapter.test.ts -x` | Wave 0 |
| DETAIL-02 | ServerActionAdapter.addSpecialty calls addSpecialtyToProject with correct data shape | unit | `npx vitest run src/components/features/supply-table/server-action-adapter.test.ts -x` | Wave 0 |
| DETAIL-02 | ServerActionAdapter.updateQuantity maps field names correctly (need -> quantityRequired + isNeedOverridden) | unit | `npx vitest run src/components/features/supply-table/server-action-adapter.test.ts -x` | Wave 0 |
| DETAIL-02 | ServerActionAdapter.remove delegates to correct removeProject* action based on type | unit | `npx vitest run src/components/features/supply-table/server-action-adapter.test.ts -x` | Wave 0 |
| DETAIL-02 | ServerActionAdapter.searchSupplies transforms Prisma types to SupplySearchResult | unit | `npx vitest run src/components/features/supply-table/server-action-adapter.test.ts -x` | Wave 0 |
| D-07/D-10 | addThread/addBead/addSpecialty return new junction ID in Result | unit | `npx vitest run src/components/features/supply-table/server-action-adapter.test.ts -x` | Wave 0 |
| D-09 | New row gets animate-slide-in class when newRowId is set | unit | Already exists in `supply-table-data-row.test.tsx` line 167 | Exists |

### Sampling Rate
- **Per task commit:** `npx vitest run src/components/features/supply-table/server-action-adapter.test.ts src/components/features/charts/project-detail/supplies-tab.test.tsx -x`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `src/components/features/supply-table/server-action-adapter.test.ts` -- covers DETAIL-02, D-07/D-10
- [ ] `src/components/features/charts/project-detail/supplies-tab.test.tsx` -- needs full rewrite for new component (covers DETAIL-01)
- [ ] `src/components/features/supply-table/types.ts` -- Result type extension (no test needed, TypeScript enforces)

*(Existing test infrastructure covers test framework setup, mock factories, and all Phase 10 supply-table component tests.)*

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | `requireAuth()` in all server actions -- already implemented [VERIFIED: supply-actions.ts] |
| V3 Session Management | no | No session changes in this phase |
| V4 Access Control | yes | Project ownership verification before mutations -- already implemented in all junction actions [VERIFIED: supply-actions.ts lines 400-407, 438-445, 475-482] |
| V5 Input Validation | yes | Zod schemas at server action boundary -- already implemented [VERIFIED: supply validations] |
| V6 Cryptography | no | No crypto operations in this phase |

### Known Threat Patterns for This Phase

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Unauthorized supply modification | Elevation of privilege | `requireAuth()` + `project.userId !== user.id` check on every mutation [VERIFIED: already implemented] |
| Invalid data injection via adapter | Tampering | Zod validation in server actions catches invalid payloads [VERIFIED: supply validations] |
| IDOR on junction IDs | Information disclosure | Ownership check verifies junction record belongs to user's project [VERIFIED: supply-actions.ts] |

**Note:** No new server actions are created in this phase. The ServerActionAdapter is a client-side class that delegates to existing, already-secured server actions. Security posture is inherited from Phase 4 supply action implementation.

## Sources

### Primary (HIGH confidence)
- `src/components/features/supply-table/types.ts` -- SupplyTableAdapter interface, SupplyRow, Result type, CalcParams
- `src/components/features/supply-table/local-state-adapter.ts` -- Reference adapter implementation
- `src/components/features/supply-table/supply-table.tsx` -- SupplyTable component with newRowIds state
- `src/components/features/supply-table/supply-table-data-row.tsx` -- isNew prop and animate-slide-in class
- `src/components/features/supply-table/use-supply-table.ts` -- Hook with commitRow return type and search debounce
- `src/components/features/charts/project-detail/supplies-tab.tsx` -- Old SuppliesTab being replaced (457 lines)
- `src/components/features/charts/project-detail/project-detail-page.tsx` -- Parent component integration point
- `src/components/features/charts/project-detail/types.ts` -- SupplySortOption, CalculatorSettings, ProjectDetailProps
- `src/lib/actions/supply-actions.ts` -- All server actions with return types
- `src/lib/validations/supply.ts` -- Zod schemas for junction operations
- `src/types/supply.ts` -- Prisma junction types with includes
- `src/app/globals.css` lines 270-295 -- slideIn animation CSS
- `.planning/phases/11-supply-table-on-project-detail/11-CONTEXT.md` -- D-01 through D-10 decisions
- `.planning/phases/11-supply-table-on-project-detail/11-UI-SPEC.md` -- Visual and interaction contracts

### Secondary (MEDIUM confidence)
- `.claude/skills/sketch-findings-cross-stitch-tracker/references/supply-data-entry.md` -- Design spec (already implemented in Phase 10)

### Tertiary (LOW confidence)
- None -- all findings verified from codebase.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- zero new dependencies, all existing libraries
- Architecture: HIGH -- adapter pattern is well-defined with reference implementation, all server actions verified
- Pitfalls: HIGH -- identified from direct codebase analysis of type mismatches and field name differences

**Research date:** 2026-05-10
**Valid until:** 2026-06-10 (stable -- no external dependencies or version-sensitive APIs)
