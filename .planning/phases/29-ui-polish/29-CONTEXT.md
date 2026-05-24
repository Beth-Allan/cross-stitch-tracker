# Phase 29: UI Polish - Context

**Gathered:** 2026-05-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Visual and functional polish across gallery cards, project detail supplies, and file uploads. Colored status/size pills replace grey ones, digital copy indicator added to gallery cards, skein calculator controls added to project detail supplies, supply sorting fixed, and file upload limits expanded. No new pages, no new data models — polish what's shipped.

Requirements: UI-01, UI-02, UI-03, UI-04, UI-05, BUG-03

</domain>

<decisions>
## Implementation Decisions

### Status pill colors (UI-01)
- **D-01:** Give `Unstarted` status a slate/stone color instead of grey (`bg-muted`). Use slate-50/slate-700 (light) and slate-900/slate-300 (dark). All other 6 statuses already have colors (amber, emerald, sky, orange, violet, rose) in `STATUS_CONFIG` — no changes to those.
- **D-02:** Update `STATUS_CONFIG` in `src/lib/utils/status.ts` to replace the `bg-muted`/`text-muted-foreground` classes on the `UNSTARTED` entry with slate-toned classes matching the pattern used by other statuses.

### Size pill colors (UI-01)
- **D-03:** Replace the hardcoded grey inline classes on the gallery card size badge (`bg-background/90 text-muted-foreground`) with the existing `SIZE_COLORS` from `src/lib/utils/size-category.ts`. The `SizeBadge` component already exists and is used on project detail — reuse it (or its color config) on gallery cards.
- **D-04:** Lighten the `SIZE_COLORS` to use -50 shade backgrounds instead of the current -100, making them visually distinct from (more muted than) the bolder status badge colors. Keep the same hues: Mini=blue, Small=green, Medium=amber, Large=orange, BAP=red.

### Digital copy indicator (UI-02)
- **D-05:** Add a `hasDigitalCopy: boolean` field to `GalleryCardData` (derived from `_count.files > 0` in the gallery query). No file count — just presence/absence.
- **D-06:** Display a small badge in the card body area (below the cover image, near the metadata). Icon + "Digital copy" label. Not an overlay on the image.

### Supply sort (BUG-03)
- **D-07:** The sort controls already exist in `supplies-tab.tsx` (lines 85-137) with "Added" and "A-Z" toggle buttons. Investigate whether the bug is that sorting isn't working correctly, or that the sort controls aren't visible/accessible enough. Fix whatever is broken.

### Skein calc on project supplies (UI-03)
- **D-08:** Reuse the full `CalculatorCard` component on the project detail Supplies tab, positioned above the supply table. Same layout and controls as the chart form supply takeover mode.
- **D-09:** Changes to calculator params (strands, over, count, waste) persist to the database via server action, not view-only. Same persistence pattern as the edit form.
- **D-10:** Fabric selector in the CalculatorCard shows the project's assigned fabric. If no fabric is assigned, the selector shows available user fabrics.

### File upload improvements (UI-04, UI-05)
- **D-11:** Increase `MAX_FILE_SIZE` from 10MB to 50MB. Update the error message in `uploadRequestSchema` accordingly. R2 supports up to 5GB per object; 50MB covers individual patterns and reasonable PDFs.
- **D-12:** Add `.zip` support to chart file uploads only: add `application/zip` and `application/x-zip-compressed` to `ALLOWED_CHART_FILE_TYPES`, add `.zip` to `ALLOWED_CHART_FILE_EXTENSIONS`. Do NOT add zip to `ALLOWED_FILE_TYPES` (covers/sessions stay image-only).

### Claude's Discretion
- Test strategy and plan structure/grouping.
- Exact icon choice for the digital copy indicator (Lucide icon selection).
- Layout of digital copy badge within the card body (positioning relative to designer name, stitch count, etc.).
- How to wire CalculatorCard on project detail — may need a new server action for updating calc params on existing projects, or extend existing supply actions.
- Whether to extract `SizeBadge` usage directly into gallery card or refactor the gallery card to use the shared `SizeBadge` component.
- Fix approach for BUG-03 supply sort — investigate and fix whatever is broken.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & Roadmap
- `.planning/REQUIREMENTS.md` — UI-01 through UI-05, BUG-03 definitions
- `.planning/ROADMAP.md` §Phase 29 — Success criteria (5 items) and UI hint

### Gallery Cards (UI-01, UI-02)
- `src/components/features/gallery/gallery-card.tsx` — Gallery card component with status badge (line 194) and inline grey size badge (lines 198-208)
- `src/components/features/gallery/gallery-grid.tsx` — List/table view modes, also uses StatusBadge (lines 272, 424)
- `src/components/features/gallery/gallery-types.ts` — `GalleryCardData` interface (needs `hasDigitalCopy` field)
- `src/components/features/charts/status-badge.tsx` — `StatusBadge` component using `STATUS_CONFIG`
- `src/components/features/charts/size-badge.tsx` — `SizeBadge` component using `SIZE_COLORS` (already colored, used on project detail but NOT gallery cards)
- `src/lib/utils/status.ts` — `STATUS_CONFIG` with per-status color classes (Unstarted = grey, others colored)
- `src/lib/utils/size-category.ts` — `SIZE_COLORS`, `SizeCategory` type, `calculateSizeCategory()`

### Gallery Data Query
- `src/components/features/gallery/project-gallery.tsx` — Gallery wrapper
- `src/lib/actions/chart-actions.ts` — Gallery data fetching (needs to include file count)

### Project Detail Supplies (UI-03, BUG-03)
- `src/components/features/charts/project-detail/supplies-tab.tsx` — Supplies tab with existing sort controls (lines 74-137) and supply table rendering
- `src/components/features/charts/form-primitives/calculator-card.tsx` — `CalculatorCard` component to reuse
- `src/components/features/supply-table/types.ts` — `CalcParams` type (fabricCount, strandCount, overCount, wastePercent)
- `src/components/features/charts/project-detail/types.ts` — `ProjectDetailProps` and related types

### File Upload (UI-04, UI-05)
- `src/lib/validations/upload.ts` — `MAX_FILE_SIZE`, `ALLOWED_CHART_FILE_TYPES`, `ALLOWED_CHART_FILE_EXTENSIONS`, `uploadRequestSchema`
- `src/lib/actions/upload-actions.ts` — Upload action with type validation (lines 63-85)

### Conventions
- `.claude/rules/base-ui-patterns.md` — Semantic tokens, component patterns
- `.claude/rules/component-implementation.md` — Component implementation rules
- `.claude/rules/testing-requirements.md` — TDD mandatory, colocated tests

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `StatusBadge` component — Already renders colored pills for 6 of 7 statuses. Unstarted needs a color update in `STATUS_CONFIG`.
- `SizeBadge` component — Already has per-size colors via `SIZE_COLORS`. Used on project detail hero but not gallery cards. Can be reused directly on gallery cards.
- `SIZE_COLORS` config — Per-size-category color mappings at -100 shade. Needs lightening to -50 for visual distinction from status badges.
- `CalculatorCard` component — Full skein calculator UI. Accepts `CalcParams` + fabric options. Reusable on project detail.
- `sortSupplyRows()` in `supplies-tab.tsx` — Already implements Added/A-Z sorting. May have a bug or visibility issue.
- `uploadRequestSchema` — Centralized Zod schema for upload validation. Single place to update size limit and error message.

### Established Patterns
- **Gallery card overlay badges** — Status (absolute top-left) and size (absolute top-right) positioned over cover image.
- **Supply table adapter pattern** — `ProjectDetailAdapter` for server-action persistence vs `LocalStateAdapter` for form state. CalculatorCard on project detail would use `ProjectDetailAdapter` flow.
- **Presigned URL upload** — Client uploads directly to R2 via presigned URL. Server validates type/size before issuing URL. No server-side file processing for chart files.
- **`STATUS_CONFIG` color pattern** — Each status has `bgClass`, `textClass`, `dotClass`, `darkBgClass`. Adding slate to Unstarted follows this exact pattern.

### Integration Points
- Gallery data query — Needs `_count: { select: { files: true } }` added to the Prisma include for `hasDigitalCopy`.
- `supplies-tab.tsx` — Needs CalculatorCard wired in above the supply table, with calcParams state and server action for persistence.
- `upload.ts` validation — Single file to update for both size limit and zip acceptance.

</code_context>

<specifics>
## Specific Ideas

- Size pill colors should be lighter/more muted than status pills so the two badge types are visually distinct on the card. Status pills are the "active" information; size is secondary context.
- Unstarted = slate/stone color. Not a dramatic color — subtle but clearly not grey/colorless. Most of the 500+ chart collection is Unstarted, so this color will dominate gallery views.
- Digital copy badge: small, in card body, not competing with the cover image area badges. Subtle presence indicator.
- 50MB upload limit handles individual patterns and reasonable PDFs. For 140MB+ full books, split into individual patterns.
- CalculatorCard on project detail persists to database — this is the user's live supply tracking, not a hypothetical calculator.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 29-ui-polish*
*Context gathered: 2026-05-23*
