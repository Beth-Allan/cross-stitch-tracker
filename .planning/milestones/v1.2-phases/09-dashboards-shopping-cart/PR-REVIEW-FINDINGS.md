# PR #18 Review Findings — Phase 9: Dashboards & Shopping Cart

**Reviewed:** 2026-04-18
**Agents:** code-reviewer, pr-test-analyzer, silent-failure-hunter, type-design-analyzer, comment-analyzer
**Status:** Fixes needed before merge

---

## Critical Issues (3 — must fix before merge)

### 1. Hydration mismatch + data loss in ShoppingListTab (flagged by 3/5 agents)

- **File:** `src/components/features/shopping/shopping-list-tab.tsx:95-105`
- Reads localStorage in `useState` initializer — same bug already fixed in `shopping-cart.tsx` this PR
- Worse: the `useEffect` that persists `checkedItems` overwrites localStorage with an empty Set on first render, destroying saved checkmarks
- **Fix:** Apply the `hydratedRef` + `useEffect` pattern from `usePersistedSelection`

### 2. Read-only server actions have zero error handling

- **Files:**
  - `src/lib/actions/dashboard-actions.ts` — `getMainDashboardData`, `getSpotlightProject`
  - `src/lib/actions/project-dashboard-actions.ts` — `getProjectDashboardData`
  - `src/lib/actions/shopping-cart-actions.ts` — `getShoppingCartData`
- Every other server action in the project wraps in try/catch + `console.error`. These four don't — a Neon cold start failure crashes the entire page with no logging.

### 3. Unprotected Promise.all in dashboard page

- **File:** `src/app/(dashboard)/page.tsx:12-13`
- One failing data source takes down the whole page
- Consider `Promise.allSettled` or per-section error boundaries

---

## Important Issues (6 — should fix)

### 4. Missing test coverage for error paths

- `updateSupplyAcquired`: no test for database error (try/catch path) or empty string `junctionId`
- `shopping-cart.tsx`: `handleUpdateAcquired` failure/error paths untested
- 3 complex components have no test files:
  - `project-accordion.tsx` (258 lines)
  - `supply-overview.tsx` (291 lines)
  - `shopping-list-tab.tsx` (271 lines)

### 5. No server-side upper bound on acquiredQuantity

- **File:** `src/lib/actions/shopping-cart-actions.ts:14`
- Zod validates `min(0)` but no max
- Client-side `QuantityControl` clamps, but a crafted request could set any value
- **Fix:** After ownership check, clamp: `Math.min(acquiredQuantity, record.quantityRequired)`

### 6. Plan/task reference comments will rot

- D-02, D-05, D-06, D-07, D-08, D-15, T-09-03, T-09-04 references across:
  - `src/lib/actions/dashboard-actions.ts`
  - `src/lib/actions/project-dashboard-actions.ts`
  - `src/app/(dashboard)/page.tsx`
  - `src/components/shell/top-bar.tsx`
- **Fix:** Strip the reference IDs, keep the useful reasoning

### 7. Type narrowing opportunities

- `ShoppingListProject.projectStatus: string` → `ProjectStatus` in `src/lib/actions/shopping-actions.ts:13` (eliminates `as` cast)
- Remove vestigial `as ProjectStatus` in `src/components/features/shopping/project-accordion.tsx:151`
- Narrow `ShoppingSupplyNeed.unit` to `"skeins" | "packs"` in `src/types/dashboard.ts:175`
- Extract duplicated `computeProgressPercent` to shared utility (exists in `project-dashboard-actions.ts`, duplicated inline in `dashboard-actions.ts`)

### 8. Spotlight card misleading error toast

- **File:** `src/components/features/dashboard/spotlight-card.tsx:35-52`
- If image URL resolution fails after project loads, toast says "Could not load project" — but the project did load, only the image failed
- **Fix:** Separate the two operations; show project with placeholder if only image fails

### 9. Multi-item quantity distribution silently truncates

- **File:** `src/components/features/shopping/supply-overview.tsx:228-239`
- "By Supply" view only updates first item's junction record; excess quantity change silently dropped
- **Fix:** Either distribute diff across multiple items, or warn when change can't be fully applied

---

## Suggestions (3 — nice to have)

### 10. Add architectural comment for custom DOM event bridge

- `src/components/features/dashboard/quick-add-menu.tsx:102-113`
- Explain: "Falls back to custom DOM event because QuickAddMenu and LogSessionModal live in different component trees with no shared state ancestor"

### 11. Remove unnecessary comments

- "Server component — no 'use client' needed" in `section-heading.tsx` and `buried-treasures-section.tsx`
- Various "what" comments that restate code (see comment analyzer details below)

### 12. Backlog: extract shared SupplyType

- `"thread" | "bead" | "specialty"` appears 30+ times inline across codebase without a named type

---

## Strengths

- All server actions call `requireAuth()` at entry
- IDOR protection with ownership check in `updateSupplyAcquired`
- Correct server/client component split throughout
- No `any` types, no `Button render={<Link>}` violations
- `buttonVariants` imported from `button-variants.ts` in server components
- Test utils consistently imported from `@/__tests__/test-utils`
- Hydration correctly handled in `usePersistedSelection` and `usePersistedViewMode`
- Excellent keyboard a11y in `QuickAddMenu` (ArrowUp/Down, Escape, focus management)
- `ProgressBucketId` literal union is exemplary type design
- Good empty states and null-or-complete compound field patterns in types

---

## Fix Plan (recommended order)

1. **Critical #1:** Fix ShoppingListTab hydration mismatch (apply hydratedRef pattern)
2. **Critical #2:** Add try/catch + console.error to 4 read-only server actions
3. **Critical #3:** Handle page-level Promise.all failure gracefully
4. **Important #5:** Add server-side acquiredQuantity clamp
5. **Important #7:** Type narrowing (projectStatus, unit, remove cast)
6. **Important #6:** Strip plan/task reference IDs from comments
7. **Important #8:** Fix spotlight card error toast
8. **Important #9:** Address multi-item quantity truncation
9. **Important #4:** Add missing tests (can be follow-up PR)

Run `/gsd-code-review-fix` or fix manually, then re-run tests and push.
