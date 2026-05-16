# Phase 14: Edit Mode & Cleanup - Research

**Researched:** 2026-05-16
**Domain:** React form mode switching, dead code removal, dropdown menu navigation
**Confidence:** HIGH

## Summary

Phase 14 extends the existing `ChartMergedForm` (built in Phase 12/13) to support editing existing charts/projects, wires navigation entry points from the list-row kebab menu, and removes all deprecated components. The technical risk is low because the foundational infrastructure is already built: `useChartForm` already handles `mode: "edit"` with `initialData`, `updateChart` server action exists with fabric link/unlink support, and the edit route server component (`page.tsx`) already fetches all required data.

The main implementation work is: (1) making `ChartMergedForm` accept edit-mode props and conditionally render a "Manage Supplies" link instead of the supply takeover section, (2) updating `StickySaveBar` with mode-aware labels, (3) replacing the inline Pencil/Trash buttons in `chart-list.tsx` with a kebab `DropdownMenu`, and (4) safely removing 19 deprecated files across two deletion waves.

**Primary recommendation:** Extend `ChartMergedForm` with optional `initialData` and `mode` props that thread through to the existing `useChartForm` hook. The form already has all the fields and validation -- the only visual differences in edit mode are heading text, save bar labels, and the supply section being replaced by a link.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** In edit mode, replace the milestone marker / supply takeover section with a contextual "Manage Supplies" link pointing to `/charts/[chartId]?tab=supplies`
- **D-02:** The link occupies the same DOM position as the creation flow's milestone marker -- maintains visual continuity without dead UI
- **D-03:** Text should clearly communicate that supplies are managed elsewhere (not imply something is missing or gated)
- **D-04:** On successful save, redirect to project detail (`/charts/[chartId]`) with `toast.success("Changes saved")`
- **D-05:** Matches existing feedback patterns (e.g., `toast.success("Project deleted")` in HeroKebabMenu)
- **D-06:** No `router.back()` -- unreliable in App Router with in-route state changes
- **D-07:** Table/list rows in `chart-list.tsx` get a kebab DropdownMenu with "Edit" (navigates to `/charts/[id]/edit`) and "Delete" (existing confirmation dialog)
- **D-08:** Gallery card grid stays clean -- no overflow menu. Users click card -> project detail -> Edit button on hero
- **D-09:** Project detail hero already has an Edit button (`LinkButton href="/charts/[id]/edit"`) -- no changes needed there
- **D-10:** The old inline `ChartEditModal` state management in `chart-list.tsx` is removed entirely (no more `editingChart` useState)
- **D-11:** Update ROADMAP success criteria from "gallery card kebab menu" to "list-row kebab menu"
- **D-12:** Three plans in sequence: Plan 1 (dead code removal), Plan 2 (edit mode + kebab), Plan 3 (modal + section removal)
- **D-13:** Each plan produces a green build before the next begins

### Claude's Discretion
- How `ChartMergedForm` accepts edit-mode props (likely `initialData?: ChartWithProject` alongside the existing `mode` in `useChartForm`)
- Kebab menu component implementation (inline in chart-list vs. extracted component)
- "Manage Supplies" link styling (subtle vs. prominent)
- Whether to extract the delete confirmation dialog for reuse
- Test strategy for the edit form
- Unsaved changes guard approach

### Deferred Ideas (OUT OF SCOPE)
- Supply takeover in edit mode -- explicitly excluded per REQUIREMENTS.md Out of Scope. Supply management for existing projects lives on project detail Supplies tab
- Gallery card kebab menu -- excluded per DesignOS spec. Cards reused in non-action contexts
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| EDIT-01 | User edits an existing chart/project via the same merged form layout as creation (full-page, not modal) | `useChartForm` already supports `mode: "edit"` with `initialData` and `updateChart` branching. `ChartMergedForm` needs mode/initialData props. Edit route server component already fetches chart + reference data. |
| EDIT-02 | User navigates to edit from existing entry points (project detail, list-row kebab menu) | Hero edit button already works (`LinkButton href="/charts/[id]/edit"`). List-row kebab requires `DropdownMenu` with `router.push`. `HeroKebabMenu` provides reference pattern. |
| CLEAN-01 | Deprecated components removed (old chart form, old supply tab, old supply row components, edit modal) | 9 files deletable in Plan 1 (zero live imports). 12 files deletable in Plan 3 (after edit mode rewires importers). Dependency analysis verified. |
</phase_requirements>

## Project Constraints (from CLAUDE.md)

- **Server Components by default** -- "use client" only for interactivity
- **TDD mandatory** -- tests before implementation in all plans
- **Zod validation at boundaries** -- already handled by `chartFormSchema`
- **Colocated tests** -- `foo.test.tsx` next to `foo.tsx`
- **Import test utils from `@/__tests__/test-utils`** -- not `@testing-library/react`
- **Semantic design tokens** -- bg-card, border-border, text-muted-foreground; never hardcoded scales
- **Do NOT use `Button render={<Link>}`** -- use `LinkButton` or `buttonVariants()`
- **No nested forms** -- use `<div>` with `type="button"` handlers
- **Quality gates**: `/impeccable:polish` after UI plans, `/impeccable:audit` before verify
- **Pin exact versions** in package.json (no `^` or `~`)
- **DesignOS is the spec** -- use UI-SPEC and sketch findings as design contracts

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Edit form rendering | Browser / Client | -- | Interactive form with useState, event handlers |
| Edit route data fetching | Frontend Server (SSR) | -- | Server component fetches chart + reference data, passes as props |
| Form validation | Browser / Client | API / Backend | Client-side Zod parse first, server action re-validates |
| Chart/project mutation | API / Backend | -- | `updateChart` server action with `requireAuth()` + Prisma transaction |
| Navigation (kebab -> edit page) | Browser / Client | -- | Client-side `router.push` from DropdownMenu |
| Delete confirmation | Browser / Client | API / Backend | Client dialog + `deleteChart` server action |
| Dead code removal | N/A (build tooling) | -- | File deletion verified by TypeScript build |

## Standard Stack

### Core (already installed -- zero new dependencies)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16 | App Router, server components, routing | Project framework [VERIFIED: package.json] |
| @base-ui/react | 1.0.0-alpha.14 | DropdownMenu primitives (via shadcn/ui v4) | Project UI library [VERIFIED: package.json] |
| react | 19.1.0 | Component rendering, hooks | Project runtime [VERIFIED: package.json] |
| sonner | 2.0.2 | Toast notifications | Already used for post-action feedback [VERIFIED: codebase grep] |
| lucide-react | 0.501.0 | Icons (MoreHorizontal, Pencil, Trash2, ArrowLeft, ArrowRight) | Project icon library [VERIFIED: package.json] |
| zod | 3.24.4 | Form validation schema | Already used via `chartFormSchema` [VERIFIED: codebase] |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| vitest | 3.1.4 | Test runner | All test files [VERIFIED: package.json] |
| @testing-library/react | 16.3.0 | Component testing (via test-utils wrapper) | All component tests [VERIFIED: package.json] |
| @testing-library/user-event | 14.6.1 | User interaction simulation | Click, type tests [VERIFIED: package.json] |

### Alternatives Considered

None -- this phase uses exclusively the existing stack with zero new dependencies.

## Architecture Patterns

### System Architecture Diagram

```
                          LIST-ROW KEBAB
User clicks kebab ──> DropdownMenu ──> "Edit Project"
                                         |
                                    router.push(/charts/[id]/edit)
                                         |
                                         v
                          EDIT ROUTE (Server Component)
                    page.tsx fetches chart + reference data
                                         |
                                    passes props
                                         v
                          EDIT CLIENT (Client Component)
                    edit-client.tsx renders ChartMergedForm
                        with mode="edit" + initialData
                                         |
                                         v
                          CHART MERGED FORM
                    Same layout as creation, but:
                    - "Edit [Name]" heading
                    - "Save Changes" button
                    - ManageSuppliesLink replaces supply takeover
                    - No draft persistence
                                         |
                                    form.submitForm()
                                         |
                                         v
                          useChartForm (mode="edit")
                    Client-side Zod validation
                    Calls updateChart(chartId, formData)
                                         |
                                         v
                          updateChart SERVER ACTION
                    requireAuth() -> ownership check
                    Prisma $transaction (chart + project + fabric)
                                         |
                                    on success
                                         v
                    router.push(/charts/[chartId]) + toast.success("Changes saved")
```

### Recommended Project Structure

No new directories. All changes within existing structure:

```
src/
  app/(dashboard)/charts/[id]/edit/
    page.tsx                          # Server component (keep, already correct)
    edit-client.tsx                   # Client component (modify: swap modal for merged form)
  components/features/charts/
    chart-merged-form.tsx             # Extend with mode/initialData props
    use-chart-form.ts                 # Already edit-ready (no changes needed)
    chart-list.tsx                    # Replace inline buttons with kebab menu
    list-row-kebab-menu.tsx           # NEW: extracted kebab menu component
    manage-supplies-link.tsx          # NEW: contextual link for edit mode
    form-primitives/
      sticky-save-bar.tsx             # Add mode-aware labels
```

### Pattern 1: Form Mode Switching via Props

**What:** The `ChartMergedForm` receives an optional `mode` and `initialData` prop. It passes these through to `useChartForm`, which already handles the branching. The form conditionally renders different headings, save bar labels, and replaces the supply section. [VERIFIED: codebase analysis of use-chart-form.ts]

**When to use:** Any form that has create + edit modes with the same field layout.

**Example:**
```typescript
// Source: existing use-chart-form.ts pattern
interface ChartMergedFormProps {
  designers: Designer[];
  genres: Genre[];
  storageLocations: StorageLocationWithStats[];
  stitchingApps: StitchingAppWithStats[];
  unassignedFabrics: (Fabric & { brand: FabricBrand })[];
  // Edit mode props (optional -- absence means creation mode)
  mode?: "create" | "edit";
  initialData?: ChartWithProject;
}

// Inside the component:
const formMode = mode ?? "create";
const isEdit = formMode === "edit";

const form = useChartForm({
  mode: formMode,
  initialData: isEdit ? initialData : undefined,
  designers,
  genres,
  storageLocations,
  stitchingApps,
  onSuccess,
  getSupplyRows: isEdit ? undefined : () => adapterRef.current?.getRows() ?? [],
  onValidationError: isEdit ? undefined : () => setViewMode("form"),
});
```

### Pattern 2: Kebab Menu with Confirmation Dialog

**What:** A `DropdownMenu` with a `DropdownMenuItem` for each action. Destructive actions open a `Dialog` for confirmation. The dialog is controlled by local state, not the dropdown. [VERIFIED: existing HeroKebabMenu pattern]

**When to use:** Any list row or card that needs action overflow.

**Example:**
```typescript
// Source: existing hero-kebab-menu.tsx pattern
export function ListRowKebabMenu({ chartId, chartName }: Props) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger aria-label="Project actions" className="...">
          <MoreHorizontal className="size-5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={8} className="w-48">
          <DropdownMenuItem onClick={() => router.push(`/charts/${chartId}/edit`)}>
            <Pencil className="size-4" />
            Edit Project
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={() => setDialogOpen(true)}>
            <Trash2 className="size-4" />
            Delete Project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        {/* Confirmation dialog content */}
      </Dialog>
    </>
  );
}
```

### Pattern 3: Conditional Section Rendering

**What:** In edit mode, the milestone marker + supply takeover + supply mode Activity are entirely replaced by a `ManageSuppliesLink` component. No `Activity` wrapper needed -- the supply section simply does not render. [VERIFIED: CONTEXT.md D-01/D-02]

**When to use:** When a form has sections that only apply to one mode.

**Example:**
```typescript
// In ChartMergedForm:
{isEdit ? (
  <ManageSuppliesLink chartId={initialData!.id} />
) : (
  <>
    {/* Milestone marker with "Add supplies" CTA */}
    <div className="bg-primary/5 border-primary/15 ...">...</div>
  </>
)}

// The entire supply mode block (Activity + SummaryBar + CalculatorCard + SupplyTable)
// is wrapped in: {!isEdit && mode === "supply" && (...)}
```

### Anti-Patterns to Avoid

- **Do not keep draft persistence in edit mode:** The `saveDraftV2` / `loadDraftV2` / `clearDraft` calls are creation-only. Edit mode works on real server data, not local storage. The unmount auto-save effect must be gated on `formMode !== "edit"`. [VERIFIED: CONTEXT.md specifics]
- **Do not reuse `window.confirm` differently for edit vs create:** The `beforeunload` handler in `useChartForm` already works for both modes (it checks `isDirty`). No changes needed -- it naturally protects unsaved edits.
- **Do not pass `getSupplyRows` in edit mode:** The supply takeover does not exist in edit mode, so passing a supply row getter would cause the `createChartWithSupplies` path to execute on mode="edit". Set `getSupplyRows: undefined` for edit mode.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dropdown menu | Custom popover + click handler | `DropdownMenu` from shadcn/ui v4 | Focus management, keyboard nav, dismiss behavior, portal |
| Delete confirmation | Inline confirm/cancel | `Dialog` from shadcn/ui v4 | Focus trap, escape handling, backdrop |
| Form validation | Manual field checks | `chartFormSchema.safeParse()` + `useChartForm` | Already built and battle-tested |
| Unsaved changes guard | Custom navigation blocking | `beforeunload` handler in `useChartForm` | Already implemented, works for both modes |
| Toast notifications | Custom notification UI | `toast.success()` from sonner | Already used everywhere |

**Key insight:** This phase has zero greenfield infrastructure. Everything is extending and recomposing existing patterns.

## Common Pitfalls

### Pitfall 1: Deleting Files That Are Still Imported

**What goes wrong:** Deleting a file that is imported by another live file breaks the TypeScript build.
**Why it happens:** The dependency graph between deprecated files is interleaved -- `sections/` is imported by `chart-edit-modal`, which is imported by `chart-list` and `edit-client`.
**How to avoid:** Plan 1 deletes only files with zero live importers (9 files). Plan 3 deletes `chart-edit-modal` + `sections/` + `pattern-type-fields` (12 files) only after Plan 2 has rewired all importers. Run `npm run build` after each plan.
**Warning signs:** Build failure with "Module not found" errors.

### Pitfall 2: Draft Persistence Firing in Edit Mode

**What goes wrong:** The unmount auto-save writes edit-mode form values to `localStorage`, overwriting any creation draft.
**Why it happens:** The `useEffect` cleanup in `ChartMergedForm` runs `saveDraftV2()` on unmount without checking form mode.
**How to avoid:** Gate the auto-save effect on `formMode === "create"`. In edit mode, skip all draft logic: no `loadDraftV2`, no `saveDraftV2`, no `clearDraft`.
**Warning signs:** Navigating away from edit form and then going to create form shows stale data.

### Pitfall 3: Supply State Initialization in Edit Mode

**What goes wrong:** The `CreationFlowAdapter`, `SupplyTable`, and `CalcParams` state all initialize unnecessarily in edit mode, adding complexity.
**Why it happens:** They are created at the top of `ChartMergedForm` unconditionally.
**How to avoid:** In edit mode, these never render (the supply takeover section is replaced by `ManageSuppliesLink`). However, the adapter and supply state should still be gated with a check so they do not fire server actions (`getThreads`, etc.) on mount. Most are lazy-initialized via refs, so the actual risk is minimal, but the import of supply-table features should be inside the conditional render or behind a dynamic import.
**Warning signs:** Network requests for supply data when loading the edit form.

### Pitfall 4: Chart-List Test Assertions Breaking

**What goes wrong:** Existing `chart-list.test.tsx` has assertions like "Edit Chart" title (from ChartEditModal), edit/delete button aria-labels, and specific icon button patterns that will change.
**Why it happens:** The test expects pencil/trash icon buttons and the ChartEditModal dialog. After Plan 2, these become a kebab menu with different labels.
**How to avoid:** Update tests alongside the component changes. The new tests should assert kebab trigger, menu items ("Edit Project", "Delete Project"), and navigation rather than direct icon buttons.
**Warning signs:** Failing assertions on "Edit Chart" heading or aria-label patterns.

### Pitfall 5: Forgetting to Gate Activity Wrapper on Create Mode

**What goes wrong:** The `<Activity mode={...}>` wrapper for form/supply mode toggle is creation-only. In edit mode, there is no supply mode, so the Activity wrapper should not be used (or should always be "visible").
**Why it happens:** The Activity component is at the top level of the form JSX.
**How to avoid:** In edit mode, render the form content directly without the Activity wrapper. The supply mode state (`useState<"form" | "supply">`) is also creation-only and should not be initialized in edit mode.
**Warning signs:** Form fields not rendering or rendering in an unexpected hidden state.

## Code Examples

### Edit Mode Props for ChartMergedForm
```typescript
// Source: codebase analysis of current props + useChartForm interface
// [VERIFIED: use-chart-form.ts UseChartFormOptions interface]

interface ChartMergedFormProps {
  designers: Designer[];
  genres: Genre[];
  storageLocations: StorageLocationWithStats[];
  stitchingApps: StitchingAppWithStats[];
  unassignedFabrics: (Fabric & { brand: FabricBrand })[];
  // Edit mode (optional -- omit for creation)
  mode?: "create" | "edit";
  initialData?: ChartWithProject;
}
```

### ManageSuppliesLink Component
```typescript
// Source: UI-SPEC.md interaction contract
// [VERIFIED: 14-UI-SPEC.md ManageSuppliesLink section]

import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface ManageSuppliesLinkProps {
  chartId: string;
}

export function ManageSuppliesLink({ chartId }: ManageSuppliesLinkProps) {
  return (
    <div className="border-border rounded-lg border p-4">
      <p className="text-foreground text-sm">
        Supplies are managed on the project page
      </p>
      <Link
        href={`/charts/${chartId}?tab=supplies`}
        className="text-primary mt-1 inline-flex items-center gap-1 text-sm hover:underline"
      >
        Go to Supplies
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </div>
  );
}
```

### StickySaveBar Mode Adaptation
```typescript
// Source: UI-SPEC.md StickySaveBar contract
// [VERIFIED: 14-UI-SPEC.md and existing sticky-save-bar.tsx]

interface StickySaveBarProps {
  chartName: string;
  onSaveDraft?: () => void;       // undefined in edit mode
  onSubmit: () => void;
  isSubmitting: boolean;
  isSavingDraft?: boolean;        // undefined in edit mode
  saveDraftLabel?: string;        // undefined in edit mode
  mode?: "create" | "edit";       // controls labels
}

// In render:
const isEdit = mode === "edit";
// Primary CTA: "Save Changes" / "Saving..." in edit, "Create" / "Creating..." in create
// Secondary CTA: hidden in edit mode (no Save Draft)
```

### Edit-Client Rewiring
```typescript
// Source: existing edit-client.tsx pattern
// [VERIFIED: current edit-client.tsx + page.tsx]

"use client";

import { ChartMergedForm } from "@/components/features/charts/chart-merged-form";
import type { ChartWithProject } from "@/types/chart";
// ... other imports

export function EditChartPageClient({ chart, ...referenceData }: Props) {
  return (
    <ChartMergedForm
      mode="edit"
      initialData={chart}
      {...referenceData}
    />
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| ChartEditModal (dialog) | Full-page merged form at `/charts/[id]/edit` | Phase 14 | Better UX -- same layout as creation, no cramped modal |
| Inline Pencil/Trash buttons per row | Kebab DropdownMenu per row | Phase 14 | Cleaner table, consistent with hero kebab pattern |
| chart-add-form.tsx (old multi-section form) | chart-merged-form.tsx (single continuous page) | Phase 12 | Merged form replaced old section-based form |

**Deprecated/outdated:**
- `chart-add-form.tsx`: Replaced by `chart-merged-form.tsx` in Phase 12
- `chart-edit-modal.tsx`: Replaced by full-page edit route using merged form in Phase 14
- `sections/` directory (9 files): Only used by deprecated forms
- `project-supplies-tab.tsx`, `supply-row.tsx` (old), `supply-section.tsx`, `supply-footer-totals.tsx`: Replaced by unified supply-table feature in Phase 11
- `chart-detail.tsx`: Replaced by modular project-detail/ components in Phase 9

## Deletion Dependency Analysis

### Plan 1: Safe Deletions (9 files -- zero live importers)

| File | Reason Dead | Live Importers |
|------|-------------|----------------|
| `chart-add-form.tsx` | Replaced by merged form (Phase 12) | None |
| `chart-add-form.test.tsx` | Tests for above | None |
| `chart-detail.tsx` | Replaced by project-detail/ modules | None |
| `project-supplies-tab.tsx` | Replaced by supply-table feature | Only chart-detail (dead) |
| `project-supplies-tab.test.tsx` | Tests for above | None |
| `project-detail/supply-row.tsx` (old) | Replaced by supply-table-data-row | Only supply-section (dead) |
| `project-detail/supply-row.test.tsx` | Tests for above | None |
| `project-detail/supply-section.tsx` | Replaced by supply-table feature | None |
| `project-detail/supply-footer-totals.tsx` | Replaced by supply-table feature | None |

**Note on count:** CONTEXT.md says "12 files with zero active imports" for Plan 1, but `sections/` (9 files) and `form-primitives/pattern-type-fields.tsx` are actively imported by `chart-edit-modal.tsx`, which itself is still imported by `chart-list.tsx` and `edit-client.tsx`. Those files must wait for Plan 3 after the modal's importers are rewired. The verified safe count for Plan 1 is 9 files.

### Plan 3: Post-Rewire Deletions (12 files)

| File | Blocked By | Unblocked After |
|------|-----------|-----------------|
| `chart-edit-modal.tsx` | chart-list.tsx, edit-client.tsx | Plan 2 rewires both |
| `chart-edit-modal.test.tsx` | Tests for above | Plan 2 |
| `sections/basic-info-section.tsx` | chart-edit-modal.tsx | Plan 3 (modal deleted) |
| `sections/stitch-count-section.tsx` | chart-edit-modal.tsx | Plan 3 |
| `sections/genre-section.tsx` | chart-edit-modal.tsx | Plan 3 |
| `sections/pattern-type-section.tsx` | chart-edit-modal.tsx | Plan 3 |
| `sections/project-setup-section.tsx` | chart-edit-modal.tsx | Plan 3 |
| `sections/project-setup-section.test.tsx` | chart-edit-modal.tsx | Plan 3 |
| `sections/dates-section.tsx` | chart-edit-modal.tsx | Plan 3 |
| `sections/goals-section.tsx` | chart-edit-modal.tsx | Plan 3 |
| `sections/notes-section.tsx` | chart-edit-modal.tsx | Plan 3 |
| `form-primitives/pattern-type-fields.tsx` | sections/pattern-type-section | Plan 3 |

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | `CreationFlowAdapter` ref initialization does not fire server actions on mount (lazy via ref pattern) | Pitfalls #3 | Unnecessary network requests on edit page load; fix: conditional initialization |
| A2 | `DropdownMenuItem` onClick fires before the dropdown closes (allowing `router.push` to work) | Patterns #2 | Edit navigation may not trigger; fix: use `onSelect` instead of `onClick` |

## Open Questions

1. **Supply state import weight in edit mode**
   - What we know: `ChartMergedForm` imports supply-table, supply actions, and CreationFlowAdapter even in edit mode
   - What's unclear: Whether Next.js tree-shakes these effectively when the supply section conditionally renders null
   - Recommendation: Low risk. These are already bundled in the page. If code-splitting is desired later, extract the supply mode into a lazy-loaded sub-component. Not needed for Phase 14.

2. **Chart with no project (orphan chart scenario)**
   - What we know: `ChartWithProject` has `project: ProjectWithRelations | null`. The edit form works on chart+project, but a chart could theoretically have no project.
   - What's unclear: Whether the edit route should handle this edge case or assume all charts have projects.
   - Recommendation: The app creates charts with projects atomically (`createChart` always creates both). A null project on the edit route should return `notFound()`. The existing `page.tsx` already checks `if (!chart) notFound()` but does not check for project. Add a `chart.project` null check. Low priority -- this state should not occur in practice.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 3.1.4 + @testing-library/react 16.3.0 |
| Config file | `vitest.config.ts` |
| Quick run command | `npx vitest run --reporter=dot` |
| Full suite command | `npm test` |

### Phase Requirements -> Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| EDIT-01a | ChartMergedForm renders in edit mode with pre-populated fields | unit | `npx vitest run src/components/features/charts/chart-merged-form.test.tsx -t "edit mode"` | Existing file, new tests needed (Wave 0) |
| EDIT-01b | StickySaveBar shows "Save Changes" in edit mode, hides Save Draft | unit | `npx vitest run src/components/features/charts/form-primitives/sticky-save-bar.test.tsx -t "edit mode"` | Existing file, new tests needed (Wave 0) |
| EDIT-01c | ManageSuppliesLink renders with correct href and copy | unit | `npx vitest run src/components/features/charts/manage-supplies-link.test.tsx` | New file (Wave 0) |
| EDIT-01d | Edit form calls updateChart on submit (not createChart) | unit | `npx vitest run src/components/features/charts/use-chart-form.test.ts -t "edit mode"` | Check if exists |
| EDIT-01e | Draft persistence skipped in edit mode | unit | `npx vitest run src/components/features/charts/chart-merged-form.test.tsx -t "draft"` | Existing file, new tests needed |
| EDIT-02a | ListRowKebabMenu renders Edit + Delete items | unit | `npx vitest run src/components/features/charts/list-row-kebab-menu.test.tsx` | New file (Wave 0) |
| EDIT-02b | ListRowKebabMenu Edit navigates to /charts/[id]/edit | unit | `npx vitest run src/components/features/charts/list-row-kebab-menu.test.tsx -t "edit"` | New file (Wave 0) |
| EDIT-02c | ListRowKebabMenu Delete opens confirmation dialog | unit | `npx vitest run src/components/features/charts/list-row-kebab-menu.test.tsx -t "delete"` | New file (Wave 0) |
| EDIT-02d | chart-list.tsx uses kebab menu, no more inline buttons | unit | `npx vitest run src/components/features/charts/chart-list.test.tsx` | Existing file, tests need update |
| CLEAN-01a | Build passes after Plan 1 deletions | build | `npm run build` | N/A |
| CLEAN-01b | Build passes after Plan 3 deletions | build | `npm run build` | N/A |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=dot` (quick full suite, ~20s)
- **Per plan merge:** `npm run build && npm test` (full build + full test suite)
- **Phase gate:** Full suite green + build green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `src/components/features/charts/list-row-kebab-menu.test.tsx` -- covers EDIT-02a/b/c
- [ ] `src/components/features/charts/manage-supplies-link.test.tsx` -- covers EDIT-01c
- [ ] Edit mode test cases in existing `chart-merged-form.test.tsx` -- covers EDIT-01a/d/e
- [ ] Edit mode test cases in existing `sticky-save-bar.test.tsx` -- covers EDIT-01b

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | `requireAuth()` in `updateChart` server action (already implemented) |
| V3 Session Management | no | No session changes in this phase |
| V4 Access Control | yes | Ownership check in `updateChart` (verifies `project.userId === user.id`) (already implemented) |
| V5 Input Validation | yes | `chartFormSchema.parse()` in both client and server action (already implemented) |
| V6 Cryptography | no | No crypto operations |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Unauthorized edit (IDOR) | Tampering | `updateChart` checks `project.userId === user.id` before mutation [VERIFIED: chart-actions.ts L220-225] |
| Invalid form data | Tampering | Zod schema validation on client + server [VERIFIED: chart-actions.ts L228] |
| XSS via form fields | Tampering | React auto-escapes rendered strings; no raw HTML injection used [VERIFIED: codebase] |

**Assessment:** No new security surface. All mutations go through existing server actions with auth + ownership + validation. The edit form reuses the same `updateChart` action already protected.

## Sources

### Primary (HIGH confidence)
- `src/components/features/charts/use-chart-form.ts` -- Edit mode support verified (mode, initialData, buildInitialValues, updateChart branching)
- `src/components/features/charts/chart-merged-form.tsx` -- Current creation-only form analyzed
- `src/lib/actions/chart-actions.ts` -- updateChart server action verified (auth, ownership, $transaction, fabric link/unlink)
- `src/components/features/charts/project-detail/hero-kebab-menu.tsx` -- Reference kebab pattern verified
- `src/components/ui/dropdown-menu.tsx` -- DropdownMenuItem variant="destructive" prop verified
- `src/components/features/charts/chart-list.tsx` -- Current inline button pattern analyzed
- `src/app/(dashboard)/charts/[id]/edit/page.tsx` -- Server component data fetching verified
- `src/app/(dashboard)/charts/[id]/edit/edit-client.tsx` -- Current ChartEditModal wrapper analyzed
- `src/components/features/charts/form-primitives/sticky-save-bar.tsx` -- Current creation-only labels analyzed
- `.planning/phases/14-edit-mode-cleanup/14-CONTEXT.md` -- User decisions
- `.planning/phases/14-edit-mode-cleanup/14-UI-SPEC.md` -- Visual/interaction contract

### Secondary (MEDIUM confidence)
- Dependency analysis via `grep -rl` across codebase for import chains
- Test infrastructure analysis from `vitest.config.ts` and existing test files

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- zero new dependencies, all existing libraries
- Architecture: HIGH -- extending existing patterns (useChartForm, HeroKebabMenu, merged form)
- Pitfalls: HIGH -- identified from direct codebase analysis of the specific files being modified
- Deletion safety: HIGH -- import chain analysis verified via grep

**Research date:** 2026-05-16
**Valid until:** Indefinite (internal codebase patterns, not external library concerns)
