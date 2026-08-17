# Phase 9: Dashboards & Shopping Cart - Context

**Gathered:** 2026-04-17
**Status:** Ready for planning

<domain>
## Phase Boundary

Users get a curated home dashboard, a progress-oriented project dashboard, and a shopping cart that lets them plan supply runs by project. This phase delivers the Main Dashboard (Currently Stitching, Start Next, Buried Treasures, Spotlight, Collection Stats, Quick Add), the Project Dashboard (hero stats, progress buckets, Finished tab), and a redesigned Shopping Cart with project selection and tabbed supply types. Goals Summary section is omitted — Goal model doesn't exist until v1.3.

</domain>

<decisions>
## Implementation Decisions

### Dashboard Page Structure
- **D-01:** Main Dashboard and Project Dashboard live on a single route (`/`) with nuqs tab switching. Tab labels: "Your Library" (default) and "Progress". URL state via `?tab=progress` for deep-linking.
- **D-02:** Independent data-fetching functions per dashboard (`getMainDashboardData()`, `getProjectDashboardData()`) fetched via Promise.all() in the server component. Designed for easy route-splitting if multi-user data volumes require it later.
- **D-03:** Matches the Pattern Dive tab precedent — same Tabs component, same nuqs URL state pattern, same eager-fetch approach.

### Main Dashboard Sections
- **D-04:** Currently Stitching uses custom `CurrentlyStitchingCard` components (compact, progress-focused, 280px fixed-width, horizontal scroll with arrows). NOT the full GalleryCard. Per DesignOS design.
- **D-05:** Start Next section reuses the existing `GalleryCard` component. Display top 2 per design.
- **D-06:** Buried Treasures uses a **dynamic threshold** — oldest 10% of unstarted charts, display top 5, sorted oldest-first. Self-adjusting as the collection ages. Avoids the empty-section problem of a fixed 365-day threshold when all charts were recently imported.
- **D-07:** Spotlight uses server-side random on page load. "Shuffle" button calls a server action to re-fetch a new random project. Zero client state management.
- **D-08:** Quick Add menu provides shortcuts to create charts, supplies, designers, or log stitches. "Log Stitches" reuses the existing LogSessionModal from Phase 8.

### Shopping Cart
- **D-09:** New Shopping Cart **fully replaces** the existing Shopping List at `/shopping`. Same nav position, new architecture with project selection + supply type tabs (Threads, Beads, Specialty, Fabric).
- **D-10:** Default state: **no projects selected** on first visit. Last selection persisted via localStorage so return visits restore the user's previous picks. Must filter out stale project IDs (deleted/completed).
- **D-11:** Supply needs aggregated across selected projects. Tab badges show unfulfilled item counts per supply type (SHOP-04).
- **D-12:** "Mark Acquired" interaction retained from existing ShoppingList — per-item buttons, server action pattern.

### Project Dashboard
- **D-13:** Progress buckets as collapsible accordion sections with chevrons, **collapsed by default**. Stacked horizontal bar chart summary above the accordions shows distribution at a glance. Per DesignOS design.
- **D-14:** Hero stats bar as responsive auto-fit grid of 6 individual stat cards (`minmax(140px, 1fr)`). Matches existing stat card pattern.
- **D-15:** Finished tab sort default: `finishDate` (most recent first). Sort dropdown offers: finish date, start-to-finish duration, stitch count, stitching days. Per DesignOS design.

### Claude's Discretion
- Collection Stats sidebar/inline layout responsive breakpoints
- Empty state messaging for sections with no data (no WIPs, no unstarted charts, etc.)
- Exact Quick Add menu component (dropdown, speed dial, or popover)
- Shopping Cart project selection component specifics (checkboxes, toggleable cards — follow design reference)
- Loading skeleton designs for dashboard sections
- Stacked bar chart implementation details (CSS, charting library, or SVG)
- "View all" link destinations (Pattern Dive filtered views)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Dashboard Design
- `product-plan/sections/dashboards-and-views/components/MainDashboard.tsx` — Full Main Dashboard layout: Currently Stitching cards, Start Next, Buried Treasures, Spotlight, Collection Stats, Quick Add menu
- `product-plan/sections/dashboards-and-views/components/ProjectDashboard.tsx` — Project Dashboard: hero stats grid, progress buckets accordion, Finished tab with sort controls
- `product-plan/sections/dashboards-and-views/components/ShoppingCart.tsx` — Shopping Cart: project selection, supply type tabs, mark-acquired, badge counts
- `product-plan/sections/dashboards-and-views/main-dashboard.png` — Visual reference for Main Dashboard
- `product-plan/sections/dashboards-and-views/project-dashboard.png` — Visual reference for Project Dashboard
- `product-plan/sections/dashboards-and-views/shopping-cart.png` — Visual reference for Shopping Cart
- `product-plan/sections/dashboards-and-views/types.ts` — All TypeScript interfaces: MainDashboardProps, ProjectDashboardProps, ShoppingCartProps, CollectionStats, ProgressBucket, etc.
- `product-plan/sections/dashboards-and-views/README.md` — Component overview, user flows, props reference

### Requirements & Roadmap
- `.planning/REQUIREMENTS.md` — DASH-01 through DASH-06, PROJ-01 through PROJ-05, SHOP-01 through SHOP-04
- `.planning/ROADMAP.md` — Phase 9 success criteria and dependency on Phase 8

### Existing Patterns
- `src/components/features/charts/project-detail/project-tabs.tsx` — nuqs tab pattern to follow for dashboard tabs
- `src/components/features/gallery/gallery-card.test.tsx` — Gallery card component reused for Start Next section
- `src/components/features/shopping/shopping-list.tsx` — Existing shopping list being replaced (reference for mark-acquired pattern)
- `src/lib/actions/shopping-actions.ts` — Existing shopping actions (markSupplyAcquired to carry forward)
- `src/lib/actions/session-actions.ts` — Session data queries for "last stitched" sorting and progress aggregations
- `src/lib/actions/pattern-dive-actions.ts` — Pattern Dive data actions (What's Next, Fabric Reqs, Storage) for reference
- `src/app/(dashboard)/page.tsx` — Current placeholder dashboard page to replace
- `src/components/shell/nav-items.ts` — Nav items for routing updates

### Phase 8 Context
- `.planning/phases/08-session-logging-pattern-dive/08-CONTEXT.md` — Prior decisions: Promise.all() eager fetching, nuqs tab state, LogSessionModal in TopBar

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- **GalleryCard** (`src/components/features/gallery/`): Full gallery cards with status-specific layouts — reused for Start Next section
- **Tabs** (`src/components/ui/tabs.tsx`): Base UI tabs with line variant — dashboard tabs use this
- **nuqs tab state** (`src/components/features/charts/project-detail/project-tabs.tsx`): URL-persisted tabs pattern — extend for dashboard tabs
- **ShoppingList** (`src/components/features/shopping/shopping-list.tsx`): Existing SupplyRow + markSupplyAcquired pattern — carry forward into new ShoppingCart
- **LogSessionModal**: Already in TopBar from Phase 8 — Quick Add "Log Stitches" reuses this
- **Card** (`src/components/ui/card.tsx`): Base card component for stat cards, section cards
- **StatusBadge** (`src/components/features/charts/status-badge.tsx`): Status indicators reused across sections
- **ColorSwatch** (`src/components/features/supplies/color-swatch.tsx`): Thread color display in shopping cart

### Established Patterns
- **Server actions with requireAuth**: All mutations go through server actions with `requireAuth()` guard
- **Promise.all() for parallel queries**: Established in Phase 8 for Pattern Dive data fetching
- **nuqs for URL state**: Query params managed via nuqs with `parseAsStringLiteral`
- **Semantic design tokens**: bg-card, text-muted-foreground, etc. throughout the app
- **JetBrains Mono for hero stats**: Established in design system for numeric displays

### Integration Points
- **Dashboard route** (`src/app/(dashboard)/page.tsx`): Replace placeholder with tabbed dashboard
- **Shopping route** (`src/app/(dashboard)/shopping/page.tsx`): Replace simple ShoppingList with new ShoppingCart
- **Nav items** (`src/components/shell/nav-items.ts`): No nav changes needed — Dashboard and Shopping links already exist
- **Session data**: StitchSession model from Phase 8 provides "last stitched" dates, progress aggregations
- **Prisma schema**: No schema changes expected — all data models exist

</code_context>

<specifics>
## Specific Ideas

- Currently Stitching should sort by "most recently worked on" — uses session data `lastStitchedDate` from Phase 8
- Buried Treasures age is dynamic (oldest 10% of unstarted) to avoid empty section when charts are newly imported
- Shopping Cart localStorage should filter out deleted/completed project IDs on hydration to prevent stale selections
- "View all" links from dashboard sections should deep-link to Pattern Dive with appropriate tab/filter (e.g., "View all unstarted" → Pattern Dive Browse tab filtered to Unstarted status)
- Quick Add for "Log Stitches" reuses the existing LogSessionModal — no new modal needed

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 09-dashboards-shopping-cart*
*Context gathered: 2026-04-17*
