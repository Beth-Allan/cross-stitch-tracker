---
phase: quick
plan: 260411-jhw
type: execute
wave: 1
depends_on: []
files_modified:
  - src/app/(dashboard)/charts/page.tsx
  - src/components/features/charts/chart-list.tsx
  - src/components/features/charts/chart-list.test.tsx
autonomous: true
must_haves:
  truths:
    - "Each chart row has edit and delete action buttons"
    - "Clicking edit opens the ChartEditModal for that chart"
    - "Clicking delete opens a confirmation dialog, confirming deletes the chart"
    - "Action buttons match the designer-list/genre-list visual pattern (opacity-40, hover reveal)"
    - "Mobile card layout includes edit/delete buttons"
  artifacts:
    - path: "src/components/features/charts/chart-list.tsx"
      provides: "Client component with chart rows, edit/delete actions, modals"
    - path: "src/components/features/charts/chart-list.test.tsx"
      provides: "Tests for rendering, edit button, delete flow"
    - path: "src/app/(dashboard)/charts/page.tsx"
      provides: "Server page fetching charts + designers + genres, passing to ChartList"
  key_links:
    - from: "src/app/(dashboard)/charts/page.tsx"
      to: "src/components/features/charts/chart-list.tsx"
      via: "passes charts, designers, genres as props"
    - from: "src/components/features/charts/chart-list.tsx"
      to: "src/components/features/charts/chart-edit-modal.tsx"
      via: "opens modal with editingChart state"
    - from: "src/components/features/charts/chart-list.tsx"
      to: "src/lib/actions/chart-actions.ts deleteChart"
      via: "calls deleteChart on delete confirmation"
---

<objective>
Add edit/delete action buttons to the charts list page, matching the pattern used on designer-list and genre-list pages.

Purpose: Charts list is currently read-only with no inline actions. Designers and genres both have edit (pencil) and delete (trash) buttons in each row that open modals. Charts need the same UX for consistency and usability.

Output: A new `ChartList` client component with action buttons, wired to the existing `ChartEditModal` and a delete confirmation dialog. The server page fetches designers + genres (needed by ChartEditModal) alongside charts.
</objective>

<execution_context>
@/Users/wanderskye/Projects/cross-stitch-tracker/.claude/get-shit-done/workflows/execute-plan.md
@/Users/wanderskye/Projects/cross-stitch-tracker/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/components/features/designers/designer-list.tsx (reference pattern — action buttons, modals, row/card layout)
@src/components/features/genres/genre-list.tsx (reference pattern — same approach)
@src/app/(dashboard)/charts/page.tsx (current server page to modify)
@src/components/features/charts/chart-edit-modal.tsx (existing modal to wire up)
@src/components/features/charts/chart-detail.tsx (has DeleteChartDialog pattern to reuse)
@src/lib/actions/chart-actions.ts (getCharts, deleteChart)
@src/lib/actions/designer-actions.ts (getDesigners)
@src/lib/actions/genre-actions.ts (getGenres — note: the function is named getGenres, not getGenresSimple)
@src/types/chart.ts (ChartWithProject type)
@src/__tests__/mocks/factories.ts (createMockChartWithRelations, createMockDesigner)

<interfaces>
<!-- Key types and contracts the executor needs -->

From src/types/chart.ts:
```typescript
export type ChartWithProject = Chart & {
  project: Project | null;
  designer: Designer | null;
  genres: Genre[];
};
```

From src/components/features/charts/chart-edit-modal.tsx:
```typescript
interface ChartEditModalProps {
  chart: ChartWithProject;
  designers: Designer[];
  genres: Genre[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}
```

From src/lib/actions/chart-actions.ts:
```typescript
export async function getCharts()  // returns Chart[] with project, designer, genres included
export async function deleteChart(chartId: string) // returns { success: true } | { success: false, error: string }
```

From src/lib/actions/designer-actions.ts:
```typescript
export async function getDesigners() // returns Designer[]
```

From src/lib/actions/genre-actions.ts:
```typescript
export async function getGenres() // returns Genre[] — note: NOT getGenresWithStats
```

The `getCharts()` return type is `ChartWithProject[]` (Chart with project, designer, genres via Prisma include). This is the SAME type that `ChartEditModal` expects for its `chart` prop.

From src/components/features/designers/delete-confirmation-dialog.tsx:
```typescript
interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  entityName: string;
  chartCount: number;  // not relevant for charts — use 0
  entityType: "designer" | "genre" | "brand" | "supply";  // NOTE: no "chart" type
  onConfirm: () => Promise<void>;
}
```
The existing DeleteConfirmationDialog does NOT support entityType "chart". Instead, follow the pattern from chart-detail.tsx which has its own inline DeleteChartDialog using Dialog + DialogTrigger directly.
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Create ChartList client component with tests</name>
  <files>src/components/features/charts/chart-list.tsx, src/components/features/charts/chart-list.test.tsx</files>
  <behavior>
    - Test 1: Renders chart names in a table when charts are provided
    - Test 2: Renders empty state when no charts provided (cross-stitch grid pattern + "Your collection awaits")
    - Test 3: Each chart row has edit and delete buttons with proper aria-labels
    - Test 4: Clicking edit button opens the ChartEditModal (verify dialog title "Edit Chart" appears)
    - Test 5: Clicking delete button opens delete confirmation dialog (verify "Delete Chart" dialog appears)
    - Test 6: Confirming delete calls deleteChart server action
    - Test 7: Mobile card layout renders chart names and action buttons
  </behavior>
  <action>
Create `chart-list.test.tsx` first with the behaviors above. Mock `chart-actions` (deleteChart), `designer-actions`, `genre-actions`, `next/navigation` (useRouter), and `sonner` (toast). Use `createMockChartWithRelations` and `createMockDesigner` from `@/__tests__/mocks`.

Then create `chart-list.tsx` as a "use client" component. Follow the designer-list.tsx pattern exactly:

**Props:** `{ charts: ChartWithProject[], designers: Designer[], genres: Genre[] }`

**State:**
- `editingChart: ChartWithProject | null` — which chart's edit modal is open
- `deletingChart: ChartWithProject | null` — which chart's delete dialog is open

**Structure (matching designer-list):**
1. Header row with title "Charts" and LinkButton to "/charts/new" (keep using LinkButton since "Add Chart" is navigation, not a button action)
2. Desktop table (`hidden md:block`) with columns: Chart (thumbnail + name + stitch count), Designer, Status, Size, Added, Actions (w-20 column)
3. Mobile cards (`md:hidden`) with chart name, designer, status, and action buttons
4. ChartEditModal — opened when `editingChart` is set, passes `editingChart`, `designers`, `genres`
5. Delete confirmation dialog — build inline like DeleteChartDialog in chart-detail.tsx (NOT the DeleteConfirmationDialog from designers, which doesn't support "chart" entityType). Use Dialog/DialogContent/DialogHeader/DialogTitle/DialogDescription/DialogFooter pattern. Description: "This will permanently delete {name} and all associated project data. This cannot be undone."

**ChartRow sub-component:**
- Same structure as current `ChartRow` in page.tsx (Link with thumbnail, name, stitches, designer, status badge, size badge, date)
- Add actions column (last td) with edit/delete buttons using the designer-list opacity pattern:
  ```
  <div className="flex items-center justify-end gap-1 opacity-40 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
  ```
- Edit button: `<Pencil className="h-3.5 w-3.5" />` with aria-label `Edit {chartName}`
- Delete button: `<Trash2 className="h-3.5 w-3.5" />` with aria-label `Delete {chartName}`, hover:text-destructive

**ChartCard sub-component (mobile):**
- Same card layout as DesignerCard: rounded-xl border, name as Link, action buttons in top-right
- Show designer name, status badge, stitch count as metadata below the name

**Delete handler:** Call `deleteChart(id)`, check `result.success`, toast success/error, `router.refresh()` on success. Wrap in try/catch.

**handleEdit callback for onSuccess:** Call `router.refresh()` to pick up updated data.

**Important:**
- Import `StatusBadge` and `SizeBadge` from existing chart components
- Import `CoverThumbnail` — extract the existing one from page.tsx or re-create inline (it's small: just img or placeholder div)
- Import `getEffectiveStitchCount` from `@/lib/utils/size-category`
- Use `LinkButton` from `@/components/ui/link-button` for the "Add Chart" button (it's navigation)
- Do NOT import `buttonVariants` from `@/components/ui/button` (this is a client component so either import works, but we don't need it)
- Use semantic design tokens throughout, never hardcoded colors
  </action>
  <verify>
    <automated>cd /Users/wanderskye/Projects/cross-stitch-tracker && npx vitest run src/components/features/charts/chart-list.test.tsx</automated>
  </verify>
  <done>ChartList component renders charts with edit/delete action buttons. Edit opens ChartEditModal. Delete opens confirmation dialog and calls deleteChart. All tests pass.</done>
</task>

<task type="auto">
  <name>Task 2: Wire charts page to use ChartList client component</name>
  <files>src/app/(dashboard)/charts/page.tsx</files>
  <action>
Modify the server page to:

1. Import `getDesigners` from `@/lib/actions/designer-actions` and `getGenres` from `@/lib/actions/genre-actions` (note: import from `genre-actions`, function is `getGenres`)
2. Import the new `ChartList` from `@/components/features/charts/chart-list`
3. Fetch all three in parallel using `Promise.all`:
   ```typescript
   const [charts, designers, genres] = await Promise.all([
     getCharts(),
     getDesigners(),
     getGenres(),
   ]);
   ```
4. Replace the inline `ChartsList`/`ChartRow`/`CoverThumbnail`/`EmptyState` components with a single `<ChartList charts={charts} designers={designers} genres={genres} />`
5. Remove ALL the inline server sub-components (`ChartsList`, `ChartRow`, `CoverThumbnail`, `EmptyState`, the `ChartWithRelations` type alias) — they're now in the client component
6. Keep imports: `getCharts` (still needed), plus add `getDesigners`, `getGenres`, and `ChartList`
7. Remove unused imports: `Link`, `Plus`, `Image as ImageIcon`, `getEffectiveStitchCount`, `StatusBadge`, `SizeBadge`, `LinkButton`

The page should be ~15 lines: imports, async function, Promise.all, return ChartList.
  </action>
  <verify>
    <automated>cd /Users/wanderskye/Projects/cross-stitch-tracker && npx vitest run src/components/features/charts/chart-list.test.tsx && npm run build 2>&1 | tail -5</automated>
  </verify>
  <done>Charts page fetches designers and genres alongside charts, passes all to ChartList. Build succeeds with no type errors. No unused imports.</done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

| Boundary | Description |
|----------|-------------|
| client -> deleteChart | User-initiated delete crosses to server action |

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-quick-01 | Spoofing | deleteChart | accept | Already mitigated: deleteChart checks requireAuth() + ownership (project.userId === user.id) |
| T-quick-02 | Tampering | chart ID | accept | Already mitigated: deleteChart verifies chart ownership before deletion |
| T-quick-03 | Denial of Service | rapid delete clicks | mitigate | useTransition isPending disables the confirm button, preventing duplicate calls |
</threat_model>

<verification>
- `npx vitest run src/components/features/charts/chart-list.test.tsx` — all tests pass
- `npm run build` — no type errors, no unused imports
- Manual: visit /charts, see edit/delete buttons on each row, edit opens modal, delete opens confirmation
</verification>

<success_criteria>
- Charts list page has Pencil (edit) and Trash2 (delete) action buttons on every row
- Edit button opens ChartEditModal pre-filled with that chart's data
- Delete button opens a styled confirmation dialog (not window.confirm)
- Confirming delete removes the chart and shows success toast
- Action button styling matches designer-list: opacity-40 default, full opacity on hover/focus-within
- Mobile card layout includes action buttons
- All existing chart list functionality preserved (thumbnail, name, designer, status, size, date)
</success_criteria>

<output>
After completion, create `.planning/quick/260411-jhw-chart-list-edit-delete-actions-matching-/260411-jhw-SUMMARY.md`
</output>
