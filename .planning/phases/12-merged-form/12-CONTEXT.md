# Phase 12: Merged Form - Context

**Gathered:** 2026-05-10
**Status:** Ready for planning

<domain>
## Phase Boundary

Build a single-page chart+project creation form with merged field groups, pattern type cards, required field indicators, sticky save bar, and digital working copy upload. The form replaces the current `chart-add-form.tsx` shell while reusing the existing `use-chart-form.ts` hook and most form primitives. Supply takeover (Phase 13) and edit mode (Phase 14) build on top of this form.

</domain>

<decisions>
## Implementation Decisions

### Pattern type cards
- **D-01:** UI-level mapping only — keep the 3 existing booleans (`isPaperChart`, `isFormalKit`, `isSAL`) unchanged. No schema migration
- **D-02:** Render 4 cards in a 2x2 grid: **Paper Chart**, **Digital**, **Kit**, **SAL**. "Subscription" in REQUIREMENTS.md was a misnomer — SAL/Stitch-Along is the correct label
- **D-03:** Paper and Digital are mutually exclusive (opposite values of `isPaperChart`). Kit and SAL are independent overlay flags that can co-exist with either format and with each other
- **D-04:** Kit card expands to show "Colours in kit" numeric input (`kitColorCount`). Paper, Digital, and SAL have no sub-fields
- **D-05:** Cards use radio-style check circles for the Paper/Digital pair, checkbox-style for Kit/SAL. Visual spec from sketch `project-creation-form.md` CSS patterns

### Save Draft behavior
- **D-06:** Save Draft persists form state to localStorage only — zero schema changes, zero server interaction
- **D-07:** On return to `/charts/new`, the form auto-hydrates from localStorage if a draft exists
- **D-08:** Handle stale reference IDs gracefully (e.g., deleted designer since draft was saved) — fallback to null for missing references
- **D-09:** Clear localStorage draft on successful Create

### Form rebuild strategy
- **D-10:** Hybrid approach — keep everything in `src/components/features/charts/`, no new directory
- **D-11:** Keep `use-chart-form.ts` unchanged — it already supports create/edit modes, validation, submission, and inline entity creation
- **D-12:** Build `chart-merged-form.tsx` as the new shell component (replaces `chart-add-form.tsx`'s role for creation)
- **D-13:** Add `pattern-type-cards.tsx` as a new form primitive — the visual card selector replacing the old checkbox/radio approach
- **D-14:** Add `sticky-save-bar.tsx` as a new component — fixed bottom bar with save-readiness hint + Save Draft + Create buttons
- **D-15:** Old `chart-add-form.tsx`, `chart-edit-modal.tsx`, `sections/`, and `pattern-type-fields.tsx` stay live until Phase 14 cleanup
- **D-16:** Update the `/charts/new` page to render the new `chart-merged-form.tsx` instead of `chart-add-form.tsx`

### Genre chip selector
- **D-17:** Keep `GenrePicker` as-is — it's already chip toggles matching the sketch spec, not a SearchableSelect
- **D-18:** Check style fidelity during assembly: sketch specifies `font-weight: 500` on selected chips

### Claude's Discretion
- Form group wrapper component design (divider-separated sections)
- Required dot indicator implementation (CSS pseudo-element vs component prop)
- localStorage serialization format and debounce strategy for Save Draft
- Stale ID detection approach on draft hydration
- Save-readiness hint text logic ("Chart name entered — ready to save at any point")
- How the milestone marker at the end connects to Phase 13's supply takeover entry point
- Test strategy for new components (pattern type cards, sticky save bar, draft persistence)

</decisions>

<specifics>
## Specific Ideas

- Pattern type cards should feel like radio buttons for Paper/Digital (mutual exclusion) but allow Kit/SAL to be toggled independently on top — the visual treatment should make this clear
- The save-readiness hint should guide the user: "Enter a chart name to enable saving" → "Chart name entered — ready to save at any point"
- The form should feel fast for bulk data entry — the user has 500+ charts to manage
- Green required dots (6px) on Chart Name and Status only — everything else is implicitly optional, no "optional" tags

</specifics>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design spec (primary)
- `.claude/skills/sketch-findings-cross-stitch-tracker/references/project-creation-form.md` — Complete visual design, CSS patterns, HTML structures, field groups, pattern type card styling, milestone marker, sticky save bar, chip selector
- `.claude/skills/sketch-findings-cross-stitch-tracker/SKILL.md` — Design direction summary and multi-supply-type decisions

### Existing form code (being extended)
- `src/components/features/charts/use-chart-form.ts` — Core form hook (393 lines): state, validation, submission, inline entity creation. Reuse unchanged
- `src/components/features/charts/chart-add-form.tsx` — Current form shell (190 lines): section rendering, layout. Being replaced by new merged form shell but stays live until Phase 14
- `src/components/features/charts/form-primitives/` — 10 form primitives (SearchableSelect, CoverImageUpload, FileUpload, GenrePicker, FormField, StitchCountFields, etc.). All carry over unchanged except pattern-type-fields.tsx which gets a new parallel replacement
- `src/components/features/charts/sections/` — 9 current section wrappers. Content fields reused but wrappers replaced by new group layout

### Validation
- `src/lib/validations/chart.ts` — Zod schema with `isPaperChart`, `isFormalKit`, `kitColorCount`, `isSAL` fields. No changes needed

### Server actions
- `src/lib/actions/chart-actions.ts` — `createChart` and `updateChart` server actions. No changes needed for Phase 12

### Requirements
- `.planning/REQUIREMENTS.md` — FORM-01 through FORM-05 (5 requirements mapped to Phase 12)

### Prior phase context
- `.planning/phases/10-unified-supply-table/10-CONTEXT.md` — Phase 10 decisions (zero new dependencies, adapter interface pattern)
- `.planning/phases/11-supply-table-on-project-detail/11-CONTEXT.md` — Phase 11 decisions (ServerActionAdapter, animation wiring)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `use-chart-form.ts`: Core hook with all form state management, Zod validation, submission, error formatting, inline entity creation (designer, genre, storage location, stitching app). Already mode-aware (create/edit)
- `FormField`: Label + error + hint wrapper with `required` prop support
- `SearchableSelect`: Dropdown with search, inline "Add New" — used for designers, storage locations, stitching apps
- `GenrePicker`: Chip toggle multi-select with inline creation — already matches sketch spec
- `CoverImageUpload` (274 lines): Complex, well-tested image upload with preview
- `FileUpload` (160 lines): Digital file upload component
- `StitchCountFields`: Width/Height/Count 3-column grid with auto-calculation
- `StyledCheckbox`: Styled checkbox primitive
- `StartPreferenceFields`: Season preference fields

### Established Patterns
- Server Components by default, "use client" only for interactivity — the form is a client component
- `sonner` toast for success/error feedback
- `useRouter().push()` for navigation after submit
- `window.confirm()` for unsaved changes guard on cancel
- Zod validation with `chartFormSchema.safeParse()` at submission boundary

### Integration Points
- `/charts/new/page.tsx` renders `ChartAddForm` — will switch to `ChartMergedForm`
- `chart-actions.ts` `createChart()` creates both Chart + Project in one transaction
- Phase 13 will add supply takeover mode — the milestone marker at the end of the form is the entry point
- Phase 14 will wire the merged form layout for editing, then remove deprecated components

</code_context>

<deferred>
## Deferred Ideas

- Supply takeover transition (milestone marker click → form collapse → supply table) — Phase 13
- Edit mode using merged form layout — Phase 14
- Removal of deprecated components (old form shell, edit modal, section wrappers, old pattern type fields) — Phase 14
- "Subscription" as a potentially distinct concept from SAL — user confirmed they're the same thing, but if a subscription-model chart type emerges later, revisit

</deferred>

---

*Phase: 12-merged-form*
*Context gathered: 2026-05-10*
