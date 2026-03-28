# Feature Research

**Domain:** Cross-stitch project management and craft inventory tracking
**Researched:** 2026-03-28
**Confidence:** MEDIUM-HIGH

## Competitor Landscape Summary

The cross-stitch app ecosystem is fragmented. No single app does what this project aims to do. Apps fall into distinct categories:

1. **Pattern viewers / markup apps** (Pattern Keeper, Markup R-XP, Saga, MyCozyApp) -- focus on viewing charts and marking stitches on-screen while stitching. Strong at in-session use, weak at collection management.
2. **Inventory trackers** (X-Stitch/XStitch Plus, Thread Stash, Cross Stitch Thread Organizer) -- track thread/supply collections. Pre-loaded DMC catalogs. Shopping lists. Weak at project lifecycle and statistics.
3. **Journal/progress apps** (Cross Stitch Journal, StitchPal) -- log sessions, track progress, show statistics and streaks. Weak at supply management and collection browsing.
4. **General craft platforms** (Ravelry for knitting/crochet) -- the gold standard for craft project management with stash tracking, project linking, community. Nothing equivalent exists for cross-stitch.

**The gap this project fills:** A unified system combining collection management + supply tracking + session logging + statistics + dashboards. This is the "Ravelry for cross-stitch" but personal-first rather than community-first.

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete or worse than existing tools.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Project CRUD with rich metadata | Every tracker does this; it's the core purpose | MEDIUM | ~50 fields per project is ambitious but necessary. Batch entry UX matters. |
| Status tracking (lifecycle stages) | Cross Stitch Journal, XStitch Plus, and Notion all have this | LOW | 7 statuses (Unstarted through FFO). Must feel natural, not bureaucratic. |
| Cover photo / project images | StitchPal, XStitch Plus (5 photos), Cross Stitch Journal all support photos | LOW | Min 1 cover photo per project. Progress photos handled via sessions. |
| Digital file storage (PDF/chart upload) | Users store charts digitally; Markup R-XP and Pattern Keeper revolve around this | MEDIUM | Cloudflare R2 integration. Must handle PDF and image formats. |
| Pre-seeded DMC thread catalog | XStitch Plus, X-Stitch, Thread Stash, My Cross Stitch Tracker all pre-load DMC | LOW | ~500 colors with hex swatches. Major UX win -- this is a pain point in every manual system. |
| Thread/supply inventory per project | XStitch Plus, X-Stitch all track per-project supplies | MEDIUM | Three junction tables (thread, bead, specialty). Quantity required vs acquired. |
| Shopping list (auto-generated) | X-Stitch, XStitch Plus, Thread Stash all offer shopping lists | MEDIUM | Grouped by project. Filter by supply type. Show what's still needed. |
| Stitch session logging | Cross Stitch Journal, StitchPal both center on this | LOW | Date, project, count, optional photo, optional time. Must be fast (< 30 seconds). |
| Progress tracking (% complete) | Every progress app shows this; it's the core feedback loop | LOW | Auto-calculated from sessions vs total stitch count. |
| Basic statistics (stitches per day/week/month/year) | Cross Stitch Journal shows quarterly/semiannual stats; StitchPal tracks daily | MEDIUM | Aggregation queries. Bar charts for monthly totals. |
| Designer tracking | Standard metadata in all chart management systems | LOW | CRUD + link to projects. Browse by designer. |
| Gallery/list/table views | Ravelry, Airtable, Notion all offer multiple view modes | MEDIUM | Gallery cards are the primary browse mode. Table for power users. |
| Filtering and sorting | Every database tool supports this; stitchers filter by status, size, designer | MEDIUM | Multi-dimension filter bar with dismissible chips. Must feel fast. |
| Basic responsive design (desktop + mobile) | All competitor apps work on phones; web app must too | MEDIUM | Mac browser primary, iPhone secondary. Not a native app. |
| PWA installable | Users expect app-like experience on phone home screen | LOW | Manifest + icons. Offline deferred to post-MVP. |
| Authentication | Protecting personal data and uploaded files | LOW | Single-user Auth.js setup. |

### Differentiators (Competitive Advantage)

Features that set the product apart. These are where existing apps fall short and this project can win.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Comprehensive statistics engine (Year in Review, streaks, records) | Cross Stitch Journal has basic streaks; no app offers the depth planned here (8 stat sections, yearly summaries, completion brackets, supply stats) | HIGH | This is the core differentiator. Stitchers love data. No competitor comes close to the planned stats depth. |
| Auto-calculated kitting status with progress indicator | No competitor tracks kitting as a composite calculated state; they treat it as a manual status | HIGH | 8+ boolean conditions across multiple relations. "80% kitted -- needs 3 DMC colors and fabric" is unique. |
| SAL support (multi-part charts, evolving supply needs) | Printable SAL trackers exist on Etsy; no app handles this natively. Stitch counts and supply lists grow over time. | MEDIUM | Part tracking, cumulative stitch counts, growing supply lists. Unique among apps. |
| Series/collection management with completion tracking | No cross-stitch app tracks "4 of 12 Mini Bottles complete" -- this is a book-tracker pattern applied to crafts | LOW | Series entity with member projects. Completion percentage. |
| Multiple dashboard contexts (Main, Pattern Dive, Project, Shopping Cart) | Competitors have one view; this project has purpose-built dashboards for different tasks | HIGH | Each dashboard is a different "lens" on the same data. Pattern Dive alone is a killer feature. |
| Gallery cards with status-specific layouts | No competitor changes card layout based on project status (WIP shows progress, Unstarted shows kitting needs, Finished shows completion photo) | MEDIUM | Three card variants. Contextual information density. |
| Goal tracking with rotation management | Cross Stitch Journal has basic goals; no app offers rotation systems (Focus+Rotate, Milestone, Round Robin, etc.) | HIGH | Multiple rotation styles. This is deeply niche and valuable. |
| Achievement/trophy system | Cross Stitch Journal has streaks; no cross-stitch app has a proper achievement system with auto-tracked milestones | MEDIUM | Gamification that rewards consistent stitching. Streaks, records, milestone trophies. |
| Fabric size calculator integrated with projects | XStitch Plus has a standalone calculator; this project integrates it with project data and fabric inventory | LOW | Given stitch dimensions and fabric count, calculate required fabric size. Match to available fabric. |
| Draggable widget dashboards | No competitor offers customizable dashboard layouts | HIGH | dnd-kit integration. User chooses and arranges widgets. Aspirational but high-impact. |
| Stitch calendar view | Cross Stitch Journal shows some timeline data; a proper calendar (like GitHub contribution graph) is rare | MEDIUM | Monthly grid showing daily stitching activity by project. Visual and motivating. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems. Deliberately NOT building these.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Pattern viewer / markup tool | "One app to rule them all" -- combines viewing with management | Markup R-XP and Pattern Keeper are excellent at this and have years of development. Building a competitor is a massive scope expansion with little ROI. Users already have preferred markup apps. | Store which app a chart is loaded into. Link to digital working copy PDF for reference. Let specialized apps do what they do best. |
| Pattern creation / photo conversion | Stitchly and MacStitch handle this. Users might ask. | Entirely different product category. Pattern creation requires sophisticated image processing, thread color matching algorithms, and stitch type support. | Out of scope. This is a management app, not a design tool. |
| Social media direct posting | "Share my stats to Instagram" | API integrations are fragile, platform-dependent, and require ongoing maintenance. Instagram API is particularly restrictive. | Design stats pages and Year in Review to be screenshot-friendly. Social share card generation deferred to post-MVP. |
| Real-time multi-user collaboration | "My stitching group wants to use this" | Adds enormous complexity (real-time sync, conflict resolution, permissions). Single-user is the stated priority. | Multi-user aware architecture now. Actual multi-user deferred to post-MVP. |
| Thread stash inventory (total owned, not per-project) | Power users want "I own 5 skeins of DMC 310 total" | Adds a second inventory dimension that complicates the supply model and UI. Per-project tracking is the core need. | Architecture supports adding this later. Explicit future extension, not MVP. |
| Offline-first PWA with service workers | "Log stitches without internet" | Service worker complexity, sync conflict resolution, and cache invalidation are significant engineering effort | Basic PWA (installable, home screen) in MVP. Offline deferred to Phase 5+. |
| Automated rotation schedule generator | "Tell me what to stitch next based on my goals" | Requires understanding user preferences, project priorities, and scheduling constraints. AI-level complexity for marginal value. | Manual rotation management with multiple rotation styles. User sets the plan, app tracks adherence. |
| Import from Notion | "Migrate my existing data" | Notion export format is complex and user-specific. The user is starting fresh with 500+ charts -- data entry is inevitable regardless. | No import in MVP. User adds charts progressively. Consider import/export in post-MVP. |
| Barcode scanning for supplies | "Scan a DMC skein to add it" | Requires camera access, barcode database, and DMC doesn't standardize barcodes across retailers | Pre-seeded catalog with search-and-select is faster than scanning for most use cases. |

## Feature Dependencies

```
[Auth] (foundation)
    |
    v
[Project CRUD] (core entity)
    |
    +----> [Designer CRUD] (required for project metadata)
    +----> [Genre management] (required for project tagging)
    +----> [Status system] (required for project lifecycle)
    +----> [Digital file storage] (R2 integration for chart PDFs)
    |
    v
[Supply databases] (thread, bead, specialty)
    |
    +----> [DMC catalog pre-seed] (required for usable thread database)
    +----> [Project-supply linking] (junction tables with quantities)
    |          |
    |          v
    |      [Shopping list] (auto-generated from unfulfilled supplies)
    |      [Kitting status calculation] (composite of supply + other conditions)
    |
    v
[Stitch session logging] (requires projects to exist)
    |
    +----> [Progress tracking] (auto-updated from sessions)
    +----> [Statistics engine] (aggregates session data)
    |          |
    |          +----> [Stitch calendar] (visualizes session data by day)
    |          +----> [Bar charts] (monthly stitch totals)
    |          +----> [Year in Review] (yearly stat summaries)
    |
    v
[Gallery cards] (requires projects with images, statuses, progress)
    |
    +----> [Filter bar] (reusable across all browsing contexts)
    +----> [Multiple view modes] (gallery/list/table)
    |
    v
[Dashboards] (compose gallery cards, stats, filters)
    |
    +----> [Main Dashboard] (recently added, currently stitching, spotlight)
    +----> [Pattern Dive] (deep library browser)
    +----> [Project Dashboard] (active work tracking)
    +----> [Shopping Cart dashboard] (aggregated supply needs)
    |
    v
[Fabric CRUD] (independent entity, links to projects)
[Series management] (independent entity, groups projects)
[Storage locations] (simple metadata on projects)
    |
    v
[Goals & Plans] (requires projects, sessions, progress)
    |
    +----> [Rotation management] (multiple rotation styles)
    +----> [Achievement system] (auto-tracked milestones and streaks)
    +----> [Scheduling] (start dates, recurring days, seasonal focus)
```

### Dependency Notes

- **Project CRUD is the foundation for everything** -- nothing else works without projects. Must be solid before building supply or session features.
- **Supply databases must exist before project-supply linking** -- DMC pre-seed is the first thing to load.
- **Session logging requires projects** -- but not supplies. Sessions and supplies are independent feature tracks that can be built in parallel after projects exist.
- **Statistics engine requires session data** -- needs enough sessions logged to be meaningful. Statistics queries should be performant even with years of data.
- **Gallery cards and dashboards are presentation layers** -- they compose data from projects, supplies, sessions, and stats. They come last but deliver the most visible value.
- **Goals/plans/rotations are the capstone** -- they require all other systems to be working. Most complex behavioral features, least critical for day-one use.

## MVP Definition

### Launch With (v1)

Minimum viable product -- what's needed to validate that this is better than Notion on day one.

- [ ] Auth (single-user) -- protect the data
- [ ] Project CRUD with full metadata -- the core entity with ~50 fields
- [ ] Designer CRUD and linking -- essential project metadata
- [ ] Genre management (taggable) -- essential for filtering
- [ ] Status system (7 statuses) -- project lifecycle tracking
- [ ] Digital file upload/storage -- chart PDFs to R2
- [ ] Size category auto-calculation -- derived from stitch count
- [ ] SAL support (multi-part charts) -- unique need not served elsewhere
- [ ] Basic gallery/list/table views -- browse the collection
- [ ] Basic filtering and sorting -- find projects quickly
- [ ] Responsive layout (Mac + iPhone) -- usable on both devices
- [ ] PWA installable -- home screen icon on iPhone

### Add After Validation (v1.x)

Features to add once core project management is working and charts are being entered.

- [ ] DMC thread catalog (pre-seeded ~500 colors) -- enables supply tracking
- [ ] Bead and specialty item databases -- complete the supply ecosystem
- [ ] Project-supply linking with quantities -- the supply management system
- [ ] Auto-generated shopping list -- the #1 pain point from Notion
- [ ] Kitting status auto-calculation -- the key composite status
- [ ] Stitch session logging (quick-log flow) -- daily use feature
- [ ] Progress tracking (auto-update from sessions) -- the feedback loop
- [ ] Basic statistics (daily/weekly/monthly/yearly) -- motivational data
- [ ] Monthly stitch bar charts -- visual statistics
- [ ] Stitch calendar view -- daily activity visualization
- [ ] Session history table -- raw data access

### Future Consideration (v2+)

Features to defer until the core is solid and daily use is established.

- [ ] Comprehensive statistics engine (Year in Review, 8 stat sections) -- high value but high complexity
- [ ] Fabric CRUD with brand management and size calculator -- useful but not blocking
- [ ] Series/collection management with completion tracking -- nice organizational feature
- [ ] Storage location management -- simple metadata, low priority
- [ ] Full dashboard system (Main, Pattern Dive, Project, Shopping Cart) -- the vision, but needs all other systems first
- [ ] Custom gallery cards by status (3 layouts) -- polish feature
- [ ] Draggable widget dashboards -- aspirational, high complexity
- [ ] Goal tracking (project-specific and global) -- capstone feature
- [ ] Rotation management (6 styles) -- deeply niche, high value for power users
- [ ] Achievement trophy case -- gamification layer
- [ ] Scheduling plans -- recurring days, seasonal focus

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Project CRUD with rich metadata | HIGH | HIGH | P1 |
| Status system (7 statuses) | HIGH | LOW | P1 |
| Designer/genre management | HIGH | LOW | P1 |
| Digital file upload (R2) | HIGH | MEDIUM | P1 |
| Gallery/list/table views | HIGH | MEDIUM | P1 |
| Filtering and sorting | HIGH | MEDIUM | P1 |
| DMC catalog pre-seed | HIGH | LOW | P1 |
| Project-supply linking | HIGH | MEDIUM | P1 |
| Shopping list (auto-generated) | HIGH | MEDIUM | P1 |
| Stitch session logging | HIGH | LOW | P1 |
| Progress tracking | HIGH | LOW | P1 |
| Kitting status calculation | HIGH | HIGH | P1 |
| Basic statistics | HIGH | MEDIUM | P2 |
| Monthly bar charts | MEDIUM | LOW | P2 |
| Stitch calendar | MEDIUM | MEDIUM | P2 |
| SAL support | MEDIUM | MEDIUM | P2 |
| Series management | MEDIUM | LOW | P2 |
| Fabric CRUD + calculator | MEDIUM | MEDIUM | P2 |
| Year in Review | HIGH | HIGH | P2 |
| Custom gallery cards | MEDIUM | MEDIUM | P2 |
| Full dashboard system | HIGH | HIGH | P2 |
| Storage locations | LOW | LOW | P3 |
| Goal tracking | MEDIUM | HIGH | P3 |
| Rotation management | MEDIUM | HIGH | P3 |
| Achievements/trophies | MEDIUM | MEDIUM | P3 |
| Draggable widgets | LOW | HIGH | P3 |
| Scheduling plans | LOW | MEDIUM | P3 |

**Priority key:**
- P1: Must have -- core functionality that makes the app usable and better than Notion
- P2: Should have -- features that make the app genuinely powerful and differentiated
- P3: Nice to have -- polish and advanced features for power-user delight

## Competitor Feature Analysis

| Feature | Cross Stitch Journal | XStitch Plus | StitchPal | Pattern Keeper | This Project |
|---------|---------------------|--------------|-----------|----------------|--------------|
| Project management | Basic (5 stages) | Charts + journal | Patterns + progress | Pattern viewing only | Full lifecycle with ~50 fields, SAL, series |
| Supply inventory | Basic supply tracking | Pre-loaded DMC, Mill Hill, linens | None | Thread list from pattern | Pre-seeded DMC, beads, specialty. Per-project quantities. |
| Shopping list | None | Yes (limited -- no stash awareness) | None | None | Auto-generated from unfulfilled supplies across all projects |
| Session logging | Timer + date/count/photo | Journal entries | Daily progress reports | None | Quick-log: date, project, count, photo, time |
| Statistics | Streaks, quarterly stats, progress charts | None | Basic progress | None | Comprehensive: daily through yearly, Year in Review, supply stats, completion brackets |
| Goals | Quarterly/semiannual goals, widget | None | None | None | Project-specific + global goals, milestone targets, frequency goals, deadlines |
| Kitting tracking | None | Partial (inventory awareness) | None | None | Auto-calculated composite status with progress indicator |
| Multiple views | Project list | Charts, threads, linens, embellishments | Pattern list | Pattern grid | Gallery cards (3 layouts), list, table with advanced filtering |
| Dashboards | Stats page | None | None | None | 4 purpose-built dashboards + customizable widgets |
| Rotation/scheduling | None | None | None | None | 6 rotation styles, scheduling, seasonal focus |
| Achievements | Streaks only | None | None | None | Trophy case, auto-tracked milestones, streaks, records |
| Platform | iOS only | iOS + Android | iOS + Android + Windows | Android (iOS coming) | Web (PWA) -- all platforms |
| Pricing | Free + IAP | $9.99/yr subscription | Free + premium sync | One-time $10.50 | Self-hosted, free |

## Sources

- [Lord Libidan: 23 Best Apps for Cross Stitchers](https://lordlibidan.com/the-best-apps-for-cross-stitchers/) -- comprehensive app roundup (MEDIUM confidence)
- [Sirious Stitches: Inventory Tracking](https://sirithre.com/inventory-tracking-cross-stitch-patterns-wips-and-materials/) -- real stitcher workflow analysis (MEDIUM confidence)
- [Cross Stitch Journal on App Store](https://apps.apple.com/us/app/cross-stitch-journal/id6443886471) -- feature list and reviews (HIGH confidence)
- [XStitch Plus on App Store](https://apps.apple.com/us/app/xstitch-plus/id1281394467) -- feature list (HIGH confidence)
- [StitchPal on App Store](https://apps.apple.com/us/app/stitchpal/id1550536005) -- feature list (HIGH confidence)
- [Thread Bare](https://thread-bare.app/) -- pattern viewer + tracker (MEDIUM confidence)
- [Stitchly Features](https://stitchly.com/features/) -- pattern creation app (HIGH confidence)
- [Pattern Keeper](https://patternkeeper.app/) -- markup app (HIGH confidence)
- [MyCozyApp](https://mycozyapp.com/) -- newer entrant, early-stage (MEDIUM confidence)
- [Ravelry Getting Started](https://www.ravelry.com/tour/getting-started) -- gold standard craft platform for knitting/crochet (HIGH confidence)
- [The Fresh Cross Stitch: 7 Must-Have Apps](https://thefreshcrossstitch.com/blogs/tips-and-resources/7-must-have-apps-for-your-cross-stitch-and-embroidery) -- app recommendations (MEDIUM confidence)
- [Cross Stitch Forum discussions](https://www.crossstitchforum.com/) -- community sentiment on tracking needs (LOW confidence)

---
*Feature research for: Cross-stitch project management and craft inventory tracking*
*Researched: 2026-03-28*
