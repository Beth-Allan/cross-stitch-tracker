# Phase 31: Data Foundation & Fixes - Research

**Researched:** 2026-05-24
**Domain:** Prisma schema design, server action CRUD, computed progress types
**Confidence:** HIGH

## Summary

Phase 31 adds a Series entity to the existing Prisma schema, implements CRUD server actions following the well-established Designer pattern, defines a dual progress computation utility, and closes two already-resolved bugs via verification.

The research confirms this phase is entirely pattern-replication work. The Designer model (schema, actions, Zod validation, types, tests) provides a complete template. The only novel element is the dual progress computation, which is a pure utility function with no external dependencies.

**Primary recommendation:** Copy the Designer pattern verbatim for Series CRUD, add a `computeSeriesProgress()` utility function in `src/lib/utils/`, and close FIX-01/FIX-02 via verification tasks.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** "Finished" = projects with status FINISHED or FFO
- **D-02:** "Owned" = all charts assigned to the series
- **D-03:** When totalCount is null (open-ended series), display "8 charts, 3 finished". No progress fraction for owned.
- **D-04:** When totalCount is set, dual progress shows: "8 of 15 owned" + "3 of 8 finished"
- **D-05:** Series has nullable FK to Designer (`designerId String?`)
- **D-06:** No enforcement that charts' designers match series designer
- **D-07:** Designer always set manually
- **D-08:** Series name is @unique (mirrors Designer pattern)
- **D-09:** Series includes optional notes field
- **D-10:** FIX-01 already resolved. Verify with `tsc --noEmit` and mark closed.
- **D-11:** FIX-02 already resolved. Verify allSettled coverage and mark closed.
- **D-12:** Both fixes require verification only, no new implementation.
- **D-13:** Series designer FK retained (entity property, not derivation)

### Claude's Discretion
- None explicitly granted beyond D-13 recommendation

### Deferred Ideas (OUT OF SCOPE)
- None
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| SERIES-01 | User can create a series with name, optional total count, and optional designer link | Designer CRUD pattern provides exact template; Zod schema + server action |
| SERIES-03 | User can edit a series (name, total count, designer link) | `updateDesigner` pattern with Zod validation and P2002 handling |
| SERIES-04 | User can delete a series (charts become unassigned, not deleted) | `deleteDesigner` pattern with $transaction (updateMany + delete) |
| SERIES-10 | User can see dual progress (owned/total + finished/owned) | Pure computation utility; needs type definition + function |
| FIX-01 | Fix pre-existing TypeScript errors in 3 test files | Verified resolved: `tsc --noEmit` returns 0 errors |
| FIX-02 | Separate stats page query groups for resilience | Verified resolved: `Promise.allSettled()` + `settled<T>()` in stats/page.tsx |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Series schema | Database / Storage | -- | Prisma model definition, migration |
| Series CRUD | API / Backend | -- | Server actions with auth, validation, Prisma writes |
| Dual progress computation | API / Backend | -- | Pure utility, called at query time |
| Series types | API / Backend | Frontend Server | Shared types consumed by both layers |
| FIX verification | -- | -- | Verification only, no code changes |

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Prisma | 7.7.0 | ORM, schema definition | Project standard, already configured |
| Zod | (installed) | Input validation | Project standard at all boundaries |
| Next.js | 16 | Server actions, revalidation | Framework |
| Vitest | (installed) | Testing | Project standard |

### Supporting (Already Installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @prisma/adapter-neon | (installed) | Neon PostgreSQL adapter | Database connection |

**No new packages needed for this phase.**

## Package Legitimacy Audit

> No new packages are installed in this phase. All dependencies are already present in the project.

| Package | Registry | Age | Downloads | Source Repo | slopcheck | Disposition |
|---------|----------|-----|-----------|-------------|-----------|-------------|
| -- | -- | -- | -- | -- | -- | No new packages |

**Packages removed due to slopcheck [SLOP] verdict:** none
**Packages flagged as suspicious [SUS]:** none

## Architecture Patterns

### System Architecture Diagram

```
Series CRUD Flow:
  Client (future Phase 32+)
    → Server Action (series-actions.ts)
      → requireAuth()
      → Zod validation (seriesSchema)
      → Prisma write (series model)
      → revalidatePath("/series")
      → Return { success, data } or { success: false, error }

Dual Progress Flow:
  Query (getSeriesDetail / getSeriesWithStats)
    → Prisma: series + charts with project.status
    → computeSeriesProgress(charts, totalCount)
    → Return SeriesWithProgress type
```

### Recommended Project Structure
```
prisma/
  schema.prisma           # Add Series model + seriesId on Chart

src/lib/
  validations/
    series.ts             # Zod schema for series
  actions/
    series-actions.ts     # CRUD server actions
    series-actions.test.ts # Tests
  utils/
    series-progress.ts    # computeSeriesProgress utility
    series-progress.test.ts # Tests

src/types/
  series.ts              # SeriesWithStats, SeriesDetail, SeriesProgress types

src/__tests__/mocks/
  factories.ts           # Add createMockSeries factory
```

### Pattern 1: Entity CRUD (from designer-actions.ts)
**What:** Server action with auth guard, Zod validation, Prisma write, path revalidation
**When to use:** Any entity create/update/delete
**Example:**
```typescript
// Source: src/lib/actions/designer-actions.ts (verified in codebase)
export async function createSeries(formData: unknown) {
  await requireAuth();

  try {
    const validated = seriesSchema.parse(formData);
    const series = await prisma.series.create({ data: validated });
    revalidatePath("/series");
    return { success: true as const, series };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: error.errors[0].message };
    }
    if (error && typeof error === "object" && "code" in error && (error as { code: string }).code === "P2002") {
      return { success: false as const, error: "A series with that name already exists" };
    }
    console.error("createSeries error:", error);
    return { success: false as const, error: "Failed to create series" };
  }
}
```

### Pattern 2: Delete with Unlink (from deleteDesigner)
**What:** Transaction that unlinks related records then deletes the entity
**When to use:** Series deletion (charts become unassigned)
**Example:**
```typescript
// Source: src/lib/actions/designer-actions.ts (verified in codebase)
await prisma.$transaction([
  prisma.chart.updateMany({
    where: { seriesId: id },
    data: { seriesId: null },
  }),
  prisma.series.delete({ where: { id } }),
]);
```

### Pattern 3: Computed Progress (new utility)
**What:** Pure function computing dual progress from chart data
**When to use:** Any query returning series with progress info
**Example:**
```typescript
// New pattern for this phase
type SeriesProgress = {
  ownedCount: number;
  finishedCount: number;
  totalCount: number | null;
};

const FINISHED_STATUSES = new Set(["FINISHED", "FFO"]);

export function computeSeriesProgress(
  charts: Array<{ project: { status: string } | null }>,
  totalCount: number | null,
): SeriesProgress {
  const ownedCount = charts.length;
  const finishedCount = charts.filter(
    (c) => c.project !== null && FINISHED_STATUSES.has(c.project.status),
  ).length;
  return { ownedCount, finishedCount, totalCount };
}
```

### Anti-Patterns to Avoid
- **Deriving designer from charts:** D-07 says series designer is always set manually, never auto-populated
- **Enforcing chart-designer match:** D-06 explicitly allows mixed series (collabs, etc.)
- **Storing computed progress:** Project convention is "calculated fields at query time"
- **Adding userId to Series:** Reference entities (Designer, Genre) don't have userId in this single-user app

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Unique constraint handling | Custom unique check query | Prisma P2002 error code catch | Race-condition-free, pattern exists |
| Transaction rollback | Manual multi-step with try/catch | `prisma.$transaction([...])` | Atomic, pattern exists in deleteDesigner |
| Input validation | Manual field checks | Zod schema with .trim().min(1) | Standard boundary validation |
| Auth guard | Inline session check | `requireAuth()` from auth-guard.ts | Single source of truth |

**Key insight:** Every piece of this phase has an existing implementation to copy. The risk is deviation from established patterns, not missing solutions.

## Common Pitfalls

### Pitfall 1: Forgetting seriesId on Chart mock factory
**What goes wrong:** Tests break when Chart type expects seriesId field after schema change
**Why it happens:** Prisma generate updates the Chart type to include the new optional field
**How to avoid:** Update `createMockChart` in factories.ts to include `seriesId: null`
**Warning signs:** TypeScript errors in existing chart tests after `prisma generate`

### Pitfall 2: Missing revalidation paths
**What goes wrong:** UI shows stale data after series mutations
**Why it happens:** Series will appear on /series, /charts, and pattern-dive pages
**How to avoid:** Revalidate `/series` on all mutations, `/charts` on delete (unlinking)
**Warning signs:** Stale cache in dev mode after mutations

### Pitfall 3: P2002 error shape in Prisma 7
**What goes wrong:** Unique constraint errors not caught properly
**Why it happens:** Prisma 7 error shape may differ from older versions
**How to avoid:** Use the exact error detection pattern from designer-actions.ts (already working in production)
**Warning signs:** Generic "Failed to create series" instead of "name already exists" message

### Pitfall 4: Dual progress with zero charts
**What goes wrong:** Division by zero or misleading display for empty series
**Why it happens:** A newly created series has 0 charts
**How to avoid:** Progress utility must handle ownedCount=0 gracefully (D-03/D-04 both work at 0)
**Warning signs:** NaN or Infinity in progress calculations

### Pitfall 5: Chart model update requires factory update
**What goes wrong:** 50+ existing tests fail with type error after adding seriesId to Chart
**Why it happens:** `createMockChart` doesn't include the new field
**How to avoid:** Add `seriesId: null` to factory as first task after schema change
**Warning signs:** Mass test failures on `npm test`

## Code Examples

### Prisma Schema Addition
```prisma
// Source: Pattern from existing Designer model in prisma/schema.prisma
model Series {
  id         String    @id @default(cuid())
  name       String    @unique
  totalCount Int?
  designer   Designer? @relation(fields: [designerId], references: [id])
  designerId String?
  notes      String?
  charts     Chart[]
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
}
```

Chart model addition:
```prisma
// Add to existing Chart model
series     Series?   @relation(fields: [seriesId], references: [id])
seriesId   String?
```

Designer model addition:
```prisma
// Add to existing Designer model
series     Series[]
```

### Zod Schema
```typescript
// Source: Pattern from designerSchema in src/lib/validations/chart.ts
import { z } from "zod";

export const seriesSchema = z.object({
  name: z.string().trim().min(1, "Series name is required").max(200, "Series name too long"),
  totalCount: z.number().int().min(1, "Total count must be at least 1").nullable().default(null),
  designerId: z.string().nullable().default(null),
  notes: z.string().max(5000, "Notes too long").nullable().default(null),
});

export type SeriesInput = z.infer<typeof seriesSchema>;
```

### Type Definitions
```typescript
// Source: Pattern from src/types/designer.ts
import type { ProjectStatus } from "@/generated/prisma/client";

export type SeriesProgress = {
  ownedCount: number;
  finishedCount: number;
  totalCount: number | null;
};

export type SeriesWithStats = {
  id: string;
  name: string;
  totalCount: number | null;
  designerId: string | null;
  designerName: string | null;
  notes: string | null;
  progress: SeriesProgress;
};

export type SeriesDetail = SeriesWithStats & {
  charts: SeriesChart[];
};

export type SeriesChart = {
  id: string;
  name: string;
  coverThumbnailUrl: string | null;
  status: ProjectStatus | null;
  stitchesCompleted: number;
  stitchCount: number;
};
```

### Test Factory Addition
```typescript
// Source: Pattern from createMockDesigner in src/__tests__/mocks/factories.ts
import type { Series } from "@/generated/prisma/client";

export function createMockSeries(overrides?: Partial<Series>): Series {
  return {
    id: "series-1",
    name: "Test Series",
    totalCount: null,
    designerId: null,
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
```

### Mock Prisma Extension
```typescript
// Add to createMockPrisma() in factories.ts
series: {
  create: vi.fn(),
  findMany: vi.fn(),
  findUnique: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
},
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Prisma 5/6 import paths | Prisma 7: `@/generated/prisma/client` | This project | Custom output path in schema |
| `next-auth` v4 | Auth.js v5 beta | This project | JWT callbacks required for user.id |
| `revalidateTag` for fine-grained | `revalidatePath` for page-level | Project convention | Simpler invalidation model |

**Deprecated/outdated:**
- None relevant to this phase. All patterns are current and working in production.

## Assumptions Log

> All claims in this research were verified against the codebase. No external lookups needed.

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| -- | -- | -- | All claims verified against codebase |

**If this table is empty:** All claims in this research were verified or cited -- no user confirmation needed.

## Open Questions

1. **Should `getSeriesWithStats` join designer name eagerly?**
   - What we know: `getDesignersWithStats` does NOT join other relations, just `_count`
   - What's unclear: Series list page (Phase 32) needs designer name for display
   - Recommendation: Include `designer: { select: { name: true } }` in the getSeriesWithStats query since it's always needed for display. This is Claude's discretion -- low-stakes optimization.

2. **Should Series deletions also revalidate stats paths?**
   - What we know: Out of scope per REQUIREMENTS.md ("Stats page series integration -- Deferred")
   - What's unclear: Nothing -- explicitly out of scope
   - Recommendation: No stats revalidation in Phase 31. Only `/series` and `/charts` paths.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest (jsdom environment) |
| Config file | `vitest.config.ts` |
| Quick run command | `npm test -- --reporter=verbose` |
| Full suite command | `npm test` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| SERIES-01 | createSeries: auth, validation, happy path, P2002 | unit | `npx vitest run src/lib/actions/series-actions.test.ts -x` | Wave 0 |
| SERIES-03 | updateSeries: auth, validation, happy path, P2002 | unit | `npx vitest run src/lib/actions/series-actions.test.ts -x` | Wave 0 |
| SERIES-04 | deleteSeries: auth, not found, $transaction unlink+delete | unit | `npx vitest run src/lib/actions/series-actions.test.ts -x` | Wave 0 |
| SERIES-10 | computeSeriesProgress: null total, with total, 0 charts, mixed statuses | unit | `npx vitest run src/lib/utils/series-progress.test.ts -x` | Wave 0 |
| FIX-01 | TypeScript compiles without errors | smoke | `npx tsc --noEmit` | Existing (passes now) |
| FIX-02 | Stats page uses Promise.allSettled + settled() | smoke | `grep -q "Promise.allSettled" src/app/(dashboard)/stats/page.tsx` | Existing (passes now) |

### Sampling Rate
- **Per task commit:** `npm test -- --reporter=verbose`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps
- [ ] `src/lib/actions/series-actions.test.ts` -- covers SERIES-01, SERIES-03, SERIES-04
- [ ] `src/lib/utils/series-progress.test.ts` -- covers SERIES-10
- [ ] `src/__tests__/mocks/factories.ts` -- add `createMockSeries` factory
- [ ] `src/__tests__/mocks/factories.ts` -- add `series` to `createMockPrisma()`
- [ ] `src/__tests__/mocks/factories.ts` -- add `seriesId: null` to `createMockChart()`

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | `requireAuth()` on every server action |
| V3 Session Management | no | Handled by Auth.js framework |
| V4 Access Control | no | Single-user app, no ownership model on reference entities |
| V5 Input Validation | yes | Zod schema at server action boundary |
| V6 Cryptography | no | No secrets/encryption in this phase |

### Known Threat Patterns for this stack

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Unauthenticated CRUD | Spoofing | `requireAuth()` guard on all actions |
| SQL injection via name field | Tampering | Prisma parameterized queries (ORM) |
| Oversized input (name/notes) | DoS | Zod `.max(200)` / `.max(5000)` constraints |
| Unique constraint race | Tampering | Prisma P2002 catch (database-level enforcement) |

## Sources

### Primary (HIGH confidence)
- `prisma/schema.prisma` -- Existing Designer model pattern, Chart model structure
- `src/lib/actions/designer-actions.ts` -- Complete CRUD pattern with error handling
- `src/lib/validations/chart.ts` -- Zod schema patterns (designerSchema)
- `src/types/designer.ts` -- Type definition patterns
- `src/__tests__/mocks/factories.ts` -- Test factory patterns, mock Prisma shape
- `src/app/(dashboard)/stats/page.tsx` -- Promise.allSettled + settled() verification
- `tsc --noEmit` output -- 0 errors (FIX-01 verification)

### Secondary (MEDIUM confidence)
- None needed -- all patterns are internal to the codebase

### Tertiary (LOW confidence)
- None

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- no new packages, all patterns exist in codebase
- Architecture: HIGH -- direct replication of Designer entity pattern
- Pitfalls: HIGH -- known from 30 prior phases of identical pattern work

**Research date:** 2026-05-24
**Valid until:** 2026-06-24 (stable -- internal patterns only)
