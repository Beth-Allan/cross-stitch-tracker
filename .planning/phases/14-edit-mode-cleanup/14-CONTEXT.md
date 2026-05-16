# Phase 14: Edit Mode & Cleanup - Context

**Gathered:** 2026-05-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Adapt the merged form (Phase 12/13) for editing existing charts/projects via a full-page route, wire navigation entry points from project detail hero and gallery list-row kebab menus, and remove all deprecated components. Supply management for existing projects stays on the project detail Supplies tab — the edit form is metadata-only.

</domain>

<decisions>
## Implementation Decisions

### Edit form boundary
- **D-01:** In edit mode, replace the milestone marker / supply takeover section with a contextual "Manage Supplies" link pointing to `/charts/[chartId]?tab=supplies`
- **D-02:** The link occupies the same DOM position as the creation flow's milestone marker — maintains visual continuity without dead UI
- **D-03:** Text should clearly communicate that supplies are managed elsewhere (not imply something is missing or gated)

### After-save experience
- **D-04:** On successful save, redirect to project detail (`/charts/[chartId]`) with `toast.success("Changes saved")`
- **D-05:** Matches existing feedback patterns (e.g., `toast.success("Project deleted")` in HeroKebabMenu)
- **D-06:** No `router.back()` — unreliable in App Router with in-route state changes

### Navigation entry points
- **D-07:** Table/list rows in `chart-list.tsx` get a kebab (⋮) DropdownMenu with "Edit" (navigates to `/charts/[id]/edit`) and "Delete" (existing confirmation dialog)
- **D-08:** Gallery card grid stays clean — no overflow menu. Users click card → project detail → Edit button on hero
- **D-09:** Project detail hero already has an Edit button (`LinkButton href="/charts/[id]/edit"`) — no changes needed there
- **D-10:** The old inline `ChartEditModal` state management in `chart-list.tsx` is removed entirely (no more `editingChart` useState)
- **D-11:** Update ROADMAP success criteria from "gallery card kebab menu" to "list-row kebab menu" — gallery cards are reused in Dashboard/Pattern Dive without action chrome per DesignOS

### Plan structure
- **D-12:** Three plans in sequence:
  - Plan 1: Remove dead code (12 files with zero active imports) — build verifies
  - Plan 2: Build edit mode (merged form accepts chart prop, edit route rewired, list-row kebab added)
  - Plan 3: Remove `chart-edit-modal.tsx` + tests (now orphaned after Plan 2 rewires importers)
- **D-13:** Each plan produces a green build before the next begins

### Claude's Discretion
- How `ChartMergedForm` accepts edit-mode props (likely `initialData?: ChartWithProject` alongside the existing `mode` in `useChartForm`)
- Kebab menu component implementation (inline in chart-list vs. extracted component)
- "Manage Supplies" link styling (subtle vs. prominent)
- Whether to extract the delete confirmation dialog from HeroKebabMenu for reuse in the list-row kebab
- Test strategy for the edit form (unit tests on mode switching, integration tests on save flow)
- Handling unsaved changes guard in edit mode (existing `window.confirm` pattern from creation flow)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design spec
- `.claude/skills/sketch-findings-cross-stitch-tracker/references/project-creation-form.md` — Merged form visual design, field groups, sticky save bar (reused for edit)
- `.claude/skills/sketch-findings-cross-stitch-tracker/SKILL.md` — Design direction summary

### Existing form code (being extended)
- `src/components/features/charts/chart-merged-form.tsx` — Current merged form (creation-only). Phase 14 adds edit mode props and conditional supply section
- `src/components/features/charts/use-chart-form.ts` — Core form hook with `mode: "create" | "edit"`, `initialData`, and `updateChart` submission. Already edit-ready
- `src/components/features/charts/use-draft-persistence.ts` — Draft utilities (creation-only, not needed for edit mode)

### Edit route (being rewired)
- `src/app/(dashboard)/charts/[id]/edit/page.tsx` — Server component fetching chart + reference data. Keep but change client component
- `src/app/(dashboard)/charts/[id]/edit/edit-client.tsx` — Currently wraps `ChartEditModal`. Replace with `ChartMergedForm` in edit mode

### Navigation entry points
- `src/components/features/charts/chart-list.tsx` — Gallery/list view. Has `onEdit` callbacks triggering inline modal → replace with kebab menu navigation
- `src/components/features/charts/project-detail/hero-kebab-menu.tsx` — Hero kebab (Delete only). Edit button already exists separately on hero
- `src/components/features/charts/project-detail/project-detail-hero.tsx` — Has existing Edit LinkButton

### Deprecated components (to be removed)
- `src/components/features/charts/chart-add-form.tsx` (+ test) — no active imports
- `src/components/features/charts/chart-detail.tsx` — dead code
- `src/components/features/charts/project-supplies-tab.tsx` (+ test) — only imported by dead chart-detail
- `src/components/features/charts/project-detail/supply-row.tsx` (+ test) — only imported by dead supply-section
- `src/components/features/charts/project-detail/supply-section.tsx` — no active imports
- `src/components/features/charts/project-detail/supply-footer-totals.tsx` — no active imports
- `src/components/features/charts/sections/` (9 files) — only imported by deprecated chart-add-form and chart-edit-modal
- `src/components/features/charts/form-primitives/pattern-type-fields.tsx` — only imported by deprecated sections/
- `src/components/features/charts/chart-edit-modal.tsx` (+ test) — blocked on Plan 2 rewiring

### Server actions
- `src/lib/actions/chart-actions.ts` — `updateChart` server action (already exists, used by edit mode)

### Requirements
- `.planning/REQUIREMENTS.md` — EDIT-01, EDIT-02, CLEAN-01

### Prior phase context
- `.planning/phases/12-merged-form/12-CONTEXT.md` — D-10 through D-16: form rebuild strategy, hybrid approach
- `.planning/phases/13-supply-takeover/13-CONTEXT.md` — D-01/D-02: Activity toggle, mode switching (creation-only pattern)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `ChartMergedForm`: Full creation form with field groups, pattern type cards, sticky save bar, supply takeover. Extend for edit mode by accepting `initialData` and `mode` props
- `useChartForm`: Already supports `mode: "create" | "edit"` with branching on submission (`createChart` vs `updateChart`)
- `HeroKebabMenu`: Reference for kebab + delete confirmation dialog pattern (DropdownMenu + Dialog)
- `StickySaveBar`: Reusable — just needs text change from "Create" to "Save Changes" in edit mode
- `LinkButton`: Already used on project detail hero for the edit navigation

### Established Patterns
- Full-page edit routes at `/charts/[id]/edit` with server component data fetching + client component rendering
- `router.push` + `toast.success` for post-mutation navigation
- `DropdownMenu` + `DropdownMenuItem` for kebab menus (shadcn/ui v4)
- `useTransition` for non-blocking server action calls
- `window.confirm` for unsaved changes guard on navigation away

### Integration Points
- `edit-client.tsx` → swap `ChartEditModal` for `ChartMergedForm` with edit props
- `chart-list.tsx` → replace `onEdit` modal pattern with kebab menu navigation
- `chart-merged-form.tsx` → add conditional rendering based on mode (supply section vs. manage link)
- `page.tsx` (edit route) → data fetching already correct, pass chart to client component

</code_context>

<specifics>
## Specific Ideas

- Edit form should feel identical to creation form in layout — same field groups, same sticky save bar, same max-width. The only visible differences: "Save Changes" instead of "Create", the supply section becomes a link, and no draft persistence (editing real data)
- The "Manage Supplies" link should feel like a natural endpoint — not a dead end or error state. Something like "Supplies are managed on the project page → Go to Supplies"
- List-row kebab should feel familiar — same pattern as the hero kebab, just applied to table rows

</specifics>

<deferred>
## Deferred Ideas

- Supply takeover in edit mode — explicitly excluded per REQUIREMENTS.md Out of Scope. Supply management for existing projects lives on project detail Supplies tab
- Gallery card kebab menu — excluded per DesignOS spec. Cards are reused across Dashboard/Pattern Dive where actions don't belong. Edit access via project detail hero is sufficient for card-grid users

</deferred>

---

*Phase: 14-edit-mode-cleanup*
*Context gathered: 2026-05-16*
