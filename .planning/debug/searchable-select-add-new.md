---
status: awaiting_human_verify
trigger: "Chart form '+ Add New' in SearchableSelect is broken AGAIN — duplicate prefix '+ +Add New' and clicking does nothing"
created: 2026-04-12T00:00:00Z
updated: 2026-04-12T00:00:00Z
---

## Current Focus

hypothesis: CONFIRMED AND FIXED — Both bugs resolved
test: 513/513 tests pass, build succeeds, integration tests with real cmdk verify behavior
expecting: User confirms fix in browser
next_action: Await human verification

## Symptoms

expected: Storage Location and Stitching App dropdowns show single "+ Add New", clicking creates entity inline via server action
actual: (1) Text reads "+ +Add New" — duplicate prefix. (2) Clicking Add New does nothing — no creation, no dialog, no response
errors: Unknown — click handler clearly not firing
reproduction: Open chart create/edit form, open Storage Location or Stitching App dropdown, observe duplicate "+", click Add New — nothing happens
started: Recurring across plans 05-06, 05-07, 05-08 (3-4 fix attempts)

## Eliminated

- hypothesis: cmdk forceMount breaks onSelect click handler
  evidence: Real cmdk tests (no mocks) prove onSelect fires correctly on forceMount items, both with and without search text
  timestamp: 2026-04-12

- hypothesis: Base UI Popover portal intercepts clicks before cmdk handler
  evidence: SearchableSelect tests with real cmdk inside real Popover show onAddNew is called correctly
  timestamp: 2026-04-12

## Evidence

- timestamp: 2026-04-12
  checked: Git history — 7 commits touching searchable-select.tsx
  found: Original label was 'Add "search"', changed to "Add New" (Phase 2), then to 'Add "search"' with search.trim() guard (05-07), then to "forceMount + '+ Add New'" (05-08). Each fix oscillated between approaches.
  implication: No fix addressed both issues simultaneously

- timestamp: 2026-04-12
  checked: searchable-select.tsx line 94-96 — Plus icon + text content
  found: <Plus> icon renders a "+" glyph, AND text says "+ Add New" — double "+"
  implication: Bug 1 confirmed — duplicate prefix

- timestamp: 2026-04-12
  checked: Real cmdk test with SearchableSelect — clicked Add New without typing
  found: onSelect fires, onAddNew("") called. But handleAddStorageLocation("") in use-chart-form.ts hits `if (!name.trim()) return;` — silent no-op
  implication: Bug 2 confirmed — handler silently ignores empty names, user sees nothing happen

- timestamp: 2026-04-12
  checked: Real cmdk test — typed "Bin A" then clicked Add New
  found: onAddNew("Bin A") called correctly, search text passed through
  implication: The mechanism works when user types first, but UX doesn't communicate this requirement

## Resolution

root_cause: TWO DISTINCT BUGS — (1) `<Plus>` icon renders "+" AND literal text "+" creates duplicate "++". (2) The "Add New" item is always visible (forceMount) but clicking without typing calls onAddNew(""), which hits the empty-name guard in handleAddStorageLocation/handleAddStitchingApp and silently returns. User sees no response. The UX label "Add New" implies a click-to-create flow but the implementation requires typed text.
fix: |
  In searchable-select.tsx:
  1. Removed literal "+" from text — `<Plus>` icon already renders the "+" glyph. Changed text from `"+ Add New"` to `"Add New"` (no search) or `Add "{search}"` (with search).
  2. Added dynamic label: shows `Add "{search.trim()}"` when text is typed, `"Add New"` when empty.
  3. Passes `search.trim()` to onAddNew (not raw search).
  4. Kept forceMount on both CommandGroup and CommandItem — prevents cmdk filtering from hiding the item (which caused the spaces bug in 05-07).
  5. Added integration test (searchable-select-integration.test.tsx) using real cmdk (no mocks) to prevent future regressions.
  6. Updated 4 other test files that referenced old "+" prefix text.
verification: 513/513 tests pass (41 directly affected across 5 files). Build succeeds. Integration tests with real cmdk confirm onSelect fires, onAddNew receives correct text, and no duplicate "+" in text content.
files_changed:
  - src/components/features/charts/form-primitives/searchable-select.tsx
  - src/components/features/charts/form-primitives/searchable-select.test.tsx
  - src/components/features/charts/form-primitives/searchable-select-integration.test.tsx
  - src/components/features/charts/sections/project-setup-section.test.tsx
  - src/components/features/fabric/fabric-form-modal.test.tsx
  - src/components/features/supplies/supply-form-modal.test.tsx
