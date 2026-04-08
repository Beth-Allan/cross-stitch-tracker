---
phase: 03-designer-genre-pages
verified: 2026-04-08T16:45:00Z
status: gaps_found
score: 4/5 roadmap success criteria verified
re_verification: false
gaps:
  - truth: "User can delete designers from a dedicated page"
    status: failed
    reason: "Delete button in DesignerRow and DesignerCard (designer-list.tsx lines 331, 386) renders with no onClick handler. Clicking delete from the designer list does nothing. DeleteConfirmationDialog is never opened from the list — only from the detail page."
    artifacts:
      - path: "src/components/features/designers/designer-list.tsx"
        issue: "DesignerRow (line 330) and DesignerCard (line 384) have Trash2 buttons with no onClick. The delete flow (deletingDesigner state, DeleteConfirmationDialog wiring) is entirely absent."
    missing:
      - "Add deletingDesigner state to DesignerList"
      - "Pass onDelete callback to DesignerRow and DesignerCard props"
      - "Wire DeleteConfirmationDialog into DesignerList (mirrors GenreDetail pattern)"
      - "Add test for clicking delete button triggers confirmation dialog"

  - truth: "User can delete genres from a dedicated page (consistent UX)"
    status: failed
    reason: "GenreList uses window.confirm() (line 252) instead of DeleteConfirmationDialog. This is inconsistent with GenreDetail (which uses the dialog correctly), is untestable in JSDOM, and does not show the chart count in the UI-SPEC styled dialog."
    artifacts:
      - path: "src/components/features/genres/genre-list.tsx"
        issue: "handleDelete() calls confirm() directly at line 252-258 instead of opening DeleteConfirmationDialog"
    missing:
      - "Replace window.confirm() with DeleteConfirmationDialog in GenreList"
      - "Add deletingGenre state to hold the genre being deleted"
      - "Wire DeleteConfirmationDialog with entityType='genre'"
      - "Add test for clicking delete triggers the dialog (not confirm())"
human_verification:
  - test: "Designer list page — delete from list row"
    expected: "Clicking the Trash2 icon on a designer row opens a DeleteConfirmationDialog with the designer name, chart count, and 'Charts will NOT be deleted' text. Confirming deletes the designer and refreshes the list."
    why_human: "WR-01 is a gap (no onClick), but even after fix, the full dialog flow requires visual and interaction confirmation that automated tests cannot fully cover."

  - test: "Genre list page — delete from list row"
    expected: "Clicking the Trash2 icon on a genre row opens DeleteConfirmationDialog (not a browser confirm dialog). Dialog shows 'Charts will NOT be deleted'. Confirming deletes the genre."
    why_human: "WR-02 uses confirm() which is untestable in JSDOM. After fix, verify the dialog renders and behaves correctly."

  - test: "Designer list — sortable table interaction"
    expected: "Clicking DESIGNER, CHARTS, or FINISHED column headers toggles sort direction (A-Z / Z-A or high-low / low-high). Active column header text turns primary color with chevron indicator."
    why_human: "Client-side sort state changes and visual feedback cannot be verified programmatically."

  - test: "Designer detail page — full stats display"
    expected: "Stats row shows Charts (count), Started (count), Finished (count with primary color), and Top Genre (amber badge or em dash). Chart list rows show thumbnail, name linking to /charts/[id], stitch count, size badge, and status badge."
    why_human: "Computed stats (projectsStarted/Finished/topGenre) depend on live database data. Visual accuracy of amber badge, status badge colors, and progress bars requires human inspection."

  - test: "Genre detail page — chart list"
    expected: "Genre detail shows chartCount stat, and chart rows link to /charts/[id] with thumbnail, stitch count, status badge."
    why_human: "Live data rendering and link targets require human verification."

  - test: "Mobile responsive layout"
    expected: "Below 768px, both designer and genre list pages show card layout instead of table. Cards show name, chart count, and always-visible edit/delete icons."
    why_human: "CSS media queries are not evaluated in JSDOM."

  - test: "404 for non-existent IDs"
    expected: "Navigating to /designers/nonexistent-id and /genres/nonexistent-id shows Next.js 404 page."
    why_human: "notFound() behavior requires a running server to verify."

  - test: "Duplicate name validation"
    expected: "Creating or editing a designer/genre with a name that already exists shows 'A designer/genre with that name already exists' error inline below the name field."
    why_human: "Error display inline vs toast requires visual confirmation; P2002 path needs live database."
---

# Phase 3: Designer & Genre Pages Verification Report

**Phase Goal:** Users can manage designers and genres with dedicated pages — list, create, edit, delete — not just inline creation from the chart form
**Verified:** 2026-04-08T16:45:00Z
**Status:** gaps_found
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths (Roadmap Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | User can view a list of all designers with chart counts | VERIFIED | `/designers/page.tsx` calls `getDesignersWithStats()`, passes to `DesignerList`. Action queries `prisma.designer.findMany` with `_count.charts`. Renders sortable table with CHARTS column. |
| 2 | User can create, edit, and delete designers from a dedicated page | PARTIAL | Create: DesignerFormModal wired via "Add Designer" button (VERIFIED). Edit: DesignerFormModal wired via row edit icon (VERIFIED). Delete: Trash2 button in DesignerRow/DesignerCard has NO onClick handler — delete is non-functional from the list. Delete works from the detail page only. |
| 3 | User can view a list of all genres with chart counts | VERIFIED | `/genres/page.tsx` calls `getGenresWithStats()`, passes to `GenreList`. Renders 2-column sortable table with CHARTS column. |
| 4 | User can create, edit, and delete genres from a dedicated page | PARTIAL | Create/Edit: wired and working (VERIFIED). Delete: uses `window.confirm()` instead of `DeleteConfirmationDialog` — inconsistent, untestable, and does not show the styled dialog with chart count warning. Functional but incorrect implementation. |
| 5 | Designer/genre detail views show associated charts | VERIFIED | `DesignerDetail` renders chart list with thumbnail, name (linked to `/charts/[id]`), stitch count, SizeBadge, StatusBadge, progress bar. `GenreDetail` follows same pattern. Both backed by `getDesigner`/`getGenre` which include full chart data. |

**Score:** 4/5 truths verified (truths 2 and 4 are partial failures)

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `prisma/schema.prisma` | Designer model with `notes String?` | VERIFIED | Line 29: `notes     String?` present inside Designer model block |
| `src/lib/validations/chart.ts` | designerSchema with notes validation | VERIFIED | Line 62: `notes: z.string().max(5000, "Notes too long").nullable().default(null)` |
| `src/types/designer.ts` | DesignerWithStats, DesignerDetail, DesignerChart | VERIFIED | All three types exported with correct shapes |
| `src/types/genre.ts` | GenreWithStats, GenreDetail, GenreChart | VERIFIED | All three types exported with correct shapes |
| `src/lib/actions/designer-actions.ts` | Full CRUD + stats (5 actions) | VERIFIED | createDesigner, updateDesigner, deleteDesigner, getDesigner, getDesignersWithStats all exported and implemented |
| `src/lib/actions/genre-actions.ts` | Full CRUD + stats (5 actions) | VERIFIED | createGenre, updateGenre, deleteGenre, getGenre, getGenresWithStats all exported and implemented |
| `src/app/(dashboard)/designers/page.tsx` | Server Component list page | VERIFIED | No "use client", imports and calls `getDesignersWithStats()`, renders `<DesignerList>` |
| `src/app/(dashboard)/designers/[id]/page.tsx` | Server Component detail route | VERIFIED | `await params`, `notFound()` guard, calls `getDesigner(id)`, renders `<DesignerDetail>` |
| `src/app/(dashboard)/genres/page.tsx` | Server Component list page | VERIFIED | No "use client", imports and calls `getGenresWithStats()`, renders `<GenreList>` |
| `src/app/(dashboard)/genres/[id]/page.tsx` | Server Component detail route | VERIFIED | `await params`, `notFound()` guard, calls `getGenre(id)`, renders `<GenreDetail>` |
| `src/components/features/designers/designer-list.tsx` | Client sortable table | STUB (partial) | "use client", search, sort, create/edit modals wired. Delete button rendered but NO onClick — delete non-functional from list. |
| `src/components/features/designers/designer-form-modal.tsx` | Create/edit modal form | VERIFIED | Create and edit modes, 3 fields (name/website/notes), toast feedback, useTransition |
| `src/components/features/designers/designer-detail.tsx` | Client detail with stats, chart list | VERIFIED | Stats row (Charts/Started/Finished/TopGenre), chart list with thumbnail+link+badges, edit/delete wired correctly |
| `src/components/features/designers/delete-confirmation-dialog.tsx` | Shared delete confirmation | VERIFIED | "use client", "Charts will NOT be deleted", entityType variant, useTransition, "Deleting..." pending state |
| `src/components/features/genres/genre-list.tsx` | Client sortable table | STUB (partial) | "use client", 2-column table, search, create/edit modals wired. Delete uses `window.confirm()` — inconsistent with design and untestable. |
| `src/components/features/genres/genre-form-modal.tsx` | Name-only modal form | VERIFIED | "use client", name field only (no website, no notes per D-04) |
| `src/components/features/genres/genre-detail.tsx` | Client detail with chart list | VERIFIED | chartCount stat, chart list, edit/delete properly wired with DeleteConfirmationDialog |
| `src/components/shell/nav-items.ts` | Designers and Genres nav items | VERIFIED | "Designers" (Paintbrush icon) at index 2, "Genres" (Tags icon) at index 3, both after "Charts" |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|----|--------|---------|
| `designers/page.tsx` | `designer-actions.ts` | `getDesignersWithStats()` | WIRED | Import + call both present |
| `genres/page.tsx` | `genre-actions.ts` | `getGenresWithStats()` | WIRED | Import + call both present |
| `designers/[id]/page.tsx` | `designer-actions.ts` | `getDesigner(id)` | WIRED | Import + call both present |
| `genres/[id]/page.tsx` | `genre-actions.ts` | `getGenre(id)` | WIRED | Import + call both present |
| `designer-actions.ts` | `prisma.designer` | findMany / findUnique / create / update / delete | WIRED | All 5 operations present with `_count` and includes |
| `designer-actions.ts` | `src/lib/validations/chart.ts` | `designerSchema.parse()` | WIRED | Lines 14, 39 |
| `genre-actions.ts` | `prisma.genre` | findMany / findUnique / create / update / delete | WIRED | All 5 operations present |
| `designer-detail.tsx` | `designer-actions.ts` | `deleteDesigner(id)` | WIRED | Import line 22, call line 106 |
| `genre-detail.tsx` | `genre-actions.ts` | `deleteGenre(id)` | WIRED | Import line 20, call line 102 |
| `designer-list.tsx` | `designer-actions.ts` | `createDesigner`/`updateDesigner` | WIRED | Via DesignerFormModal which calls both actions |
| `designer-list.tsx` | `designer-actions.ts` | `deleteDesigner` | NOT_WIRED | deleteDesigner is never called from designer-list.tsx — delete button has no handler |
| `genre-list.tsx` | `genre-actions.ts` | `createGenre`/`updateGenre` | WIRED | Via GenreFormModal |
| `genre-list.tsx` | `genre-actions.ts` | `deleteGenre` | PARTIAL | deleteGenre is called, but via window.confirm() path — DeleteConfirmationDialog not used |

---

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `designers/page.tsx` → `DesignerList` | `designers: DesignerWithStats[]` | `getDesignersWithStats()` → `prisma.designer.findMany` with `_count` | Yes — Prisma query with `orderBy: { name: "asc" }` | FLOWING |
| `designers/[id]/page.tsx` → `DesignerDetail` | `designer: DesignerDetail` | `getDesigner(id)` → `prisma.designer.findUnique` with nested chart includes | Yes — full chart data + computed stats (projectsStarted, projectsFinished, topGenre) | FLOWING |
| `genres/page.tsx` → `GenreList` | `genres: GenreWithStats[]` | `getGenresWithStats()` → `prisma.genre.findMany` with `_count` | Yes | FLOWING |
| `genres/[id]/page.tsx` → `GenreDetail` | `genre: GenreDetail` | `getGenre(id)` → `prisma.genre.findUnique` with `_count` and charts | Yes | FLOWING |

---

### Behavioral Spot-Checks

Step 7b: SKIPPED — this phase produces Next.js server components and client components that require a running dev server. No standalone CLI/module entry points exist to test in isolation. Human verification items cover the equivalent checks.

---

### Requirements Coverage

| Requirement | Source Plan(s) | Description | Status | Evidence |
|-------------|---------------|-------------|--------|----------|
| PROJ-06 | 03-01, 03-02, 03-04 | User can create, edit, and delete designers and link them to projects | PARTIAL | Create/edit/detail: VERIFIED. Delete from list: NOT WIRED (WR-01). Delete from detail page: VERIFIED. Link to charts: VERIFIED via DesignerDetail chart list linking to /charts/[id]. |
| PROJ-07 | 03-01, 03-03, 03-04 | User can create, edit, and manage genre tags and apply them to projects | PARTIAL | Create/edit/detail: VERIFIED. Delete from list: uses window.confirm() (WR-02). Delete from detail page: VERIFIED. Genre tags applied to charts: VERIFIED via existing chart form InlineDesignerDialog pattern unchanged. |

No orphaned requirements — both PROJ-06 and PROJ-07 are claimed by Phase 3 plans and accounted for.

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `designer-list.tsx` | 330, 386 | Trash2 button with no `onClick` prop | BLOCKER | Delete is non-functional from designer list page — goal not achieved |
| `genre-list.tsx` | 252 | `window.confirm()` instead of `DeleteConfirmationDialog` | WARNING | Inconsistent UX, untestable in JSDOM, blocking browser API |
| `delete-confirmation-dialog.tsx` | 37-38 | `onOpenChange(false)` called unconditionally after `await onConfirm()` — dialog always closes even on error | WARNING | User cannot retry deletion after error; dialog disappears before error toast is visible |
| `designer-list.tsx` | 93-94 | FINISHED sort key falls back to chartCount with comment `// Not available from DesignerWithStats` | INFO | Misleading: clicking FINISHED column header sorts by chart count silently |
| `designer-detail.tsx` | 190-191, `genre-detail.tsx` | Hardcoded `bg-emerald-50 text-emerald-700` and `border-amber-200 bg-amber-50 text-amber-700` | INFO | Violates project convention (base-ui-patterns.md: semantic tokens only) |
| `designer-detail.tsx` + `genre-detail.tsx` | Both | Duplicated `STATUS_ORDER` and `formatNumber` definitions | INFO | Any future change must be made in two places |
| `src/lib/validations/chart.ts` | 61 | `website` field rejects `""` with "Must be a valid URL" before nullable check | INFO | Form guards this client-side; direct action calls with `website: ""` return confusing error |

---

### Human Verification Required

#### 1. Designer List — Delete from Row

**Test:** Log in and navigate to /designers. Hover over a designer row. Click the Trash2 (delete) icon.
**Expected:** A `DeleteConfirmationDialog` opens showing the designer name, chart count, and "Charts will NOT be deleted". Confirming deletes the designer and refreshes the list.
**Why human:** Currently a gap (no onClick) — this item is unverifiable until WR-01 is fixed, then requires live interaction testing.

#### 2. Genre List — Delete from Row

**Test:** Navigate to /genres. Click the Trash2 icon on a genre row.
**Expected:** A `DeleteConfirmationDialog` opens (not a browser `confirm()` popup). Shows "Charts will NOT be deleted". Confirming deletes the genre.
**Why human:** Currently uses `window.confirm()` (WR-02). After fix, requires visual confirmation that the dialog renders correctly.

#### 3. Designer List — Sort Interaction

**Test:** Click each sortable column header (DESIGNER, CHARTS, FINISHED). Click same header twice.
**Expected:** First click sorts ascending (A-Z or low-high), second click toggles to descending. Active column header shows `text-primary` color and chevron. FINISHED column may sort by chartCount (acceptable per plan — see WR-05 in REVIEW.md).
**Why human:** Client-side sort state and visual feedback require interaction testing.

#### 4. Designer Detail — Computed Stats Display

**Test:** Navigate to /designers/[id] for a designer with several charts, some in IN_PROGRESS or FINISHED status.
**Expected:** Charts count is accurate. Started = charts with status not in UNSTARTED/KITTING/KITTED. Finished = charts with FINISHED or FFO status. Top Genre shows amber badge with most frequent genre name, or em dash if no genres.
**Why human:** Computed stats depend on live database data; visual accuracy of amber badge requires inspection.

#### 5. Detail Page Chart List

**Test:** On both /designers/[id] and /genres/[id], verify chart rows. Click a chart name.
**Expected:** Each row shows: 40x40 thumbnail (or Image icon placeholder), chart name, stitch count, SizeBadge, StatusBadge. IN_PROGRESS charts show progress bar. Clicking the row navigates to /charts/[id].
**Why human:** Thumbnail rendering, badge colors, and link targets require visual confirmation.

#### 6. Mobile Responsive Layout

**Test:** Resize browser below 768px on /designers and /genres.
**Expected:** Table disappears, card layout appears. Each card shows name, chart count, and always-visible edit/delete icons.
**Why human:** CSS media queries not evaluated in JSDOM.

#### 7. 404 for Non-Existent IDs

**Test:** Navigate to /designers/this-id-does-not-exist and /genres/this-id-does-not-exist.
**Expected:** Next.js 404 page is displayed.
**Why human:** `notFound()` behavior requires a running Next.js server.

#### 8. Duplicate Name Validation

**Test:** Create a designer. Try to create another with the exact same name.
**Expected:** Modal shows "A designer with that name already exists" inline below the name field.
**Why human:** P2002 path requires live database; inline error display position needs visual confirmation.

---

### Gaps Summary

Two bugs prevent full goal achievement:

**Gap 1 (BLOCKER) — Designer delete non-functional from list page (WR-01)**
The delete button in `DesignerRow` and `DesignerCard` inside `designer-list.tsx` renders with no `onClick` handler. Clicking delete from the designers list page does nothing. `DeleteConfirmationDialog` is entirely absent from `DesignerList` — it exists only in `DesignerDetail`. This means the roadmap SC "User can delete designers from a dedicated page" is only partially satisfied (from the detail page, not the list page). The REVIEW.md identified this as WR-01. The fix is straightforward: add `deletingDesigner` state, pass `onDelete` to `DesignerRow`/`DesignerCard`, and wire `DeleteConfirmationDialog` in `DesignerList`.

**Gap 2 (WARNING) — Genre delete uses browser confirm() instead of DeleteConfirmationDialog (WR-02)**
`GenreList.handleDelete` calls `window.confirm()` instead of opening `DeleteConfirmationDialog`. The delete is functional, but it uses a blocking browser dialog that is inconsistent with `GenreDetail` (which uses the proper dialog), untestable in JSDOM, and does not show the styled warning with chart count. The REVIEW.md identified this as WR-02. The fix replaces `window.confirm()` with `deletingGenre` state + `DeleteConfirmationDialog`.

These gaps share a root cause: both list-page delete implementations were left incomplete or inconsistent. The detail page delete flows (DesignerDetail, GenreDetail) are correctly wired. Fixing both list-page gaps together is the natural next step.

---

_Verified: 2026-04-08T16:45:00Z_
_Verifier: Claude (gsd-verifier)_
