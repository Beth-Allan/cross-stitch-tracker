# Phase 23: Test Coverage & Reliability - Pattern Map

**Mapped:** 2026-05-18
**Files analyzed:** 9 (4 test files to extend, 3 implementation files to modify, 1 component test to extend, 1 component to modify)
**Analogs found:** 9 / 9

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `src/lib/utils/skein-calculator.test.ts` | test | transform | itself (extend) | exact |
| `src/lib/queries/stats/record-detection.test.ts` | test | CRUD | itself (extend) | exact |
| `src/lib/queries/stats/completion-estimates.test.ts` | test | CRUD | itself (extend) | exact |
| `src/components/features/stats/stitching-calendar.test.tsx` | test | event-driven | itself (extend) | exact |
| `src/lib/actions/session-actions.ts` | service | CRUD | itself (modify) | exact |
| `src/lib/actions/session-actions.test.ts` | test | CRUD | itself (extend) | exact |
| `src/lib/actions/chart-actions.ts` | service | CRUD | `src/lib/actions/session-actions.ts` | exact |
| `src/lib/actions/supply-actions.ts` | service | CRUD | `src/lib/actions/session-actions.ts` | role-match |
| `src/components/features/sessions/log-session-modal.tsx` | component | event-driven | itself (modify) | exact |

## Pattern Assignments

### `src/lib/utils/skein-calculator.test.ts` (test, transform) -- TEST-01

**Analog:** Same file (extending existing tests)

**Test structure pattern** (lines 1-5):
```typescript
import { describe, it, expect } from "vitest";
import { calculateSkeins } from "./skein-calculator";

describe("calculateSkeins", () => {
```

**Edge case test pattern** (lines 53-66):
```typescript
  it("returns 0 for stitchCount of 0", () => {
    const result = calculateSkeins({
      stitchCount: 0,
      strandCount: 2,
      fabricCount: 14,
      overCount: 2,
      wastePercent: 20,
    });
    expect(result).toBe(0);
  });

  it("returns 0 for negative stitchCount", () => {
    const result = calculateSkeins({
      stitchCount: -100,
      strandCount: 2,
      fabricCount: 14,
      overCount: 2,
      wastePercent: 20,
    });
    expect(result).toBe(0);
  });
```

**Note:** Tests for `fabricCount=0` already exist (lines 157-167). TEST-01 scope is adding `resolveDefaultBrandId` edge case tests -- these belong in a supply-actions test since `resolveDefaultBrandId` is in `supply-actions.ts`.

---

### `src/lib/queries/stats/record-detection.test.ts` (test, CRUD) -- TEST-05

**Analog:** Same file (extending existing tests)

**Mock setup pattern** (lines 1-9):
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockPrisma } from "@/__tests__/mocks";

const mockPrisma = createMockPrisma();
vi.mock("@/lib/db", () => ({ prisma: mockPrisma }));

vi.mock("./timezone", () => ({
  getUserTimezone: () => "America/Edmonton",
}));
```

**Test case pattern with dynamic import** (lines 17-43):
```typescript
  it("returns empty array when session does not break any record", async () => {
    mockPrisma.stitchSession.aggregate.mockResolvedValue({
      _sum: { stitchCount: 100 },
    });

    mockPrisma.stitchSession.findMany.mockResolvedValue([
      {
        date: new Date("2026-05-10T14:00:00Z"),
        stitchCount: 200,
      },
      {
        date: new Date("2026-05-11T14:00:00Z"),
        stitchCount: 100,
      },
    ]);

    const { detectBrokenRecords } = await import("./record-detection");
    const result = await detectBrokenRecords("user-1", {
      date: new Date("2026-05-17T14:00:00Z"),
      stitchCount: 100,
      projectId: "proj-1",
    });

    expect(result).toEqual([]);
  });
```

**New test needed:** Duplicate stitch count on same day -- two sessions today with identical stitchCount. Verify self-skip logic handles only one instance correctly.

---

### `src/lib/queries/stats/completion-estimates.test.ts` (test, CRUD) -- TEST-06

**Analog:** Same file (extending existing tests)

**Mock setup pattern** (lines 1-9):
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockPrisma } from "@/__tests__/mocks";

const mockPrisma = createMockPrisma();
vi.mock("@/lib/db", () => ({ prisma: mockPrisma }));

vi.mock("next/cache", () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}));

vi.mock("./timezone", () => ({
  getUserTimezone: () => "America/Edmonton",
}));
```

**Exclusion test pattern** (lines 55-73):
```typescript
  it("excludes projects with fewer than 3 sessions", async () => {
    mockPrisma.project.findMany.mockResolvedValue([
      {
        id: "p1",
        chartId: "c1",
        status: "IN_PROGRESS",
        stitchesCompleted: 500,
        chart: { id: "c1", name: "Too Few Sessions", stitchCount: 5000 },
        sessions: [
          { date: new Date("2026-01-01"), stitchCount: 250 },
          { date: new Date("2026-01-02"), stitchCount: 250 },
        ],
      },
    ]);

    const { getCompletionEstimates } = await import("./completion-estimates");
    const result = await getCompletionEstimates("user-1", "all");

    expect(result).toEqual([]);
  });
```

**New test needed:** Project where `stitchesCompleted >= totalStitches` (already completed). Current code has `remaining <= 0` guard (line 63) which handles this, but no test verifies it explicitly.

---

### `src/components/features/stats/stitching-calendar.test.tsx` (test, event-driven) -- TEST-04

**Analog:** Same file (extending existing tests)

**Component test with async navigation pattern** (lines 127-140):
```typescript
  it("clicking next month button calls fetchCalendarMonth with correct month/year", async () => {
    const { fetchCalendarMonth } = await import("@/lib/actions/stats-actions");
    const mockFetch = vi.mocked(fetchCalendarMonth);
    mockFetch.mockResolvedValue({ success: true, data: [] });

    render(<StitchingCalendar data={[]} initialMonth={5} initialYear={2026} />);

    const nextBtn = screen.getByRole("button", { name: "Next month" });
    fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(6, 2026);
    });
  });
```

**Navigation logic in component** (lines 89-99):
```typescript
  function navigateMonth(delta: number) {
    let newMonth = month + delta;
    let newYear = year;
    if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }
    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    }
```

**New tests needed:** Jan->Dec (prev from month=1 should call fetchCalendarMonth(12, year-1)) and Dec->Jan (next from month=12 should call fetchCalendarMonth(1, year+1)).

---

### `src/lib/actions/session-actions.ts` (service, CRUD) -- RELY-01, RELY-04

**Analog:** Same file

**deleteFile catch pattern to replace** (line 90):
```typescript
await deleteFile(session.photoKey).catch(() => {});
```

**Replace with log-and-continue pattern (matching line 93)**:
```typescript
await deleteFile(session.photoKey).catch((err) =>
  console.warn("[R2] raw file cleanup failed:", session.photoKey, err)
);
```

**deleteSession function needing photo cleanup** (lines 200-235):
```typescript
export async function deleteSession(sessionId: string) {
  const user = await requireAuth();

  try {
    const existing = await prisma.stitchSession.findUnique({
      where: { id: sessionId },
      include: {
        project: {
          select: { id: true, userId: true, chartId: true, startingStitches: true },
        },
      },
    });
    if (!existing || !existing.project || existing.project.userId !== user.id) {
      return { success: false as const, error: "Session not found" };
    }
    // ... photo cleanup should be added before or after DB delete
```

**createSession ownership query to extend for RELY-04** (lines 56-60):
```typescript
    const project = await prisma.project.findUnique({
      where: { id: validated.projectId },
      select: { id: true, userId: true, chartId: true, startingStitches: true },
    });
```
Add `chart: { select: { stitchCount: true } }` to select. Then after transaction, check if total exceeds chart stitch count and return `warning: "overTotal"`.

**Return shape for warning** (from existing success return, line 111):
```typescript
return { success: true as const, session: returnSession, brokenRecords };
```
Extend to: `{ success: true as const, session: returnSession, brokenRecords, warning?: "overTotal" }`

---

### `src/lib/actions/session-actions.test.ts` (test, CRUD) -- RELY-01 tests

**Analog:** Same file

**Test pattern for file operations** (lines 346-390):
```typescript
  it("optimizes session photo when photoKey is provided", async () => {
    // ... setup mocks ...
    const { createSession } = await import("./session-actions");
    const result = await createSession({ ... });

    expect(result.success).toBe(true);
    expect(mockProcessAndStoreImage).toHaveBeenCalledWith(
      "session-1",
      "sessions/p1/raw-photo.jpg",
      "sessions",
    );
  });
```

**Mock for deleteFile** (line 23):
```typescript
const mockDeleteFile = vi.fn().mockResolvedValue({ success: true });
```

**New tests needed:**
- `deleteSession` calls `deleteFile` when session has photoKey
- `deleteSession` succeeds even when `deleteFile` rejects (log-and-continue)
- `createSession` logs warning when deleteFile fails (not silent swallow)
- `createSession` returns `warning: "overTotal"` when stitchCount exceeds chart total

---

### `src/lib/actions/chart-actions.ts` (service, CRUD) -- RELY-02

**Analog:** `src/lib/actions/session-actions.ts` for cache invalidation pattern

**Existing revalidateTag pattern in session-actions** (line 110):
```typescript
revalidateTag("stats", { expire: 0 });
```

**updateChartStatus location** (lines 369-401):
```typescript
export async function updateChartStatus(chartId: string, status: string) {
  // ... validation and ownership check ...
  await prisma.project.update({
    where: { chartId },
    data: { status: validatedStatus as (typeof PROJECT_STATUSES)[number] },
  });

  revalidatePath(`/charts/${chartId}`);
  // ADD: revalidateTag("stats", { expire: 0 });
  return { success: true as const };
```

**Import to add** (line 3 -- add `revalidateTag` to existing import):
```typescript
import { revalidatePath } from "next/cache";
// becomes:
import { revalidatePath, revalidateTag } from "next/cache";
```

---

### `src/lib/actions/supply-actions.ts` (service, CRUD) -- RELY-03

**Analog:** `src/lib/actions/session-actions.ts` for cache invalidation pattern

**Existing revalidation in supply-actions** (line 66):
```typescript
revalidatePath("/supplies");
```

**Pattern to add after each mutation's revalidatePath**:
```typescript
revalidatePath("/supplies");
revalidateTag("stats", { expire: 0 });
```

**Import to add** (line 3 -- add `revalidateTag`):
```typescript
import { revalidatePath } from "next/cache";
// becomes:
import { revalidatePath, revalidateTag } from "next/cache";
```

---

### `src/components/features/sessions/log-session-modal.tsx` (component, event-driven) -- RELY-04 client side

**Analog:** Same file

**Current createSession result handling** (lines 210-217):
```typescript
const result = await createSession(formData);
if (result.success) {
  if (result.brokenRecords && result.brokenRecords.length > 0) {
    fireCelebration(result.brokenRecords);
  } else {
    toast.success("Session logged");
  }
  onOpenChange(false);
  return;
}
```

**After result.success, add warning toast check:**
```typescript
if (result.warning === "overTotal") {
  toast.warning("This session pushes progress past 100% — is your stitch count accurate?");
}
```

---

## Shared Patterns

### Authentication Guard
**Source:** `src/lib/auth-guard.ts` (via `requireAuth()`)
**Apply to:** All server action files (already present in session-actions, chart-actions, supply-actions)
```typescript
import { requireAuth } from "@/lib/auth-guard";
// First line in every exported action:
const user = await requireAuth();
```

### Action Return Shape
**Source:** `src/lib/actions/session-actions.ts`
**Apply to:** All server actions
```typescript
// Success:
return { success: true as const, ...data };
// Failure:
return { success: false as const, error: "Human-readable message" };
// New (RELY-04): Success with warning:
return { success: true as const, session, brokenRecords, warning: "overTotal" };
```

### Cache Invalidation
**Source:** `src/lib/actions/session-actions.ts` lines 108-110
**Apply to:** `chart-actions.ts` (updateChartStatus), all supply-actions mutations
```typescript
revalidatePath(`/charts/${chartId}`);
revalidatePath("/sessions");
revalidateTag("stats", { expire: 0 });
```

### Test Mock Infrastructure
**Source:** `src/__tests__/mocks/factories.ts`
**Apply to:** All new/extended test files
```typescript
import { createMockPrisma, createMockStitchSession } from "@/__tests__/mocks";

const mockPrisma = createMockPrisma();
vi.mock("@/lib/db", () => ({ prisma: mockPrisma }));
```

### Non-blocking Error Pattern (log-and-continue)
**Source:** `src/lib/actions/session-actions.ts` line 93
**Apply to:** All file cleanup operations (RELY-01)
```typescript
// DO NOT use: .catch(() => {})
// DO use:
.catch((err) => console.warn("[R2] raw file cleanup failed:", key, err))
```

### Component Test Pattern (event-driven navigation)
**Source:** `src/components/features/stats/stitching-calendar.test.tsx` lines 127-140
**Apply to:** Year-rollover tests (TEST-04)
```typescript
import { render, screen, fireEvent, waitFor } from "@/__tests__/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the server action
vi.mock("@/lib/actions/stats-actions", () => ({
  fetchCalendarMonth: vi.fn(),
}));

// Test navigation
it("navigates Dec->Jan crossing year boundary", async () => {
  const { fetchCalendarMonth } = await import("@/lib/actions/stats-actions");
  const mockFetch = vi.mocked(fetchCalendarMonth);
  mockFetch.mockResolvedValue({ success: true, data: [] });

  render(<StitchingCalendar data={[]} initialMonth={12} initialYear={2026} />);

  fireEvent.click(screen.getByRole("button", { name: "Next month" }));

  await waitFor(() => {
    expect(mockFetch).toHaveBeenCalledWith(1, 2027);
  });
});
```

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| (none) | -- | -- | All files have exact analogs in the existing codebase |

## Metadata

**Analog search scope:** `src/lib/actions/`, `src/lib/queries/stats/`, `src/lib/utils/`, `src/components/features/stats/`, `src/components/features/sessions/`, `src/__tests__/mocks/`
**Files scanned:** 14
**Pattern extraction date:** 2026-05-18
