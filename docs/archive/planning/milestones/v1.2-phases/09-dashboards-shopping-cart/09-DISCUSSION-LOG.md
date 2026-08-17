# Phase 9: Dashboards & Shopping Cart - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-17
**Phase:** 09-dashboards-shopping-cart
**Areas discussed:** Dashboard page structure, Main Dashboard sections, Shopping Cart upgrade, Project Dashboard display

---

## Dashboard Page Structure

| Option | Description | Selected |
|--------|-------------|----------|
| Single route with nuqs tabs | Both dashboards on / with tab switching (?tab=library, ?tab=progress). Matches Pattern Dive tab pattern. | ✓ |
| Separate routes | Main Dashboard at /, Project Dashboard at /dashboard/progress. Each loads only its own data. | |
| Repurpose /stats route | Keep / as Main Dashboard, use /stats for Project Dashboard with its own nav item. | |

**User's choice:** Single route with nuqs tabs
**Notes:** User asked about multi-user readiness. Confirmed that independent data-fetching functions make route-splitting trivial later. Tabs-now is the right call because data volume is trivial for single-user and the pattern is established. The routing decision is easily reversible (~2 hours) if multi-user data volumes warrant it.

---

## Main Dashboard Sections

### Card Format (design-resolved)

**Decision:** Custom CurrentlyStitchingCard for Currently Stitching (compact, progress-focused, horizontal scroll). GalleryCard reused for Start Next. Resolved by DesignOS design — not a user decision.

### Buried Treasures Age Threshold

| Option | Description | Selected |
|--------|-------------|----------|
| 1 year | Charts unstarted for 365+ days. Meaningful in cross-stitch culture. | |
| 1.5 years | Matches DesignOS sample data range. Only truly buried items. | |
| 6 months | More aggressive — surfaces items faster. | |
| Dynamic (oldest 10%) | Self-adjusting, always shows items regardless of collection age. | ✓ |

**User's choice:** Dynamic — oldest 10% of unstarted charts
**Notes:** User pointed out that a fixed 365-day threshold would leave the section empty for a year since all charts were recently imported to the app. Suggested "10% oldest" as a self-adjusting alternative. Refined to: display top 5 from oldest 10%, sorted oldest-first.

### Spotlight Randomization

| Option | Description | Selected |
|--------|-------------|----------|
| Random on page load + Shuffle | Fresh random pick every visit. Shuffle calls server action. Zero state. | ✓ |
| Same pick per day + Shuffle override | Deterministic daily pick. Shuffle overrides via cookie. | |
| Pre-fetch pool of 5 | Fetch 5 candidates, client picks randomly. Instant shuffle. | |

**User's choice:** Random on page load + Shuffle (recommended)
**Notes:** No additional discussion needed.

---

## Shopping Cart Upgrade

### Replacement Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Full replacement at /shopping | New ShoppingCart replaces existing ShoppingList. Same nav position, new architecture. | ✓ |
| Keep both views | Old list stays, new cart at /shopping/cart. Incremental delivery. | |

**User's choice:** Full replacement (recommended)
**Notes:** No additional discussion needed.

### Project Selection Default State

| Option | Description | Selected |
|--------|-------------|----------|
| Empty + remember selections | No projects selected on first visit. Persist last selection via localStorage. | ✓ |
| Empty, no memory | Always start fresh. Must re-pick every visit. | |
| All projects selected | Show everything by default like current shopping list. | |

**User's choice:** Empty + remember selections (recommended)
**Notes:** No additional discussion needed.

---

## Project Dashboard Display

| Option | Description | Selected |
|--------|-------------|----------|
| Follow the design as-is | Collapsible accordion (collapsed default), stacked bar chart, auto-fit stat cards, finish-date sort. | ✓ |
| Discuss specific aspects | Override or modify aspects of the DesignOS design. | |

**User's choice:** Follow the design as-is
**Notes:** All aspects resolved by DesignOS design. No overrides requested.

## Claude's Discretion

- Collection Stats sidebar/inline layout responsive breakpoints
- Empty state messaging for sections with no data
- Quick Add menu component (dropdown, speed dial, or popover)
- Shopping Cart project selection component specifics
- Loading skeleton designs
- Stacked bar chart implementation details
- "View all" link destinations

## Deferred Ideas

None — discussion stayed within phase scope
