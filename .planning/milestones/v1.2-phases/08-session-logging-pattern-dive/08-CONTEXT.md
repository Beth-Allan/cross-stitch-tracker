# Phase 8: Session Logging & Pattern Dive - Context

**Gathered:** 2026-04-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can log stitch sessions that automatically update project progress, and browse their collection through specialized Pattern Dive tabs. This phase delivers the StitchSession data model, the Log Session modal (accessible globally), the per-project Sessions tab, a global Sessions page, and the Pattern Dive tabbed experience (Browse, What's Next, Fabric Requirements, Storage View).

</domain>

<decisions>
## Implementation Decisions

### Log Session Access
- **D-01:** Primary "Log Stitches" button lives in the TopBar as an always-visible emerald button next to the user menu. Opens the LogSessionModal overlay from anywhere in the app.
- **D-02:** When logging from project detail, the modal pre-fills the project and hides the project picker (locked to that project). When logging from TopBar or Sessions page, the full project picker is shown.
- **D-03:** The Sessions page (`/sessions`) is a global chronological session log showing all sessions across all projects, with a project name column and a Log button. Not just a landing page.

### Progress Tracking Model
- **D-04:** `stitchesCompleted` is recalculated from sessions: `stitchesCompleted = startingStitches + sum(all session stitchCounts)`. The recalculation is wrapped in a `$transaction` with the session mutation (create/edit/delete) to stay atomic.
- **D-05:** One-time data migration: for projects where `stitchesCompleted > 0` and no sessions exist, copy `stitchesCompleted` to `startingStitches` so progress doesn't reset when session logging begins.
- **D-06:** Progress (stitchesCompleted) becomes read-only on the project detail page once sessions exist for that project. `startingStitches` remains editable for manual adjustments. Projects with no sessions retain the existing EditableNumber behavior.

### What's Next Ranking
- **D-07:** What's Next tab shows only **Unstarted** and **Kitted** projects. Kitting status (still gathering supplies) is excluded — this is a "ready to stitch" view.
- **D-08:** Ranking logic: (1) `wantToStartNext = true` flagged projects pinned to top, (2) kitting completeness % descending (supplies acquired / required), (3) `dateAdded` ascending (oldest first). No priorityRanking number — that depends on v1.3 goals.

### Pattern Dive Structure
- **D-09:** Existing `ProjectGallery` component wraps into the Browse tab unchanged. New tab navigation is added above it. Minimize changes to working gallery code.
- **D-10:** All four tab datasets fetched eagerly via `Promise.all()` in the server component page.tsx. Tab switching is instant with no loading spinners. Dataset is small (500 charts).
- **D-11:** Pattern Dive tabs use URL-persisted state with nuqs (`?tab=whats-next`), same pattern as existing ProjectTabs. Default tab is Browse.
- **D-12:** Nav label changes from "Projects" to "Pattern Dive". URL stays `/charts`. Page header becomes "Pattern Dive" with subtitle "Explore your collection, plan what's next, and find the right fabric".

### Claude's Discretion
- StitchSession model field names and types (following existing Prisma conventions)
- Session photo upload implementation details (reusing existing R2 presigned URL pattern)
- Fabric Requirements tab calculation details (3" margin formula from design reference)
- Storage View tab grouping implementation
- Empty state messaging for tabs with no data
- Sort options within each tab (follow design reference patterns)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Session Logging Design
- `product-plan/sections/stitching-sessions-and-statistics/components/LogSessionModal.tsx` — Modal layout, fields, project picker, photo upload, edit/delete flow
- `product-plan/sections/stitching-sessions-and-statistics/components/ProjectSessionsTab.tsx` — Per-project session history table, mini stats summary, sort controls
- `product-plan/sections/stitching-sessions-and-statistics/project-sessions-tab.png` — Visual reference for sessions tab
- `product-plan/sections/stitching-sessions-and-statistics/types.ts` — StitchSession, ProjectSessionsTabProps, ActiveProject types

### Pattern Dive Design
- `product-plan/sections/dashboards-and-views/components/PatternDive.tsx` — Full Pattern Dive with 4 tabs: Browse, What's Next, Fabric Requirements, Storage View
- `product-plan/sections/dashboards-and-views/pattern-dive.png` — Visual reference for Pattern Dive layout
- `product-plan/sections/dashboards-and-views/types.ts` — PatternDiveProps, WhatsNextProject, FabricRequirementRow, StorageGroup types

### Project Requirements
- `.planning/REQUIREMENTS.md` — SESS-01 through SESS-06, PDIV-01 through PDIV-05
- `.planning/ROADMAP.md` — Phase 8 success criteria and dependency on Phase 7

### Existing Patterns
- `src/components/features/charts/project-detail/project-tabs.tsx` — nuqs tab pattern to follow
- `src/components/features/gallery/project-gallery.tsx` — Gallery component to wrap as Browse tab
- `src/lib/actions/upload-actions.ts` — R2 presigned URL pattern to reuse for session photos
- `prisma/schema.prisma` — Current data model (Project.stitchesCompleted, startingStitches, wantToStartNext)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **ProjectGallery** (`src/components/features/gallery/`): Full gallery with filter bar, view modes, cards — becomes Browse tab
- **Tabs** (`src/components/ui/tabs.tsx`): Base UI tabs with line variant — Pattern Dive uses this
- **ProjectTabs** (`src/components/features/charts/project-detail/project-tabs.tsx`): nuqs URL-persisted tabs pattern — extend with Sessions tab
- **Dialog** (`src/components/ui/dialog.tsx`): Base UI dialog — LogSessionModal uses this
- **Upload actions** (`src/lib/actions/upload-actions.ts`): R2 presigned URL generation — reuse for session photos
- **EditableNumber** (`src/components/features/charts/editable-number.tsx`): Currently used for stitchesCompleted — will become conditional (editable only when no sessions exist)

### Established Patterns
- **Server actions with requireAuth**: All mutations go through server actions with `requireAuth()` guard
- **Zod validation at boundaries**: Form data validated with Zod schemas before DB writes
- **nuqs for URL state**: Query params managed via nuqs with `parseAsStringLiteral`
- **$transaction for atomic operations**: Already flagged in STATE.md for session + progress updates
- **Promise.all() for parallel queries**: Already flagged in STATE.md for dashboard data fetching

### Integration Points
- **TopBar** (`src/components/shell/`): Add "Log Stitches" button
- **Nav items** (`src/components/shell/nav-items.ts`): Rename "Projects" to "Pattern Dive" label
- **Charts page** (`src/app/(dashboard)/charts/page.tsx`): Evolve into Pattern Dive with tab wrapper
- **Project detail page**: Add Sessions tab to existing ProjectTabs (Overview, Supplies → Overview, Supplies, Sessions)
- **Prisma schema**: Add StitchSession model, add relation to Project

</code_context>

<specifics>
## Specific Ideas

- The design shows mini cover images in the project picker dropdown — follow the existing pattern from LogSessionModal design reference
- Session photo upload should match the existing cover image upload flow (presigned URL → R2 → store key in DB)
- The "Log Stitches" TopBar button should be a compact emerald button, visually distinct from nav items
- What's Next kitting % calculation: count of acquired supplies / total required supplies across threads, beads, and specialty items
- Fabric Requirements tab uses 3" margin per side formula from the design reference

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 08-session-logging-pattern-dive*
*Context gathered: 2026-04-16*
