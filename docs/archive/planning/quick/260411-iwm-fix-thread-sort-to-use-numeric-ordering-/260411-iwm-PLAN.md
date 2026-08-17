---
phase: quick
plan: 260411-iwm
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/utils/natural-sort.ts
  - src/lib/utils/natural-sort.test.ts
  - src/lib/actions/supply-actions.ts
  - src/lib/actions/supply-actions.test.ts
autonomous: true
requirements: ["999.0.8"]
must_haves:
  truths:
    - "Thread lists display in numeric order: 150, 310, 334, 500, 3761"
    - "Non-numeric codes (Blanc, Ecru) sort after numeric codes"
    - "Project supply threads also sort numerically"
    - "Supply table interactive column sort continues to work (already numeric)"
  artifacts:
    - path: "src/lib/utils/natural-sort.ts"
      provides: "Reusable natural sort comparator for color/product codes"
      exports: ["naturalSortByCode"]
    - path: "src/lib/utils/natural-sort.test.ts"
      provides: "Unit tests for natural sort utility"
  key_links:
    - from: "src/lib/actions/supply-actions.ts"
      to: "src/lib/utils/natural-sort.ts"
      via: "import naturalSortByCode"
      pattern: "naturalSortByCode"
---

<objective>
Fix thread sort order from alphabetical to numeric. DMC thread codes are stored as strings
(colorCode field) because some codes are text (Blanc, Ecru), but Prisma's `orderBy` sorts
them alphabetically, producing 334, 3761, 500 instead of 334, 500, 3761.

Purpose: Backlog item 999.0.8 -- threads should display in natural numeric order everywhere.
Output: Shared natural sort utility + application-level sorting in supply and project supply queries.
</objective>

<execution_context>
@/Users/wanderskye/Projects/cross-stitch-tracker/.claude/get-shit-done/workflows/execute-plan.md
@/Users/wanderskye/Projects/cross-stitch-tracker/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/lib/actions/supply-actions.ts
@src/lib/actions/supply-actions.test.ts
@src/lib/utils/fabric-calculator.ts (example util pattern)
@src/__tests__/mocks/factories.ts (createMockThread factory)

<interfaces>
<!-- Key types and contracts the executor needs. -->

From prisma/schema.prisma:
```prisma
model Thread {
  colorCode      String      // String field -- alphabetical in DB, needs numeric app sort
  colorName      String
  // ...
  @@unique([brandId, colorCode])
}
```

From src/lib/actions/supply-actions.ts:
```typescript
// Line 109 -- getThreads() sorts alphabetically via Prisma orderBy
export async function getThreads(brandId?: string, colorFamily?: string, search?: string)

// Line 545 -- getProjectSupplies() sorts alphabetically via nested Prisma orderBy
export async function getProjectSupplies(projectId: string)
```

From src/components/features/supplies/supply-table-view.tsx:
```typescript
// Lines 114-117 -- Client-side column sort already handles numeric (no change needed)
const aNum = parseFloat(aVal.replace(/[^0-9.]/g, ""));
const bNum = parseFloat(bVal.replace(/[^0-9.]/g, ""));
if (!isNaN(aNum) && !isNaN(bNum)) return dir * (aNum - bNum);
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Create natural sort utility with tests</name>
  <files>src/lib/utils/natural-sort.ts, src/lib/utils/natural-sort.test.ts</files>
  <behavior>
    - naturalSortByCode("310", "3761") returns negative (310 before 3761)
    - naturalSortByCode("3761", "500") returns positive (500 before 3761)
    - naturalSortByCode("334", "334") returns 0
    - naturalSortByCode("Blanc", "310") returns positive (text after numbers)
    - naturalSortByCode("Blanc", "Ecru") returns negative (alphabetical among text)
    - naturalSortByCode("Ecru", "Blanc") returns positive
    - Sorting ["334", "3761", "500", "150", "Blanc", "Ecru"] produces ["150", "334", "500", "3761", "Blanc", "Ecru"]
  </behavior>
  <action>
    Write tests first in natural-sort.test.ts covering all behaviors above.

    Then implement naturalSortByCode(a: string, b: string): number in natural-sort.ts:
    - Parse both as numbers (parseInt or Number)
    - If both are numeric: return numeric comparison (a - b)
    - If only one is numeric: numeric comes first (return -1 or 1)
    - If neither is numeric: return localeCompare for alphabetical

    Keep it simple -- DMC codes are either fully numeric ("310", "3761") or fully text ("Blanc", "Ecru"). No mixed alphanumeric like "B5200" expected (but if added later, those would sort after pure numbers, which is fine).
  </action>
  <verify>
    <automated>cd /Users/wanderskye/Projects/cross-stitch-tracker && npx vitest run src/lib/utils/natural-sort.test.ts</automated>
  </verify>
  <done>All natural sort test cases pass. Utility exports naturalSortByCode comparator function.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Apply natural sort in supply-actions and update tests</name>
  <files>src/lib/actions/supply-actions.ts, src/lib/actions/supply-actions.test.ts</files>
  <behavior>
    - getThreads() returns threads sorted by colorCode numerically (150, 310, 500, 3761)
    - getProjectSupplies() returns project threads sorted by colorCode numerically
    - Existing test for getThreads orderBy assertion is updated to reflect new sort approach
  </behavior>
  <action>
    **In supply-actions.ts:**

    1. Import naturalSortByCode from "@/lib/utils/natural-sort"

    2. In `getThreads()` (around line 106-110):
       - Remove `orderBy: { colorCode: "asc" }` from the Prisma query
       - After the findMany call, sort the results in JS:
         ```typescript
         const threads = await prisma.thread.findMany({ where, include: { brand: true } });
         return threads.sort((a, b) => naturalSortByCode(a.colorCode, b.colorCode));
         ```

    3. In `getProjectSupplies()` (around line 541-557):
       - Remove `orderBy: { thread: { colorCode: "asc" } }` from the projectThread query
       - After the Promise.all, sort threads in JS before returning:
         ```typescript
         const sortedThreads = threads.sort((a, b) =>
           naturalSortByCode(a.thread.colorCode, b.thread.colorCode)
         );
         return { threads: sortedThreads, beads, specialty };
         ```
       - Keep the bead and specialty orderBy as-is (productCode is less likely to have this issue, and if it does, the same fix can be applied later).

    **In supply-actions.test.ts:**

    4. Update the `getThreads` test (around line 278-283) that asserts `orderBy: { colorCode: "asc" }` -- remove or update this assertion since the Prisma query no longer has orderBy. Instead, verify the returned results are sorted by providing mock data in non-alphabetical order (e.g., colorCodes "3761", "334", "500") and asserting the result comes back in numeric order ("334", "500", "3761").

    5. Add a test for getProjectSupplies that verifies thread sort order is numeric.
  </action>
  <verify>
    <automated>cd /Users/wanderskye/Projects/cross-stitch-tracker && npx vitest run src/lib/actions/supply-actions.test.ts && npm run build</automated>
  </verify>
  <done>
    - getThreads returns threads in numeric colorCode order
    - getProjectSupplies returns project threads in numeric colorCode order
    - All existing tests pass (updated assertions)
    - Build passes with no type errors
  </done>
</task>

</tasks>

<threat_model>
## Trust Boundaries

No new trust boundaries introduced -- this is a sort-order change in existing authenticated server actions.

## STRIDE Threat Register

| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-quick-01 | D (Denial of Service) | naturalSortByCode | accept | Sort runs on small arrays (< 500 DMC threads); no performance concern. Array.sort is O(n log n). |
</threat_model>

<verification>
- `npx vitest run src/lib/utils/natural-sort.test.ts` -- natural sort utility tests pass
- `npx vitest run src/lib/actions/supply-actions.test.ts` -- supply action tests pass with updated assertions
- `npm run build` -- no type errors
- Manual: visit /supplies page, threads display as 150, 310, 334, 500, 3761 (not 150, 310, 334, 3761, 500)
</verification>

<success_criteria>
Thread color codes sort numerically (150, 310, 334, 500, 3761) instead of alphabetically (150, 310, 334, 3761, 500) in both the supply catalog and project supply views. Text-only codes like Blanc and Ecru sort after all numeric codes.
</success_criteria>

<output>
After completion, create `.planning/quick/260411-iwm-fix-thread-sort-to-use-numeric-ordering-/260411-iwm-SUMMARY.md`
</output>
