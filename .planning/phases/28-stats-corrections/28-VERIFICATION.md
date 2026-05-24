---
phase: 28-stats-corrections
verified: 2026-05-24T02:41:09Z
status: human_needed
score: 5/5
overrides_applied: 0
human_verification:
  - test: "Open /stats Overview tab. Verify StatusFilterPills (All, Not Started, In Progress, Complete) appear and toggle correctly. Verify insight lists (threads, designers, genres) appear below the pills. Verify 'COLLECTION TOTAL' counter shows in Lifetime section."
    expected: "Pills toggle on/off with multi-select behavior. 'All' clears other selections. Insight lists filter when pills are toggled. COLLECTION TOTAL shows sum of all chart stitch counts."
    why_human: "Visual layout, toggle interaction, and data correctness require live browser verification"
  - test: "Open /stats Records tab. Verify it shows STITCHES LOGGED hero stat, personal bests table, and completion estimates. Verify no YearScopeToggle, no insight lists."
    expected: "Hero stat card with formatted number and 'STITCHES LOGGED' label appears at top. Personal bests and completion estimates render below. No year scope buttons or insight grids."
    why_human: "Visual layout and absence of removed elements need browser verification"
  - test: "Open /stats Overview tab. Check designer, genre, and size breakdown chart Y-axes/X-axes. With small data counts (1-3 items), verify axes show only integer tick values (no 0.5, 1.5)."
    expected: "All numeric axes display whole numbers only (0, 1, 2, 3...). No fractional tick labels."
    why_human: "Recharts axis rendering depends on data values and container size -- grep confirms the prop but visual output needs verification"
  - test: "Open dashboard. Find Buried Treasures section. Check items with various ages. Verify the age badge shows a large number on line 1 and 'days/months/years in library' on line 2 without repeating the number."
    expected: "e.g. '6' on line 1, 'months in library' on line 2. Not '200' then '6 months in library'."
    why_human: "Visual formatting of split number/unit display requires browser verification"
---

# Phase 28: Stats Corrections Verification Report

**Phase Goal:** Statistics page displays accurate, well-formatted data across all three tabs
**Verified:** 2026-05-24T02:41:09Z
**Status:** human_needed
**Re-verification:** No -- initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Records tab shows populated thread statistics, personal bests, and insights sections (not empty/missing) | VERIFIED | Insights moved to Overview tab per user decisions D-01/D-02 in 28-CONTEXT.md. STAT-01 requirement says "populated on stats page" (not specifically Records tab). Thread/designer/genre insights render on Overview via StatsOverview (lines 127-142). Personal bests render on Records via RecordsTable. All insight queries are library-wide (no session-gating), verified in thread-insights.ts, designer-insights.ts, genre-insights.ts. |
| 2 | Collection breakdown chart Y-axes display only integer tick values for discrete data | VERIFIED | `allowDecimals={false}` confirmed on: designer-breakdown-chart.tsx XAxis (line 24), genre-distribution-chart.tsx XAxis (line 24), size-category-chart.tsx YAxis (line 27). Test assertions verify prop in all 3 chart test files. |
| 3 | Collection breakdown charts show entity names directly on/near bars instead of in separate linked lists | VERIFIED | Designer chart: YAxis type="category" dataKey="name" (line 25-33). Genre chart: YAxis type="category" dataKey="name" (line 25-33). RankedList removed from stats-overview.tsx -- grep confirms zero RankedList imports in any non-test file except ranked-list.tsx itself. |
| 4 | Stats overview displays total stitches across all projects as a hero counter | VERIFIED | Full data flow traced: hero-stats.ts line 37-40 queries `prisma.chart.aggregate({ _sum: { stitchCount: true } })`, returns `collectionTotalStitches` (line 53). page.tsx passes heroStats to StatsOverview (line 129). StatsOverview passes `heroStats.collectionTotalStitches` to LifetimeCounters (line 56). LifetimeCounters renders with label "COLLECTION TOTAL" (line 12). |
| 5 | Days-in-library displays as large prominent number with a small descriptive label beneath it | VERIFIED | buried-treasures-section.tsx: `formatAge()` returns unit only ("days"/"months"/"years") at lines 14-18. `formatAgeNumber()` returns converted number at lines 21-24. Template line 84: `formatAgeNumber(t.daysInLibrary).toLocaleString()` for large number. Line 87: `formatAge(t.daysInLibrary)` + " in library" for label. 5 tests verify correct output at days/months/years boundaries. |

**Score:** 5/5 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/lib/utils/status-groups.ts` | resolveStatusFilter utility and STATUS_GROUPS const | VERIFIED | 22 lines, exports STATUS_GROUPS, StatusGroup, resolveStatusFilter. Wired by thread-insights.ts, designer-insights.ts, genre-insights.ts, search-params.ts. |
| `src/app/(dashboard)/stats/search-params.ts` | status param in statsSearchParamsCache | VERIFIED | Line 18: `status: parseAsArrayOf(parseAsStringLiteral([...STATUS_GROUPS]), ",").withDefault([])`. Imports STATUS_GROUPS from status-groups.ts. |
| `src/types/stats.ts` | collectionTotalStitches field on StatsHeroData | VERIFIED | Line 15: `collectionTotalStitches: number` in StatsHeroData interface. |
| `src/lib/queries/stats/hero-stats.ts` | Collection total query via prisma.chart.aggregate | VERIFIED | Lines 37-40: `prisma.chart.aggregate({ where: { project: { userId } }, _sum: { stitchCount: true } })`. Returns `collectionTotalStitches` at line 53. |
| `src/lib/queries/stats/thread-insights.ts` | Library-wide thread insights with status filter | VERIFIED | 77 lines. Signature: `statusGroups: string[]`. Uses `resolveStatusFilter`. No `buildDateFilter` or `Scope` imports. No `sessions: { some: ... }` clause. |
| `src/lib/queries/stats/designer-insights.ts` | Library-wide designer insights with status filter | VERIFIED | 89 lines. Same pattern as thread-insights. |
| `src/lib/queries/stats/genre-insights.ts` | Library-wide genre insights with status filter | VERIFIED | 79 lines. Same pattern. Uses `chart.stitchCount` for ranking (library data). |
| `src/components/features/stats/status-filter-pills.tsx` | StatusFilterPills client component with nuqs multi-select | VERIFIED | 67 lines. "use client" directive. 4 pills with aria-pressed, role="group", aria-label="Filter by status". Uses useQueryState with parseAsArrayOf. |
| `src/components/features/stats/stats-overview.tsx` | Overview tab with insights + status filter pills | VERIFIED | 146 lines. Imports and renders ThreadInsightList, DesignerInsightList, GenreInsightList, StatusFilterPills. No RankedList import. |
| `src/components/features/stats/records-overview.tsx` | Records tab with session hero stat only | VERIFIED | 61 lines. No YearScopeToggle, no insight list imports. Has totalSessionStitches prop, renders "STITCHES LOGGED" hero stat card with toLocaleString(). |
| `src/components/features/stats/lifetime-counters.tsx` | Lifetime counters with COLLECTION TOTAL label | VERIFIED | Line 12: key "collectionTotalStitches", label "COLLECTION TOTAL". Prop renamed from totalLifetimeStitches. |
| `src/app/(dashboard)/stats/page.tsx` | Stats page wiring insights to Overview, session total to Records | VERIFIED | Line 56: destructures `status` from parsedParams. Lines 77-79: passes `status` to insight queries. Lines 75-76, 80: passes `"all"` to records queries. Lines 134-136: insight props to StatsOverview. Line 157: totalSessionStitches to RecordsOverview. |
| `src/components/features/stats/designer-breakdown-chart.tsx` | Designer chart with allowDecimals={false} | VERIFIED | Line 24: `allowDecimals={false}` on XAxis. |
| `src/components/features/stats/genre-distribution-chart.tsx` | Genre chart with allowDecimals={false} | VERIFIED | Line 24: `allowDecimals={false}` on XAxis. |
| `src/components/features/stats/size-category-chart.tsx` | Size chart with allowDecimals={false} | VERIFIED | Line 27: `allowDecimals={false}` on YAxis. |
| `src/components/features/dashboard/buried-treasures-section.tsx` | Fixed formatAge returning unit only, formatAgeNumber for display | VERIFIED | formatAge lines 14-18 returns "days"/"months"/"years". formatAgeNumber lines 21-24 returns display number. Template correctly composes both. |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| thread-insights.ts | status-groups.ts | import resolveStatusFilter | WIRED | Line 3: `import { resolveStatusFilter } from "@/lib/utils/status-groups"` |
| designer-insights.ts | status-groups.ts | import resolveStatusFilter | WIRED | Line 3: same import |
| genre-insights.ts | status-groups.ts | import resolveStatusFilter | WIRED | Line 3: same import |
| search-params.ts | status-groups.ts | import STATUS_GROUPS | WIRED | Line 8: `import { STATUS_GROUPS } from "@/lib/utils/status-groups"` |
| page.tsx | stats-overview.tsx | props: threadInsights, designerInsights, genreInsights | WIRED | Lines 134-136: `threadInsights={threadInsights} designerInsights={designerInsights} genreInsights={genreInsights}` |
| page.tsx | records-overview.tsx | props: totalSessionStitches | WIRED | Line 157: `totalSessionStitches={heroStats?.totalLifetimeStitches ?? null}` |
| stats-overview.tsx | status-filter-pills.tsx | JSX render | WIRED | Line 11: import, Line 124: `<StatusFilterPills />` rendered |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| lifetime-counters.tsx | collectionTotalStitches | hero-stats.ts -> prisma.chart.aggregate | Yes (DB query with _sum) | FLOWING |
| stats-overview.tsx | threadInsights | thread-insights.ts -> prisma.projectThread.groupBy | Yes (DB query) | FLOWING |
| stats-overview.tsx | designerInsights | designer-insights.ts -> prisma.project.findMany | Yes (DB query) | FLOWING |
| stats-overview.tsx | genreInsights | genre-insights.ts -> prisma.project.findMany | Yes (DB query) | FLOWING |
| records-overview.tsx | totalSessionStitches | hero-stats.ts -> prisma.stitchSession.aggregate | Yes (DB query with _sum) | FLOWING |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| All phase tests pass | `npx vitest run [13 test files]` | 94/94 tests pass, 0 failures | PASS |
| No debt markers in modified files | grep for TBD/FIXME/XXX/TODO/HACK | Zero matches across 16 files | PASS |
| No session-gating in insight queries | grep for buildDateFilter/Scope/sessions.some | Zero matches across 3 insight query files | PASS |

### Probe Execution

Step 7c: SKIPPED (no probe scripts defined for this phase)

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|----------|
| STAT-01 | 28-01, 28-02 | User sees records tab items (thread stats, personal bests, insights) populated on stats page | SATISFIED | Insights on Overview tab (library-wide queries), personal bests on Records tab. All backed by real Prisma queries. |
| STAT-02 | 28-03 | Collection breakdown chart axes use integer values for discrete data | SATISFIED | allowDecimals={false} on all 3 chart components' numeric axes |
| STAT-03 | 28-02 | Collection breakdown charts display entity names inline rather than in separate linked lists | SATISFIED | YAxis type="category" dataKey="name" on designer/genre charts. RankedList removed from StatsOverview. |
| STAT-04 | 28-01, 28-02 | User sees total stitches across all projects on the stats page | SATISFIED | collectionTotalStitches field in hero stats, rendered as "COLLECTION TOTAL" in LifetimeCounters on Overview tab |
| STAT-05 | 28-03 | Days-in-library displays as large prominent number with small label | SATISFIED | formatAge/formatAgeNumber split eliminates duplication. Template renders large number + unit label separately. |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| (none) | - | - | - | No anti-patterns found in any phase-modified files |

### Human Verification Required

### 1. StatusFilterPills Toggle Behavior + Insights on Overview

**Test:** Open /stats Overview tab. Verify StatusFilterPills (All, Not Started, In Progress, Complete) appear and toggle correctly. Verify insight lists (threads, designers, genres) appear below the pills. Verify 'COLLECTION TOTAL' counter shows in Lifetime section.
**Expected:** Pills toggle on/off with multi-select behavior. 'All' clears other selections. Insight lists filter when pills are toggled. COLLECTION TOTAL shows sum of all chart stitch counts.
**Why human:** Visual layout, toggle interaction, and data correctness require live browser verification.

### 2. Records Tab Simplification

**Test:** Open /stats Records tab. Verify it shows STITCHES LOGGED hero stat, personal bests table, and completion estimates. Verify no YearScopeToggle, no insight lists.
**Expected:** Hero stat card with formatted number and 'STITCHES LOGGED' label appears at top. Personal bests and completion estimates render below. No year scope buttons or insight grids.
**Why human:** Visual layout and absence of removed elements need browser verification.

### 3. Integer-Only Chart Axes

**Test:** Open /stats Overview tab. Check designer, genre, and size breakdown chart Y-axes/X-axes. With small data counts (1-3 items), verify axes show only integer tick values (no 0.5, 1.5).
**Expected:** All numeric axes display whole numbers only (0, 1, 2, 3...). No fractional tick labels.
**Why human:** Recharts axis rendering depends on data values and container size -- grep confirms the prop but visual output needs verification.

### 4. Days-in-Library Formatting

**Test:** Open dashboard. Find Buried Treasures section. Check items with various ages. Verify the age badge shows a large number on line 1 and 'days/months/years in library' on line 2 without repeating the number.
**Expected:** e.g. '6' on line 1, 'months in library' on line 2. Not '200' then '6 months in library'.
**Why human:** Visual formatting of split number/unit display requires browser verification.

### Gaps Summary

No gaps found. All 5 must-have truths are verified at code level. All 16 artifacts exist, are substantive, and are properly wired. All 7 key links are confirmed. All 5 data flows produce real data from Prisma queries. All 5 STAT requirements are satisfied. No anti-patterns or debt markers found.

4 items require human visual verification due to the UI nature of this phase (UI hint: yes in ROADMAP.md).

---

_Verified: 2026-05-24T02:41:09Z_
_Verifier: Claude (gsd-verifier)_
