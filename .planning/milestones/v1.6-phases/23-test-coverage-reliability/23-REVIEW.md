---
phase: 23-test-coverage-reliability
reviewed: 2026-05-18T20:45:00Z
depth: standard
files_reviewed: 10
files_reviewed_list:
  - src/components/features/sessions/log-session-modal.tsx
  - src/components/features/stats/stitching-calendar.test.tsx
  - src/lib/actions/chart-actions.test.ts
  - src/lib/actions/chart-actions.ts
  - src/lib/actions/session-actions.test.ts
  - src/lib/actions/session-actions.ts
  - src/lib/actions/supply-actions.test.ts
  - src/lib/actions/supply-actions.ts
  - src/lib/queries/stats/completion-estimates.test.ts
  - src/lib/queries/stats/record-detection.test.ts
findings:
  critical: 0
  warning: 2
  info: 1
  total: 3
status: issues_found
---

# Phase 23: Code Review Report

**Reviewed:** 2026-05-18T20:45:00Z
**Depth:** standard
**Files Reviewed:** 10
**Status:** issues_found

## Summary

Phase 23 adds test coverage for edge cases (overTotal warning, photo cleanup logging, year-boundary calendar navigation, completion estimates for already-completed projects, duplicate stitch count record detection), fixes silent `deleteFile().catch(() => {})` patterns to log warnings, adds `revalidateTag("stats")` to chart-actions and all supply-actions, and implements the `overTotal` warning for sessions that push progress past 100%.

The implementation is solid overall. Auth guards, ownership validation, Zod validation, and cache invalidation are consistently applied. Test coverage is thorough with good failure-mode testing. Two warnings found: one logic correctness issue where the overTotal warning uses a stale snapshot that can produce false negatives, and one missing `revalidateTag` in supply-actions functions added in this phase's scope.

## Warnings

### WR-01: overTotal warning uses pre-transaction snapshot, producing false negatives for concurrent or startingStitches scenarios

**File:** `src/lib/actions/session-actions.ts:117-122`
**Issue:** The `overTotal` warning check reads `project.stitchesCompleted` before the `$transaction` runs. This value is correct for the simple case, but consider this scenario: user has `startingStitches=500`, `stitchesCompleted=500` (no sessions yet), `chart.stitchCount=1000`. User logs 600 stitches. The check computes `500 + 600 = 1100 > 1000` and correctly warns. However, the check does NOT account for the *actual* post-transaction `stitchesCompleted` value (which is `startingStitches + SUM(sessions)` = `500 + 600 = 1100`). For the simple sequential case this works.

The real issue: the pre-transaction read is not protected by any lock. If two `createSession` calls race, both read `stitchesCompleted=900` with `chart.stitchCount=1000`, each adding 100 stitches. Neither triggers the warning (900+100=1000, not >1000), but the final `stitchesCompleted` will be 1100 (recalculated atomically inside the transaction). The warning is silently missed for the second session. Since this is a non-critical UX hint (not a guard), the impact is low, but it is a correctness gap in the warning logic.

**Fix:** Read the post-transaction `stitchesCompleted` and compare against `chart.stitchCount`:
```ts
const session = await prisma.$transaction(async (tx) => {
  const created = await tx.stitchSession.create({ ... });
  await recalculateProgress(tx, validated.projectId);
  return created;
});

// Read the updated project after transaction
const updatedProject = await prisma.project.findUnique({
  where: { id: validated.projectId },
  select: { stitchesCompleted: true },
});

let warning: "overTotal" | undefined;
if (
  project.chart?.stitchCount &&
  updatedProject &&
  updatedProject.stitchesCompleted > project.chart.stitchCount
) {
  warning = "overTotal";
}
```
Alternatively, have `recalculateProgress` return the new value so the extra query is avoided.

### WR-02: Missing revalidateTag("stats") in createAndAdd* supply functions (test gap)

**File:** `src/lib/actions/supply-actions.ts:742-845`
**Issue:** The diff adds `revalidateTag("stats", { expire: 0 })` to `createAndAddThread` (line 742), `createAndAddBead` (line 794), and `createAndAddSpecialty` (line 845). However, there are no test assertions verifying these specific calls. The cache invalidation test section (line 1504-1521 of `supply-actions.test.ts`) only tests `createThread` calling `revalidateTag("stats")`. The three `createAndAdd*` functions are the most complex supply mutations (transaction + ownership check + two DB writes), and their cache invalidation is untested.

This is a test coverage gap rather than a bug, but given that the phase's explicit goal is cache staleness testing, the omission is notable.

**Fix:** Add test assertions for `createAndAdd*` cache invalidation, similar to the existing `createThread` test:
```ts
it("createAndAddThread calls revalidateTag('stats') after success", async () => {
  // ... setup mocks ...
  const { createAndAddThread } = await import("./supply-actions");
  const { revalidateTag } = await import("next/cache");
  const result = await createAndAddThread({ ... });
  expect(result.success).toBe(true);
  expect(vi.mocked(revalidateTag)).toHaveBeenCalledWith("stats", { expire: 0 });
});
```

## Info

### IN-01: Hardcoded emerald-* color classes in log-session-modal (pre-existing, not introduced in this phase)

**File:** `src/components/features/sessions/log-session-modal.tsx:296,311,313,465,475`
**Issue:** Six locations use hardcoded `emerald-*` color classes (`focus:ring-emerald-500/40`, `hover:bg-emerald-50`, `text-emerald-700`, etc.) instead of semantic design tokens. This violates the project's convention documented in `base-ui-patterns.md`. Already tracked as backlog item 999.32 -- noting here for completeness since the file was touched in this phase (the 5-line `overTotal` warning addition is clean).

**Fix:** Tracked in backlog item 999.32; no action needed this phase.

---

_Reviewed: 2026-05-18T20:45:00Z_
_Reviewer: Claude (gsd-code-reviewer)_
_Depth: standard_
