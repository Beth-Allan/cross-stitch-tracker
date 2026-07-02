# Phase 36: Type Safety - Context

**Gathered:** 2026-07-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Tighten type definitions so compile-time checks enforce domain invariants — eliminating runtime null checks, invalid state combinations, and `as` type casts. Pure type-system improvements with no feature or behavioral changes.

Requirements: QUAL-04, QUAL-05, QUAL-06, QUAL-07, QUAL-08.

</domain>

<decisions>
## Implementation Decisions

### StrandCount Literal Union (QUAL-04)

- **D-01:** Create a shared `StrandCount` type alias (`1 | 2 | 3 | 4 | 5 | 6`) in a new file `src/types/supply.ts`. Export the type and an `isStrandCount` type guard.
- **D-02:** `CalcParams.strandCount` in `supply-table/types.ts` imports and uses `StrandCount` from `src/types/supply.ts`.
- **D-03:** `skein-calculator.ts` `CalculateParams.strandCount` narrows from `number` to `StrandCount` — the calculator should reject invalid values at compile time, not just runtime.
- **D-04:** `project-detail/types.ts` `strandCount` narrows from `number` to `StrandCount`.
- **D-05:** The `as` cast in `supplies-tab.tsx:100` (`project.strandCount as CalcParams["strandCount"]`) is replaced with a Zod validation or `isStrandCount` guard at the Prisma→app boundary. Prisma's `Int` stays as-is — validation happens at the query result layer.
- **D-06:** `supply.ts` Zod schema (`z.number().int().min(1).max(6)`) remains as the runtime boundary check; the new type guard is the compile-time equivalent.

### OptionalFocalPoint Discriminated Union (QUAL-05)

- **D-07:** Replace the current `OptionalFocalPoint` interface with a both-or-neither discriminated union type:
  ```typescript
  type OptionalFocalPoint =
    | { focalPointX: number; focalPointY: number }
    | { focalPointX: null; focalPointY: null };
  ```
- **D-08:** Add a `mapFocalPoint(x: number | null, y: number | null): OptionalFocalPoint` helper co-located in `src/types/focal-point.ts`. This maps raw Prisma results (independent nullable fields) into the validated union.
- **D-09:** Each query that selects focal point fields (dashboard-actions, gallery-utils, designer/genre/series detail queries) calls `mapFocalPoint` to produce the union type. No `as` assertions.
- **D-10:** All 10+ consumer types (6 dashboard interfaces, GalleryCardData, GenreChart, DesignerChart, SeriesChart) continue using `extends OptionalFocalPoint` — the intersection pattern is unchanged; only the underlying type shape changes.

### Co-Dependent Props & Collection Types (QUAL-06, QUAL-07)

- **D-11:** `SuppliesTab` co-dependent props `fabricOptions` + `chartId` collapse into a single optional object prop:
  ```typescript
  calculator?: { fabricOptions: FabricOption[]; chartId: string }
  ```
  Component checks `if (calculator)` instead of `if (fabricOptions && chartId)`.
- **D-12:** `SuppliesTab` `persistFields` type narrows from `Record<string, number>` to `Partial<Pick<CalcParams, 'strandCount' | 'overCount' | 'wastePercent'>>`.
- **D-13:** `AggregatedSupply.items` uses a non-empty tuple type: `[ShoppingSupplyNeed, ...ShoppingSupplyNeed[]]`. Encodes the at-least-one invariant from the `aggregateSupplies` function at the type level.
- **D-14:** `onUpdateAcquired` callback type extracted to `src/types/shopping.ts` as a shared type alias:
  ```typescript
  type OnUpdateAcquired = (type: SupplyType, junctionId: string, newValue: number) => void
  ```
  All 4 component interfaces (2 in project-accordion, 1 in supply-overview, 1 in shopping-cart) import from there.

### Controlled-Only Simplification (QUAL-08)

- **D-15:** `InlineDesignerDialog`: delete all uncontrolled code paths — `trigger` prop, `uncontrolledOpen` state, `isControlled` branching, `DialogTrigger`, and the `useState` ref hack for syncing `initialName`. Props become `open` (required), `onOpenChange` (required), `initialName`, `onSubmit`. Only used once in `chart-merged-form.tsx`, always in controlled mode.
- **D-16:** `LocalStateAdapter.updateQuantity`: narrow `field: string` to a constrained union of the actual updatable `SupplyRow` fields (e.g., `keyof Pick<SupplyRow, 'stitchCount' | 'need' | 'have' | 'isNeedOverridden'>`). Remove the `as unknown as Record<string, unknown>` cast — field indexing becomes type-safe via the narrowed parameter.

### Claude's Discretion

- Ordering of type changes across plans (whether to do all type definitions first, or group by requirement)
- Exact field names in the LocalStateAdapter `field` union (verify actual usage before narrowing)
- Whether `isStrandCount` guard should be a function or a Zod schema — pick whichever fits the existing validation patterns better
- How to handle the `mapFocalPoint` call sites — whether to add it in each query individually or create a shared query-result mapper

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Type Definitions
- `src/types/focal-point.ts` — Current OptionalFocalPoint interface (will be replaced with union)
- `src/types/dashboard.ts` — 6 interfaces extending OptionalFocalPoint
- `src/types/genre.ts` — GenreChart type using OptionalFocalPoint
- `src/types/designer.ts` — DesignerChart type using OptionalFocalPoint
- `src/types/series.ts` — SeriesChart type using OptionalFocalPoint
- `src/components/features/supply-table/types.ts` — CalcParams with strandCount, SupplyRow fields
- `src/components/features/gallery/gallery-types.ts` — GalleryCardData extending OptionalFocalPoint

### Implementation Files
- `src/lib/utils/skein-calculator.ts` — CalculateParams.strandCount currently `number`
- `src/components/features/charts/project-detail/supplies-tab.tsx` — `as` cast at line 100, persistFields at line 129
- `src/components/features/charts/project-detail/types.ts` — strandCount as `number`
- `src/components/features/shopping/supply-overview.tsx` — AggregatedSupply interface, onUpdateAcquired
- `src/components/features/shopping/project-accordion.tsx` — 2 onUpdateAcquired prop definitions
- `src/components/features/charts/inline-designer-dialog.tsx` — Uncontrolled paths to remove
- `src/components/features/supply-table/local-state-adapter.ts` — `as unknown as` cast at line 130

### Validation
- `src/lib/validations/supply.ts` — Zod schema for strandCount (line 95)

### Requirements
- `.planning/REQUIREMENTS.md` — QUAL-04 through QUAL-08 definitions with backlog item references

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/types/focal-point.ts` — Small file, easy to modify in-place for the union type
- `src/lib/validations/supply.ts` — Existing Zod validation for strandCount min/max
- `CalcParams` in `supply-table/types.ts` — Already has the literal union for strandCount; other consumers need to match

### Established Patterns
- Type intersection via `extends` / `&` — All OptionalFocalPoint consumers use this pattern, preserved by the union change
- Server action return type: `{ success: true, data } | { success: false, error }` — discriminated union pattern already established
- Shared type files in `src/types/` — genre.ts, designer.ts, dashboard.ts, series.ts, focal-point.ts — new files (supply.ts, shopping.ts) follow existing convention

### Integration Points
- Prisma query results → `mapFocalPoint` → typed components (new boundary for focal point)
- Prisma `Int` → `isStrandCount` guard → `StrandCount` type (new boundary for strand count)
- `SuppliesTab` prop changes affect `chart-detail-page.tsx` (the only caller)
- `InlineDesignerDialog` prop changes affect `chart-merged-form.tsx` (the only caller)

</code_context>

<specifics>
## Specific Ideas

- `StrandCount` type and `isStrandCount` guard go in `src/types/supply.ts` (new file alongside focal-point.ts)
- `OnUpdateAcquired` callback type goes in `src/types/shopping.ts` (new file)
- `mapFocalPoint` helper co-locates with the type in `src/types/focal-point.ts`
- The `useState` ref hack in InlineDesignerDialog (lines 42-46) is replaced with a standard `useEffect` that syncs `initialName` when `open` transitions to true, or removed entirely if the controlled parent handles it

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 36-Type Safety*
*Context gathered: 2026-07-01*
