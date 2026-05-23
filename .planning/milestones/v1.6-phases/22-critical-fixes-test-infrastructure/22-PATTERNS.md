# Phase 22: Critical Fixes & Test Infrastructure - Pattern Map

**Mapped:** 2026-05-18
**Files analyzed:** 11 (new/modified files)
**Analogs found:** 11 / 11

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/lib/actions/supply-actions.ts` | action | CRUD | self (junction ops lines 401-509) | exact |
| `src/lib/actions/supply-actions.test.ts` | test | CRUD | self (existing ownership tests lines 660-702) | exact |
| `src/lib/actions/stats-actions.ts` | action | request-response | `src/lib/actions/supply-actions.ts` (auth pattern) | role-match |
| `src/lib/actions/stats-actions.test.ts` | test | request-response | `src/lib/actions/supply-actions.test.ts` (auth tests) | role-match |
| `src/app/(dashboard)/stats/page.tsx` | page | request-response | self (Promise.all restructure) | exact |
| `src/components/features/stats/stats-overview.tsx` | component | request-response | self (props become nullable) | exact |
| `src/components/features/stats/activity-overview.tsx` | component | request-response | self (props become nullable) | exact |
| `src/components/features/stats/records-overview.tsx` | component | request-response | self (props become nullable) | exact |
| `src/__tests__/mocks/factories.ts` | utility | test-infra | self (extend $transaction) | exact |
| `src/components/features/dashboard/dashboard-tabs.test.tsx` | test | component-test | self (fix wrapper prop type) | exact |
| `src/lib/actions/chart-actions.test.ts` | test | CRUD | self (fix createMany mock type) | exact |
| `src/lib/actions/shopping-cart-actions.test.ts` | test | CRUD | self (fix error narrowing type) | exact |

## Pattern Assignments

### `src/lib/actions/supply-actions.ts` -- CRIT-01: Ownership Validation (action, CRUD)

**Analog:** Self -- the junction operations already have ownership checks. The gap is that top-level CRUD functions (`createThread`, `updateThread`, `deleteThread`, etc. on lines 57-319) do NOT verify project ownership because they operate on global supply entities, not project-scoped ones. Per CONTEXT D-35, Claude decides the check location.

**Existing ownership check pattern** (lines 401-419, `addThreadToProject`):
```typescript
export async function addThreadToProject(formData: unknown) {
  const user = await requireAuth();

  try {
    const validated = projectThreadSchema.parse(formData);

    // Verify project ownership
    const project = await prisma.project.findUnique({
      where: { id: validated.projectId },
      select: { userId: true },
    });
    if (!project || project.userId !== user.id) {
      return { success: false as const, error: "Project not found" };
    }
    // ... proceed with mutation
```

**Junction ownership check via relation** (lines 523-534, `updateProjectSupplyQuantity`):
```typescript
if (type === "thread") {
  const record = await prisma.projectThread.findUnique({
    where: { id },
    select: { project: { select: { userId: true } } },
  });
  if (!record || record.project.userId !== user.id) {
    return { success: false as const, error: "Supply not found" };
  }
  await prisma.projectThread.update({
    where: { id },
    data: validated,
  });
}
```

**Error shape pattern** -- failures return `{ success: false as const, error: string }`, NOT throwing:
```typescript
return { success: false as const, error: "Project not found" };
return { success: false as const, error: "Supply not found" };
```

---

### `src/lib/actions/supply-actions.test.ts` -- CRIT-01: Ownership Rejection Tests (test, CRUD)

**Analog:** Self -- existing ownership tests for junction operations. New tests follow the same structure but target the missing coverage (zero tests verifying rejection when project belongs to different user for the standalone supply CRUD).

**Auth mock setup pattern** (lines 1-34):
```typescript
import { describe, expect, it, vi, beforeEach } from "vitest";
import { createMockPrisma, /* factories */ } from "@/__tests__/mocks";

const mockAuth = vi.fn();
vi.mock("@/lib/auth", () => ({
  auth: mockAuth,
}));

const mockPrisma = createMockPrisma();
vi.mock("@/lib/db", () => ({
  prisma: mockPrisma,
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("supply-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({
      user: { id: "user-1", name: "Test", email: "test@test.com" },
    });
  });
```

**Auth rejection test pattern** (lines 39-51):
```typescript
it("rejects unauthenticated calls to createThread", async () => {
  mockAuth.mockResolvedValueOnce(null);
  const { createThread } = await import("./supply-actions");
  await expect(
    createThread({ /* valid data */ }),
  ).rejects.toThrow("Unauthorized");
});
```

**Ownership rejection test pattern** (lines 1011-1025, `createAndAddThread`):
```typescript
it("checks project ownership before creating", async () => {
  mockPrisma.project.findUnique.mockResolvedValueOnce({ userId: "other-user" });
  const { createAndAddThread } = await import("./supply-actions");

  const result = await createAndAddThread({
    projectId: "p1",
    name: "Custom Red",
    brandId: "brand-1",
  });

  expect(result.success).toBe(false);
  if (!result.success) {
    expect(result.error).toBe("Project not found");
  }
});
```

**Junction ownership rejection pattern** (lines 960-971):
```typescript
it("returns empty arrays when project not owned by user", async () => {
  mockPrisma.project.findUnique.mockResolvedValueOnce({ userId: "other-user" });
  const { getProjectSupplies } = await import("./supply-actions");

  const result = await getProjectSupplies("proj-1");

  expect(result.threads).toHaveLength(0);
  // Should NOT query junction tables when ownership fails
  expect(mockPrisma.projectThread.findMany).not.toHaveBeenCalled();
});
```

---

### `src/lib/actions/stats-actions.ts` -- D-09: requireAuth Outside try/catch (action, request-response)

**Analog:** `src/lib/actions/supply-actions.ts` and `src/lib/actions/session-actions.ts`

**Current stats-actions pattern (WRONG -- auth inside try/catch)** (lines 19-35):
```typescript
export async function fetchCalendarMonth(
  month: number,
  year: number,
): Promise<StatsResult<CalendarDayData[]>> {
  try {
    const user = await requireAuth();  // <-- inside try/catch, swallows auth errors
    const parsed = monthYearSchema.parse({ month, year });
    // ...
  } catch (error) {
    // Auth failures land here as generic errors
```

**Target pattern from supply-actions (CORRECT -- auth outside try/catch)** (lines 57-81):
```typescript
export async function createThread(formData: unknown) {
  await requireAuth();  // <-- outside try/catch, throws through

  try {
    const validated = threadSchema.parse(formData);
    // ... business logic
    return { success: true as const, thread };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: error.errors[0].message };
    }
    // ...
  }
}
```

**Target pattern from session-actions** (lines 49-51):
```typescript
export async function createSession(formData: unknown) {
  const user = await requireAuth();  // <-- outside try/catch

  try {
    const validated = sessionFormSchema.parse(formData);
```

---

### `src/lib/actions/stats-actions.test.ts` -- D-09/D-10: Auth + Zod Tests (test, request-response)

**Analog:** `src/lib/actions/supply-actions.test.ts` for auth rejection, existing stats-actions.test.ts for Zod tests.

**Current stats auth test (WRONG -- tests expect swallowed error)** (lines 44-51):
```typescript
it("returns error when requireAuth rejects", async () => {
  mockRequireAuth.mockRejectedValue(new Error("Unauthorized"));

  const { fetchCalendarMonth } = await import("./stats-actions");
  const result = await fetchCalendarMonth(5, 2026);

  expect(result).toEqual({ success: false, error: "Failed to load calendar data" });
});
```

**Target auth test pattern (should throw through)** from supply-actions.test.ts (lines 39-51):
```typescript
it("rejects unauthenticated calls to createThread", async () => {
  mockAuth.mockResolvedValueOnce(null);
  const { createThread } = await import("./supply-actions");
  await expect(
    createThread({ /* data */ }),
  ).rejects.toThrow("Unauthorized");
});
```

**Existing Zod boundary test pattern** from stats-actions.test.ts (lines 36-42):
```typescript
it("returns error on invalid month", async () => {
  const { fetchCalendarMonth } = await import("./stats-actions");
  const result = await fetchCalendarMonth(13, 2026);

  expect(result.success).toBe(false);
  expect(mockGetCalendarDays).not.toHaveBeenCalled();
});
```

---

### `src/app/(dashboard)/stats/page.tsx` -- D-01/D-02/D-03: Promise.allSettled (page, request-response)

**Analog:** Self -- restructuring the existing Promise.all on lines 45-81.

**Current pattern (FRAGILE)** (lines 45-81):
```typescript
const [
  heroStats,
  collectionBreakdown,
  // ... 15 more destructured results
] = await Promise.all([
  getHeroStats(user.id),
  getCollectionBreakdown(user.id),
  // ... 15 more calls
]);
```

**Target pattern** -- wrap with Promise.allSettled + settled() helper:
```typescript
// New utility: src/lib/utils/settled.ts
function settled<T>(result: PromiseSettledResult<T>): T | null {
  return result.status === "fulfilled" ? result.value : null;
}
```

**hasNoSessions defensive derivation (D-03)** -- current line 98:
```typescript
const hasNoSessions = heroStats.totalSessions === 0;
```
Must become:
```typescript
const hasNoSessions = heroStats === null || heroStats.totalSessions === 0;
```

---

### Stats Component Props -- Nullable Props (components, request-response)

**Analog:** Self -- each component's props interface needs `| null` added.

**StatsOverview current props** (stats-overview.tsx lines 17-23):
```typescript
interface StatsOverviewProps {
  heroStats: StatsHeroData;
  collectionBreakdown: CollectionBreakdownData;
  sizeBreakdown: SizeBreakdownItem[];
  designerBreakdown: DesignerBreakdownItem[];
  genreBreakdown: GenreBreakdownItem[];
}
```

**ActivityOverview current props** (activity-overview.tsx lines 15-25):
```typescript
interface ActivityOverviewProps {
  paceMetrics: PaceMetricsData;
  monthlyTotals: MonthlyTotal[];
  dayOfWeekData: DayOfWeekData[];
  calendarData: CalendarDayData[];
  sessionHistory: SessionHistoryData;
  projects: { id: string; name: string }[];
  currentYear: number;
  currentMonth: number;
  hasNoSessions: boolean;
}
```

**RecordsOverview current props** (records-overview.tsx lines 17-26):
```typescript
interface RecordsOverviewProps {
  personalBests: PersonalBestRecord[];
  fastestCompletions: FastestCompletion[];
  threadInsights: ThreadInsight[];
  designerInsights: DesignerInsight[];
  genreInsights: GenreInsight[];
  completionEstimates: CompletionEstimate[];
  availableYears: number[];
  hasNoSessions: boolean;
}
```

**"unavailable" card pattern** (no existing analog -- new pattern). Components should render a muted placeholder when data is null:
```typescript
{heroStats === null ? (
  <div className="text-muted-foreground text-sm">Data unavailable</div>
) : (
  <MetricsBar stitchesToday={heroStats.stitchesToday} /* ... */ />
)}
```

---

### `src/__tests__/mocks/factories.ts` -- D-05/D-06: $transaction Default (utility, test-infra)

**Analog:** Self -- extending the existing `createMockPrisma()`.

**Current $transaction mock** (factories.ts line 583):
```typescript
$transaction: vi.fn(),
```

**Target D-05 -- default implementation** per CONTEXT:
```typescript
$transaction: vi.fn().mockImplementation(
  (fn: unknown) => typeof fn === "function" ? fn(mockPrisma) : Promise.all(fn as Promise<unknown>[])
),
```
Note: this is self-referential -- the `mockPrisma` object isn't in scope at definition time, so the implementation needs to use a closure or be set after construction.

**Existing per-test $transaction override pattern** from supply-actions.test.ts (lines 1031-1036):
```typescript
mockPrisma.$transaction.mockImplementationOnce(async (cb: (tx: unknown) => unknown) => {
  return cb({
    thread: { create: vi.fn().mockResolvedValue(mockThread) },
    projectThread: { create: vi.fn().mockResolvedValue(mockLink) },
  });
});
```

**Target D-06 -- mockTransaction helper** (new file or addition to factories.ts):
```typescript
function mockTransaction(
  mockPrisma: ReturnType<typeof createMockPrisma>,
  overrides: Record<string, Record<string, ReturnType<typeof vi.fn>>>
) {
  mockPrisma.$transaction.mockImplementationOnce(
    async (cb: (tx: unknown) => unknown) => cb(overrides)
  );
}
```

---

### `src/components/features/dashboard/dashboard-tabs.test.tsx` -- CRIT-03: wrapper Prop Fix (test, component-test)

**Analog:** Self -- fixing the TypeScript error on the `wrapper` prop.

**Current render call** (dashboard-tabs.test.tsx line 13-15):
```typescript
render(<DashboardTabs {...defaultProps} />, {
  wrapper: withNuqsTestingAdapter(),
});
```

**Custom render signature** from test-utils.tsx (lines 12-18):
```typescript
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper"> & { wrapper?: RenderOptions["wrapper"] },
) {
  const { wrapper, ...rest } = options ?? {};
  return render(ui, { wrapper: wrapper ?? AllProviders, ...rest });
}
```

The `wrapper` prop IS accepted by the custom render. The error is likely that `withNuqsTestingAdapter()` returns a type incompatible with `RenderOptions["wrapper"]`. Fix approach: type assertion or verifying nuqs adapter's return type.

---

### `src/lib/actions/chart-actions.test.ts` -- CRIT-03: createMany Mock Type Fix (test, CRUD)

**Analog:** Self -- the $transaction mock on lines 105-109 and 131-138 passes `mockPrisma` as the tx client.

**Error site** (chart-actions.test.ts lines 105-109):
```typescript
mockPrisma.$transaction.mockImplementationOnce(
  async (fn: (tx: typeof mockPrisma) => Promise<unknown>) => {
    mockPrisma.chart.create.mockResolvedValueOnce(createdChart);
    return fn(mockPrisma);
  },
);
```

The issue: `typeof mockPrisma` includes `$transaction` but the real `Prisma.TransactionClient` does not. The fix is adjusting the type annotation on the callback parameter.

---

### `src/lib/actions/shopping-cart-actions.test.ts` -- CRIT-03: Error Narrowing Fix (test, CRUD)

**Analog:** Self -- the vacuous assertion pattern.

**Error site** (shopping-cart-actions.test.ts lines 461-463):
```typescript
expect(result.success).toBe(false);
if (!result.success) expect(result.error).toBeDefined();
```

**D-07 fix pattern** -- use TypeScript narrowing via assertion before accessing `.error`:
```typescript
expect(result.success).toBe(false);
if (!result.success) {
  expect(result.error).toBeDefined();
}
```
This already uses the narrowing pattern. The actual TS error may be that `result` lacks a discriminated union type -- the action return type needs investigation.

---

## Shared Patterns

### Authentication Guard
**Source:** `src/lib/auth-guard.ts` (lines 1-22)
**Apply to:** All action files (supply-actions, stats-actions, session-actions)
```typescript
import { requireAuth } from "@/lib/auth-guard";

export async function someAction(formData: unknown) {
  const user = await requireAuth();  // OUTSIDE try/catch -- throws through

  try {
    // Business logic here
  } catch (error) {
    // Only catches business/validation errors, NOT auth errors
  }
}
```

### Server Action Error Shape
**Source:** `src/lib/actions/supply-actions.ts` (consistent across all actions)
**Apply to:** All action files
```typescript
// Success
return { success: true as const, data };

// Validation failure
if (error instanceof z.ZodError) {
  return { success: false as const, error: error.errors[0].message };
}

// Business logic failure
return { success: false as const, error: "Human-readable message" };
```

### Test Mock Setup (Standard 3-Mock Pattern)
**Source:** `src/lib/actions/supply-actions.test.ts` (lines 1-34)
**Apply to:** All server action test files
```typescript
const mockAuth = vi.fn();
vi.mock("@/lib/auth", () => ({ auth: mockAuth }));

const mockPrisma = createMockPrisma();
vi.mock("@/lib/db", () => ({ prisma: mockPrisma }));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

beforeEach(() => {
  vi.clearAllMocks();
  mockAuth.mockResolvedValue({
    user: { id: "user-1", name: "Test", email: "test@test.com" },
  });
});
```

### Ownership Verification Pattern
**Source:** `src/lib/actions/supply-actions.ts` (lines 401-419)
**Apply to:** All junction/project-scoped mutations
```typescript
const project = await prisma.project.findUnique({
  where: { id: validated.projectId },
  select: { userId: true },
});
if (!project || project.userId !== user.id) {
  return { success: false as const, error: "Project not found" };
}
```

### Stats Query Module Pattern
**Source:** `src/lib/queries/stats/hero-stats.ts` (lines 1-59)
**Apply to:** Understanding of what the stats page consumes
```typescript
async function computeHeroStats(userId: string): Promise<StatsHeroData> {
  try {
    // Prisma queries
    return { /* typed data */ };
  } catch (error) {
    console.error("[stats] computeHeroStats failed:", { userId, error });
    throw error;  // Re-throws -- the page's Promise.allSettled will catch
  }
}

export function getHeroStats(userId: string) {
  return unstable_cache(() => computeHeroStats(userId), [`stats-hero-${userId}`], {
    tags: ["stats"],
    revalidate: 300,
  })();
}
```

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/lib/utils/settled.ts` | utility | transform | New utility -- no existing settled/allSettled helper in codebase. Pattern is straightforward (2-line function). |

## Metadata

**Analog search scope:** `src/lib/actions/`, `src/lib/queries/stats/`, `src/components/features/stats/`, `src/components/features/dashboard/`, `src/__tests__/mocks/`
**Files scanned:** ~25 (actions, tests, components, mocks, queries)
**Pattern extraction date:** 2026-05-18
