# Phase 16: Input & Dashboard Fixes - Context

**Gathered:** 2026-05-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix two specific UX issues: keyboard input reliability in the supply search flow (PortalAutocomplete keystroke drops) and visual proportions in the Dashboard Spotlight section (image sizing + button consistency). Also clean up orphaned SearchToAdd component (dead code from pre-v1.3).

</domain>

<decisions>
## Implementation Decisions

### Keystroke bug fix (INPUT-01)
- **D-01:** Single input architecture — remove the duplicate `<input>` from PortalAutocomplete. The portal becomes a results-only dropdown. All typing stays in the table row input in `supply-table-add-row.tsx`; keyboard navigation (`handleKeyDown`) moves from portal to the table row input.
- **D-02:** Add `useTransition` for `setIsSearching` in `use-supply-table.ts` — defer the state update so re-renders don't block typing.
- **D-03:** Fix adapter identity instability in `supplies-tab.tsx` — stabilize `router.refresh` via `useCallback` and remove `router` from `useMemo` deps to prevent debounce cancellation on re-render.
- **D-04:** Delete orphaned `SearchToAdd` component (`src/components/features/supplies/search-to-add.tsx` + test file) — dead code replaced by PortalAutocomplete in v1.3.

### Spotlight section sizing (DASH-01)
- **D-05:** Fixed 320px image column — change from `grid-cols-2` (50/50) to `grid-cols-[320px_1fr]` on desktop. Image displays as a gallery-card-sized thumbnail, content column stretches.
- **D-06:** Lower max height from 360px to 300px — `max-h-[300px]` on the grid container. Keeps `min-h-[260px]`.
- **D-07:** Image div retains `overflow-hidden` and `object-cover` — clips cleanly at the new constraints.

### Button consistency (DASH-02)
- **D-08:** Migrate "Check It Out" LinkButton from hardcoded emerald classes to `buttonVariants` default variant + `className="rounded-xl px-5 py-2.5 font-semibold"`. The `--primary` CSS var is already emerald, so dark mode works automatically without explicit `dark:` overrides.
- **D-09:** Bump "Shuffle Spotlight" button from `font-medium` to `font-semibold` for visual weight balance. Keep its semantic token styling (border-border, bg-card, text-muted-foreground).

### Claude's Discretion
- Exact `useTransition` wrapping scope (whether to wrap just `setIsSearching` or the entire fetch effect)
- How to handle the portal's ARIA attributes (`role="combobox"`, `aria-activedescendant`) when the input moves to the table row
- Whether to adjust `min-h-[260px]` on the Spotlight grid (may no longer be needed at 300px max)
- Test refactoring scope for PortalAutocomplete (must update tests to reflect removed input)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` — INPUT-01, DASH-01, DASH-02 requirements

### Keystroke bug — current implementation
- `src/components/features/supply-table/portal-autocomplete.tsx` — Portal dropdown with duplicate input (to be refactored to results-only)
- `src/components/features/supply-table/supply-table-add-row.tsx` — Table row with search input + portal integration
- `src/components/features/supply-table/use-supply-table.ts` — Search state, debounce, fetch via adapter
- `src/components/features/charts/project-detail/supplies-tab.tsx` — Adapter instantiation with unstable router dep

### Keystroke bug — orphaned code to delete
- `src/components/features/supplies/search-to-add.tsx` — Dead code, no consumers
- `src/components/features/supplies/search-to-add.test.tsx` — Tests for dead code

### Dashboard Spotlight
- `src/components/features/dashboard/spotlight-card.tsx` — Grid layout, image sizing, button styling (all changes here)
- `src/components/features/dashboard/main-dashboard.tsx` — Parent layout context (Spotlight is full-width)

### Design system
- `src/components/ui/button-variants.ts` — CVA variants; `default` variant maps to `--primary` (emerald)
- `src/components/ui/link-button.tsx` — LinkButton component used for "Check It Out"

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `buttonVariants` default variant: already maps to `--primary` (emerald-600 light / emerald-500 dark) — direct swap for hardcoded colors
- `LinkButton` component: wraps Next.js `Link` with `buttonVariants` — use for "Check It Out" migration
- `useTransition` from React: already used in SpotlightCard and SupplyTableAddRow — established pattern

### Established Patterns
- Controlled inputs with `useState` + debounced server action fetching via `useEffect` + `setTimeout`
- Portal rendering via `createPortal(dropdown, document.body)` for table stacking context escape
- ARIA combobox pattern (`role="combobox"`, `aria-activedescendant`, `role="listbox"`) in PortalAutocomplete

### Integration Points
- `supply-table-add-row.tsx` line 174-183: Table row search input — will become the sole input for typing
- `supply-table-add-row.tsx` line 188-199: PortalAutocomplete integration — `onSearchChange` prop becomes unnecessary when portal has no input
- `portal-autocomplete.tsx` line 165-179: Portal search input — to be removed
- `portal-autocomplete.tsx` line 111-139: `handleKeyDown` — needs to move to or be called from the table row input
- `spotlight-card.tsx` line 59: Grid container — sizing changes here
- `spotlight-card.tsx` lines 131-148: Action buttons — styling changes here

### Root Cause Analysis
- **Keystroke drops:** PortalAutocomplete mounts when first results arrive and auto-focuses its own input (line 85-88), stealing focus from the table row input mid-typing. Characters typed during the focus-jump window are lost.
- **Spotlight image dominance:** At 1100px container width, 50/50 split gives image ~550px width × up to 360px height — reads as a hero banner, not an accent. The DesignOS reference used placeholders without real-image sizing in mind.
- **Button visual imbalance:** Primarily `font-semibold` vs `font-medium` weight difference. Secondary: hardcoded emerald bypasses design system dark mode token flipping.

</code_context>

<specifics>
## Specific Ideas

- Cross-stitch chart images are typically portrait or square — at 320px wide they display as a recognizable thumbnail matching gallery card proportions
- The `--primary` CSS var in `globals.css` is `oklch(0.596 0.145 163.23)` (light) / `oklch(0.648 0.15 163.8)` (dark) — exactly what "Check It Out" manually replicates, confirming the swap is safe
- Single input architecture means the portal becomes purely a results panel — similar to how autocomplete dropdowns work in VS Code or GitHub search

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 16-input-dashboard-fixes*
*Context gathered: 2026-05-16*
