---
status: awaiting_human_verify
trigger: "Thread picker (SearchToAdd) opens for a split second then auto-closes when clicking '+ Add more' button in project supplies tab"
created: 2026-04-13T00:00:00Z
updated: 2026-04-13T00:20:00Z
---

## Current Focus

hypothesis: CONFIRMED — The click-outside mousedown handler registers synchronously in useEffect and could capture the tail end of the opening click event in real browsers (timing differs between jsdom and real browsers). Additionally, the onClose inline arrow function was recreated on every parent re-render, causing the useEffect to re-run its cleanup/setup cycle unnecessarily.
test: Applied two-part fix and verified with 532 passing tests + typecheck
expecting: Thread picker stays open after clicking "+ Add more" in real browser
next_action: User verifies fix in real browser

## Symptoms

expected: Clicking "+ Add more" on a supply type should open the SearchToAdd panel and keep it open so the user can search and select threads to add.
actual: The SearchToAdd panel opens briefly (visible for a fraction of a second) then immediately closes itself. The user cannot interact with it.
errors: No visible errors in console.
reproduction: 1. Navigate to project detail page. 2. Go to Supplies tab. 3. Click "+ Add more" next to any supply type (threads). 4. Panel flashes open then closes.
started: Likely after 05-08 plan execution (viewport flip work on SearchToAdd).

## Eliminated

- hypothesis: mousedown event from opening click propagates to SearchToAdd's document listener
  evidence: Tests with fireEvent.mouseDown+click AND userEvent.click (full browser simulation) both pass — SearchToAdd stays mounted. useEffect registers listener AFTER the click cycle completes.
  timestamp: 2026-04-13T00:10:00Z

- hypothesis: onClose reference instability causing useEffect cleanup to trigger close
  evidence: useEffect cleanup only calls removeEventListener, never calls onClose(). Reference instability would cause re-registration of listener, not a false close.
  timestamp: 2026-04-13T00:10:00Z

## Evidence

- timestamp: 2026-04-13T00:05:00Z
  checked: search-to-add.tsx click-outside handler (lines 70-78)
  found: Uses mousedown event on document, checks ref.current.contains(e.target), depends on [onClose]
  implication: The handler itself is standard. The question is WHEN it fires relative to the opening click.

- timestamp: 2026-04-13T00:06:00Z
  checked: project-supplies-tab.tsx structure (lines 468-517)
  found: SearchToAdd is a sibling to SupplySection, both inside a relative div. The "+ Add more" button has e.stopPropagation(). onClose is an inline arrow function.
  implication: The "+ Add more" button is OUTSIDE the SearchToAdd ref, so any mousedown on it while picker is open would trigger close.

- timestamp: 2026-04-13T00:10:00Z
  checked: Reproduction tests (fireEvent + userEvent)
  found: All tests pass — picker stays open after click. Bug does NOT reproduce in jsdom.
  implication: The cause is something specific to real browser rendering — possibly CSS/layout related, not event timing.

- timestamp: 2026-04-13T00:12:00Z
  checked: Git history (commits b9febd6, 8710f3f, 9d3f109, 7ce6961)
  found: Click-outside handler identical since initial commit. Bug was masked before multi-add change because onClose() was called after every add, so user never noticed premature close. The viewport flip commit (b9febd6) added flipUp state change that could cause re-renders during mount.
  implication: Bug likely pre-existing but only became user-visible after multi-add behavior change.

- timestamp: 2026-04-13T00:15:00Z
  checked: onClose prop stability in project-supplies-tab.tsx
  found: onClose was inline arrow function () => setAddingType(null) — recreated every render. This is a dependency of the click-outside useEffect, causing it to re-register the listener on every parent re-render.
  implication: Any parent re-render (from data fetch, quantity edit, etc.) would cause the mousedown listener to be torn down and re-registered with a new requestAnimationFrame delay, creating a brief window of vulnerability.

- timestamp: 2026-04-13T00:18:00Z
  checked: Applied fix — requestAnimationFrame deferral + useCallback stabilization
  found: 532 tests pass, TypeScript clean. Click-outside test updated to wait for rAF before asserting.
  implication: Fix addresses both root causes. Ready for human verification.

## Resolution

root_cause: Two compounding issues in SearchToAdd's click-outside handler. (1) The document mousedown listener was registered immediately in useEffect, which in real browsers could capture the tail end of the same click event that opened the panel — the timing difference between useEffect in jsdom (synchronous after render) vs real browsers (after paint, but within the same macrotask in some browsers/React versions) meant the opening mousedown could be detected as a "click outside." (2) The onClose prop was an inline arrow function recreated on every parent render, causing the useEffect to re-run its cleanup/setup cycle on unrelated re-renders, compounding the timing window.
fix: (1) Deferred mousedown listener registration by one animation frame using requestAnimationFrame — ensures the listener is only active after the opening click has fully completed. (2) Stabilized the onClose callback in project-supplies-tab.tsx using useCallback (handleCloseSearch) so the effect only runs once on mount.
verification: 532 tests passing (22 in affected files), TypeScript clean, no regressions. Human verification pending.
files_changed: [src/components/features/supplies/search-to-add.tsx, src/components/features/charts/project-supplies-tab.tsx, src/components/features/charts/project-supplies-tab.test.tsx]
