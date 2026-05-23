---
phase: 27-chart-form-fixes
verified: 2026-05-21T21:30:00Z
status: human_needed
score: 5/5 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Navigate to /charts/new. In the Designer field, type a new name and click Add New. Verify InlineDesignerDialog opens with the search term pre-filled. Submit the dialog and verify the new designer is auto-selected in the field."
    expected: "Dialog opens with name pre-filled; after submit, designer appears selected in the Designer field without a page reload"
    why_human: "Dialog open/close interaction and auto-select behavior require real browser rendering; SearchableSelect + dialog interaction cannot be fully exercised in JSDOM mocks"
  - test: "Navigate to /charts/new. Tab into the Designer field. Immediately type a letter (e.g., 'K'). Verify the popover opens and the search input is pre-seeded with the typed character and options filter accordingly."
    expected: "Popover opens immediately on first keystroke; typed character appears in search input; matching designers filter in real time"
    why_human: "Focus management between PopoverTrigger and CommandInput involves real browser focus behavior that JSDOM cannot fully simulate"
  - test: "Navigate to /charts/new. Add thread supplies with stitch counts (e.g., enter 1500 in the stitches field for a thread row). Scroll to the Total Stitch Count field. Verify 'Supply total: 1,500 stitches' hint is visible and updates as supply rows change."
    expected: "Hint reads 'Supply total: N stitches' with the sum formatted with commas; updates reactively as stitch counts are edited"
    why_human: "Supply panel → stitch count field cross-panel reactive update needs visual confirmation in the running app"
  - test: "Navigate to /designers/{id} for a designer with charts that have cover images. Verify each chart row shows its own thumbnail (not wrong images or blank placeholders)."
    expected: "Each chart row shows its own cover image or thumbnail; charts without any cover image show the placeholder icon"
    why_human: "Requires real R2-hosted images and a populated database; cannot verify correct image-to-chart mapping programmatically without the actual data"
  - test: "Navigate to /charts/new, add a thread supply, and inspect the Need column in the supply table. Enter enough skeins to produce a 3-digit value (e.g., set a very low fabric count). Verify the number, 'sk' label, and Sparkles icon all display without truncation."
    expected: "Need column shows the full value (e.g., '100 sk' + icon) without any clipping or overflow ellipsis"
    why_human: "Column width truncation behavior requires visual inspection in a running browser at real viewport widths"
---

# Phase 27: Chart Form Fixes Verification Report

**Phase Goal:** Fix five chart form and display bugs: designer inline creation dialog wiring, tab-to-type focus, designer detail thumbnails, supply stitch total hint, and Need column width
**Verified:** 2026-05-21T21:30:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | User can type a new designer name and create it inline without leaving the chart form (BUG-01) | VERIFIED | `chart-merged-form.tsx:487-492` — InlineDesignerDialog wired with controlled open/initialName/onSubmit pattern matching storage location dialog. `onAddNew` opens dialog instead of calling handler directly. 3 new tests pass: opens dialog, pre-fills name, auto-selects after creation. |
| 2 | User can tab into the Designer field and immediately type to search (BUG-02) | VERIFIED | `searchable-select.tsx:45-52` — `handleTriggerKeyDown` added to PopoverTrigger; `e.key.length === 1` check correctly captures printable chars while excluding Tab/Escape/Shift. 2 new tests pass. Applies to all SearchableSelect instances. |
| 3 | Designer detail pages show the correct chart cover thumbnail for each chart (BUG-04) | VERIFIED | `designer-detail.tsx:301` — `chart.coverThumbnailUrl ?? chart.coverImageUrl` fallback. `designer-actions.ts:103-104,122-123` — both fields selected and mapped. `designer.ts:16` — `coverImageUrl: string | null` added to DesignerChart type. 3 new tests pass including fallback case. |
| 4 | Supply stitch total hint auto-updates when user changes per-colour stitch counts (BUG-05) | VERIFIED | `stitch-count-fields.tsx:117-124` — hint renders when `supplyStitchTotal > 0` with formatted number and correct id. `chart-merged-form.tsx:268-271` — `useMemo` over `supplyRows` updates reactively. Edit mode: `edit/page.tsx:29-36` — ProjectThread aggregate query; `edit-client.tsx:36` — passed through as `initialSupplyStitchTotal`. 9 new tests pass. Note: D-05 decision explicitly chose hint-not-override; SC4 wording "auto-updates" is satisfied by reactive hint. |
| 5 | Auto-calculated skeins value displays fully (not clipped) in the Need column (BUG-06) | VERIFIED | `supply-table.tsx:166,173` — Colour column width changed 44%→41%, Need column width changed 13%→16%. 2 new tests pass asserting exact width values. No other columns changed. |

**Score:** 5/5 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/components/features/charts/chart-merged-form.tsx` | InlineDesignerDialog wiring + supplyStitchTotal | VERIFIED | Import at line 36, state at 173-174, dialog JSX at 487-492, useMemo at 268-271, prop pass at 528 |
| `src/components/features/charts/form-primitives/searchable-select.tsx` | Tab-to-type onKeyDown | VERIFIED | `handleTriggerKeyDown` at lines 45-52, applied to PopoverTrigger at line 59 |
| `src/components/features/charts/form-primitives/stitch-count-fields.tsx` | Supply stitch total hint | VERIFIED | `supplyStitchTotal?: number` in props, hint at 117-124, aria-describedby at 93-101 |
| `src/components/features/charts/form-primitives/stitch-count-fields.test.tsx` | Tests for supply total hint display | VERIFIED | NEW FILE — 9 tests covering hint on/off, formatting, id, aria-describedby |
| `src/app/(dashboard)/charts/[id]/edit/page.tsx` | Supply stitch total query for edit mode | VERIFIED | ProjectThread.aggregate query at lines 29-36, passes `supplyStitchTotal` to EditChartPageClient |
| `src/components/features/designers/designer-detail.tsx` | Correct thumbnail rendering with fallback | VERIFIED | `chart.coverThumbnailUrl ?? chart.coverImageUrl` at line 301 |
| `src/lib/actions/designer-actions.ts` | coverThumbnailUrl + coverImageUrl in query | VERIFIED | Both selected at lines 103-104, both mapped at lines 122-123 |
| `src/types/designer.ts` | coverImageUrl on DesignerChart type | VERIFIED | `coverImageUrl: string | null` at line 16 |
| `src/components/features/supply-table/supply-table.tsx` | Need column 16%, Colour column 41% | VERIFIED | Lines 166 (41%) and 173 (16%) |
| `src/app/(dashboard)/charts/[id]/edit/edit-client.tsx` | Pass supplyStitchTotal to ChartMergedForm | VERIFIED | Prop in interface at line 15, passed at line 36 |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `chart-merged-form.tsx` onAddNew | InlineDesignerDialog | `designerDialogOpen` controlled state | WIRED | `onAddNew` sets `designerDialogName` + `designerDialogOpen=true`; dialog receives both via props |
| `chart-merged-form.tsx` | `stitch-count-fields.tsx` | `supplyStitchTotal` prop | WIRED | `supplyStitchTotal` computed via useMemo and passed at line 528 |
| `searchable-select.tsx` PopoverTrigger | CommandInput | `onKeyDown` + `setSearch(e.key)` | WIRED | `handleTriggerKeyDown` calls `setOpen(true)` and `setSearch(e.key)` — CommandInput receives via `value={search}` |
| `designer-actions.ts` getDesigner | `designer-detail.tsx` ChartRow | `chart.coverThumbnailUrl` + `chart.coverImageUrl` | WIRED | Query selects both fields, type includes both, component uses both in fallback expression |
| `supply-table.tsx` Need column | `supply-table-data-row.tsx` | `table-layout: fixed` column width | WIRED | Width 16% constrains the fixed-layout table column used by data rows |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `stitch-count-fields.tsx` | `supplyStitchTotal` | `supplyRows.reduce` in `chart-merged-form.tsx` | Yes — reduces live SupplyRow state | FLOWING |
| `stitch-count-fields.tsx` (edit mode) | `initialSupplyStitchTotal` | `prisma.projectThread.aggregate` in `edit/page.tsx` | Yes — real DB aggregate query | FLOWING |
| `designer-detail.tsx` ChartRow | `chart.coverThumbnailUrl ?? chart.coverImageUrl` | `getDesigner` query in `designer-actions.ts` | Yes — both fields queried from DB | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| stitch-count-fields tests | `npx vitest run stitch-count-fields.test.tsx` | 9/9 pass | PASS |
| chart-merged-form designer dialog tests | `npx vitest run chart-merged-form.test.tsx` | 51/51 pass (3 new designer dialog tests) | PASS |
| searchable-select tab focus tests | `npx vitest run searchable-select.test.tsx` | 2 new tab-focus tests pass | PASS |
| designer-detail thumbnail tests | `npx vitest run designer-detail.test.tsx` | 3 new BUG-04 tests pass | PASS |
| supply-table column width tests | `npx vitest run supply-table.test.tsx` | 2 new BUG-06 tests pass | PASS |
| Full test suite | `npx vitest run` | 2197/2197 pass across 194 files | PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| BUG-01 | Plan 01 | User can quick-add a designer from the chart form | SATISFIED | InlineDesignerDialog wired in chart-merged-form.tsx with controlled dialog pattern |
| BUG-02 | Plan 01 | User can tab into Designer field and immediately type to search | SATISFIED | onKeyDown handler with e.key.length===1 check added to SearchableSelect PopoverTrigger |
| BUG-04 | Plan 02 | User sees correct chart thumbnails on designer detail pages | SATISFIED | coverThumbnailUrl ?? coverImageUrl fallback in designer-detail.tsx; both fields in query |
| BUG-05 | Plan 01 | User sees stitch count auto-calculated from per-colour supply stitch counts | SATISFIED | "Supply total: N stitches" hint in stitch-count-fields.tsx, reactive to supplyRows changes |
| BUG-06 | Plan 02 | User sees full auto-calculated skeins value (not truncated) | SATISFIED | Need column widened from 13% to 16%, Colour narrowed from 44% to 41% |

**Note:** BUG-03 (supply sort order) is Phase 29, not Phase 27 — correctly excluded from this phase.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `chart-merged-form.tsx` | 418-766 | Pre-existing JSX `{/* === Section === */}` markers | Info | Pre-existing violation from earlier phases (confirmed not introduced in Phase 27 commits). Tracked as 999.30 in backlog. Not actionable here. |

No blockers. No stub implementations. No hardcoded empty returns. No TODO/FIXME in newly added code.

### Human Verification Required

#### 1. Designer Inline Creation Dialog (BUG-01)

**Test:** Navigate to `/charts/new`. In the Designer field, type a new name (e.g., "Jane Doe"), then click the "Add New" item in the dropdown.
**Expected:** InlineDesignerDialog opens with "Jane Doe" pre-filled. After submitting, the form's Designer field shows "Jane Doe" selected without a page reload.
**Why human:** Dialog open/close interactions and auto-select after async server action require real browser behavior that JSDOM mocks bypass.

#### 2. Tab-to-Type Focus (BUG-02)

**Test:** Navigate to `/charts/new`. Tab to the Designer field (do not click). Type a letter (e.g., "K").
**Expected:** The search popover opens immediately; the typed character appears in the search input; designers with "K" in their name filter in the dropdown.
**Why human:** Focus delegation from PopoverTrigger to CommandInput inside a Popover involves real browser focus behavior that cannot be fully validated in JSDOM.

#### 3. Supply Stitch Total Hint (BUG-05)

**Test:** Navigate to `/charts/new`. Add thread supplies and enter stitch counts per row. Scroll to the Total Stitch Count field.
**Expected:** "Supply total: N stitches" hint appears below the stitch count input. The number is formatted with commas. The hint value updates as you change stitch counts in the supply table.
**Why human:** Cross-panel reactive update (supply table → stitch count field hint) requires visual confirmation in the running app.

#### 4. Designer Detail Thumbnails (BUG-04)

**Test:** Navigate to `/designers/{id}` for a designer that has charts with cover images.
**Expected:** Each chart row in the list shows its own cover image or thumbnail. Charts without a cover image show the placeholder icon (no broken image). Each chart shows its own image, not another chart's.
**Why human:** Requires a real database with chart records and R2-hosted image URLs; thumbnail fallback for the race condition (thumbnail not yet generated) cannot be exercised with mock data.

#### 5. Need Column Display (BUG-06)

**Test:** Navigate to `/charts/new`. Add a thread supply. Set the fabric count and fabric count settings to produce a 3-digit skeins value (e.g., reduce wasteFactor or use a small fabricCount). Inspect the Need column.
**Expected:** The skeins number (e.g., "100"), the "sk" label, and the Sparkles icon all display on one line without any text truncation or overflow clipping.
**Why human:** Column width truncation behavior requires visual inspection in a running browser at realistic viewport widths; pixel-perfect layout cannot be verified programmatically.

### Gaps Summary

No gaps. All 5 must-have truths are VERIFIED in the codebase. The phase goal is met in code — automated tests confirm behavior for all five bugs (2197 tests passing). Five human verification items remain for final visual/interactive confirmation in the running application.

---

_Verified: 2026-05-21T21:30:00Z_
_Verifier: Claude (gsd-verifier)_
