# Phase 39: Accessibility & Performance - Context

**Gathered:** 2026-07-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix ARIA violations in clickable card rows (nested interactive elements) and optimize supply component render performance (useMemo for aggregation, SSR hydration fix). No new features — structural correctness and performance only.

Requirements: POLISH-01, POLISH-04.

</domain>

<decisions>
## Implementation Decisions

### Card Row ARIA Refactor (POLISH-01)

- **D-01:** Use the **stretched link pattern** to fix nested interactive violations. Replace `<div role="button" onClick={onNavigate}>` with a plain `<div>` containing a `<Link>` element stretched to fill the card via `position: absolute; inset: 0; z-index: 0`. Edit/delete buttons sit above via `position: relative; z-index: 10`. Screen readers see Link + buttons as siblings — no nesting.
- **D-02:** The stretched link uses a **visually hidden** label with `sr-only` class (e.g., "View {name}"). Card appearance stays identical to today — the entity name is already visible in the card body.
- **D-03:** **Remove the keyboard navigation handler entirely** (onKeyDown for Enter/Space). The `<Link>` element handles Enter natively. Space key is for buttons, not links — removing the handler is correct semantics.
- **D-04:** **Keep whole-card hover** effects. The stretched link fills the card, so hovering anywhere triggers the link's hover state. Existing shadow/border transition on the outer div via `group-hover` is preserved. No visual change from today.
- **D-05:** **Scope is exactly two components**: `storage-location-list.tsx` (StorageLocationCard) and `stitching-app-list.tsx` (StitchingAppCard). These are the only components with `role="button"` containing child buttons. Designer/genre rows, gallery cards, and chart-file-row are all structurally valid and out of scope.
- **D-06:** **Keep the two components separate** — do not extract a shared ClickableEntityCard component. Both files are small, each has domain-specific content, and the stretched link fix is ~5 lines per component. Extracting adds abstraction for minimal deduplication.

### SupplyOverview Memoization (POLISH-04)

- **D-07:** Wrap `aggregateSupplies()` and `filterAggregatedSupplies()` calls in `useMemo`. Dependency arrays: `[threads]`, `[beads]`, `[specialty]` for aggregation; `[aggregatedX, deferredSearch]` for filtering.
- **D-08:** **Memoize aggregation calls only** — do not memoize the derived boolean checks (`hasAny`, `hasFilteredResults`, `isSupplySearchActive`). These are trivial comparisons that don't benefit from memoization.

### SSR Hydration Fix (POLISH-04)

- **D-09:** Fix `supply-catalog.tsx` SSR hydration mismatch by replacing the `typeof window !== "undefined"` guard in `useState` initializer with a **`useEffect` post-mount** pattern. Initialize with `DEFAULT_VIEWS`, then `useEffect` reads localStorage and calls `setViewModes`.
- **D-10:** **No loading skeleton** for the post-mount flash. The flash only appears if the user previously changed the default view mode AND returns to the supplies page — barely perceptible single-frame shift.
- **D-11:** **Check whether gallery view modes have the same pattern** during implementation, but **do not fix** if found. Gallery's synchronous localStorage was an intentional PROJECT.md Key Decision with different trade-off analysis. Document findings in this phase's verification.

### Claude's Discretion

- How to structure plans (single plan vs. separate ARIA/performance plans)
- Exact `useMemo` dependency arrays after verifying all prop references
- Whether to add any TDD tests for the stretched link ARIA pattern (e.g., testing that no nested interactives exist in the rendered DOM)
- Whether `initialView` prop in supply-catalog needs special handling in the useEffect migration

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### ARIA Refactor Target Files
- `src/components/features/storage/storage-location-list.tsx` — StorageLocationCard: `<div role="button">` with nested edit/delete buttons (lines 233-260)
- `src/components/features/apps/stitching-app-list.tsx` — StitchingAppCard: `<div role="button">` with nested edit/delete buttons (lines 228-255)

### Performance Target Files
- `src/components/features/shopping/supply-overview.tsx` — SupplyOverview: unmemoized `aggregateSupplies()` and `filterAggregatedSupplies()` calls (lines 103-109)
- `src/components/features/supplies/supply-catalog.tsx` — SSR hydration: `typeof window` in useState initializer (lines 190-209)

### Pattern References (for context, not modification)
- `src/components/features/gallery/gallery-card.tsx` — Example of valid card with non-interactive container + Link children (no ARIA issue)
- `src/components/features/designers/designer-list.tsx` — Example of valid table row with Link + button children (tr not interactive itself)
- `src/components/features/charts/project-detail/chart-file-row.tsx` — `role="link"` without nested interactives (valid)

### Test Infrastructure
- `src/__tests__/mocks/factories.ts` — Mock factories for all domain objects
- `src/__tests__/test-utils.tsx` — Custom render wrapper (always import from here)

### Requirements
- `.planning/REQUIREMENTS.md` — POLISH-01 and POLISH-04 definitions

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Link` from `next/link` — used throughout the codebase for navigation, direct replacement for `role="button"` + `router.push`
- `sr-only` Tailwind class — already used in the project for visually hidden accessible text
- `useDeferredValue` — already used in SupplyOverview for search (line 89), pairs well with useMemo for the aggregation

### Established Patterns
- Stretched link pattern: not yet used in this project, but `gallery-card.tsx` uses a similar concept with `tabIndex={-1} aria-hidden="true"` on a decorative Link covering the card image
- `useEffect` for localStorage: established pattern in the codebase (shopping cart selection persistence uses this approach)
- `group-hover` for card hover effects: both target components already use `group` class on the outer container

### Integration Points
- Storage location detail pages at `/storage/[id]` — Link href target for StorageLocationCard
- Stitching app detail pages at `/apps/[id]` — Link href target for StitchingAppCard
- Supply catalog view mode persistence: `STORAGE_KEYS` constant defines localStorage keys per tab
- Backlog items 999.0.19 (ARIA), 999.58 (useMemo), 999.72 (SSR hydration) to be marked closed

</code_context>

<specifics>
## Specific Ideas

- For stretched link: use `<Link href={href} className="absolute inset-0 z-0"><span className="sr-only">View {name}</span></Link>` as the first child of the card container, add `relative` to the container, add `relative z-10` to the button group div
- Both storage and app cards have nearly identical structures — apply the same pattern to both
- For useMemo: 6 memoized values total (3 aggregations + 3 filtered), each with appropriate dependency arrays
- For supply catalog: the `initialView` prop should be preserved in the useEffect — it takes priority over localStorage for the threads tab

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 39-Accessibility & Performance*
*Context gathered: 2026-07-01*
