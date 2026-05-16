---
status: resolved
trigger: Create button does nothing when in supply mode on /charts/new
created: 2026-05-15
updated: 2026-05-15
---

# Debug Session: create-btn-supply-mode

## Symptoms

- **Expected:** Clicking Create in supply mode submits form, creates chart with supplies, redirects
- **Actual:** Nothing happens — no redirect, no toast, no error, no console error
- **Errors:** None visible. Terminal shows only getThreads search calls, never createChartWithSupplies
- **Timeline:** Broken since Activity mode toggle was introduced (commit a6e338d)
- **Reproduction:** /charts/new → fill fields → Add supplies → add a thread → click Create → nothing

## Current Focus

- hypothesis: CONFIRMED — React 19 Activity blocks event delegation for hidden subtrees
- test: Traced through react-dom source to confirm event dispatch path
- expecting: N/A — root cause confirmed
- next_action: fix applied
- specialist_hint: react

## Evidence

- timestamp: 2026-05-15 react-dom source analysis
  - `hideInstance` (line 22300) sets `display: none !important` via `style.setProperty`
  - `findInstanceBlockingTarget` (line 23679-23682): when nearest mounted fiber is Activity (tag 31), calls `getActivityInstanceFromFiber` which returns `undefined` for client-hidden (non-dehydrated) Activities
  - `null !== undefined` evaluates to `true`, so `findInstanceBlockingTarget` returns `undefined` as "blocker"
  - In `dispatchEvent`, `null === undefined` is `false`, so the normal dispatch path is skipped
  - Falls through to else clause which dispatches with `targetInst = null`
  - With `targetInst = null`, no React event listeners are accumulated — `handleSubmit` never fires

## Eliminated

- requestSubmit() failing on hidden forms — confirmed requestSubmit() fires native submit event regardless of display:none (tested in JSDOM, confirmed per HTML spec)
- Form validation blocking — onValidationError callback never fires
- Server-side errors — no server calls logged at all

## Resolution

- root_cause: React 19's event delegation system silently blocks synthetic events from elements inside hidden `<Activity mode="hidden">` subtrees. When `requestSubmit()` fires a native submit event on the hidden form, React's `findInstanceBlockingTarget` identifies the nearest mounted fiber as an Activity (tag 31). For client-hidden (non-dehydrated) Activities, `getActivityInstanceFromFiber` returns `undefined`, which passes the `null !== targetNode` check and causes the event to be dispatched with `targetInst = null`, meaning no React event listeners are accumulated and `handleSubmit` never executes.
- fix: Extracted submission logic from `handleSubmit` into a new `submitForm()` function that can be called directly without going through the DOM event system. `handleSubmit` now delegates to `submitForm()` after `preventDefault()`. The StickySaveBar's `onSubmit` callback now calls `form.submitForm` directly instead of `formRef.current?.requestSubmit()`, bypassing the blocked event path entirely.
- verification: 32/32 tests pass including new regression test "Create button submits from supply mode (form hidden in Activity)"
- files_changed: src/components/features/charts/use-chart-form.ts, src/components/features/charts/chart-merged-form.tsx, src/components/features/charts/chart-merged-form.test.tsx
