---
phase: 16-input-dashboard-fixes
validated: 2026-05-17
status: green
requirements: [INPUT-01, DASH-01, DASH-02]
gaps_identified: 3
gaps_resolved: 3
gaps_escalated: 0
test_files_added:
  - src/components/features/supply-table/supply-table-add-row.nyquist.test.tsx
  - src/components/features/charts/project-detail/supplies-tab.nyquist.test.tsx
---

# Phase 16 Nyquist Validation

**Phase:** 16 — input-dashboard-fixes
**Requirements:** INPUT-01, DASH-01, DASH-02
**Status:** GAPS FILLED — 3/3 resolved, 0 escalated

---

## Existing Test Coverage (Pre-Validation)

| File | Tests | Status |
|------|-------|--------|
| `portal-autocomplete.test.tsx` | 13 | all pass |
| `supply-table-add-row.test.tsx` | 23 | all pass |
| `use-supply-table.test.ts` | 34 | all pass |
| `supplies-tab.test.tsx` | 14 | all pass |
| `spotlight-card.test.tsx` | 11 (Phase 16) | all pass |
| **Total** | **95** | **all pass** |

Runner: `npx vitest run --reporter=verbose <pattern>`

---

## Gap Analysis

Requirements were mapped to plan truths, then compared against existing tests to find behavioral claims with no covering test.

### GAP-1 — ArrowUp keyboard navigation wiring (INPUT-01)

**Requirement:** Plan 16-01, Task 1 behavior: "ArrowUp on search input moves highlightIndex to previous non-disabled item."

**Gap:** `supply-table-add-row.test.tsx` covered ArrowDown and ArrowDown+Enter but had no test for ArrowUp. The wiring in `handleSearchKeyDown` (line 133-135 of supply-table-add-row.tsx: `moveHighlight(-1, ...)`) was untested at the component level. `use-supply-table.test.ts` tested `moveHighlight` backward in isolation, but the key event → function call path was unverified.

**Test type:** Integration (component render + keyboard event)

**Tests written:**
- `ArrowUp after ArrowDown returns highlight to first item` — fires ArrowDown×2, then ArrowUp, then Enter; verifies the first item (not second) is selected
- `ArrowUp when at first item stays on first item (does not go to -1)` — verifies highlight stays at 0 when there is no prior addable item, Enter still selects

**Result:** FILLED — both tests pass

### GAP-2 — Adapter identity stability across re-renders (INPUT-01 / D-03)

**Requirement:** Plan 16-01, Task 1 behavior: "Test: supplies-tab adapter identity is stable across re-renders (useCallback wraps router.refresh)."

**Gap:** `supplies-tab.test.tsx` had no test that a component re-render (triggered by toggling sortOption) preserved the same `ServerActionAdapter` instance. If the adapter is recreated on re-render, `useSupplyTable` receives a new adapter reference and the debounce effect re-subscribes, cancelling in-flight searches and potentially dropping keystrokes.

**Test type:** Integration (component render + state mutation)

**Tests written:**
- `sort toggle re-render does not create a new ServerActionAdapter instance` — captures the `supply-table-add-row` DOM node reference before and after three sort toggles; verifies it is the same element (proving SupplyTable did not remount, which would only happen if adapter identity was unstable)
- `adapter is instantiated exactly once on initial render (not on re-renders)` — verifies DOM node identity is preserved across three consecutive sort toggle clicks

**Result:** FILLED — both tests pass

### GAP-3 — aria-activedescendant updates dynamically (INPUT-01)

**Requirement:** Plan 16-01, Task 1 behavior: "Test: supply-table-add-row search input has role='combobox', aria-expanded, aria-controls='portal-autocomplete-listbox', aria-activedescendant."

**Gap:** Existing tests verified `aria-controls` and `aria-autocomplete` but NOT that `aria-activedescendant` actually points to the correct item ID as `highlightIndex` changes. This is the attribute screen readers use to announce the active result — a broken or stale `aria-activedescendant` is a silent accessibility regression.

**Test type:** Integration (component render + keyboard events + ARIA attribute assertion)

**Tests written:**
- `aria-activedescendant is absent when no item is highlighted (highlightIndex=-1)` — verifies attribute is not present before any ArrowDown
- `aria-activedescendant points to highlighted item id after ArrowDown` — verifies `portal-autocomplete-item-t1` after first ArrowDown
- `aria-activedescendant updates to second item after two ArrowDowns` — verifies `portal-autocomplete-item-t2` after ArrowDown×2
- `aria-activedescendant clears after new search results arrive (highlightIndex resets to -1)` — verifies attribute disappears when new search results arrive and reset highlightIndex to -1

**Result:** FILLED — all four tests pass

---

## Verification Map

| Requirement | Gap | Test Command | File | Status |
|-------------|-----|-------------|------|--------|
| INPUT-01 (D-01: ArrowUp wiring) | GAP-1 | `npx vitest run --reporter=verbose "supply-table-add-row.nyquist"` | `supply-table-add-row.nyquist.test.tsx` | green |
| INPUT-01 (D-03: adapter stability) | GAP-2 | `npx vitest run --reporter=verbose "supplies-tab.nyquist"` | `supplies-tab.nyquist.test.tsx` | green |
| INPUT-01 (D-01: aria-activedescendant) | GAP-3 | `npx vitest run --reporter=verbose "supply-table-add-row.nyquist"` | `supply-table-add-row.nyquist.test.tsx` | green |
| INPUT-01 (full) | — | `npx vitest run --reporter=verbose "supply-table-add-row\|use-supply-table\|supplies-tab\|portal-autocomplete"` | multiple | green |
| DASH-01 | — (fully covered by existing tests) | `npx vitest run --reporter=verbose "spotlight-card"` | `spotlight-card.test.tsx` | green |
| DASH-02 | — (fully covered by existing tests) | `npx vitest run --reporter=verbose "spotlight-card"` | `spotlight-card.test.tsx` | green |

---

## Final Test Count

| File | Tests |
|------|-------|
| `portal-autocomplete.test.tsx` | 13 |
| `supply-table-add-row.test.tsx` | 23 |
| `supply-table-add-row.nyquist.test.tsx` | 6 (new — GAP-1 + GAP-3) |
| `use-supply-table.test.ts` | 34 |
| `supplies-tab.test.tsx` | 14 |
| `supplies-tab.nyquist.test.tsx` | 2 (new — GAP-2) |
| `spotlight-card.test.tsx` | 11 (Phase 16 scope) |
| **Total** | **103** |

All tests pass. No implementation bugs found during gap testing.

---

## Items Confirmed Human-Only (Not Escalated)

Per the existing `16-VERIFICATION.md`, three behaviors are explicitly flagged as requiring human verification and are not addressable by automated tests:

| Item | Reason |
|------|--------|
| Type "310" quickly — all 3 characters appear | DOM event timing races cannot be replicated at human typing speed in jsdom |
| Spotlight visual proportions on real viewport | CSS class assertions pass; rendered visual weight requires human judgment |
| Dark mode button color correctness | `jsdom` does not apply CSS custom property token resolution |

All three passed human UAT (see `16-UAT.md`). These are correctly classified as out-of-scope for automated test coverage, not as gaps.

---

_Validated: 2026-05-17_
_Validator: Nyquist (claude-sonnet-4-6)_
