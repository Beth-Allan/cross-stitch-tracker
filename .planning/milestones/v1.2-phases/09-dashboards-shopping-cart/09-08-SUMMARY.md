---
phase: 09-dashboards-shopping-cart
plan: 08
subsystem: shopping-cart-wiring
tags: [shopping-cart, page-wiring, custom-events, topbar]
dependency_graph:
  requires: [getShoppingCartData, ShoppingCart-component, getPresignedImageUrls]
  provides: [/shopping-route-wired, topbar-log-session-event-listener]
  affects: [/shopping, TopBar]
tech_stack:
  added: []
  patterns: [custom-dom-event-cross-component-communication]
key_files:
  created: []
  modified:
    - src/app/(dashboard)/shopping/page.tsx
    - src/components/shell/top-bar.tsx
decisions:
  - "Used filter(Boolean) + as string[] for image key extraction -- matches existing pattern in charts/page.tsx"
  - "Custom event listener uses useEffect with cleanup -- standard React pattern for DOM event subscriptions"
metrics:
  duration: 2m
  completed: "2026-04-18T04:12:57Z"
  tasks_completed: 1
  tasks_total: 1
  test_count: 1149
  test_pass: 1149
---

# Phase 9 Plan 8: Shopping Cart Page Wiring & TopBar Event Listener Summary

Replaced ShoppingList with ShoppingCart at /shopping route, wired getShoppingCartData + presigned image URLs, and added custom event listener in TopBar for Quick Add "Log Stitches" cross-component communication.

## Tasks Completed

| # | Task | Type | Commit | Key Changes |
|---|------|------|--------|-------------|
| 1 | Replace ShoppingList with ShoppingCart and wire TopBar event listener | feat | 4d1fc75 | New page imports, presigned URL fetching, useEffect event listener |

## Implementation Details

### Shopping Page (page.tsx)
- Replaced `getShoppingList` import with `getShoppingCartData` from shopping-cart-actions
- Replaced `ShoppingList` component with `ShoppingCart` from shopping-cart.tsx
- Added `getPresignedImageUrls` call for project cover thumbnails (extracts keys from `data.projects[].coverThumbnailUrl`)
- Updated heading from "Shopping List" to "Shopping Cart" per UI-SPEC copy contract
- Updated subtitle to "Select projects to build your shopping list" per UI-SPEC copy contract
- Page remains a Server Component -- data fetching on server, interactive ShoppingCart as client child

### TopBar Event Listener (top-bar.tsx)
- Added `useEffect` import alongside existing `useState`
- Added 7-line `useEffect` hook listening for `"open-log-session-modal"` custom DOM event
- Event handler calls `setLogModalOpen(true)` -- reuses existing modal state
- Proper cleanup via `removeEventListener` in effect return
- Satisfies D-08: Quick Add "Log Stitches" reuses existing LogSessionModal via custom event
- Maintains SESS-02: LogSessionModal remains accessible from TopBar's direct "Log Stitches" button

## Threat Mitigations

| Threat ID | Status | Implementation |
|-----------|--------|----------------|
| T-09-15 (Information Disclosure) | Mitigated | getShoppingCartData calls requireAuth() -- unauthenticated users get no data |
| T-09-16 (Spoofing via event) | Accepted | Custom event only opens a modal; modal's data operations require auth |

## Deviations from Plan

None -- plan executed exactly as written.

## Known Stubs

None -- page is fully wired to real data sources and components.

## Self-Check: PASSED

- FOUND: src/app/(dashboard)/shopping/page.tsx
- FOUND: src/components/shell/top-bar.tsx
- FOUND: commit 4d1fc75 in git log
- 1149/1149 tests passing
- Build succeeds
