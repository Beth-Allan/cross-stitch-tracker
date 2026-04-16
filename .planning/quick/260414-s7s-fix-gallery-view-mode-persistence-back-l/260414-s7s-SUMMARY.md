---
status: complete
plan: 260414-s7s
tasks_completed: 2
tasks_total: 2
---

# Quick Task 260414-s7s: Fix gallery view mode persistence

## Summary

Fixed two related bugs in the gallery view mode on the `/charts` page:

1. **Back link loses view mode** — The back link from chart detail hardcoded `href="/charts"` with no query params. Replaced with a `BackToGalleryLink` client component that reads the user's last view preference from localStorage.

2. **Refresh flashes gallery default** — The `useGalleryFilters` hook only used URL params via nuqs with no localStorage fallback. Added localStorage write on `setView` and a mount-time restore when no URL param is present.

## Changes

| File | Action |
|------|--------|
| `src/components/features/gallery/use-gallery-filters.ts` | Added localStorage persistence (write on setView, restore on mount) |
| `src/components/features/gallery/use-gallery-filters.test.ts` | 4 new tests for persistence behavior |
| `src/components/features/charts/back-to-gallery-link.tsx` | New client component for view-preserving back link |
| `src/components/features/charts/back-to-gallery-link.test.tsx` | 5 tests for back link behavior |
| `src/components/features/charts/chart-detail.tsx` | Replaced inline Link with BackToGalleryLink |

## Commits

- `b9a32b8`: test(260414-s7s): add failing tests for gallery view mode localStorage persistence
- `4b16d41`: feat(260414-s7s): add localStorage persistence to gallery view mode
- `f3f4ccc`: test(260414-s7s): add failing tests for BackToGalleryLink component
- `755e3e4`: feat(260414-s7s): create BackToGalleryLink with view mode preservation

## Deviation

Plan suggested `window.location.search` for URL param detection, but this doesn't work in jsdom test environments. Used `useRef` to capture the initial nuqs-parsed value instead — if nuqs initializes to a non-default view, a URL param was present and localStorage restoration is skipped.
