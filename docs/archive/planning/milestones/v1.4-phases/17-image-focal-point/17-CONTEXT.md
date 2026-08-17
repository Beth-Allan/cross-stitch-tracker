# Phase 17: Image Focal Point - Context

**Gathered:** 2026-05-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can control which area of a cover image stays visible when the image is cropped in different display contexts. Includes schema fields for focal point coordinates, a click-to-set UI on the project detail hero banner, and CSS object-position propagation to all cropped image contexts.

</domain>

<decisions>
## Implementation Decisions

### Focal point setter UI
- **D-01:** Focal point setter lives on the project detail hero banner area — user interacts with the hero image to set the anchor point.
- **D-02:** Interaction model is click/tap to place a marker — single click anywhere on the image drops a crosshair/dot at that position. Click again to move it.
- **D-03:** Marker is visible only while in edit mode — clean hero view normally, marker appears when user enters "set focal point" mode.
- **D-04:** Edit mode is triggered by a button overlaying the hero image corner (crosshair icon, "Set focal point"). Click button → enter edit mode → click image to place → Save/Cancel buttons to confirm.
- **D-05:** A "Reset to center" button appears in edit mode alongside Save/Cancel — clears focal point back to null (center default).

### Display context behavior
- **D-06:** Hero banner keeps `object-contain` (no crop) — focal point does not change hero banner rendering. The hero is where you SET it, but it doesn't APPLY there since there's no cropping.
- **D-07:** ALL `object-cover` contexts respect the focal point — gallery cards, spotlight card, genre/designer detail thumbnails, shopping accordion.
- **D-08:** While in edit mode, show a live aspect-4/3 crop guide overlay on the hero image so user can preview what gallery cards will look like from the selected focal point.

### Data model & persistence
- **D-09:** Two nullable Float fields on Chart: `focalPointX Float?` and `focalPointY Float?`. Normalized 0-1 (0,0 = top-left, 1,1 = bottom-right). Maps directly to CSS `object-position: {x*100}% {y*100}%`.
- **D-10:** When no focal point is set (null), default crop is center (50% 50%) — matches current browser behavior, no visual change for existing images.

### Claude's Discretion
- Exact crosshair/dot marker visual design (size, color, border, animation)
- How the crop preview overlay renders (semi-transparent dimming outside crop area, dashed border, etc.)
- Edit mode button placement (top-right corner vs. bottom-right of hero)
- Whether to use optimistic UI or wait for server response on save
- Server action structure (single `updateFocalPoint` action or reuse existing chart update)
- Touch handling nuances for mobile (tap vs. long-press disambiguation)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements
- `.planning/REQUIREMENTS.md` — IMG-01, IMG-02 requirements

### Schema
- `prisma/schema.prisma` — Chart model (lines 41-63) where focalPointX/Y will be added

### Image display contexts (all files that need object-position propagation)
- `src/components/features/gallery/gallery-card.tsx` — Gallery card with `object-cover`, aspect-4/3 (line 176)
- `src/components/features/dashboard/spotlight-card.tsx` — Spotlight with `object-cover` in 320px column (line 68)
- `src/components/features/charts/project-detail/hero-cover-banner.tsx` — Hero banner with `object-contain` (setter lives here, but focal point doesn't apply to rendering)
- `src/components/features/genres/genre-detail.tsx` — Genre detail thumbnail
- `src/components/features/designers/designer-detail.tsx` — Designer detail thumbnail
- `src/components/features/shopping/project-accordion.tsx` — Shopping accordion thumbnail

### Image types and data flow
- `src/types/dashboard.ts` — Dashboard types with coverImageUrl/coverThumbnailUrl (will need focalPointX/Y)
- `src/components/features/gallery/gallery-types.ts` — GalleryCardData type (will need focalPointX/Y)
- `src/components/features/charts/project-detail/types.ts` — ProjectDetail type (line 62)

### Existing hero UI
- `src/components/features/charts/project-detail/hero-kebab-menu.tsx` — Existing hero kebab menu (for reference on hero overlay patterns)
- `src/components/features/charts/project-detail/project-detail-hero.tsx` — Hero component parent

### Upload & image infrastructure
- `src/lib/actions/upload-actions.ts` — Existing chart update patterns (for server action reference)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `hero-cover-banner.tsx`: Already a `"use client"` component with image error handling — edit mode can be layered here
- `hero-kebab-menu.tsx`: Existing overlay button on hero — pattern reference for the focal point edit button
- `buttonVariants` + `Button`: For Save/Cancel/Reset buttons in edit mode
- `useTransition`: Already used across the app for server action state management

### Established Patterns
- Cover images use presigned URLs (`getPresignedImageUrls`) — focal point data flows alongside but doesn't change image URLs
- Gallery card receives data via `GalleryCardData` type — needs focalPointX/Y added to type and query
- Spotlight/Dashboard cards receive data via typed props from server page queries
- `object-cover` + `fill` on Next.js `Image` component — add inline `style={{ objectPosition }}` for focal point

### Integration Points
- Chart model query in `src/app/(dashboard)/charts/[id]/page.tsx` — needs to include focalPointX/Y
- Gallery data fetching (wherever GalleryCardData is populated) — needs focalPointX/Y in select
- Dashboard queries for Spotlight — needs focalPointX/Y
- All server-side queries that select coverImageUrl for display contexts need to also select focal point fields
- New server action for `updateFocalPoint(chartId, x, y)` or `updateFocalPoint(chartId, null)` for reset

</code_context>

<specifics>
## Specific Ideas

- Cross-stitch chart cover images are often portrait-oriented full patterns — the top area frequently has the most recognizable motif, making focal point valuable for 4:3 landscape crops in gallery cards
- The hero banner shows the full image uncropped (object-contain) which makes it the ideal place to SET the focal point since the user can see the entire image to choose from
- Live crop preview during editing is important for confidence — user sees exactly what gallery cards will look like before committing
- CSS `object-position` with percentage values maps directly to the 0-1 normalized storage (multiply by 100)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 17-image-focal-point*
*Context gathered: 2026-05-17*
