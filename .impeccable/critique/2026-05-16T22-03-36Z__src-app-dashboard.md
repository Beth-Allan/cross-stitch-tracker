---
target: full app (dashboard)
total_score: 28
p0_count: 0
p1_count: 0
timestamp: 2026-05-16T22-03-36Z
slug: src-app-dashboard
---

## Design Health Score

| #         | Heuristic                       | Score     | Key Issue                                                                    |
| --------- | ------------------------------- | --------- | ---------------------------------------------------------------------------- |
| 1         | Visibility of System Status     | 3         | No inline loading indicator when marking supplies acquired in shopping       |
| 2         | Match System / Real World       | 4         | Excellent domain language throughout (Kitting, FFO, BAP, Buried Treasures)   |
| 3         | User Control and Freedom        | 3         | No undo after marking supply acquired; shuffle provides re-roll              |
| 4         | Consistency and Standards       | 3         | Shopping h1 uses font-bold while other pages use font-semibold               |
| 5         | Error Prevention                | 3         | Zod validation at boundaries, delete confirmation dialogs present            |
| 6         | Recognition Rather Than Recall  | 3         | Quick Add menu has 8 flat items requiring label-scanning                     |
| 7         | Flexibility and Efficiency      | 3         | Three view modes, URL-synced filters; no keyboard shortcuts for power users  |
| 8         | Aesthetic and Minimalist Design | 3         | Clean composition with generous spacing; list view 7-col grid can feel dense |
| 9         | Error Recovery                  | 2         | Generic error boundary, toast-only feedback, no retry mechanism              |
| 10        | Help and Documentation          | 1         | Zero in-app guidance, no contextual help for domain terms                    |
| **Total** |                                 | **28/40** | **Good — solid foundation, gaps in error recovery and onboarding**           |

## Anti-Patterns Verdict

**LLM assessment: PASS.** This interface does NOT look AI-generated. Domain-specific features (Buried Treasures, Spotlight shuffle, kitting dots), intentional serif typography (Fraunces), and personal warmth in feature naming all resist generic SaaS aesthetics. The HeroStats emerald cards and section heading accent bars are borderline but saved by restraint and domain context.

**Deterministic scan: 5 findings, 4 false positives.** The automated detector flagged `bg-black/10` overlays in dialog.tsx and sheet.tsx (standard shadcn patterns), violet gradients in gallery-utils.ts (intentional status color coding), and `bg-black/50` on image upload controls (standard overlay convention). Only the image overlay is worth noting — could use `bg-foreground/50` for token purity. Zero gradient text, zero glassmorphism, zero side-stripe borders found.

**Combined verdict: Clean.** The app successfully maintains its own personality and avoids the AI aesthetic trap.

## Overall Impression

A well-crafted product UI that speaks its domain fluently and respects its design system. The "Craft Room Ledger" aesthetic comes through — warm, personal, data-rich without being overwhelming. The biggest opportunity is strengthening feedback loops (error recovery, inline loading states) and adding minimal onboarding for the domain vocabulary.

## What's Working

1. **Domain-specific emotional design in the dashboard.** "Buried Treasures" (oldest unstarted projects with age badges), "Rediscover This One" (Spotlight with shuffle), and "Start Next" are not generic widgets — they create emotional connection to the craft.

2. **Status system coherence.** The 7-status lifecycle is consistently expressed through color + badge + progress bar variant + card treatment across every view. The centralized STATUS_CONFIG makes this reliable and maintainable.

3. **Three-view gallery with URL-synced state.** Gallery/List/Table with nuqs URL state, filter chips, sort toggles, and responsive column hiding is sophisticated and fast for 500+ items.

## Priority Issues

**[P2] HeroStats hardcoded emerald colors violate token convention**

- **Why it matters:** The project explicitly bans hardcoded color scales in favor of semantic tokens. These emerald-100/50/900/950 values make theming fragile and break the pattern every other component follows.
- **Fix:** Create semantic tokens (e.g., `--color-stat-surface`, `--color-stat-border`) or reuse existing emerald mappings from the theme.
- **Suggested command:** `/impeccable polish`

**[P2] Quick Add menu lacks grouping for 8 items**

- **Why it matters:** 7+ undifferentiated items at a decision point exceed cognitive load thresholds. The menu conflates actions (Log Stitches) with creation (New X) without visual distinction.
- **Fix:** Group into sections — "Quick Actions" (Log Stitches), "Create" (Chart, Thread, Bead, Specialty, Fabric), "Reference" (Designer, Genre) with section labels.
- **Suggested command:** `/impeccable layout`

**[P2] Loading states are generic across all routes**

- **Why it matters:** A single centered skeleton for every page fails to communicate what IS loading. Content-shaped skeletons maintain spatial stability and reduce perceived load time.
- **Fix:** Route-specific loading: dashboard skeleton with card shapes, gallery skeleton with card grid, shopping skeleton with accordion shapes.
- **Suggested command:** `/impeccable harden`

**[P3] Shopping page heading weight inconsistency**

- **Why it matters:** Heading consistency is fundamental to design system trust. `font-bold` vs `font-semibold` creates subtle visual incoherence when navigating.
- **Fix:** Standardize all page h1 headings to `font-semibold` (majority usage).
- **Suggested command:** `/impeccable polish`

**[P3] No inline feedback for shopping acquire actions**

- **Why it matters:** The primary action (marking supplies bought) relies on ephemeral toasts. For the core shopping workflow, immediate inline feedback is critical.
- **Fix:** Show spinner/disabled state on the specific row being updated; render `failedIds` items with inline warning indicator.
- **Suggested command:** `/impeccable harden`

## Persona Red Flags

**Alex (Power User — 500+ charts, daily use):**

- No keyboard shortcuts for frequent actions (Log Stitches, toggle view, navigate to next project)
- Quick Add requires mouse targeting through 8 undifferentiated items
- No bulk operations visible (bulk status change, bulk supply marking)
- Tab cycling on shopping page requires multiple clicks to reach "By Supply" view

**Jordan (First-Timer returning after 2 weeks):**

- "Pattern Dive" as a navigation label doesn't obviously mean "my project gallery"
- No contextual help for domain terms (FFO, BAP, Kitting, WIP)
- Sidebar Scissors icon doesn't reinforce "Pattern Dive" semantics
- Empty states exist but don't teach the interface vocabulary

## Minor Observations

- CoverPlaceholder Scissors icon at `opacity-15` may be invisible to some users
- Gallery grid uses inline `style={{ gridTemplateColumns }}` — pragmatic but invisible to Tailwind audits
- List view grid template string is extremely complex for responsive (`grid-cols-[40px_8px_minmax(180px,2fr)_...]`) — brittle to maintain
- `backdrop-blur-sm` in shopping-for-bar is subtle and functional, not decorative glassmorphism
- Sidebar collapse transition respects `motion-reduce:transition-none` — good a11y detail

## Questions to Consider

1. **Is "Pattern Dive" costing discoverability?** The creative naming is charming, but would a returning user after 2 weeks remember it means "gallery"? The sidebar icon (Scissors) doesn't reinforce "dive" semantics.

2. **At 75+ projects in kitting, does the shopping project list need search-first instead of browse-first?** The accordion assumes the list fits on screen. The ShoppingForBar pills will overflow on mobile with 10+ selections.

3. **Does the dashboard eagerly load full gallery data just to show 2 "Start Next" cards?** Three parallel fetches including `getChartsForGallery()` for 500+ items — is the page paying for the heaviest fetch to populate a 2-card section?
