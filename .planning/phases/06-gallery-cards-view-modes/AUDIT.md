# Impeccable Audit: Phase 6 — Gallery Cards & View Modes

**Date:** 2026-04-13
**Score:** 14/20 (Good — address weak dimensions)
**Issues:** 0 P0, 5 P1, 7 P2, 4 P3

## Audit Health Score

| # | Dimension | Score | Key Finding |
|---|-----------|-------|-------------|
| 1 | Accessibility | 3 | Dropdown triggers missing `aria-expanded`/`aria-haspopup`; fake checkboxes |
| 2 | Performance | 3 | No `loading="lazy"` on images in a 500+ item collection |
| 3 | Theming | 2 | STATUS_GRADIENTS & celebration styles are fixed hex — no dark mode adaptation |
| 4 | Responsive Design | 3 | ListView 7-column grid doesn't collapse on mobile |
| 5 | Anti-Patterns | 3 | One glassmorphism badge, otherwise clean and intentional |
| **Total** | | **14/20** | **Good** |

## Anti-Patterns Verdict

**Pass.** This does NOT look AI-generated. The design has clear intentionality:
- Three distinct status-specific card footers (progress bar for WIP, kitting dots for Unstarted, completion date for Finished)
- Data-driven kitting dots with 4 states per supply type
- Celebration borders are restrained (2px solid + subtle shadow, not neon glow)
- No gradient text, no bounce animations, no hero metrics, no thick side-stripe borders

**One minor tell:** `backdrop-blur-sm bg-white/80` on the size badge (`gallery-card.tsx:201`) is a glassmorphism pattern. Functional here (badge overlays an image) but flagged for awareness.

## Recommended Actions (in priority order)

1. **[P1] `/harden`** — Fix ARIA gaps: aria-expanded on dropdowns, accessible label on search input, focus trapping on menus, real checkbox semantics
2. **[P1] `/optimize`** — Add `loading="lazy"` to all images, remove backdrop-blur on size badge
3. **[P1] `/adapt`** — Fix ListView grid on mobile, increase touch targets on filter controls, wrap page header
4. **[P1] `/polish`** — Migrate hardcoded stone-* neutrals to semantic tokens, fix dark mode for gradients and celebration styles, deduplicate formatters
5. **[P3] `/delight`** — Enhance empty project state with warmth per design principles

---

## Detailed Findings

### P1 Major (fix before release)

#### P1-1: Dropdown ARIA patterns missing
- **Location:** `multi-select-dropdown.tsx:54-56`, `sort-dropdown.tsx:67-69`
- **Category:** Accessibility
- **Impact:** Screen reader users can't tell if a dropdown is open or that it opens a popup. Fake checkboxes (`multi-select-dropdown.tsx:90-100`) have no `aria-checked` and aren't real inputs.
- **WCAG:** 4.1.2 Name, Role, Value
- **Fix:** Add `aria-expanded={isOpen}`, `aria-haspopup="listbox"` to trigger buttons. Add `role="listbox"` to dropdown panel, `role="option"` + `aria-selected` on items. For multiselect, use real `<input type="checkbox">` visually hidden + custom styles, or add `aria-checked`.

#### P1-2: Images missing lazy loading
- **Location:** `gallery-card.tsx:179-183`, `gallery-grid.tsx:52-57`
- **Category:** Performance
- **Impact:** With 500+ charts, all images load eagerly — significant bandwidth waste and slow initial paint for gallery/list/table views.
- **Fix:** Add `loading="lazy"` to `<img>` tags. Consider `decoding="async"` too.

#### P1-3: Search input missing accessible label
- **Location:** `filter-bar.tsx:47-53`
- **Category:** Accessibility
- **Impact:** Screen readers announce this as a generic text input. Placeholder text disappears on focus.
- **WCAG:** 1.3.1 Info and Relationships
- **Fix:** Add `aria-label="Search projects"` to the input.

#### P1-4: STATUS_GRADIENTS don't adapt to dark mode
- **Location:** `gallery-utils.ts:130-138`, used by `cover-placeholder.tsx:15` and `gallery-grid.tsx:65`
- **Category:** Theming
- **Impact:** Placeholder backgrounds use light-mode hex colors (`#e7e5e4`, `#fef3c7`, etc.) that look washed out or have poor contrast on dark backgrounds.
- **Fix:** Either use Tailwind classes with `dark:` variants instead of inline gradient styles, or add a dark mode map and select based on theme.

#### P1-5: ListView grid doesn't collapse on mobile
- **Location:** `gallery-grid.tsx:234-237`
- **Category:** Responsive Design
- **Impact:** Inline `gridTemplateColumns` defines 7 tracks. Columns 4-7 use `hidden sm:block` to hide content, but grid tracks still allocate space. On mobile, visible content is squished into first 3 columns.
- **Fix:** Use responsive grid template (CSS custom property toggled by breakpoint) or switch to flexbox for mobile layout.

### P2 Minor (fix in next pass)

#### P2-1: Filter/sort button touch targets below 44px
- **Location:** `multi-select-dropdown.tsx:58`, `sort-dropdown.tsx:71`, `view-toggle-bar.tsx:77`
- **Category:** Accessibility / Responsive
- **Impact:** `py-1.5` + text/icon = ~32-38px height. Below WCAG 2.2 target size recommendation (44px).
- **Fix:** Increase padding to `py-2` or `py-2.5` to reach >=44px.

#### P2-2: Inconsistent neutral token usage
- **Location:** Multiple files — `gallery-card.tsx:45,51,64`, `filter-chips.tsx:74`, `view-toggle-bar.tsx:69,79-80`, `kitting-dots.tsx:18-20,65-66`
- **Category:** Theming
- **Impact:** `bg-stone-100` where `bg-muted` would work, `text-stone-600` where `text-muted-foreground` fits. Creates maintenance burden if neutral palette changes.
- **Fix:** Replace hardcoded stone neutrals with semantic equivalents. Status-specific colors (emerald, violet, etc.) stay per design system.

#### P2-3: Celebration styles don't adapt to dark mode
- **Location:** `gallery-utils.ts:142-158`
- **Category:** Theming
- **Impact:** `getCelebrationStyles()` returns hardcoded `rgb()`. The 0.08 opacity shadow may be invisible on dark mode.
- **Fix:** Increase shadow opacity or adjust colors for dark mode.

#### P2-4: Duplicate utility functions
- **Location:** `gallery-card.tsx:14-24` and `gallery-grid.tsx:32-42`
- **Category:** Maintainability
- **Impact:** `formatNumber()` and `formatDate()` are identical in both files.
- **Fix:** Extract to shared `gallery-format.ts` or import from one location. Cache the `Intl.NumberFormat` instance.

#### P2-5: Page header doesn't wrap on mobile
- **Location:** `project-gallery.tsx:53`
- **Category:** Responsive Design
- **Impact:** Title and "Add Project" button side by side. On narrow screens (~320px), title could truncate or button overflows.
- **Fix:** Add `flex-wrap gap-4` or stack vertically on small screens with `flex-col sm:flex-row`.

#### P2-6: Dropdown menus don't trap focus
- **Location:** `multi-select-dropdown.tsx:79-106`, `sort-dropdown.tsx:84-115`
- **Category:** Accessibility
- **Impact:** Keyboard users can Tab past the open dropdown into background content.
- **Fix:** Move focus to first option on open, trap focus within dropdown, return focus to trigger on close.

#### P2-7: Filter chip remove button hit area
- **Location:** `filter-chips.tsx:77-84`
- **Category:** Accessibility
- **Impact:** X icon is 12x12px with no padding on the button. Difficult to tap on mobile.
- **Fix:** Add `p-1` or `min-w-[28px] min-h-[28px]` to the remove button.

### P3 Polish (fix if time permits)

#### P3-1: Size badge glassmorphism
- **Location:** `gallery-card.tsx:201`
- **Category:** Anti-Pattern
- **Impact:** `backdrop-blur-sm bg-white/80` is a minor AI tell. Blur adds GPU cost per card.
- **Fix:** Replace with opaque `bg-white/90` or `bg-background/90`.

#### P3-2: Card hover lift
- **Location:** `gallery-card.tsx:171`
- **Category:** Anti-Pattern
- **Impact:** `hover:-translate-y-1` is common but also a legitimate design choice. Very subtle here.
- **Fix:** Keep or remove — design call, not quality issue.

#### P3-3: Empty state could be more engaging
- **Location:** `gallery-grid.tsx:83-96`
- **Category:** UX
- **Impact:** Empty project state is functional but minimal. Design context says "playful empty states."
- **Fix:** Warmer empty state illustration or copy.

#### P3-4: `as unknown as` type cast
- **Location:** `project-gallery.tsx:25`
- **Category:** Maintainability
- **Impact:** Double cast suggests types don't align cleanly. Works but fragile.
- **Fix:** Align `GalleryChartData` with `GalleryChartWithProject` to avoid cast.

## Positive Findings

- **Excellent semantic HTML in table view:** `<caption>`, `aria-sort`, proper `<thead>`/`<tbody>` (`gallery-grid.tsx:329-365`)
- **Good sr-only labels:** View toggle buttons have `sr-only` text (`view-toggle-bar.tsx:84`)
- **Smart URL state management:** `useGalleryFilters` with nuqs + `useDeferredValue` for search
- **Data-driven kitting dots:** 4 states derived from actual supply quantities
- **Proper aria-labels:** KittingDots, FilterChips remove buttons, SortDropdown trigger
- **Auto-responsive gallery grid:** `repeat(auto-fill, minmax(280px, 340px))`
- **Clean separation:** Pure functions for filtering/sorting, React for rendering
- **Good empty states:** Both "no matches" and "no projects" variants exist

## Systemic Issues

1. **Stone-* vs semantic tokens:** 40+ instances of hardcoded `stone-*` neutrals where `bg-muted`, `text-muted-foreground`, `border-border` would work. Status-specific colors (emerald, amber, violet, rose) are correct per design system.
2. **Dropdown ARIA pattern:** Both MultiSelectDropdown and SortDropdown share the same hand-built pattern with the same gaps. Fix the pattern once.
3. **Image loading strategy:** All `<img>` tags lack `loading="lazy"`. Measurable bottleneck at 500+ charts.
