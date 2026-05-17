---
phase: 16-input-dashboard-fixes
verified: 2026-05-16T21:49:30Z
status: human_needed
score: 7/7 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Type '310' quickly in SearchToAdd on the project detail Supplies tab — specifically type all 3 characters as fast as you can"
    expected: "All 3 characters appear in the input ('310'), no dropped keystroke results in '30' or '31'"
    why_human: "The root cause was a focus-steal via DOM event timing — automated tests verify the architecture (no input in portal, ARIA wiring, no focus() call) but cannot replicate real keystroke races at human typing speed"
  - test: "Visit the dashboard and check the Spotlight section visual proportions"
    expected: "Image column is thumbnail-sized (~320px), not a 50/50 banner. Container height is noticeably shorter than before. 'Check It Out' is emerald/primary-colored in both light and dark mode. 'Shuffle Spotlight' text weight matches 'Check It Out'"
    why_human: "CSS class changes require visual inspection — tests verify class strings but cannot confirm rendered visual weight and proportional balance"
  - test: "Toggle dark mode on the dashboard and check the Spotlight 'Check It Out' button"
    expected: "Button uses design system dark-mode emerald (lighter, not hardcoded bg-emerald-600) — confirms buttonVariants default variant is providing the correct semantic token for dark mode"
    why_human: "Dark mode CSS token behavior cannot be asserted in jsdom tests"
---

# Phase 16: Input Dashboard Fixes Verification Report

**Phase Goal:** SearchToAdd input works reliably and the Dashboard Spotlight section displays at correct proportions
**Verified:** 2026-05-16T21:49:30Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | D-01: Single input architecture — portal is results-only, no input element inside it | VERIFIED | `portal-autocomplete.tsx`: 0 `<input` matches, `role="listbox"` confirmed, `highlightIndex` prop present, `onSearchChange` absent |
| 2 | D-01: Portal dropdown displays results without an input field inside it | VERIFIED | `portal-autocomplete.tsx` line 106-164: listbox div contains only result items, loading state, and create button — no input element |
| 3 | D-01: Arrow keys navigate dropdown results from the table row input | VERIFIED | `supply-table-add-row.tsx` lines 128-143: `handleSearchKeyDown` handles ArrowDown, ArrowUp, Enter, Escape; calls `moveHighlight` from hook |
| 4 | D-01: Enter key selects highlighted item from the table row input | VERIFIED | `supply-table-add-row.tsx` line 134-138: Enter guard checks `highlightIndex >= 0 && displayItems[highlightIndex]` then calls `selectItem` |
| 5 | D-02: useTransition wraps setIsSearching so re-renders don't block typing | VERIFIED | `use-supply-table.ts` line 41: `useTransition` imported; line 64: `startTransition(() => { setIsSearching(true); })` |
| 6 | D-03: Adapter identity stabilized via useCallback — no debounce cancellation on re-render | VERIFIED | `supplies-tab.tsx` line 89: `const stableRefresh = useCallback(() => router.refresh(), [router])`; adapter memo deps are `[project.id, stableRefresh]` |
| 7 | D-04: Dead SearchToAdd component no longer exists in the codebase | VERIFIED | `search-to-add.tsx` and `search-to-add.test.tsx` both deleted; 0 orphaned imports in src/ |
| 8 | D-05: Spotlight image displays at a fixed 320px width on desktop, not stretching to 50% of container | VERIFIED | `spotlight-card.tsx` line 59: `md:grid-cols-[320px_1fr]`; `md:grid-cols-2` absent |
| 9 | D-06: Spotlight card grid has max-height of 300px (not 360px) | VERIFIED | `spotlight-card.tsx` line 59: `max-h-[300px]`; `max-h-[360px]` absent |
| 10 | D-07: Image div retains overflow-hidden and object-cover — clips cleanly at new constraints | VERIFIED | `spotlight-card.tsx` line 61: `relative overflow-hidden`; line 67: `object-cover` unchanged |
| 11 | D-08: 'Check It Out' button uses the design system primary variant (not hardcoded emerald classes) | VERIFIED | `spotlight-card.tsx` line 131-137: `LinkButton` with `className` containing no `bg-emerald`; remaining emerald references are on progress bar only |
| 12 | D-09: 'Shuffle Spotlight' button has font-semibold weight matching 'Check It Out' | VERIFIED | `spotlight-card.tsx` line 142: `font-semibold` on Shuffle button class string |

**Score:** 7/7 must-haves verified (12 sub-truths all VERIFIED)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `src/components/features/supply-table/portal-autocomplete.tsx` | Results-only dropdown without search input | VERIFIED | 169 lines, `role="listbox"`, `highlightIndex` prop, no input element, no focus-steal |
| `src/components/features/supply-table/supply-table-add-row.tsx` | Single input with ARIA combobox attributes and keyboard navigation | VERIFIED | `role="combobox"`, `aria-controls="portal-autocomplete-listbox"`, `aria-activedescendant`, full keyboard handler |
| `src/components/features/supply-table/use-supply-table.ts` | useTransition-wrapped search state and stable highlightIndex export | VERIFIED | `useTransition` imported, `startTransition` wraps `setIsSearching`, `highlightIndex`/`moveHighlight`/`setHighlightIndex` in return |
| `src/components/features/charts/project-detail/supplies-tab.tsx` | Stable adapter with useCallback for router.refresh | VERIFIED | `stableRefresh` via `useCallback`, adapter deps are `[project.id, stableRefresh]` |
| `src/components/features/dashboard/spotlight-card.tsx` | Fixed 320px image column + design-system button styling | VERIFIED | `grid-cols-[320px_1fr]`, `max-h-[300px]`, `LinkButton` without hardcoded emerald, both buttons `font-semibold` |
| `src/components/features/supplies/search-to-add.tsx` | DELETED (dead code) | VERIFIED | File absent; 0 orphaned imports |
| `src/components/features/supplies/search-to-add.test.tsx` | DELETED (dead code) | VERIFIED | File absent |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `supply-table-add-row.tsx` | `portal-autocomplete.tsx` | `PortalAutocomplete` with `isOpen, items, existingIds, searchText, highlightIndex, onSelect, onCreateRequest, onClose, anchorRef, isLoading` | WIRED | Lines 217-228 pass all required props including `highlightIndex`; `onSearchChange` correctly absent |
| `supply-table-add-row.tsx` | `use-supply-table.ts` | `useSupplyTable` hook — `highlightIndex`, `moveHighlight` destructured | WIRED | Lines 54-56: `highlightIndex` and `moveHighlight` both destructured from hook return |
| `supplies-tab.tsx` | `ServerActionAdapter` | `useMemo` with `stableRefresh` from `useCallback` | WIRED | Lines 89-95: `stableRefresh` created before adapter, used in memo deps |

### Data-Flow Trace (Level 4)

Not applicable — this phase is a bug-fix/CSS change. No new data sources introduced. Existing data flows (supply search results from `adapter.searchSupplies`, spotlight project from server action) were unchanged and pre-verified in earlier phases.

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| 77 supply table tests pass | `npx vitest run portal-autocomplete supply-table-add-row use-supply-table supplies-tab` | 77/77 passed, 4 test files | PASS |
| 9 spotlight card tests pass | `npx vitest run spotlight-card` | 9/9 passed, 1 test file | PASS |
| No orphaned search-to-add imports | `grep -rn "search-to-add" src/ --include="*.ts" --include="*.tsx"` | 0 matches | PASS |
| All 5 TDD commits exist in git history | `git log --oneline` | 3eb0fdc (RED), 86e1144 (GREEN), 436f391 (delete), 5ba3364 (RED), be42c78 (GREEN) | PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|---------|
| INPUT-01 | Plan 01 | User can type supply codes quickly without dropped keystrokes in SearchToAdd | SATISFIED | Portal no longer steals focus (no `focus()` call), `useTransition` prevents render-blocking, ARIA combobox pattern maintained, all 77 tests pass |
| DASH-01 | Plan 02 | Spotlight "Rediscover This One" section displays at a constrained, appropriate size | SATISFIED | `max-h-[300px]` and `md:grid-cols-[320px_1fr]` verified in source; spotlight tests verify class strings |
| DASH-02 | Plan 02 | "Check it Out" and "Shuffle Spotlight" buttons display at matching sizes | SATISFIED | Both buttons: `px-5 py-2.5 rounded-xl font-semibold`; test at line 94-106 asserts both |

Note: REQUIREMENTS.md traceability table still shows INPUT-01/DASH-01/DASH-02 as "Pending" — this is a documentation gap, not an implementation gap. The implementation is complete. The Pending status should be updated during the ship step.

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `supply-table-add-row.test.tsx` | warning output | `<div>` rendered inside `<tbody>` in test | Info | Test-only HTML structure warning from RTL; does not affect production behavior or test assertions. Pre-existing from InlineCreateDialog test setup. |

No blockers found. The one emerald reference remaining in `spotlight-card.tsx` (lines 119, 123) is on the progress bar percentage display, not on the Spotlight buttons — this is intentional and correct.

### Human Verification Required

The automated checks pass comprehensively. Three items require human visual/interactive confirmation before this phase is fully closed:

### 1. Keystroke Drop Regression Test

**Test:** Open the project detail page for any project with supplies. Click the search input in the add-row. Type "310" as fast as you normally would.
**Expected:** All 3 characters appear in the input field. No dropped keystrokes. The dropdown opens below the input without the focus ever leaving the input.
**Why human:** The bug was a timing-sensitive focus-steal via DOM events. Automated tests verify the architectural fix (no `focus()` in portal, correct ARIA wiring) but cannot replicate real keyboard event races at human typing speed.

### 2. Dashboard Spotlight Visual Proportions

**Test:** Visit the main dashboard. Look at the "Rediscover This One" Spotlight section.
**Expected:** The image column is thumbnail-sized (narrow, fixed ~320px), not a 50/50 banner. The card height is visually shorter and less dominant than before. "Check It Out" and "Shuffle Spotlight" buttons are at matching visual weight (same padding, same font boldness).
**Why human:** CSS class changes need visual confirmation — automated tests verify the class strings are present but not the rendered proportional impact on the page.

### 3. Dark Mode Button Colors

**Test:** Toggle to dark mode. Look at the Spotlight "Check It Out" button.
**Expected:** Button shows a lighter emerald shade (design system dark-mode token), not the hardcoded `bg-emerald-600` that would be too dark in dark mode. The `buttonVariants` default variant provides semantic dark-mode support automatically.
**Why human:** Tailwind CSS dark mode token resolution cannot be asserted in jsdom tests.

### Gaps Summary

No implementation gaps. All must-haves are fully verified at all levels (exists, substantive, wired). Three items are flagged for human verification due to the inherent limitations of automated testing for timing-sensitive input behavior and visual CSS rendering.

---

_Verified: 2026-05-16T21:49:30Z_
_Verifier: Claude (gsd-verifier)_
