# Phase 31: Data Foundation & Fixes - Context

**Gathered:** 2026-05-24
**Status:** Ready for planning

<domain>
## Phase Boundary

This phase delivers the Series data model (Prisma schema + CRUD server actions), dual progress computation logic, and verification/closure of two pre-existing bug fixes (FIX-01 and FIX-02). No UI pages — just the data foundation that Phases 32-34 build on.

</domain>

<decisions>
## Implementation Decisions

### Dual Progress Definitions
- **D-01:** "Finished" = projects with status FINISHED or FFO. Both count toward series completion progress.
- **D-02:** "Owned" = all charts assigned to the series (since Chart and Project are effectively 1:1 in this app via the merged creation form).
- **D-03:** When `totalCount` is null (open-ended series), display both facts: "8 charts, 3 finished". No progress fraction for owned (since total unknown), but still show finished count.
- **D-04:** When `totalCount` is set, dual progress shows: "8 of 15 owned" (collection) + "3 of 8 finished" (stitching).

### Series-Designer Relationship
- **D-05:** Series has a nullable FK to Designer model (`designerId String?`). It represents "who publishes this series" — a property of the series itself, not derived from charts.
- **D-06:** No enforcement that charts' designers match the series designer. Edge cases (collabs, mixed series) are allowed.
- **D-07:** Designer is always set manually — no auto-populate from charts.

### Series Name Constraints
- **D-08:** Series name is `@unique` (globally unique, mirrors Designer pattern). Simple for SearchableSelect matching.
- **D-09:** Series model includes an optional `notes` field for user context (e.g., "Released monthly 2019-2020, 12 charts total").

### Fix Scope
- **D-10:** FIX-01 (999.19 — TS test errors) is already resolved. TypeScript reports 0 errors. Verify with `tsc --noEmit` and mark closed.
- **D-11:** FIX-02 (999.22 — stats Promise.all resilience) is already resolved. Stats page uses `Promise.allSettled()` + `settled<T>()`. Verify allSettled coverage and mark closed.
- **D-12:** Both fixes require verification only (no new implementation). Confirm in plan, close requirements.

### Claude's Discretion
- **D-13:** Series designer FK retained on the model (Claude's recommendation). Rationale: it's an entity property, not a derivation; management pages need quick access; matches existing patterns.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements & Roadmap
- `.planning/REQUIREMENTS.md` — SERIES-01, SERIES-03, SERIES-04, SERIES-10, FIX-01, FIX-02 definitions
- `.planning/ROADMAP.md` §Phase 31 — Success criteria and dependencies

### Schema Patterns (series mirrors these)
- `prisma/schema.prisma` — Designer model (lines 23-31) as pattern for Series
- `src/lib/actions/designer-actions.ts` — CRUD action pattern (create, update, delete, get, getWithStats)

### Stats (for fix verification)
- `src/app/(dashboard)/stats/page.tsx` — Promise.allSettled usage (line 60)
- `src/lib/utils/settled.ts` — settled<T>() utility

### Test Files (for fix verification)
- `src/lib/actions/chart-actions.test.ts` — verify no TS errors
- `src/lib/actions/shopping-cart-actions.test.ts` — verify no TS errors
- `src/components/features/dashboard/dashboard-tabs.test.tsx` — verify no TS errors

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Designer` model pattern: cuid ID, `@unique` name, nullable fields, `Chart[]` relation, timestamps
- `designer-actions.ts`: complete CRUD pattern with requireAuth, Zod validation, ownership-free (single user)
- `src/lib/validations/`: Zod schema location for series validation
- `src/types/`: type definitions location for series types

### Established Patterns
- Entity CRUD: `requireAuth()` → Zod parse → Prisma write → `revalidatePath()`
- No userId on reference entities (Designer, Genre) — single-user app
- Calculated fields at query time (progress computation follows this)
- `@unique` on entity names for SearchableSelect deduplication

### Integration Points
- `prisma/schema.prisma` — new Series model + `seriesId` FK on Chart
- `src/lib/actions/` — new `series-actions.ts` file
- `src/lib/validations/` — new series Zod schema
- `src/types/` — new series types with dual progress shape

</code_context>

<specifics>
## Specific Ideas

- Dual progress return shape should support both "with total" and "without total" display modes
- Series schema: `{ id, name (unique), totalCount?, designerId?, notes?, charts[], createdAt, updatedAt }`
- Chart model gets `seriesId String?` + `series Series? @relation(...)` field

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 31-Data Foundation & Fixes*
*Context gathered: 2026-05-24*
