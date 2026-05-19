# Phase 24: Code Quality - Pattern Map

**Mapped:** 2026-05-18
**Files analyzed:** 14 files to be modified (no new files created)
**Analogs found:** 14 / 14 (all are self-analogs — modifying existing files in-place)

---

## File Classification

| Modified File | Role | Data Flow | Closest Analog | Match Quality |
|---|---|---|---|---|
| `src/types/stats.ts` | type-bundle | transform | self (section markers already in use) | exact |
| `src/lib/queries/stats/utils.ts` (new) | utility | transform | `src/lib/queries/stats/genre-insights.ts` lines 7-14 | exact (extract from) |
| `src/lib/queries/stats/genre-insights.ts` | service | request-response | `src/lib/queries/stats/completion-estimates.ts` | exact |
| `src/lib/queries/stats/thread-insights.ts` | service | request-response | `src/lib/queries/stats/genre-insights.ts` | exact |
| `src/lib/queries/stats/designer-insights.ts` | service | request-response | `src/lib/queries/stats/genre-insights.ts` | exact |
| `src/lib/queries/stats/personal-bests.ts` | service | request-response | self (discriminated union refactor + comment cleanup) | exact |
| `src/lib/queries/stats/fastest-completions.ts` | service | request-response | `src/lib/queries/stats/genre-insights.ts` | exact |
| `src/lib/queries/stats/completion-estimates.ts` | service | request-response | self (tilde prefix move + buildDateFilter removal) | exact |
| `src/lib/queries/stats/available-years.ts` | service | request-response | self (unwrap AvailableYearsData) | exact |
| `src/lib/queries/stats/session-history.ts` | service | CRUD | self (Date → string for SessionHistoryItem.date) | exact |
| `src/app/(dashboard)/stats/search-params.ts` | utility | transform | self (SORT_FIELDS/SORT_DIRS become exports) | exact |
| `src/components/features/stats/session-history-table.tsx` | component | request-response | self (remove duplicate SORT_FIELDS/SORT_DIRS, remove `new Date()` wrapper) | exact |
| `src/components/features/stats/records-table.tsx` | component | request-response | self (consume discriminated union, update type guards) | exact |
| `src/components/features/stats/stitching-calendar.tsx` | component | event-driven | self (remove JSX section-marker comments) | exact |
| `src/components/features/sessions/log-session-modal.tsx` | component | event-driven | self (replace emerald-* with semantic tokens) | exact |
| `src/components/features/supply-table/types.ts` | type-bundle | transform | self (strandCount → literal union 1\|2\|3\|4\|5\|6) | exact |
| `src/__tests__/mocks/factories.ts` | utility/test | transform | self (add assertSuccess/assertFailure, fix createMockStitchSession type) | exact |
| `src/lib/queries/stats/record-detection.test.ts` | test | transform | self (remove WHAT-comment block lines 224-229) | exact |
| `src/lib/actions/chart-actions.test.ts` | test | transform | self (remove section marker line 229, sweep vacuous assertions) | exact |
| `src/lib/actions/supply-actions.test.ts` | test | transform | self (remove section markers lines 1423, 1502, sweep vacuous assertions) | exact |
| `.claude/rules/comment-conventions.md` (new) | config | — | `.claude/rules/testing-requirements.md` (structure reference) | role-match |

---

## Pattern Assignments

### `src/lib/queries/stats/utils.ts` (new utility — extract from 6 query modules)

**Analog:** `src/lib/queries/stats/genre-insights.ts` lines 1-14

**Imports pattern** (lines 1-2 of genre-insights.ts):
```typescript
import { TZDate } from "@date-fns/tz";
```

**Core extraction pattern** (lines 7-14 of genre-insights.ts — identical in all 6 files):
```typescript
function buildDateFilter(scope: string, tz: string): { gte: Date; lt: Date } | null {
  if (scope === "all") return null;
  const year = parseInt(scope, 10);
  if (isNaN(year)) return null;
  const yearStart = new TZDate(year, 0, 1, 0, 0, 0, tz);
  const nextYearStart = new TZDate(year + 1, 0, 1, 0, 0, 0, tz);
  return { gte: yearStart, lt: nextYearStart };
}
```

**New file shape** — export the function so all 6 consumers can import it:
```typescript
// src/lib/queries/stats/utils.ts
import { TZDate } from "@date-fns/tz";

export type Scope = "all" | (string & {});  // "all" | year string like "2026"

export function buildDateFilter(scope: Scope, tz: string): { gte: Date; lt: Date } | null {
  if (scope === "all") return null;
  const year = parseInt(scope, 10);
  if (isNaN(year)) return null;
  const yearStart = new TZDate(year, 0, 1, 0, 0, 0, tz);
  const nextYearStart = new TZDate(year + 1, 0, 1, 0, 0, 0, tz);
  return { gte: yearStart, lt: nextYearStart };
}
```

**Consumer import pattern** (replace the inline function in each of the 6 modules):
```typescript
import { buildDateFilter } from "./utils";
// Remove local `function buildDateFilter(...)` definition entirely
```

---

### `src/types/stats.ts` (type-bundle — multiple type changes)

**Analog:** self — the `// ─── Section Name ───` separator style is already the project convention for type-bundle files. Decision D-02 says to keep these markers. Do not remove them.

**QUAL-01: strandCount literal union** — strandCount is on the `Project` model, not in stats.ts. See `src/components/features/supply-table/types.ts` and `prisma/schema.prisma`. The literal union belongs on the `CalcParams` interface (supply-table/types.ts line 13):
```typescript
// BEFORE (supply-table/types.ts line 13):
strandCount: number;  // default 2

// AFTER:
strandCount: 1 | 2 | 3 | 4 | 5 | 6;  // default 2, Prisma comment says "1-6"
```

**QUAL-03: MonthlyTotal.month literal union** (stats.ts lines 66-70):
```typescript
// BEFORE:
export interface MonthlyTotal {
  month: string; // "Jan", "Feb", ... "Dec"
  ...
}

// AFTER:
export type MonthLabel = "Jan" | "Feb" | "Mar" | "Apr" | "May" | "Jun"
  | "Jul" | "Aug" | "Sep" | "Oct" | "Nov" | "Dec";

export interface MonthlyTotal {
  month: MonthLabel;
  ...
}
```

**QUAL-03: DayOfWeekData.dayOfWeek literal union** (stats.ts lines 121-124):
```typescript
// BEFORE:
export interface DayOfWeekData {
  dayOfWeek: string; // "Mon", "Tue", ... "Sun"
  ...
}

// AFTER:
export type DayLabel = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

export interface DayOfWeekData {
  dayOfWeek: DayLabel;
  ...
}
```

**QUAL-04: SessionHistoryItem.date Date → string** (stats.ts lines 88-98):
```typescript
// BEFORE:
export interface SessionHistoryItem {
  id: string;
  date: Date;
  ...
}

// AFTER:
export interface SessionHistoryItem {
  id: string;
  date: string; // "YYYY-MM-DD" in user timezone — consistent with CalendarDayData.date
  ...
}
```

**QUAL-05: DailyBreakdownEntry extends CalendarSession** (stats.ts lines 74-134):
```typescript
// CalendarSession (lines 74-79) — unchanged, already has the 4 fields
export interface CalendarSession {
  projectId: string;
  chartId: string;
  projectName: string;
  stitchCount: number;
}

// BEFORE DailyBreakdownEntry (lines 128-134):
export interface DailyBreakdownEntry {
  date: string; // "YYYY-MM-DD"
  projectId: string;
  chartId: string;
  projectName: string;
  stitchCount: number;
}

// AFTER — extends CalendarSession to eliminate the structural duplication:
export interface DailyBreakdownEntry extends CalendarSession {
  date: string; // "YYYY-MM-DD"
}
```

**QUAL-09 + QUAL-10: PersonalBestRecord discriminated union** (stats.ts lines 137-149):
```typescript
// BEFORE:
export type RecordType = "bestDay" | "bestSession" | "longestStreak" | "currentStreak";

export interface PersonalBestRecord {
  type: RecordType;
  label: string;
  value: number;
  unit: string;
  date: string | null;
  projectId: string | null;
  chartId: string | null;
  projectName: string | null;
}

// AFTER — two-variant discriminated union per D-05/D-06:
export type RecordType = "bestDay" | "bestSession" | "longestStreak" | "currentStreak";

export interface ProjectLinkedRecord {
  type: "bestDay" | "bestSession";
  label: string;
  value: number;
  unit: string;
  date?: string;        // optional (absent when no data), not null
  projectId?: string;
  chartId?: string;
  projectName?: string;
}

export interface AggregateRecord {
  type: "longestStreak" | "currentStreak";
  label: string;
  value: number;
  unit: string;
}

export type PersonalBestRecord = ProjectLinkedRecord | AggregateRecord;
```

**QUAL-11: BrokenRecordType as Exclude** (stats.ts lines 209):
```typescript
// BEFORE:
export type BrokenRecordType = "bestDay" | "bestSession" | "longestStreak";

// AFTER — self-documenting, stays in sync automatically:
export type BrokenRecordType = Exclude<RecordType, "currentStreak">;
```

**QUAL-12: AvailableYearsData wrapper removal** (stats.ts lines 220-223):
```typescript
// REMOVE this interface entirely:
export interface AvailableYearsData {
  years: number[];
}
// available-years.ts will return number[] directly; page.tsx will receive number[].
```

---

### `src/lib/queries/stats/personal-bests.ts` (service — discriminated union + comment cleanup)

**QUAL-09: emptyRecord helper update** (lines 49-58, currently):
```typescript
// BEFORE — returns flat interface with null fields:
const emptyRecord = (type: RecordType, label: string, unit: string): PersonalBestRecord => ({
  type,
  label,
  value: 0,
  unit,
  date: null,
  projectId: null,
  chartId: null,
  projectName: null,
});

// AFTER — returns correct variant based on type discriminant:
const emptyProjectLinked = (
  type: "bestDay" | "bestSession",
  label: string,
): ProjectLinkedRecord => ({ type, label, value: 0, unit: "stitches" });

const emptyAggregate = (
  type: "longestStreak" | "currentStreak",
  label: string,
): AggregateRecord => ({ type, label, value: 0, unit: "days" });
```

**QUAL-07: Remove `// --- Sub-section ---` markers** (lines 69, 102, 121, 157):
```typescript
// REMOVE these 4 comments — the logic blocks are already self-evident:
// --- Best Day ---
// --- Best Session ---
// --- Streaks ---
// --- Current Streak ---
```

**buildDateFilter import** (replace lines 8-14 with import):
```typescript
import { buildDateFilter } from "./utils";
// Remove local function definition
```

---

### `src/lib/queries/stats/completion-estimates.ts` (service — tilde prefix move + buildDateFilter)

**QUAL-06 / QUAL-14: Move `~` prefix from data to rendering** (lines 75-76):
```typescript
// BEFORE — tilde baked into data:
estimatedDate: `~${format(estimatedDate, "MMM yyyy")}`,

// AFTER — data is clean, rendering adds tilde:
estimatedDate: format(estimatedDate, "MMM yyyy"),
// (same change at line 149 in getProjectCompletionEstimate)
```

**Consumer rendering** — wherever `estimatedDate` is displayed in a component, prefix with `~`:
```tsx
<span>~{estimate.estimatedDate}</span>
// or in template literal:
`~${estimate.estimatedDate}`
```

**buildDateFilter import** (replace lines 8-14 with import):
```typescript
import { buildDateFilter } from "./utils";
```

---

### `src/lib/queries/stats/available-years.ts` (service — unwrap AvailableYearsData)

**QUAL-12: Return `number[]` directly** (lines 7-33):
```typescript
// BEFORE:
import type { AvailableYearsData } from "@/types/stats";

async function computeAvailableYears(userId: string): Promise<AvailableYearsData> {
  ...
  return { years: [] };  // line 18
  ...
  return { years };       // line 28
}

// AFTER:
// Remove AvailableYearsData import
async function computeAvailableYears(userId: string): Promise<number[]> {
  ...
  return [];
  ...
  return years;
}
```

**Consumer update** — `src/app/(dashboard)/stats/page.tsx` line 101 and 158:
```typescript
// BEFORE (page.tsx line 101):
const availableYears = settled<AvailableYearsData>(results[16], "availableYears");
// line 158:
availableYears={availableYears?.years ?? null}

// AFTER:
const availableYears = settled<number[]>(results[16], "availableYears");
// line 158:
availableYears={availableYears ?? null}
```

---

### `src/lib/queries/stats/session-history.ts` (service — Date → string for date field)

**QUAL-04: Return date as "YYYY-MM-DD" string** (lines 50-60):
```typescript
// BEFORE:
return {
  sessions: sessions.map((s) => ({
    id: s.id,
    date: s.date,  // Date object from Prisma
    ...
  })),
  ...
};

// AFTER — format the date to match SessionHistoryItem.date: string:
import { format } from "date-fns";
import { TZDate } from "@date-fns/tz";
import { getUserTimezone } from "./timezone";

// inside computeSessionHistory, after getting tz:
const tz = getUserTimezone(userId);
return {
  sessions: sessions.map((s) => ({
    id: s.id,
    date: format(new TZDate(s.date, tz), "yyyy-MM-dd"),
    ...
  })),
  ...
};
```

---

### `src/app/(dashboard)/stats/search-params.ts` (utility — export SORT_FIELDS/SORT_DIRS)

**QUAL-02: Export constants** (lines 8-9):
```typescript
// BEFORE — private:
const SORT_FIELDS = ["date", "stitches", "time"] as const;
const SORT_DIRS = ["asc", "desc"] as const;

// AFTER — exported as single source of truth:
export const SORT_FIELDS = ["date", "stitches", "time"] as const;
export const SORT_DIRS = ["asc", "desc"] as const;
```

---

### `src/components/features/stats/session-history-table.tsx` (component — two changes)

**QUAL-02: Remove duplicate constants, import from search-params** (lines 26-28):
```typescript
// REMOVE these lines:
const SORT_FIELDS = ["date", "stitches", "time"] as const;
const SORT_DIRS = ["asc", "desc"] as const;

// ADD import at top:
import { SORT_FIELDS, SORT_DIRS } from "@/app/(dashboard)/stats/search-params";
```

**QUAL-04: Remove `new Date()` wrapper** (line 126):
```typescript
// BEFORE — defensive wrapper because date was Date type:
{format(new Date(item.date), "MMM d, yyyy")}

// AFTER — date is already a string "YYYY-MM-DD", parse directly:
{format(new Date(item.date), "MMM d, yyyy")}
// Note: format() accepts string directly if it's ISO-parseable.
// Can also use: {format(parseISO(item.date), "MMM d, yyyy")} for explicitness.
```

---

### `src/components/features/stats/records-table.tsx` (component — discriminated union narrowing)

**QUAL-09: Update RecordValueCell guard** (lines 35-69):

The current guard at line 42 checks `!record.date` which will become a type error once `date` is no longer `string | null` on the union. Narrow by discriminant instead:

```typescript
// BEFORE — checks null fields:
function RecordValueCell({ record, isAllTime }) {
  if (!record || (record.value === 0 && !record.date)) {
    return <span className="text-muted-foreground font-mono">--</span>;
  }
  ...
  {record.date && (
    <span>{format(new Date(record.date), "MMM d, yyyy")}</span>
  )}
  {record.projectName && record.chartId && (
    <Link href={`/charts/${record.chartId}`}>{record.projectName}</Link>
  )}
}

// AFTER — narrow by discriminant type:
function RecordValueCell({ record, isAllTime }) {
  if (!record || record.value === 0) {
    return <span className="text-muted-foreground font-mono">--</span>;
  }
  const isProjectLinked = record.type === "bestDay" || record.type === "bestSession";
  ...
  {isProjectLinked && record.date && (
    <span>{format(new Date(record.date), "MMM d, yyyy")}</span>
  )}
  {isProjectLinked && record.projectName && record.chartId && (
    <Link href={`/charts/${record.chartId}`}>{record.projectName}</Link>
  )}
}
```

**Test fixture update** (`records-table.test.tsx` lines 28-37 — streak records have spurious project fields):
```typescript
// BEFORE — longestStreak with project fields that don't belong:
{
  type: "longestStreak",
  ...
  date: "2026-01-01",         // spurious
  projectId: "proj-1",        // spurious
  chartId: "chart-1",         // spurious
  projectName: "Spring Garden", // spurious
},

// AFTER — AggregateRecord has no project fields:
{
  type: "longestStreak",
  label: "Longest Streak",
  value: 45,
  unit: "days",
  // no date, projectId, chartId, projectName
},
```

---

### `src/components/features/stats/stitching-calendar.tsx` (component — JSX comment cleanup)

**QUAL-06: Remove JSX `{/* ... */}` section labels** (lines 121, 144, 156, 180, 194, 213, 235, 240):

Pattern — these are JSX section markers inside render return. Remove all 8:
```tsx
// REMOVE (line 121):
{/* Month navigation header */}

// REMOVE (line 144):
{/* Weekday headers */}

// REMOVE (line 156):
{/* Calendar grid */}

// REMOVE (line 180):
{/* Day number */}

// REMOVE (line 194):
{/* Session pills - full on sm+, dots on mobile */}

// REMOVE (line 213):
{/* Mobile dots */}

// REMOVE (line 235):
{/* Empty state */}

// REMOVE (line 240):
{/* Calendar legend */}
```

---

### `src/components/features/sessions/log-session-modal.tsx` (component — semantic token replacement)

**QUAL-08: Replace emerald-* with semantic tokens** (lines 301, 316, 318, 470, 480):

The existing semantic token system uses: `bg-card`, `bg-muted`, `text-foreground`, `text-muted-foreground`, `text-primary`, `bg-primary/10`, `hover:bg-accent`, `border-border`. The session log modal uses a green accent for the project search results — emerald maps to the primary/accent color family:

```tsx
// Line 301 — search input focus ring:
// BEFORE: "focus:ring-emerald-500/40"
// AFTER:  "focus:ring-primary/40"

// Line 316 — dropdown item hover:
// BEFORE: "hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
// AFTER:  "hover:bg-accent"

// Line 318 — selected item state:
// BEFORE: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
// AFTER:  "bg-primary/10 text-primary"

// Line 470 — link text:
// BEFORE: "text-xs text-emerald-600 hover:underline dark:text-emerald-400"
// AFTER:  "text-xs text-primary hover:underline"

// Line 480 — upload area hover border + text:
// BEFORE: "hover:border-emerald-400 hover:text-emerald-600 dark:hover:border-emerald-600 dark:hover:text-emerald-400"
// AFTER:  "hover:border-primary hover:text-primary"
```

---

### `src/__tests__/mocks/factories.ts` (utility — assertion helpers + createMockStitchSession fix)

**QUAL-15/QUAL-16: assertSuccess/assertFailure helpers** — add after the `createMockRouter` export at line 624:

```typescript
// Pattern: result type matches the discriminated union used by all server actions:
// { success: true; [key]: ... } | { success: false; error: string }

/**
 * Narrows a server action result to the success branch.
 * Throws if the result is a failure, preventing vacuous assertions.
 *
 * Usage: assertSuccess(result); expect(result.chartId).toBe("...");
 */
export function assertSuccess<T extends { success: boolean }>(
  result: T,
): asserts result is T & { success: true } {
  if (!result.success) {
    throw new Error(
      `Expected success result but got failure: ${JSON.stringify(result)}`,
    );
  }
}

/**
 * Narrows a server action result to the failure branch.
 * Throws if the result is a success, preventing vacuous assertions.
 *
 * Usage: assertFailure(result); expect(result.error).toMatch("...");
 */
export function assertFailure<T extends { success: boolean }>(
  result: T,
): asserts result is T & { success: false } {
  if (result.success) {
    throw new Error(
      `Expected failure result but got success: ${JSON.stringify(result)}`,
    );
  }
}
```

**QUAL-16 (999.48): Fix createMockStitchSession type** (lines 407-430):
```typescript
// BEFORE — inline anonymous type that won't catch schema drift:
export function createMockStitchSession(
  overrides?: Partial<{
    id: string;
    projectId: string;
    date: Date;
    ...
  }>,
)

// AFTER — use Prisma's StitchSession type as source of truth:
import type { StitchSession } from "@/generated/prisma/client";

export function createMockStitchSession(overrides?: Partial<StitchSession>) {
  return {
    id: "session-1",
    projectId: "project-1",
    date: new Date("2026-04-10"),
    stitchCount: 150,
    timeSpentMinutes: 60,
    photoKey: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
```

---

### Vacuous Assertion Sweep — 12 test files

**Pattern: replace `if (result.success) { expect(...) }` with `assertSuccess(result)` guard**

**Import to add** at top of each affected test file:
```typescript
import { assertSuccess, assertFailure } from "@/__tests__/mocks/factories";
```

**Before/after transformation** (from `chart-actions.test.ts` lines 120-123):
```typescript
// BEFORE — vacuous: assertions inside conditional never run on failure:
expect(result.success).toBe(true);
if (result.success) {
  expect(result.chartId).toBe("chart-new");
}

// AFTER — assertSuccess throws on failure, so assertions always run:
assertSuccess(result);
expect(result.chartId).toBe("chart-new");
```

**Failure branch transform** (from `chart-actions.test.ts` lines 211-214):
```typescript
// BEFORE:
expect(result.success).toBe(false);
if (!result.success) {
  expect(result.error).toBeTruthy();
}

// AFTER:
assertFailure(result);
expect(result.error).toBeTruthy();
```

**Files requiring the sweep** (43 instances across 12 files):
- `src/lib/validations/chart.test.ts`
- `src/lib/actions/upload-actions.test.ts`
- `src/lib/actions/chart-file-actions.test.ts`
- `src/lib/actions/designer-actions.test.ts`
- `src/lib/actions/supply-actions.test.ts`
- `src/lib/actions/chart-actions.test.ts`
- `src/lib/actions/genre-actions.test.ts`
- `src/lib/actions/fabric-actions.test.ts`
- `src/lib/actions/chart-actions-thumbnail.test.ts`
- `src/lib/actions/storage-location-actions.test.ts`
- `src/lib/actions/stitching-app-actions.test.ts`
- `src/lib/actions/session-actions.test.ts`

---

### Comment Cleanup in Test Files (QUAL-07 per D-04)

**`src/lib/actions/supply-actions.test.ts`** — Section markers inside describe blocks at lines 1423 and 1502. Per D-04, remove `// ─── ... ───` markers in test files where describe block names already provide structure:
```typescript
// REMOVE line 1423:
// ─── resolveDefaultBrandId (via public API) ─────────────────────────────────

// REMOVE line 1502:  (check exact text when implementing)
```

Note: The markers at lines 37, 130, 331, 429, 529, 657, 1146, 1239, 1331 are at top-level describe scope and serve the same navigation role — Claude should evaluate these during implementation.

**`src/lib/actions/chart-actions.test.ts`** — Section marker at line 229:
```typescript
// REMOVE line 229:
// ─── updateChartStatus cache invalidation ───────────────────────────────────
```

**`src/lib/queries/stats/record-detection.test.ts`** — WHAT-comment block at lines 224-229 (6-line arithmetic explanation that duplicates what the assertions prove):
```typescript
// REMOVE lines 224-229 — the comment block starting with:
// "Two prior-day sessions with identical stitchCount (500 each) on May 16,
// plus the current session (500) on May 18.
// The self-skip logic only skips the first today-match, but the prior-day
// sessions are NOT on today so they are never skipped.
// previousBestSession = 500 (from prior sessions), today's session = 500 => no bestSession record
// previousBestDay = 1000 (500+500 on May 16), todayTotal = 500 => no bestDay record"
// (Keep the inline "// Today's total = 500" and "// Two sessions on prior day" short labels if useful)
// Also remove lines 245-246 inline comments:
// "// No false positives — today's 500 does not beat prior best session of 500,
//  and today's total of 500 does not beat prior best day of 1000"
```

---

### `src/components/features/supply-table/types.ts` (type-bundle — strandCount literal union)

**QUAL-01: Narrow strandCount** (line 13):
```typescript
// BEFORE:
strandCount: number;  // default 2

// AFTER — matches schema comment "1-6, default 2":
strandCount: 1 | 2 | 3 | 4 | 5 | 6;  // default 2
```

**DEFAULT_CALC_PARAMS update** (line 19, no change needed — `2` satisfies `1|2|3|4|5|6`):
```typescript
export const DEFAULT_CALC_PARAMS: CalcParams = {
  fabricCount: 14,
  strandCount: 2,  // still valid, TypeScript narrows to the literal 2
  overCount: 1,
  wastePercent: 20,
};
```

---

### `.claude/rules/comment-conventions.md` (new rule file)

**Analog:** `.claude/rules/testing-requirements.md` (structure reference for new rule files)

**Content pattern** (from testing-requirements.md structure):
```markdown
# Comment Conventions

[Short description of the rule]

## Allowed comment types

- ...

## Exception: type-bundle files

Type-bundle files containing only interface/type declarations (e.g., `src/types/stats.ts`,
`src/types/dashboard.ts`) may use `// ─── Section Name ───` separators as navigation aids.
These files have no function or class symbols for IDE navigation, so section markers serve
as the primary structural signal.

## Not allowed

- JSX `{/* Section Label */}` markers inside render return blocks
...
```

---

## Shared Patterns

### Type-Bundle Section Markers (Keep — D-02)
**Source:** `src/types/stats.ts` lines 4, 17, 30, etc.
**Apply to:** Any new type/interface added to stats.ts — place under the appropriate existing section header.
```typescript
// ─── Section Name ──────────────────────────────────────────────────────────

export interface NewType {
  ...
}
```

### Stats Query Module Structure
**Source:** `src/lib/queries/stats/genre-insights.ts` (full file, 94 lines)
**Apply to:** All 6 buildDateFilter consumers after extraction.

Each module follows: import → (removed) buildDateFilter → compute fn with try/catch + console.error → exported cache wrapper. After QUAL-13 extraction, the module becomes import → `import { buildDateFilter } from "./utils"` → compute fn → cache wrapper.

### Error Handling in Stats Queries
**Source:** `src/lib/queries/stats/genre-insights.ts` lines 77-80
**Apply to:** `src/lib/queries/stats/utils.ts` (no error handling needed — pure computation, no I/O)
```typescript
} catch (error) {
  console.error("[stats] computeGenreInsights failed:", { userId, scope, limit, error });
  throw error;
}
```

### Semantic Token Mapping (for emerald-* replacement)
**Source:** `src/components/features/stats/records-table.tsx` lines 17-21 (RECORD_ICONS use `text-warning`, `text-success`)
**Apply to:** `src/components/features/sessions/log-session-modal.tsx`

| Hardcoded | Semantic token | Context |
|---|---|---|
| `emerald-500/40` (focus ring) | `primary/40` | Focus state |
| `emerald-50` / `emerald-900/20` (hover bg) | `accent` | Hover state |
| `emerald-50 text-emerald-700` (selected) | `primary/10 text-primary` | Selected state |
| `text-emerald-600` / `dark:text-emerald-400` (link) | `text-primary` | Interactive text |
| `border-emerald-400 text-emerald-600` (hover) | `border-primary text-primary` | Upload zone hover |

---

## No Analog Found

All modified files exist in the codebase. No new algorithmic patterns are needed — every change is either an extraction, a type refinement, or a cleanup of an existing file.

---

## Metadata

**Analog search scope:** `src/types/`, `src/lib/queries/stats/`, `src/components/features/stats/`, `src/components/features/sessions/`, `src/components/features/supply-table/`, `src/__tests__/mocks/`, `src/lib/actions/*.test.ts`, `.claude/rules/`
**Files scanned:** 21
**Pattern extraction date:** 2026-05-18
