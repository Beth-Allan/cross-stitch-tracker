# Phase 26: UX Polish - Context

**Gathered:** 2026-05-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Fix 14 accessibility violations, visual inconsistencies, and component affordance gaps across existing UI. No new features, no new pages, no new data models — polish what's already shipped. Requirements UX-01 through UX-14 from REQUIREMENTS.md.

Requirements: UX-01, UX-02, UX-03, UX-04, UX-05, UX-06, UX-07, UX-08, UX-09, UX-10, UX-11, UX-12, UX-13, UX-14

</domain>

<decisions>
## Implementation Decisions

### Card row accessibility (UX-02)
- **D-01:** Flat DOM with cosmetic hover + additive ARIA attributes. Keep current HTML structure (name as `<Link>`, action buttons as siblings). Add `role="group"` + `aria-labelledby` to card containers. Ensure all action buttons have `aria-label`s. Row hover stays cosmetic only via `group-hover`.
- **D-02:** For `GalleryCard`, extend the `<Link>` to wrap the image too (larger click target). No action buttons exist in gallery cards, so no nested-interactive violation.
- **D-03:** `BucketProjectRow` and `ChartRow` in designer-detail are already correct (entire `<Link>`, no nested interactives) — no changes needed.
- **D-04:** `DesignerRow`/`GenreRow` and their mobile card equivalents (`DesignerCard`/`GenreCard`) need `role="group"` and `aria-label`s on action buttons. Structure is already correct (siblings, not nested).

### Visual feedback — EditableNumber (UX-03)
- **D-05:** Red border flash (600ms) + background tint during invalid draft. Add `border-destructive` class for ~600ms on rejection, plus `bg-destructive/10` while the draft value is invalid. Apply to both supply-table and charts variants of EditableNumber.

### Visual feedback — Kitting label at 0% (UX-05)
- **D-06:** Three-state copy: "Not kitted" at 0%, "Kitting" at 1-99%, "Fully kitted" at 100%. One-line ternary change in `whats-next-tab.tsx`. Mobile compact badge (percentage-only with colour coding) stays unchanged.

### Shopping-for bar pills (UX-06)
- **D-07:** Intentional deviation from DesignOS — change from `rounded-full` to `rounded-lg` with explicit `border border-selected-border`. This is a conscious design choice: squared-off chips with border are more appropriate for a shopping cart filter context and visually distinct from the round status badges used elsewhere. Keep semantic `bg-selected`/`text-selected-foreground` tokens (already correct).
- **D-08:** Flag this DesignOS deviation in code comment: "Intentionally deviates from DesignOS rounded-full pills — squared chips better fit shopping cart UI convention."

### Focal point editing (UX-10)
- **D-09:** Move action bar outside the banner container as a sibling element below the image. Split `FocalPointEditor` into two components: `FocalPointClickArea` (overlay + marker, renders inside the banner's `relative` container) and `FocalPointActionBar` (save/cancel/reset, renders as sibling below). This eliminates the blocked zone entirely — 100% of the image surface is clickable for focal point placement.
- **D-10:** The action bar keeps its visual treatment (border-top, semi-transparent backdrop, slide animation) — it reads as a toolbar strip attached below the image.

### Cover image preview (UX-13)
- **D-11:** Dynamic aspect ratio from image natural dimensions in the edit form preview (`CoverImageUpload`). Use `onLoad` handler to capture `naturalWidth / naturalHeight`, apply as container `aspect-ratio` CSS property. Fixed `h-48` stays as skeleton/fallback before image loads.
- **D-12:** Hero banner (`HeroCoverBanner`) does NOT change — `object-contain` + blur fill is working as designed (intentional choice from Phase 17).

### Thread insights visual consistency (UX-12)
- **D-13:** Match sister card styling — add rank numbers and align visual grammar with `DesignerInsightList` and `GenreInsightList`. No interactive styling (no hover/cursor-pointer, no links). Actual thread detail linking deferred to backlog 999.1 (Supply Detail Modal).
- **D-14:** The items currently have no interactive styling (confirmed by codebase research) — the fix is purely additive visual alignment, not removing fake affordances.

### Claude's Discretion
- **UX-01 (SearchToAdd keyboard highlight):** Implementation approach for tracking arrow key usage vs mouse hover. Likely a `hasUsedArrowKey` state flag in `portal-autocomplete.tsx` that gates the highlight class.
- **UX-04 (Supplies page first-load flash):** Investigation and fix approach — likely SSR cookie or middleware for initial view mode, or a loading skeleton to prevent flash.
- **UX-07 (Supply table commit button):** Icon choice, sizing, and positioning of the visible "add" button in the persistent add row. Should complement the existing keyboard Enter flow.
- **UX-08 (InlineCreateDialog labels):** Label mapping per supply type (e.g., "Color Name" for beads, "Product Name" for specialty, "Thread Name" for threads). Claude determines exact copy.
- **UX-09 (BucketProject focal point):** Integration approach for applying focal point data to dashboard bucket project cards. The `focalPointX`/`focalPointY` data and `getObjectPositionStyle` utility already exist.
- **UX-11 (Fabric matching null fabricCount):** Fix approach for the null short-circuit in `pattern-dive-actions.ts`. Claude determines the correct matching logic when fabricCount is null.
- **UX-14 (What's Next gallery card styling):** How closely to reuse `GalleryCard` component vs. applying gallery card CSS patterns to the existing What's Next card structure.
- Plan structure and grouping of 14 UX requirements into plans/waves.
- Test strategy for each fix (component tests, integration tests, visual verification).

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & Roadmap
- `.planning/REQUIREMENTS.md` — UX-01 through UX-14 definitions
- `.planning/ROADMAP.md` §Phase 26 — Success criteria (5 items) and UI hint

### Card Row Accessibility (UX-02)
- `src/components/features/designers/designer-list.tsx` — DesignerRow/DesignerCard with Link + action buttons
- `src/components/features/genres/genre-list.tsx` — GenreRow/GenreCard (same pattern as designer)
- `src/components/features/gallery/gallery-card.tsx` — GalleryCard with hover-lift, name-only Link (extend to wrap image)
- `src/components/features/dashboard/bucket-project-row.tsx` — Already correct (entire Link, no nested interactives)
- `src/components/features/charts/project-detail/project-detail-hero.test.tsx` — Existing hero tests

### EditableNumber (UX-03)
- `src/components/features/supply-table/editable-number.tsx` — Supply table variant (silent revert on invalid)
- `src/components/features/supply-table/editable-number.test.tsx` — Existing tests to extend
- `src/components/features/charts/editable-number.tsx` — Charts variant (same pattern)
- `src/components/features/charts/editable-number.test.tsx` — Existing tests to extend

### SearchToAdd / Portal Autocomplete (UX-01)
- `src/components/features/supply-table/portal-autocomplete.tsx` — Keyboard highlight logic
- `src/components/features/supply-table/portal-autocomplete.test.tsx` — Existing tests
- `src/components/features/supply-table/supply-table-add-row.tsx` — Add row using PortalAutocomplete

### What's Next (UX-05, UX-14)
- `src/components/features/charts/whats-next-tab.tsx` — Kitting label at line 185, card rendering
- `src/components/features/charts/whats-next-tab.test.tsx` — Existing tests
- `src/components/features/gallery/gallery-card.tsx` — Gallery card styling to match for UX-14

### Shopping Cart (UX-06)
- `src/components/features/shopping/shopping-for-bar.tsx` — Pill styling (line 36)

### Supply Table (UX-07, UX-08)
- `src/components/features/supply-table/supply-table-add-row.tsx` — Add row (needs visible commit button)
- `src/components/features/supply-table/supply-table-add-row.test.tsx` — Existing tests
- `src/components/features/supply-table/inline-create-dialog.tsx` — InlineCreateDialog labels
- `src/components/features/supply-table/inline-create-dialog.test.tsx` — Existing tests

### Focal Point (UX-10, UX-13)
- `src/components/features/charts/project-detail/focal-point-editor.tsx` — Action bar (absolute bottom-0, z-20)
- `src/components/features/charts/project-detail/focal-point-marker.tsx` — Marker component
- `src/components/features/charts/project-detail/hero-cover-banner.tsx` — Banner container (relative overflow-hidden max-h-64)
- `src/components/features/charts/form-primitives/cover-image-upload.tsx` — Edit form preview (h-48 fixed)

### Dashboard (UX-09)
- `src/components/features/dashboard/bucket-project-row.tsx` — BucketProject cards (missing focal point)
- `src/lib/utils/focal-point.test.ts` — Focal point utility tests
- `src/types/focal-point.ts` — FocalPoint type

### Fabric Matching (UX-11)
- `src/lib/actions/pattern-dive-actions.ts` — Fabric matching logic with null fabricCount issue
- `src/lib/actions/pattern-dive-actions.test.ts` — Existing tests

### Stats (UX-12)
- `src/components/features/stats/thread-insight-list.tsx` — Thread insights (no interactive styling)
- `src/components/features/stats/thread-insight-list.test.tsx` — Existing tests
- `src/components/features/stats/records-overview.tsx` — Records overview (sister insight cards)

### Supplies Page (UX-04)
- `src/app/(dashboard)/supplies/page.tsx` — Supplies page (first-load flash)

### Conventions
- `.claude/rules/base-ui-patterns.md` — Semantic tokens, button/link patterns
- `.claude/rules/component-implementation.md` — Component implementation rules
- `.claude/rules/comment-conventions.md` — Comment conventions (D-08 deviation comment)
- `.claude/rules/testing-requirements.md` — TDD mandatory, colocated tests

### Design Reference
- `product-plan/sections/supply-tracking-and-shopping/` — Supply table designs
- `product-plan/sections/dashboards-and-views/` — Shopping cart, dashboard designs
- `product-plan/sections/gallery-cards-and-advanced-filtering/` — Gallery card designs

### Sketch Findings
- `.claude/skills/sketch-findings-cross-stitch-tracker/SKILL.md` — Validated supply table design decisions

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `getObjectPositionStyle()` from `src/lib/utils/focal-point.ts` — converts 0-1 focal point coordinates to CSS `object-position`. Needed for UX-09 (BucketProject focal point).
- `GalleryCard` from `src/components/features/gallery/gallery-card.tsx` — card component with status-specific footers. Reference for UX-14 (What's Next card styling).
- `StatusBadge` from `src/components/ui/` — already renders status badges per project. Reusable in card rows.
- `buttonVariants` from `src/components/ui/button-variants.ts` — for any button additions (UX-07 commit button).
- `cn()` utility — Tailwind class merging.
- `toast` from `sonner` — for any user-facing feedback (already used in session logging).

### Established Patterns
- **Semantic design tokens**: `bg-card`, `bg-destructive/10`, `border-destructive`, `text-muted-foreground` — used for all styling, never hardcoded scales.
- **TDD mandatory**: Tests before implementation in all plans.
- **Colocated tests**: `foo.test.tsx` next to `foo.tsx`.
- **Client-side state**: `useState` + `useMemo` for UI state; localStorage for persistence.
- **Server Components by default**: "use client" only for interactivity.
- **`group-hover`**: Tailwind pattern for coordinated hover effects across card elements.

### Integration Points
- `DesignerRow`/`GenreRow` are rendered by their respective list pages — ARIA changes propagate automatically.
- `GalleryCard` is used in Browse tab, What's Next tab, and dashboard sections — styling changes affect all contexts.
- `FocalPointEditor` is used only in `ProjectDetailHero` — splitting it is self-contained.
- `EditableNumber` has two independent variants (supply-table and charts) — both need the same fix.
- `ShoppingForBar` is used only in the shopping cart page — pill changes are self-contained.

</code_context>

<specifics>
## Specific Ideas

- Shopping pills: user explicitly chose squared-off chips with border (`rounded-lg` + border) over the DesignOS full-round design. This intentional deviation should be flagged in code but not treated as a bug.
- Thread insights: user confirmed they don't currently see thread insight items on their stats page (likely insufficient thread data), but the visual consistency fix is still worthwhile for when data populates.
- Focal point: the hero banner's `object-contain` + blur fill design is intentional and should NOT be changed — only the edit form preview and action bar positioning need fixes.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 26-ux-polish*
*Context gathered: 2026-05-19*
