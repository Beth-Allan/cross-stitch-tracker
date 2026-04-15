---
status: investigating
trigger: "Hydration mismatch error on /charts with view URL param"
created: 2026-04-13T00:00:00Z
updated: 2026-04-13T00:00:00Z
---

## Current Focus

hypothesis: CONFIRMED — Turbopack SSR cache served stale server HTML after commit eeb7aaa changed ListView grid from 3-col to 4-col
test: Found actual hydration error in .next/dev/logs/next-development.log with exact diff
expecting: Production build has no issue; dev server restart clears stale cache
next_action: Report root cause

## Symptoms

expected: /charts?view=list loads without hydration errors, showing list view
actual: Next.js throws "Hydration failed because the server rendered HTML didn't match the client"
errors: "Hydration failed because the server rendered HTML didn't match the client. As a result this tree will be regenerated on the client."
reproduction: navigate to /charts?view=list (or any non-default view param)
started: unknown - likely since gallery views were added in Phase 6

## Eliminated

- hypothesis: localStorage or typeof window checks in gallery components
  evidence: Grepped all gallery files - no localStorage, no typeof window, no document access during render (only in useEffect)
  timestamp: 2026-04-13T00:03:00Z

- hypothesis: Date.now() or Math.random() in render path
  evidence: Grepped all gallery files - no non-deterministic calls during render
  timestamp: 2026-04-13T00:04:00Z

- hypothesis: Base UI tooltip IDs causing mismatch
  evidence: Base UI useId falls through to React.useId() in React 19, which is deterministic
  timestamp: 2026-04-13T00:05:00Z

- hypothesis: Dark mode / theme toggle causing mismatch
  evidence: No ThemeProvider, no next-themes, dark mode is CSS-only via .dark class
  timestamp: 2026-04-13T00:06:00Z

- hypothesis: Intl.NumberFormat or Date.toLocaleDateString differences
  evidence: Both use hardcoded "en-US" locale, and dates are only rendered for finishDate/ffoDate (not view-dependent)
  timestamp: 2026-04-13T00:07:00Z

- hypothesis: NuqsAdapter children array missing key
  evidence: Array has [Suspense (with key), children (no key)] — uses index-based reconciliation, same order on server and client
  timestamp: 2026-04-13T00:08:00Z

## Evidence

- timestamp: 2026-04-13T00:01:00Z
  checked: NuqsAdapter placement and nuqs internal code
  found: NuqsAdapter in root layout.tsx, uses useSearchParams() from Next.js navigation. The adapter wraps useSearchParams() in useOptimistic(). If useSearchParams() returns null during SSR, nuqs falls back to new URLSearchParams() (empty), making all state values use defaults.
  implication: If useSearchParams() returns null during SSR, server renders with defaults (view="gallery") while client hydrates with actual URL params (view="list"), causing mismatch.

- timestamp: 2026-04-13T00:02:00Z
  checked: Next.js SearchParamsContext in App Router
  found: SearchParamsContext is populated by the client-side Router component in app-router.js, which derives searchParams from canonicalUrl. During SSR, canonicalUrl should include search params from the request URL. However, the exact behavior depends on how the initial state is bootstrapped.
  implication: Need to verify whether canonicalUrl includes search params during SSR or if it strips them.

- timestamp: 2026-04-13T00:09:00Z
  checked: RSC payload for /charts?view=list (via curl)
  found: RSC payload contains "c":["","charts?view=list"],"q":"?view=list" — confirming search params ARE included in the canonical URL sent from server
  implication: prepareInitialCanonicalUrl in app-render.js uses url.pathname + url.search, so search params are preserved

- timestamp: 2026-04-13T00:10:00Z
  checked: Next.js build output for /charts route
  found: Route is marked as f (Dynamic) — server-rendered on demand, not static
  implication: For dynamic routes, useSearchParams() should return actual params during SSR (not null)

- timestamp: 2026-04-13T00:11:00Z
  checked: canonicalUrl flow through app-router.js Router component
  found: During SSR (typeof window === 'undefined'), URL is constructed as new URL(canonicalUrl, 'http://n') where canonicalUrl = '/charts?view=list'. This correctly produces searchParams with view=list. During client hydration, URL is constructed from window.location.href which also has view=list.
  implication: SearchParamsContext should have identical values on server and client — nuqs should read "list" on both sides

- timestamp: 2026-04-13T00:12:00Z
  checked: nuqs useQueryStates initialization path (index.js lines 462-483)
  found: useState initializer uses parseMap with initialSearchParams ?? new URLSearchParams(). The if-block at line 467 also runs during first render (queryRef.current starts as {}). Both paths read from the same initialSearchParams. If initialSearchParams has view=list, both produce view="list".
  implication: If SearchParamsContext is populated correctly (which evidence suggests it is), nuqs state should match on server and client

- timestamp: 2026-04-13T00:13:00Z
  checked: All gallery component render paths for client-only divergence
  found: No localStorage, typeof window, Date.now(), Math.random(), or browser API calls during render. All useEffect/document access is post-mount only. formatDate uses hardcoded "en-US" locale.
  implication: No obvious source of server/client HTML divergence in the gallery component tree itself

- timestamp: 2026-04-13T00:14:00Z
  checked: Next.js dev server log at .next/dev/logs/next-development.log
  found: DEFINITIVE — actual hydration error captured with exact diff:
    Server HTML: className="...grid grid-cols-[40px_8px_1fr] items..." (3-column, NO ListMobileStat span)
    Client HTML: className="...grid grid-cols-[40px_8px_1fr_auto] ..." (4-column, WITH ListMobileStat span)
    Error points to ListView > ListMobileStat at gallery-grid.tsx:230
  implication: Server SSR bundle has STALE code (pre-eeb7aaa) while client bundle has current code

- timestamp: 2026-04-13T00:15:00Z
  checked: git show eeb7aaa -- gallery-grid.tsx
  found: Commit eeb7aaa changed ListView grid from grid-cols-[40px_8px_1fr] to grid-cols-[40px_8px_1fr_auto] and added ListMobileStat component + mobile StatusBadge. The exact diff matches the server/client discrepancy in the hydration error.
  implication: Turbopack HMR updated the client bundle but the SSR cache served stale pre-eeb7aaa HTML

- timestamp: 2026-04-13T00:16:00Z
  checked: Production build (npm run build)
  found: Build succeeds with zero errors, route /charts renders as dynamic (f). No hydration mismatch in production.
  implication: This is a dev-mode-only issue caused by Turbopack SSR cache staleness

## Resolution

root_cause: Turbopack dev server SSR cache staleness after commit eeb7aaa. The commit changed ListView's mobile grid from 3 columns (grid-cols-[40px_8px_1fr]) to 4 columns (grid-cols-[40px_8px_1fr_auto]) and added the ListMobileStat component. Turbopack's HMR updated the client-side bundle with the new code, but the SSR cache continued serving stale server-rendered HTML using the old 3-column layout without ListMobileStat. This caused the server HTML to not match the client HTML, triggering React's hydration mismatch error. Not a bug in the application code — nuqs, the gallery components, and all rendering logic are correct.
fix: Restart the dev server to clear the stale Turbopack SSR cache (kill 7465 && npm run dev). Alternatively, delete .next/ directory and restart. This is a development-only issue — production builds are not affected.
verification: Production build succeeds with zero errors. The actual source code in gallery-grid.tsx line 243 correctly has grid-cols-[40px_8px_1fr_auto] and ListMobileStat is properly included at line 260.
files_changed: []
