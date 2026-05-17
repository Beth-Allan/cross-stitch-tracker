# Requirements: Cross Stitch Tracker — v1.5 Statistics & Records

**Defined:** 2026-05-17
**Core Value:** A stitcher can manage their entire chart collection and supplies faster and more pleasantly than Notion, with comprehensive statistics that make tracking feel rewarding.

## v1.5 Requirements

### Stats Engine & Infrastructure

- [ ] **STAT-01**: Stats page loads within 2s with all data pre-fetched via parallel queries
- [ ] **STAT-02**: Stats data refreshes automatically when sessions are logged/edited/deleted, charts are added/modified, supplies are linked, or project status changes (cache invalidation)
- [ ] **STAT-03**: All date-based stats respect the user's timezone (not UTC boundaries)
- [ ] **STAT-04**: Charting library (Recharts via shadcn chart component) installed and integrated with design system tokens

### Hero & Collection Stats

- [ ] **HERO-01**: User can see lifetime hero counters: total stitches, total sessions, total stitching time, projects completed
- [ ] **HERO-02**: User can see rolling time-window stats: today, this week, this month, this year
- [ ] **HERO-03**: User can see collection breakdown by status (7 statuses as donut/bar)
- [ ] **HERO-04**: User can see collection breakdown by size category (Mini/Small/Medium/Large/BAP)
- [ ] **HERO-05**: User can see collection breakdown by designer (top designers bar chart)
- [ ] **HERO-06**: User can see collection breakdown by genre distribution

### Activity Visualization

- [ ] **VIZ-01**: User can see monthly stitch bar chart (12 bars for the year) with click-to-drill-down detail
- [ ] **VIZ-02**: User can see a stitching calendar (month-view grid showing daily activity with project color-coding)
- [ ] **VIZ-03**: User can navigate between months on the stitching calendar
- [ ] **VIZ-04**: User can see session history (sortable, paginated table of all sessions)
- [ ] **VIZ-05**: User can see day-of-week stitching pattern (which days they stitch most)
- [ ] **VIZ-06**: User can see rolling averages (7-day, 30-day, 90-day stitches/day)
- [ ] **VIZ-07**: User can see month-over-month pace trends (this month vs last, trending up/down indicator)

### Personal Records

- [ ] **REC-01**: User can see personal bests board: most stitches in a day, most in a session, longest streak, current streak
- [ ] **REC-02**: Personal bests link to the associated project/session (clickable entity references)
- [ ] **REC-03**: User sees "New record!" celebration toast immediately when logging a session that beats a personal best
- [ ] **REC-04**: User can see year-scoped records alongside all-time records
- [ ] **REC-05**: User can see fastest project completions by size category (linked to projects)

### Insights & Analysis

- [ ] **INS-01**: User can see their most-used thread colors (appears in most projects, with color swatches)
- [ ] **INS-02**: User can see designer breakdown (favourite designer, completion rate per designer)
- [ ] **INS-03**: User can see genre distribution stats
- [ ] **INS-04**: User can see stitch rate (stitches/hour) when time data is logged, with trend over time
- [ ] **INS-05**: User can see estimated completion dates for active projects (when sufficient session data exists)
- [ ] **INS-06**: All stat entities (projects, threads, designers) are clickable links to their detail pages

## Future Requirements (v1.6+)

### Contextual Stats

- **CTX-01**: Contextual stats sprinkled into existing pages (Pattern Dive, project detail, dashboard)
- **CTX-02**: Gallery card completion ETAs based on session velocity
- **CTX-03**: Project detail "vs your averages" comparison
- **CTX-04**: Dashboard streak indicator and weekly counter

### Year in Review

- **YIR-01**: Year in Review tab with 8 stat sections and year selector
- **YIR-02**: Project timeline visualization (Gantt-like lifespans)
- **YIR-03**: Annual narrative summary (top projects, favourite supplies, highlights)

### Gamification

- **GAM-01**: Milestone countdowns ("2 more finishes until your 20th FFO!")
- **GAM-02**: "This time last year" snapshot comparison
- **GAM-03**: Fun facts (thread length equivalents, finish-to-start ratio)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Social leaderboards / comparisons | Single-user app. Social comparison adds complexity and can be demotivating. |
| Achievement badge/trophy unlock system | Heavy gamification risks making stitching feel like a chore. Personal bests + toasts suffice. |
| AI-generated insights / recommendations | "You should stitch more on Wednesdays" feels patronizing. Data should speak for itself. |
| Real-time stitching timer on stats page | Timer belongs to session logging UX, not stats consumption. |
| Projected finish countdown widget | Projections on sparse data are anxiety-inducing. Show estimates informally only with sufficient data. |
| Share card / social export | Image generation complexity deferred per PROJECT.md. |
| Cross-project comparison view | Comparing a mini to a BAP is meaningless. Per-project stats exist on detail pages. |
| Historical supply price tracking | Data entry nightmare for 500+ charts. Deferred indefinitely. |
| Rotation schedule in stats | Stats should observe, not prescribe. Rotation is a separate feature domain. |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| STAT-01 | Phase 18 | Pending |
| STAT-02 | Phase 18 | Pending |
| STAT-03 | Phase 18 | Pending |
| STAT-04 | Phase 18 | Pending |
| HERO-01 | Phase 19 | Pending |
| HERO-02 | Phase 19 | Pending |
| HERO-03 | Phase 19 | Pending |
| HERO-04 | Phase 19 | Pending |
| HERO-05 | Phase 19 | Pending |
| HERO-06 | Phase 19 | Pending |
| VIZ-01 | Phase 20 | Pending |
| VIZ-02 | Phase 20 | Pending |
| VIZ-03 | Phase 20 | Pending |
| VIZ-04 | Phase 20 | Pending |
| VIZ-05 | Phase 20 | Pending |
| VIZ-06 | Phase 20 | Pending |
| VIZ-07 | Phase 20 | Pending |
| REC-01 | Phase 21 | Pending |
| REC-02 | Phase 21 | Pending |
| REC-03 | Phase 21 | Pending |
| REC-04 | Phase 21 | Pending |
| REC-05 | Phase 21 | Pending |
| INS-01 | Phase 21 | Pending |
| INS-02 | Phase 21 | Pending |
| INS-03 | Phase 21 | Pending |
| INS-04 | Phase 20 | Pending |
| INS-05 | Phase 21 | Pending |
| INS-06 | Phase 19 | Pending |

**Coverage:**
- v1.5 requirements: 28 total
- Mapped to phases: 28
- Unmapped: 0

---
*Requirements defined: 2026-05-17*
*Last updated: 2026-05-17 after roadmap creation*
