---
phase: 22-critical-fixes-test-infrastructure
reviewed: 2026-05-18T19:45:00Z
depth: standard
files_reviewed: 15
files_reviewed_list:
  - src/__tests__/mocks/factories.test.ts
  - src/__tests__/mocks/factories.ts
  - src/app/(dashboard)/stats/page.tsx
  - src/components/features/dashboard/dashboard-tabs.test.tsx
  - src/components/features/stats/activity-overview.tsx
  - src/components/features/stats/data-unavailable.tsx
  - src/components/features/stats/records-overview.tsx
  - src/components/features/stats/stats-overview.tsx
  - src/lib/actions/chart-actions.test.ts
  - src/lib/actions/shopping-cart-actions.test.ts
  - src/lib/actions/stats-actions.test.ts
  - src/lib/actions/stats-actions.ts
  - src/lib/actions/supply-actions.test.ts
  - src/lib/utils/settled.test.ts
  - src/lib/utils/settled.ts
findings:
  critical: 1
  warning: 3
  info: 2
  total: 6
status: issues_found
---

# Phase 22: Code Review Report

**Reviewed:** 2026-05-18T19:45:00Z
**Depth:** standard
**Files Reviewed:** 15
**Status:** issues_found

## Summary

Phase 22 delivers three workstreams: (1) test infrastructure improvements (`createMockPrisma` defaults, `mockTransaction` helper, factory tests), (2) stats page resilience (`Promise.all` to `Promise.allSettled` with graceful degradation), and (3) pre-existing TypeScript error fixes in test files.

The `Promise.allSettled` migration is the most significant change and is structurally sound -- the `settled()` utility, nullable prop threading, and `DataUnavailable` fallback components form a coherent pattern. However, the resilience work has a critical gap: the project-list query that runs AFTER `Promise.allSettled` is not protected, meaning a single DB failure still crashes the entire page. There are also observability concerns with silent error swallowing and minor quality issues in the stats-actions module.

## Critical Issues

### CR-01: Stats page project-list query is unprotected -- single failure crashes entire page

**File:** `src/app/(dashboard)/stats/page.tsx:104-111`
**Issue:** The 17 stats queries are wrapped in `Promise.allSettled` for resilience, but the `prisma.project.findMany` call on line 104 runs outside this protection as a bare `await`. If this query throws (connection timeout, Prisma client error, etc.), the entire stats page crashes with an unhandled exception -- exactly the failure mode this phase was designed to prevent.

This is especially problematic because the project list query hits the same database as the 17 protected queries. Any transient DB issue that would cause one of those to fail would also cause this one to fail, defeating the purpose of the `Promise.allSettled` migration.

**Fix:** Include the project list query in the `Promise.allSettled` call, or wrap it separately with a fallback:

```tsx
// Option A: Add to Promise.allSettled array (preferred)
// Add as results[17], then:
const projectsRaw = settled<{ id: string; chart: { name: string } }[]>(results[17]);
const projectList = (projectsRaw ?? []).map((p) => ({
  id: p.id,
  name: p.chart.name,
}));

// Option B: Wrap with try/catch fallback
let projectList: { id: string; name: string }[] = [];
try {
  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    select: { id: true, chart: { select: { name: true } } },
    orderBy: { chart: { name: "asc" } },
  });
  projectList = projects.map((p) => ({ id: p.id, name: p.chart.name }));
} catch {
  // Graceful degradation: session table filter dropdown will be empty
}
```

## Warnings

### WR-01: settled() silently swallows all query errors with no logging

**File:** `src/lib/utils/settled.ts:5-7`
**Issue:** The `settled()` utility returns `null` for rejected promises but discards the error reason entirely. In the stats page, 17 queries could fail and the user sees "unavailable" cards with zero diagnostic information in server logs. This makes production debugging nearly impossible -- you cannot determine whether the stats page is degraded or which query failed.

The `stats-actions.ts` server actions (lines 33, 52, 68) correctly use `console.error` before returning error results. The stats page should follow the same observability pattern.

**Fix:** Add error logging to `settled()`:

```ts
export function settled<T>(result: PromiseSettledResult<T>, label?: string): T | null {
  if (result.status === "fulfilled") return result.value;
  console.error(`[settled] ${label ?? "Query"} failed:`, result.reason);
  return null;
}
```

Then in usage: `settled<StatsHeroData>(results[0], "heroStats")`.

### WR-02: console.error calls in stats-actions.ts leak to production logs

**File:** `src/lib/actions/stats-actions.ts:33,52,68`
**Issue:** Three `console.error` calls log the full error object on validation or query failures. While logging is necessary (see WR-01), `console.error` in server actions will output to Vercel's function logs in production. The error objects may contain internal details (stack traces, DB connection strings from Prisma errors). These should use a structured logger or at minimum sanitize the output.

This is a WARNING rather than CRITICAL because: (1) Vercel function logs are not publicly accessible, and (2) the information leakage is to server-side logs only, not to the client.

**Fix:** At minimum, log only the message, not the full error object:

```ts
console.error("fetchCalendarMonth error:", error instanceof Error ? error.message : "Unknown error");
```

### WR-03: Type assertion pattern in shopping-cart-actions.test.ts weakens type safety

**File:** `src/lib/actions/shopping-cart-actions.test.ts:463,470`
**Issue:** The fix for the TypeScript error uses `as` type assertions to cast the result:

```ts
expect((result as { success: false; error: string }).error).toBeDefined();
```

This replaces the original `if (!result.success) expect(result.error).toBeDefined()` pattern which was a type-narrowing guard. The original was technically correct TypeScript (the `if` narrows the union), but apparently failed type checking in this project's config. The `as` cast silences the compiler but would hide future type regressions -- if the action's return type changes to omit `error`, this test would still compile but fail at runtime.

**Fix:** Use a discriminated-union narrowing pattern that satisfies both the compiler and type safety:

```ts
expect(result.success).toBe(false);
if (!result.success) {
  expect((result as { success: false; error: string }).error).toBeDefined();
}
```

Or restructure the test to assert on the full shape:

```ts
expect(result).toEqual(expect.objectContaining({ success: false, error: expect.any(String) }));
```

## Info

### IN-01: Factory `createMockStitchSession` uses inline type instead of Prisma model type

**File:** `src/__tests__/mocks/factories.ts:407-430`
**Issue:** Unlike every other factory in the file, `createMockStitchSession` defines its shape inline via `Partial<{...}>` rather than using `Partial<StitchSession>` from the Prisma client. This means the factory won't catch schema drift if the `StitchSession` model changes (fields added/removed/renamed). Every other factory correctly uses `Partial<ModelType>`.

**Fix:** Import and use the Prisma type:

```ts
import type { StitchSession } from "@/generated/prisma/client";

export function createMockStitchSession(overrides?: Partial<StitchSession>): StitchSession {
  return {
    id: "session-1",
    projectId: "project-1",
    // ... same defaults ...
    ...overrides,
  };
}
```

### IN-02: dashboard-tabs.test.tsx imports directly from @testing-library/react

**File:** `src/components/features/dashboard/dashboard-tabs.test.tsx:2`
**Issue:** The project convention (CLAUDE.md and `testing-requirements.md`) states: "Import test utils from `@/__tests__/test-utils` -- not `@testing-library/react`". This file imports `RenderOptions` from `@testing-library/react` (line 2). While this is a type-only import (not a runtime import of render/screen), it introduces a direct dependency on the underlying library rather than the project's abstraction layer.

**Fix:** Define the `Wrapper` type locally without the import:

```ts
type Wrapper = React.ComponentType<{ children: React.ReactNode }>;
```

Or re-export `RenderOptions` from `@/__tests__/test-utils`.

---

_Reviewed: 2026-05-18T19:45:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
