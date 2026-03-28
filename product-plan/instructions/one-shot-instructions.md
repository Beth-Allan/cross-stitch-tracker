# Cross Stitch Tracker — Full Implementation Instructions

All 8 milestones combined into a single document for one-shot implementation.

---

## About This Handoff

**What you're receiving:**
- Finished UI designs (React components with full styling)
- Product requirements and user flow specifications
- Design system tokens (colors, typography)
- Sample data showing the shape of data components expect
- Test specs focused on user-facing behavior

**Your job:**
- Integrate these components into your application
- Wire up callback props to your routing and business logic
- Replace sample data with real data from your backend
- Implement loading, error, and empty states

The components are props-based — they accept data and fire callbacks. How you architect the backend, data layer, and business logic is up to you.

---

## Product Overview

**Cross Stitch Tracker** is a personal cross stitch project management application that replaces a complex Notion-based system. It tracks charts and projects through their entire lifecycle — from acquisition through kitting, stitching, completion, and finishing — along with supply inventory, stitching statistics, and auto-generated shopping lists.

### Problems Solved
1. **Notion buckles under complex data** — ~50+ fields per project, multiple related databases, slow formulas
2. **Supply management is tedious** — manual data entry for every supply link; pre-seeded DMC catalog fixes this
3. **Statistics are hard to calculate** — comprehensive stitching stats need native aggregation
4. **No customization or visual appeal** — purpose-built gallery/list/table views with rich filtering
5. **No easy sharing** — built-in summary pages and recaps

### Design System
- **Colours:** emerald (primary/navigation/progress), amber (secondary/actions/CTAs), stone (neutral)
- **Typography:** Fraunces (headings), Source Sans 3 (body), JetBrains Mono (hero stats only)
- **Colour language:** emerald = structure and progress, amber = actions and interactive moments

### Navigation
Sidebar + top bar layout. Sidebar items: Dashboard, Charts, Supplies, Stats, Shopping, Settings. Top bar: search, "Log Stitches" button, "Add Chart" button, user menu.

---

## Milestone 1: Application Shell

### Goal
Set up design tokens and the application shell with sidebar navigation, top bar, and responsive behaviour.

### Components
- `AppShell` — root layout wrapping sidebar + top bar + content area
- `MainNav` — sidebar navigation with collapsible icon-only mode
- `TopBar` — top bar with search, quick actions, user menu
- `UserMenu` — avatar dropdown with profile and logout

### Key Requirements
- Configure design tokens: emerald, amber, stone; Fraunces, Source Sans 3, JetBrains Mono
- 6 nav items: Dashboard, Charts, Supplies, Stats, Shopping, Settings
- Sidebar: full on desktop (collapsible to icon-only), collapsed on tablet, drawer on mobile
- Top bar: search input, "Log Stitches" (amber solid), "Add Chart" (amber outline), user menu
- User menu: name, avatar, logout
- Collapsed state persists across sessions
- Light and dark mode

### Done When
- [ ] Tokens configured, shell renders on all pages, nav routes correctly, responsive across breakpoints, dark mode works

---

## Milestone 2: Project Management

### Goal
Build core chart and project CRUD — the backbone of the app.

### Components
- `ChartGallery` — main gallery with filter bar and view toggle (gallery/list/table)
- `ChartDetail` — detail page with tabs: Overview, Supplies (placeholder), Sessions (placeholder), Files
- `ChartAddForm` — full-page add form with tabbed sections (Basic Info, Details)
- `ChartEditModal` — tabbed modal for editing
- `StatusBadge`, `SizeBadge` — colour-coded status and size pills

### Key Requirements
- Gallery/list/table view toggle with filter bar (status, size, designer, genre)
- Dismissible filter chips with "Clear all"
- Full chart + project CRUD with ~50 fields
- Inline designer/genre/series creation from within forms
- 7 statuses: Unstarted, Kitting, Kitted, In Progress, On Hold, Finished, FFO
- Auto-calculated: size category (Mini < 1K, Small 1-5K, Medium 5-25K, Large 25-50K, BAP 50K+), progress %, kitting status
- SAL support: multi-part charts with part numbers
- File uploads for digital working copies
- Delete with confirmation dialog

### Key Callbacks
- `onSaveChart`, `onDeleteChart`, `onUpdateProjectStatus`, `onViewChart`
- `onFilterChange`, `onViewModeChange`
- `onUploadFile`, `onAddSALPart`

### Done When
- [ ] Gallery renders with 3 view modes, filtering works, CRUD complete, auto-calculations correct, responsive, dark mode

---

## Milestone 3: Supply Tracking & Shopping

### Goal
Build supply catalog and project-supply linking with auto-calculated kitting status.

### Components
- `SupplyCatalog` — three-tab catalog (Thread, Beads, Specialty) with grid and table views
- `SupplyDetailModal` — supply detail with colour swatch and project usage
- `ProjectSuppliesTab` — Chart Detail embed with kitting progress and supply lists
- `BulkSupplyEditor` — full-page editor for bulk supply entry

### Key Requirements
- Three supply types: thread, bead, specialty — each with swatch grid and table view
- Pre-seeded DMC catalog (~500 colours) for search-and-select
- Brand management with inline "Add new" (DMC, Mill Hill, Kreinik, etc.)
- Per-supply quantities: required, acquired, per-colour stitch count, inline editing
- Auto-calculated kitting status: overall %, plain-language summary of needs
- Colour swatches as small circles from hex values
- Fulfillment colours: emerald (fulfilled), amber (partial), stone (not started)
- Cross-reference: see other projects using the same supply
- Bulk editor for rapid kitting data entry

### Key Callbacks
- `onAddThread`, `onEditThread`, `onDeleteThread` (and equivalents for beads/specialty)
- `onAddProjectThread`, `onUpdateProjectThread`, `onRemoveProjectThread`
- `onOpenBulkEditor`, `onAddBrand`

### Done When
- [ ] Catalog renders with 3 tabs, grid/table toggle, supplies linkable to projects, kitting auto-calculates, bulk editor works

---

## Milestone 4: Stitching Sessions & Statistics

### Goal
Build session logging and the comprehensive statistics engine.

### Components
- `StitchingDashboard` — four-tab dashboard: Overview, Calendar, Sessions, Year in Review
- `ProjectSessionsTab` — Chart Detail embed with per-project sessions
- `LogSessionModal` — compact create/edit session modal
- `HeroStats`, `PersonalBests`, `MonthlyChart`, `StitchingCalendar`, `SessionHistory`, `YearInReview`

### Key Requirements
- Log session: date, project (active only), stitch count, optional photo, optional time
- Auto-update project progress (stitchesCompleted, progressPercent, stitchesRemaining) on save
- Hero stats: today, week, month, year — JetBrains Mono numbers
- Personal bests: achievement-styled cards with emerald glow and trophy icon
- Monthly bar chart: emerald bars, click-to-drill-down with daily breakdown popover
- Calendar: monthly grid with project name and stitch count per day, month navigation
- Session history: sortable table (date, project, stitches, time, photo indicator)
- Year in Review: annual retrospective with year selector, project timeline, top projects, highlights
- Session editing: click row to reopen modal pre-filled; delete available
- Chart Detail Sessions tab: per-project sessions with mini stats summary

### Key Callbacks
- `onSaveSession`, `onDeleteSession`, `onUploadPhoto`
- `onRequestDailyBreakdown`, `onCalendarMonthChange`
- `onYearChange`, `onNavigateToProject`

### Done When
- [ ] Session logging works, progress auto-updates, all 4 dashboard tabs render, calendar navigates, year in review works

---

## Milestone 5: Fabric, Series & Reference Data

### Goal
Build the reference data layer — fabric, brands, designers, series, storage locations.

### Components
- `FabricCatalog` — fabric table with Brands tab
- `FabricDetail` — detail view with size calculator
- `DesignerPage` — designer table with sort and filter
- `DesignerDetailModal` — stats + chart list modal
- `SeriesList` — card grid with completion bars
- `SeriesDetail` — member management
- `StorageLocationList`, `StorageLocationDetail` — location CRUD

### Key Requirements
- Fabric catalog: filterable table (brand, count, type, colour family, need-to-buy)
- Fabric size calculator: required inches = (stitch dimension / count) + 6
- Fit indicator: green check if fabric >= required, red X if not
- Fabric brands: CRUD table, clicking brand filters catalog
- Designer page: sortable table with computed stats (chart count, projects stitched, top genre)
- Designer detail modal: stats row + sortable chart list
- Series: card grid with emerald completion bars, add/remove charts, inline rename
- Storage locations: simple CRUD list with counts, click to see assigned items
- Edit icons on hover (not always visible)

### Key Callbacks
- `onSaveFabric`, `onDeleteFabric`, `onSaveFabricBrand`, `onCalculateSizeFits`
- `onEditDesigner`, `onDeleteDesigner`, `onNavigateToChart`
- `onRenameSeries`, `onAddChart`, `onRemoveChart`
- `onAddLocation`, `onRenameLocation`, `onDeleteLocation`

### Done When
- [ ] Fabric CRUD with size calculator, designer page with stats, series with completion tracking, storage locations work

---

## Milestone 6: Gallery Cards & Advanced Filtering

### Goal
Build the shared component library for status-specific gallery cards and configurable advanced filtering.

### Components
- `GalleryView` — top-level wrapper: filter bar + view mode + content
- `GalleryGrid` — responsive card grid
- `GalleryCard` — dispatches to WIP/Unstarted/Finished layout based on statusGroup
- `ListView` — compact row list
- `TableView` — sortable data table
- `AdvancedFilterBar` — configurable filter bar with chips

### Key Requirements
- **3 card variants:**
  - WIP (In Progress, On Hold): progress bar, last stitched, total time, latest photo or gradient
  - Unstarted (Unstarted, Kitting, Kitted): kitting checklist dots, size badge, "Up Next" animated pill
  - Finished (Finished, FFO): completion date, total time, final photo, celebration border (violet/rose)
- Shared elements: cover image or gradient placeholder with scissors motif, project name (clickable), designer, genre tags (3 + "+N"), status badge
- Gradient colours: stone, amber, emerald, sky, orange, violet, rose per status
- 3 view modes: gallery grid (1/2/3-4 col responsive), list, table
- Advanced filter bar with 12 configurable dimensions plus text search
- Dismissible chips, "Clear all," auto-show at 8+ items
- Only project name is clickable (not whole card)
- **Retrofit Charts page (Milestone 2) to use these components**

### Key Callbacks
- `onNavigateToProject`, `onFilterChange`, `onRemoveFilter`, `onClearAllFilters`, `onViewModeChange`

### Done When
- [ ] 3 card variants render correctly, filter bar works with configurable dimensions, Charts page retrofitted

---

## Milestone 7: Dashboards & Views

### Goal
Build the four dashboard pages that tie together all data into purpose-built views.

### Components
- `MainDashboard` — home screen with stacked sections
- `PatternDive` — library browser (4 tabs: Browse, What's Next, Fabric Requirements, Storage View)
- `ProjectDashboard` — active work tracker (2 tabs: In Progress, Finished)
- `ShoppingCart` — supply shopping (6 tabs: Threads, Beads, Specialty, Fabric, Summary + project selector)

### Key Requirements

**Main Dashboard:**
- Recently Added row (last 10, horizontal scroll), Currently Stitching (WIP cards by recency), Buried Treasures (5 oldest unstarted), Rediscover spotlight (random project), Collection Stats, Goals Summary teaser, Quick Actions
- No tabs; vertical stack with 48px+ spacing; Fraunces headings with emerald accent underline

**Pattern Dive:**
- Browse tab reuses GalleryGrid + AdvancedFilterBar (Milestone 6)
- What's Next: kitted/flagged projects by priority
- Fabric Requirements: calculated sizes at 14ct/18ct/25ct/28ct, sortable, matching fabric
- Storage View: collapsible location groups

**Project Dashboard:**
- In Progress: hero stats, progress buckets (0-25/25-50/50-75/75-100%), sort options
- Finished: hero stats, gallery with rich stats (start-to-finish days, avg daily stitches, colour count)

**Shopping Cart:**
- Sticky "Shopping for" project selector
- Thread/bead/specialty tabs: grouped by supply, combined quantities, expandable project breakdown
- Fabric tab: need-to-buy + unassigned projects with stash matching
- Summary tab: cross-project overview, "Copy to clipboard" text list
- Tab count badges, "Mark as acquired" on hover

### Key Callbacks
- `onQuickAdd`, `onNavigateToProject`, `onViewSpotlight`, `onRefreshSpotlight`
- `onFilterChange`, `onViewModeChange`, `onAssignFabric`
- `onMarkAcquired`, `onMarkFabricAcquired`, `onClearCompleted`

### Done When
- [ ] All 4 dashboards render with correct data, Main Dashboard is the landing page, Shopping Cart has 6 functional tabs, responsive, dark mode

---

## Milestone 8: Goals & Plans

### Goal
Build goal-setting, planning, rotation management, and the achievement trophy case.

### Components
- `GoalsAndPlans` — four-tab page (Goals, Plans, Rotations, Achievements)
- `GoalsTab`, `PlansTab`, `RotationsTab`, `AchievementsTab` — individual tab content
- `ProjectGoalsPanel` — Chart Detail embed for per-project goals/plans

### Key Requirements

**Goals:**
- 9 goal types: milestone, frequency, deadline, session count, volume, consistency, project completion, project start, manual
- 6 periods: one-time, daily, weekly, monthly, quarterly, yearly
- Auto-renew toggle; "Continue this goal?" nudge for completed non-recurring
- Progress auto-updates from sessions; manual goals show checkbox
- Period badges: daily=sky, weekly=emerald, monthly=amber, quarterly=violet, yearly=rose
- Status colours: active=emerald, completed=violet, expired=stone, paused=amber

**Plans:**
- 4 types: start date, recurring schedule, deadline, seasonal focus
- Timeline view, chronological, with project thumbnails

**Rotations:**
- 6 styles: Round Robin, Focus+Rotate, Daily Assignment, Milestone, Random, Seasonal
- Hybrid per-project triggers (time, stitches, percentage, sessions)
- Active rotation: progress ring, queue with drag-to-reorder, pause/skip/complete turn
- One active rotation at a time

**Achievements:**
- Pre-defined auto-tracked trophies across 6 categories
- Unlocked: highlighted with date; locked: dimmed with progress bar
- Toast notification on unlock
- Browse-only (no manual creation)

**Project Goals Panel:**
- Embeds into Chart Detail; shows goals, plans, rotation membership for that project
- Quick-add inline creation

### Key Callbacks
- `onCreateGoal`, `onEditGoal`, `onDeleteGoal`, `onTogglePause`, `onRenewGoal`, `onCheckOffGoal`
- `onCreatePlan`, `onEditPlan`, `onDeletePlan`, `onUpdatePlanStatus`
- `onCreateRotation`, `onEditRotation`, `onDeleteRotation`, `onSkipTurn`, `onCompleteTurn`, `onReorderProjects`

### Done When
- [ ] 4 tabs work, all 9 goal types supported, rotations with 6 styles and hybrid triggers, trophy case renders, ProjectGoalsPanel embeds into Chart Detail, toasts on achievement unlock, responsive, dark mode
