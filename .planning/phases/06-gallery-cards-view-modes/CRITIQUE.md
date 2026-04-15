# Phase 6 Gallery — Design Critique Report

> Generated: 2026-04-13 | Score: **26/40** | AI Slop: **PASS**

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | No loading feedback during `useDeferredValue` search debounce |
| 2 | Match System / Real World | 4 | Domain language is excellent — kitting dots, FFO, BAP all match craft vocabulary |
| 3 | User Control and Freedom | 3 | No undo after "Clear all" filters; search input lacks inline clear button |
| 4 | Consistency and Standards | 3 | List view duplicates kitting icon rendering instead of reusing `KittingDots` component |
| 5 | Error Prevention | 2 | Sort direction invisible in resting state; two columns share same sort field |
| 6 | Recognition Rather Than Recall | 3 | Sort direction only in aria-label, not visible to sighted users |
| 7 | Flexibility and Efficiency | 2 | No keyboard shortcut to focus search; no bulk selection in multi-select |
| 8 | Aesthetic and Minimalist Design | 3 | Well-proportioned cards but unstarted footer is dense |
| 9 | Error Recovery | 2 | Empty filter state offers no suggestions to broaden filters |
| 10 | Help and Documentation | 1 | Native `title` tooltips only; no explanation of size categories or kitting dot meanings |
| **Total** | | **26/40** | **Competent** |

## Anti-Patterns Verdict

**AI Slop: PASS**

- No gradient text, glassmorphism, side-stripe borders, hero metric layouts, or AI color palettes
- Automated detector flagged 2 `ai-color-palette` findings for `from-violet-*` gradients — **false positives** (these are semantic status colors for FINISHED projects, one of 7 locked lifecycle colors)
- Celebration glow on Finished/FFO cards is borderline but defensible — restrained opacity, serves clear design purpose

## What's Working

1. **Status-specific card footers** — WIP/Unstarted/Finished each show contextually relevant data, not templated content
2. **Kitting dots system** — 4 categories x 4 states with distinct icons and semantic colors; "partial" amber state is a smart data-driven addition
3. **URL-synced state via nuqs** — bookmarkable filter views, smart default sort directions per field

## Priority Issues (ordered for fix session)

### P2: ARIA violation — `role="checkbox"` nested in `role="option"`

- **File:** `multi-select-dropdown.tsx:167-174`
- **What:** `role="checkbox"` inside `role="option"` is not a permitted ARIA child role
- **Fix:** Remove `role="checkbox"` and `aria-checked` from the visual checkbox span. Keep the visual checkmark. ARIA uses `aria-selected` on the option.
- **Command:** `/harden`

### P2: ListView missing list semantics

- **File:** `gallery-grid.tsx` — `ListView` component (~line 214)
- **What:** Gallery view correctly uses `role="list"`/`role="listitem"` but list view does not
- **Fix:** Add `role="list"` to the container div, `role="listitem"` to each row
- **Command:** `/harden`

### P2: Search input lacks clear button

- **File:** `filter-bar.tsx:37-49`
- **What:** No inline X button to clear search text; users must manually delete or find the chip below
- **Fix:** Add conditional X button when `search.length > 0`, positioned `absolute right-2.5 top-1/2`
- **Command:** `/harden`

### P2: Sort direction invisible in resting state

- **File:** `sort-dropdown.tsx:137`
- **What:** Sort trigger shows `ArrowUpDown` icon regardless of current direction. Direction only in `aria-label`.
- **Fix:** Replace `ArrowUpDown` with `ArrowUp` or `ArrowDown` based on `dir` value
- **Command:** `/harden`

### P2: Table "Progress" and "Stitches" columns share same sort field

- **File:** `gallery-grid.tsx:278-279`
- **What:** Both columns use `sortField: "stitchCount"`. Clicking "Progress" sorts by stitch count, not progress %.
- **Fix:** Add a `"progress"` sort field using `progressPercent` for WIP, 100 for finished, 0 for unstarted. Or remove sortable from Progress.
- **Command:** `/harden`

### P2: Add styled tooltips for kitting dots and size categories

- **Files:** `kitting-dots.tsx`, `gallery-card.tsx` (size badge), `gallery-grid.tsx` (ListKittingIcons)
- **What:** Native `title` tooltips are inconsistent across platforms and inaccessible to keyboard users. No explanation of what kitting dots or size categories mean.
- **Fix:** Replace `title` with styled tooltip components. Kitting dots: explain "Fabric: Ready" etc. Size badges: show stitch count ranges (e.g., "BAP: 50,000+ stitches").
- **Command:** `/harden`

### P3: Loading skeleton doesn't match gallery layout

- **File:** `src/app/(dashboard)/charts/loading.tsx`
- **What:** Shows table-like skeleton but default view is gallery (card grid). Visual jarring on page load.
- **Fix:** Render card-shaped placeholders in `auto-fill minmax(280px, 340px)` grid with aspect-4/3 image area + body area
- **Command:** `/polish`

## Minor Issues

### List view duplicates kitting icon rendering

- **File:** `gallery-grid.tsx:139-176` (`ListKittingIcons`)
- **What:** Re-implements kitting dot icons that already exist in `kitting-dots.tsx`. Different gap values, no labels, slightly different colors.
- **Fix:** Import `KittingDotIcon` from `kitting-dots.tsx` and use it in both card and list contexts

### Hardcoded stone colors in KittingDots

- **File:** `kitting-dots.tsx:19-21`
- **What:** Uses `text-stone-400 dark:text-stone-500` (needed) and `text-stone-300 dark:text-stone-600` (not-applicable) — missed during stone→semantic token conversion
- **Fix:** Replace with `text-muted-foreground` and `text-muted-foreground/30`

### Dual transition utilities on gallery card

- **File:** `gallery-card.tsx:146`
- **What:** `transition-shadow transition-transform` — may override each other in Tailwind v4
- **Fix:** Verify behavior; may need explicit `transition-[shadow,transform]`

### "Clear all" lacks safety net

- **File:** `filter-chips.tsx:87-93`
- **What:** One-click wipes all active filters with no undo
- **Fix:** Low priority — consider storing last filter state for undo, or skip

### Empty filter state could be warmer

- **File:** `gallery-grid.tsx:62-67`
- **What:** "No projects match your filters" with scissors icon — no suggestion to broaden search
- **Fix:** Add "Try adjusting your filters" text and/or a "Clear filters" button inline

## Persona Red Flags

**Power User (500+ charts):** Sort direction invisible; no keyboard shortcut to focus search; no quick "show WIPs only" shortcut

**First-Timer:** Kitting dots have no legend; size categories show no stitch count ranges; empty gallery state CTA is good but no onboarding hint

## Questions for Future Consideration

1. Should gallery cards serve double duty (browse + status check)? At 500 projects, the info density may be exhausting for browsing. Simpler cards with detail-on-hover could serve browsing better.
2. View mode transitions do a hard cut — a crossfade or shared-layout animation could feel more craft-worthy.
3. At 500 projects with no virtualization or pagination, has scroll performance been tested?

## Recommended Fix Order

```
1. /harden — ARIA fixes (checkbox role, list semantics)
2. /harden — UX discoverability (search clear, sort direction, progress sort field)
3. /harden — Styled tooltips for kitting dots + size categories
4. /polish — Loading skeleton, duplicate kitting icons, hardcoded stone colors, minor items
5. /critique — Re-run to verify score improvement
```
