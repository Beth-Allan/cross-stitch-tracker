# Requirements: Cross Stitch Tracker

**Defined:** 2026-04-15
**Core Value:** A stitcher can manage their entire chart collection and supplies faster and more pleasantly than Notion, with comprehensive statistics that make tracking feel rewarding.

## v1.2 Requirements

Requirements for Track & Measure milestone. Each maps to roadmap phases.

### Session Logging

- [ ] **SESS-01**: User can log a stitch session with date, project, stitch count, and optional time/photo
- [ ] **SESS-02**: User can access the Log Session modal from the header button, project detail, and dashboard
- [ ] **SESS-03**: User can view per-project session history with mini stats (total stitches, sessions logged, avg per session, active since)
- [ ] **SESS-04**: User can edit or delete an existing session
- [ ] **SESS-05**: Project progress auto-updates when sessions are created, edited, or deleted (atomic with session mutation)
- [ ] **SESS-06**: User can upload a progress photo with a session (reuses existing R2 upload pattern)

### Main Dashboard

- [ ] **DASH-01**: User sees a "Currently Stitching" section showing active WIPs with progress, sorted by most recently worked on
- [ ] **DASH-02**: User sees a "Start Next" section showing projects flagged as ready/want-to-start
- [ ] **DASH-03**: User sees a "Buried Treasures" section surfacing the oldest unstarted charts with days-in-library count
- [ ] **DASH-04**: User sees a "Spotlight" card featuring a random project with a refresh button
- [ ] **DASH-05**: User sees a Collection Stats sidebar (total projects, WIP/hold/unstarted/finished counts, total stitches, most recent finish, largest project)
- [ ] **DASH-06**: User can access a Quick Add menu to create charts, supplies, designers, or log stitches

### Pattern Dive

- [ ] **PDIV-01**: Charts page is renamed to "Pattern Dive" in navigation (URL path stays `/charts`)
- [ ] **PDIV-02**: Existing gallery Browse functionality becomes the Browse tab with tab navigation infrastructure
- [ ] **PDIV-03**: User can view a "What's Next" tab showing projects ranked by kitting readiness and start-next flag
- [ ] **PDIV-04**: User can view a "Fabric Requirements" tab showing cross-project fabric needs with stash matching
- [ ] **PDIV-05**: User can view a "Storage View" tab showing projects and fabrics grouped by storage location

### Project Dashboard

- [ ] **PROJ-01**: User sees hero stats bar (total WIPs, avg progress, closest to completion, finished this year, finished all time, total stitches)
- [ ] **PROJ-02**: User sees a Progress Breakdown tab with projects grouped into progress buckets (Unstarted, Just Getting Started, Making Progress, Over Halfway, Almost There) with stacked bar visualization
- [ ] **PROJ-03**: User can sort projects within progress buckets
- [ ] **PROJ-04**: User sees a Finished tab with rich per-project stats (start-to-finish duration, stitching days, avg daily stitches, total colours)
- [ ] **PROJ-05**: User can sort finished projects by finish date, duration, stitch count, or stitching days

### Shopping Cart

- [ ] **SHOP-01**: User can select which projects to shop for via a project selection interface
- [ ] **SHOP-02**: User sees aggregated supply needs across selected projects in tabbed view (Threads, Beads, Specialty, Fabric)
- [ ] **SHOP-03**: User can mark individual supply quantities as acquired
- [ ] **SHOP-04**: Tab badges show unfulfilled item counts per supply type

## Future Requirements

Deferred to v1.3 or later. Tracked but not in current roadmap.

### Statistics & Visualization (v1.3)

- **STAT-01**: User sees comprehensive stitching statistics (daily/weekly/monthly/yearly metrics)
- **STAT-02**: User sees monthly stitch bar chart with drill-down to daily breakdown
- **STAT-03**: User sees a stitching calendar showing activity per day
- **STAT-04**: User sees personal bests (most stitches in a day, longest streak, records)
- **STAT-05**: User sees Year in Review summary with yearly stats, project timeline, and highlights

### Goals & Motivation (v1.3)

- **GOAL-01**: User can set project-specific and global goals with milestone targets
- **GOAL-02**: User sees Goals Summary on Main Dashboard
- **GOAL-03**: User can manage scheduling plans (start dates, recurring stitching days)
- **GOAL-04**: User can configure rotation styles for multi-project management
- **GOAL-05**: User sees an achievement trophy case with auto-tracked milestones and streaks

### Shopping Cart Enhancements (future)

- **SHOP-05**: User can match stash fabrics to project fabric needs
- **SHOP-06**: User can copy shopping list to clipboard as formatted text

### Session Enhancements (future)

- **SESS-07**: User sees estimated completion date computed from stitching pace and remaining stitches

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Drag-and-drop dashboard widgets | No craft app uses these; fixed layouts match DesignOS designs |
| Built-in stitching timer | User stitches on iPad apps (Markup R-XP, Saga), logs afterward |
| Negative stitch counts / frogging | Allow edit/delete instead; simpler mental model |
| Offline session logging | PWA service workers add significant complexity |
| Route rename `/charts` to `/pattern-dive` | 50+ hardcoded refs across 30+ files; label change only |
| Series/collection filter on Pattern Dive | Series data model doesn't exist yet |
| Full statistics engine in v1.2 | Deferred to v1.3; v1.2 builds the session data foundation |
| Goals Summary on Main Dashboard | Goal model doesn't exist until v1.3; omit section |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| SESS-01 | TBD | Pending |
| SESS-02 | TBD | Pending |
| SESS-03 | TBD | Pending |
| SESS-04 | TBD | Pending |
| SESS-05 | TBD | Pending |
| SESS-06 | TBD | Pending |
| DASH-01 | TBD | Pending |
| DASH-02 | TBD | Pending |
| DASH-03 | TBD | Pending |
| DASH-04 | TBD | Pending |
| DASH-05 | TBD | Pending |
| DASH-06 | TBD | Pending |
| PDIV-01 | TBD | Pending |
| PDIV-02 | TBD | Pending |
| PDIV-03 | TBD | Pending |
| PDIV-04 | TBD | Pending |
| PDIV-05 | TBD | Pending |
| PROJ-01 | TBD | Pending |
| PROJ-02 | TBD | Pending |
| PROJ-03 | TBD | Pending |
| PROJ-04 | TBD | Pending |
| PROJ-05 | TBD | Pending |
| SHOP-01 | TBD | Pending |
| SHOP-02 | TBD | Pending |
| SHOP-03 | TBD | Pending |
| SHOP-04 | TBD | Pending |

**Coverage:**
- v1.2 requirements: 26 total
- Mapped to phases: 0
- Unmapped: 26

---
*Requirements defined: 2026-04-15*
*Last updated: 2026-04-15 after initial definition*
