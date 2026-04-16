# Feature Landscape

**Domain:** Dashboards, session logging, and progress tracking for a cross-stitch project management app
**Researched:** 2026-04-16
**Confidence:** HIGH (existing DesignOS specs + comparable app analysis)

## Comparable Apps Studied

| App | Type | Key Insight |
|-----|------|------------|
| Ravelry | Knitting/crochet social platform | Queue + Notebook model; progress is a manual % slider; no session logging; stash-matching is the killer feature |
| StitchStreak | Cross-stitch tracker (iOS) | Session logging + 40+ badges/achievements; streak psychology; estimated completion dates from pace data |
| Cross Stitch Journal | Cross-stitch tracker (iOS) | Timer-based session logging; quarterly/semiannual goals; progress charts over time; dashboard showing project counts by stage |
| StitchPal | Cross-stitch tracker (multi-platform) | Simple daily progress reports (count + photo + time); negative stitch counts for frogging; predicted finish dates |
| Loopsy | Crochet/knitting companion | Auto-start timer with 20s grace period; session milestones; stash management; step-by-step pattern guides |
| Croyim | Crochet project manager | Component tracking for multi-part projects; auto-start time tracker; session history per project |
| MyCozyApp | Cross-stitch/embroidery | Pattern-level progress marking; celebration effects on completion; early stage app |
| Pattern Keeper | Cross-stitch chart app | Visual stitch tracking on pattern; percentage done with progress ring; focused on stitching, not collection management |

---

## Table Stakes

Features users expect from a craft tracker with dashboards and session logging. Missing any = the product feels incomplete.

| Feature | Why Expected | Complexity | Depends On | Notes |
|---------|-------------|------------|------------|-------|
| **Quick session logging (< 15 seconds)** | Every comparable app has this. It is the core action happening after every stitching session. StitchStreak, Cross Stitch Journal, StitchPal all optimize for speed. The user's current Notion flow is 8 steps -- must beat that. | Med | StitchSession model (new) | Date defaults today, project select (active projects only), stitch count required, optional photo + time. Modal accessed from header button + FAB on stats page + project detail. Design: LogSessionModal component. |
| **Auto-updating project progress** | StitchStreak, Cross Stitch Journal, StitchPal all calculate progress from sessions. Manual progress entry feels broken once logging exists. Pattern Keeper shows visual progress rings automatically. | Med | Session logging, Project.stitchesCompleted | Formula: (startingStitches + SUM(session stitchCounts)) / chart.stitchCount. Must recalculate on session create/edit/delete. This is a calculated field, not stored -- aligns with existing convention. |
| **Project detail Sessions tab** | Per-project session history is table stakes in Cross Stitch Journal and StitchPal. Users need "when did I last work on this?" and "how productive was I on this project?" | Low | Session logging | Mini stats summary at top (total stitches, sessions logged, avg per session, active since). Sortable table below. Design: ProjectSessionsTab component. Extends existing tabbed layout (Overview + Supplies + Sessions). |
| **Home dashboard with Currently Stitching** | Every craft app leads with "what you're working on now." Ravelry's notebook, StitchStreak's project list, Cross Stitch Journal's dashboard view all lead with active work. | Med | Existing gallery cards, session data for "last stitched" sort | Horizontal scrollable cards showing active WIPs with progress bars, sorted by most recently worked on. Design: MainDashboard component, "Currently Stitching" section. |
| **Collection stats at a glance** | Cross Stitch Journal shows project status charts. Every dashboard in comparable apps surfaces a quick pulse. Users with 500+ charts need the big picture numbers. | Low | Existing Project + Chart data | Total projects, WIP count, on hold, unstarted, finished, total stitches completed, most recent finish, largest project. No new models needed -- pure query aggregation. Design: CollectionStats sidebar in MainDashboard. |
| **Progress visualization (bars/percentages)** | StitchStreak uses progress rings, Pattern Keeper shows percentage done, Cross Stitch Journal has progress charts. Visual progress on active projects is universally expected. | Low | Session logging for accuracy | Already partially built in gallery cards (WIP footer shows progress bar). Accuracy improves once sessions feed stitchesCompleted. Also appears in progress buckets and project detail hero. |
| **Session history table (global)** | Cross Stitch Journal and StitchPal both show full session logs. Needed for data verification and "what have I been doing?" review. | Low | Session logging | Sortable by date (desc default). Columns: date, project, stitches, time, photo indicator. Click to edit. Design: SessionHistory component, Sessions tab in Stitching Stats. |
| **Shopping list with mark-as-acquired** | Existing v1.0 shopping list is per-project. An aggregated cross-project view with mark-as-acquired workflow is expected in any supply-tracking craft app. Ravelry's shopping list aggregates across projects. | Med-High | Existing supply junction tables | Design shows: Projects tab for selection, then Threads/Beads/Specialty/Fabric/Shopping List tabs. Tab badges show unfulfilled count. Mark-as-acquired updates quantityAcquired. |
| **Project Dashboard with progress overview** | Cross Stitch Journal shows project counts by status. StitchStreak shows individual project progress. A collection-wide active project view is expected once you have 4+ WIPs. | Med | Session logging for accurate percentages | Hero stats row (total WIPs, avg progress, closest to done, finished counts, total stitches). Progress Breakdown + Finished tabs. Design: ProjectDashboard component. |

---

## Differentiators

Features that set this product apart from comparable apps. Not universally expected, but high value for this specific user.

| Feature | Value Proposition | Complexity | Depends On | Notes |
|---------|-------------------|------------|------------|-------|
| **Buried Treasures section** | No comparable app surfaces "forgotten" unstarted charts. With 500+ charts, the "long tail" problem is real -- charts added months/years ago disappear. Showing the 5 oldest unstarted charts with "days in library" count creates rediscovery moments. This is the kind of insight Notion cannot provide. | Low | Existing Chart/Project data | Simple query: unstarted projects sorted by dateAdded ASC, limit 5. Includes "N days in library" badge. High emotional value, extremely low effort. |
| **Spotlight / "Rediscover This One"** | Random featured project with a rich hero-sized card. Gamification-lite: surprise element makes the dashboard feel alive each visit. No comparable cross-stitch app does this. Refreshable on demand. | Low | Existing data | Random selection from non-finished projects. Large featured card with cover image, designer, genres, status, CTA. Refresh button loads another random pick. Near-zero backend cost. |
| **Progress buckets visualization** | StitchStreak shows individual progress rings but no "collection-wide progress landscape." Grouping projects into buckets (Unstarted, Just Getting Started 0-25%, Making Progress 25-50%, Over Halfway 50-75%, Almost There 75-100%, Finished) with a stacked bar overview is a novel visualization. Makes 500+ projects comprehensible at one glance. | Med | Session logging for accurate progress | Collapsible accordion sections. The stacked bar at top is the hero -- single glance shows distribution. Sort within buckets. Design: ProjectDashboard with ProgressBucket components. |
| **Stitching calendar (month grid)** | Cross Stitch Journal has stats charts but not a month-grid calendar showing project names per day with color coding. StitchStreak tracks streaks but does not visualize the calendar. This is a GitHub-contributions-style view for stitching -- immediately shows activity patterns and gaps. | Med-High | Session logging | Monthly grid, each day cell shows project name + stitch count, color-coded by project. Month navigation arrows. Legend at bottom. Design: StitchingCalendar component. |
| **Monthly stitch bar chart with drill-down** | Bar chart showing monthly totals for the current year, clickable to see daily breakdown in a popover. Cross Stitch Journal has static charts but no drill-down interaction. The popover approach keeps the user in context. | Med | Session logging, Recharts library | Emerald bars, click to see daily breakdown popover. Design: MonthlyChart component. Requires adding Recharts dependency. |
| **Pattern Dive with multiple tabs** | Ravelry has separate queue/favorites/stash pages. Combining Browse + What's Next + Fabric Requirements + Storage View into one tabbed experience is cleaner navigation for a single-user app. Evolves the existing Charts page without breaking existing flows. | Med | Existing gallery, fabric data, storage locations | Browse tab reuses existing gallery components. What's Next surfaces kitting readiness + priority. Fabric Requirements shows cross-project fabric needs. Storage View groups by location. Design: PatternDive component. |
| **Start Next / What's Next recommendations** | Ravelry has a basic queue with manual ordering + deadline dates but no "readiness" scoring. Combining kitting percentage + want-to-start flag + preferred timing into a prioritized "What to work on next" list answers the eternal stitcher question: "I finished this project, what should I pick up?" | Med | Existing Project fields (wantToStartNext, preferredStartSeason) | Priority ranking + kitting readiness as sorting criteria. Already has wantToStartNext boolean and preferredStartSeason on Project model. Design: WhatsNextProject in PatternDive. |
| **Fabric Requirements cross-project view** | No comparable app shows "what fabric do I need across all projects with stash matching." Unique to a single-user supply management context. Helps answer: "I have this piece of fabric, what project fits it?" | Med | Fabric model, stitch dimensions on Chart | Table showing project name, stitch dimensions, calculated fabric sizes at 14ct/18ct/25ct/28ct. Emerald highlighting when matching stash fabric exists. Design: FabricRequirementRow in PatternDive. |
| **Shopping Cart with project selection workflow** | The existing shopping list is a flat per-project view. The design upgrades to a "shopping trip planner" -- select which projects you are shopping for, then see aggregated supply needs across selected projects with tabbed supply types. Copy-to-clipboard generates a text list for the store. Significantly more useful. | High | Existing supply junction tables | 6-tab design: Projects (selection), Threads, Beads, Specialty, Fabric, Shopping List (clipboard summary). Tab badges show unfulfilled counts. Per-project breakdown expandable within each supply tab. Design: ShoppingCart component. |
| **Estimated completion dates** | StitchStreak does this. Given average stitches per session and remaining stitches, calculate "at this pace, you'll finish on [date]." Makes progress tangible and psychologically rewarding. | Low | Session logging with pace data | Computed from average stitches/day over recent sessions and remaining stitch count. Display on project detail and dashboard cards. No storage needed -- pure calculation. |
| **Finished projects gallery with rich stats** | StitchStreak shows basic completion info. The design shows a rich finished project view with: start-to-finish duration, stitching days, average daily stitches, total colours, project size category, genre tags. This celebrates completions and provides retrospective value. | Med | Session data for stitching days + averages | Finished tab on Project Dashboard. Sortable by finish date, duration, stitch count, stitching days. Design: FinishedProject type with rich computed fields. |

---

## Anti-Features

Features to explicitly NOT build in this milestone.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Drag-and-drop dashboard widgets** | The requirements doc mentions "ideally drag-and-drop widgets" but this adds massive complexity (dnd-kit, persistent layout state, responsive breakpoints for widget sizing) with minimal value for a single user. Not one comparable craft app studied uses draggable widgets. Even Ravelry uses fixed layouts. | Fixed section order matching the DesignOS designs. The designs are well-considered -- follow them. Revisit only if user explicitly requests rearrangement after using v1.2. |
| **Built-in stitching timer** | Loopsy and Croyim auto-start timers. Cross Stitch Journal has a timer. But this user stitches on iPad apps (Markup R-XP, Saga) and logs afterward. A timer would add friction to a "log after the fact" workflow and would not work across devices. | Keep time as an optional manual entry field (hours + minutes) in the session log modal. The user already has their flow: finish on iPad, open web app, log stitches. |
| **Achievement/badge system** | StitchStreak has 40+ badges. Gamification is a proven differentiator. But it is explicitly a v1.3 feature (Goals & Motivation milestone per PROJECT.md). Building it now dilutes the dashboard + logging focus. | Defer to v1.3 where it lives alongside goals, personal bests, and Year in Review. The session data foundation built in v1.2 enables it later. |
| **Full statistics engine** | The comprehensive Stitching Stats page (hero stats, personal bests, monthly chart, calendar, supply stats) spans both milestones per the design section. The full stats dashboard is v1.3 scope. | v1.2 builds the StitchSession model and basic per-project stats. v1.3 builds the full 3-tab Stitching Stats page (Overview, Calendar, Sessions) with computed metrics, personal bests, and Year in Review. |
| **Social sharing / export cards** | Out of scope per PROJECT.md. No comparable craft tracker nails this either. | Defer to post-MVP. The Year in Review page (v1.3) is the natural vehicle. |
| **Offline session logging** | PWA service workers for offline logging would be nice for stitching without WiFi, but adds significant complexity (IndexedDB queue, sync resolution). | Defer. PWA is already installable; offline support is a distant future phase. |
| **Negative stitch counts / frogging** | StitchPal supports negative counts for "undo" scenarios. Edge case that complicates validation and progress calculations (what if progress goes negative?). | Allow session deletion and editing instead. If the user frogged, delete or edit the session. Simpler mental model. |
| **Auto-start timer on project open** | Croyim does this (20s grace period). Requires background process behavior beyond PWA capability, and does not match this user's cross-device workflow. | Not needed. The user stitches on iPad, not in this web app. |
| **Year in Review page** | Designed in the Stitching Sessions section. High value but requires the full statistics engine, monthly pace calculations, project timelines, top projects, and supply stats. | Defer to v1.3. The session data built in v1.2 is the prerequisite. |
| **Stitching Stats page (full 3-tab layout)** | The design shows Overview + Calendar + Sessions tabs as a standalone page. This is v1.3 scope per milestone planning. | v1.2 provides: session logging modal (accessible globally), project-level sessions tab, and basic session CRUD. The full stats page with its rich visualization is v1.3. |
| **Goals and scheduling** | GoalsSummary appears on the MainDashboard design, and PlansTab is designed for project detail. These are v1.3/v1.4 scope. | On the MainDashboard, render the Goals Summary section as a "Coming Soon" placeholder or omit it. The MainDashboard design has the section but the data model for goals does not exist yet. |
| **Series/collection management** | Deferred in PROJECT.md. PatternDive design shows series as a filter option, but the data model does not exist. | Omit the series filter from Pattern Dive. The filter bar can add it when the Series model ships. |

---

## Feature Dependencies

```
StitchSession model (NEW) ──────────────────┬──> Quick session logging (Log Session modal)
                                            ├──> Auto-updating project progress
                                            ├──> Project detail Sessions tab
                                            ├──> Stitching calendar (v1.2 stretch or v1.3)
                                            ├──> Monthly stitch bar chart (v1.2 stretch or v1.3)
                                            ├──> Estimated completion dates
                                            ├──> Finished projects stats (stitching days, avg daily)
                                            ├──> Progress bucket accuracy
                                            └──> Collection Stats accuracy (total stitches from sessions)

Existing gallery cards (v1.1) ──────────────┬──> Currently Stitching section (Main Dashboard)
                                            ├──> Start Next section (Main Dashboard)
                                            └──> Pattern Dive Browse tab (reuses gallery)

Existing supply junction tables (v1.0) ─────┬──> Shopping Cart upgrade (aggregated view)
                                            └──> Fabric Requirements view (fabric stash matching)

Existing Chart/Project/Fabric data ─────────┬──> Buried Treasures (oldest unstarted)
                                            ├──> Spotlight (random project)
                                            ├──> Collection Stats (aggregation queries)
                                            ├──> Progress Buckets (project grouping by %)
                                            ├──> Storage View (group by storageLocation)
                                            └──> Fabric Requirements (stitch dims + fabric stash)

Session logging + accurate progress ────────> Progress Buckets need accurate %
                                            > Finished project stats need session history
                                            > "Last stitched" sort needs session dates
```

**Critical path:** The StitchSession model + session CRUD is the single new data model for v1.2. Nearly every new feature either directly depends on it or benefits from the accurate progress data it enables. Build it first.

**Secondary critical path:** The Main Dashboard and Project Dashboard are the headline features of v1.2. They depend on session data for full functionality but can render with existing data (just with less accurate progress info).

---

## MVP Recommendation

### Must Build (v1.2 core)

1. **StitchSession model + session logging modal** -- The foundation. Everything else depends on accurate session data. Build the Prisma model, CRUD server actions, and the LogSessionModal first.
2. **Auto-updating project progress** -- Sessions without progress calculation are meaningless. Wire session sum to stitchesCompleted immediately after session logging ships.
3. **Project detail Sessions tab** -- Per-project session history. Natural extension of existing tabbed layout (adds Sessions alongside Overview + Supplies).
4. **Main Dashboard** -- Currently Stitching, Start Next, Buried Treasures, Spotlight, Collection Stats. Replaces current landing page with a proper home experience. This is the most visible user-facing change.
5. **Project Dashboard** -- Progress buckets with hero stats + Finished projects tab. The "collection progress landscape" that no comparable app provides.
6. **Shopping Cart upgrade** -- Project selection workflow, tabbed supply types, mark-as-acquired. Significant UX upgrade over existing flat shopping list.
7. **Pattern Dive** -- Evolves Charts page with Browse (existing gallery), What's Next, Fabric Requirements, Storage View tabs. Browse tab is mostly reuse; new tabs add planning value.

### Stretch (v1.2 if time allows)

8. **Monthly stitch bar chart** -- Requires Recharts. Could be a standalone card on the Main Dashboard or deferred to the full Stats page in v1.3.
9. **Stitching calendar** -- Beautiful but complex UI. Could ship as part of v1.2 or as the first piece of v1.3's Stats page.
10. **Estimated completion dates** -- Low complexity, high delight. Can add to project detail and dashboard cards once session data exists.

### Defer to v1.3 (session data foundation built in v1.2)

- Full Stitching Stats page (3-tab layout: Overview, Calendar, Sessions)
- Personal bests (most stitches in a day, longest streak)
- Year in Review (yearly summary with hero stats, project timeline, highlights)
- Goal tracking and milestone targets
- Achievement/badge system
- All computed statistics beyond basic project-level metrics

---

## Scope Clarification: v1.2 vs v1.3 Boundary

The DesignOS has two design sections relevant to this milestone:

1. **Dashboards & Views** (`product-plan/sections/dashboards-and-views/`) -- Main Dashboard, Pattern Dive, Project Dashboard, Shopping Cart. **These are all v1.2 scope.**

2. **Stitching Sessions & Statistics** (`product-plan/sections/stitching-sessions-and-statistics/`) -- This section spans BOTH milestones:
   - **v1.2 scope:** StitchSession model, LogSessionModal, ProjectSessionsTab, session CRUD server actions
   - **v1.3 scope:** StitchingDashboard (full 3-tab stats page), HeroStats, PersonalBests, MonthlyChart, StitchingCalendar, StatCards, SessionHistory (global), YearInReview

The nav sidebar design shows "Sessions" and "Stats" as separate entries. In v1.2, session logging exists as a globally-accessible modal + per-project Sessions tab. The full Stats page with its Overview/Calendar/Sessions tabs is v1.3.

**Goals are v1.4 scope:** The MainDashboard design includes a "Goals Summary" section with upcoming milestones and planned starts. The data model for goals does not exist yet (no Goal/Milestone tables in Prisma). Either omit this section from the v1.2 Main Dashboard or render a tasteful placeholder.

---

## Sources

- [StitchStreak](https://mwm.ai/apps/stitchstreak/6759460037) -- Badge/achievement system, session logging UX, streak psychology, estimated completion
- [Cross Stitch Journal](https://apps.apple.com/us/app/cross-stitch-journal/id6443886471) -- Timer-based logging, quarterly goals, progress charts, dashboard by status
- [StitchPal](https://apps.apple.com/us/app/stitchpal/id1550536005) -- Daily progress reports, negative stitch counts, predicted finish dates
- [Ravelry](https://www.ravelry.com/tour/getting-started) -- Queue management, stash organization, project notebook, deadline tracking
- [Ravelry Queue Management](https://www.kinoknits.com/blog/ravelry-queue-management) -- Queue features, deadline tracking, project ordering
- [Loopsy](https://getloopsy.com/) -- Auto-start timer, session milestones, stash management
- [Croyim](https://croyim.com/) -- Component tracking, auto-start time tracker, session history
- [MyCozyApp](https://mycozyapp.com/) -- Pattern-level progress, completion celebrations
- [Pattern Keeper](https://patternkeeper.app/) -- Visual stitch tracking, progress rings
- [Lord Libidan Best Apps for Cross Stitchers](https://lordlibidan.com/the-best-apps-for-cross-stitchers/) -- Ecosystem overview
- [Sirious Stitches Inventory Tracking](https://sirithre.com/inventory-tracking-cross-stitch-patterns-wips-and-materials/) -- Cross-stitch inventory management patterns
- DesignOS: `product-plan/sections/dashboards-and-views/` -- Main Dashboard, Pattern Dive, Project Dashboard, Shopping Cart designs + types
- DesignOS: `product-plan/sections/stitching-sessions-and-statistics/` -- Session logging, stats, calendar, Year in Review designs + types

---
*Feature research for: Cross-stitch project management -- v1.2 Track & Measure*
*Researched: 2026-04-16*
