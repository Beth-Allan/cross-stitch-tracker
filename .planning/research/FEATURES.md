# Feature Landscape

**Domain:** Statistics & data visualization for craft/hobby tracking apps
**Researched:** 2026-05-17
**Confidence:** HIGH (cross-referenced DesignOS spec, competitor apps, fitness tracker patterns)

## Table Stakes

Features users expect in a statistics dashboard for a hobby tracker. Missing = product feels incomplete or pointless.

| Feature | Why Expected | Complexity | Data Source | Notes |
|---------|--------------|------------|-------------|-------|
| Lifetime hero counters (total stitches, sessions, days) | Every stats dashboard opens with headline numbers. StitchPal, Strava, Cross Stitch Journal all do this. Users want instant "wow I've done a lot." | Low | `StitchSession` aggregate | JetBrains Mono, large numbers. Already designed in DesignOS HeroStats. |
| Rolling time-window stats (today/week/month/year) | Gives immediacy. "What have I done recently?" is the #1 question. Strava, Cross Stitch Journal, Pattern Keeper all show this. | Low | `StitchSession` filtered by date range | Already designed. Requires efficient date-range queries. |
| Monthly bar chart (stitch totals per month) | Visual progress over time is universal. Every fitness tracker and Cross Stitch Journal uses monthly aggregation as primary chart. | Medium | `StitchSession` grouped by month | Already designed with click-to-drill-down popover. Pure CSS bars vs charting library is a key decision. |
| Stitching calendar (daily activity view) | GitHub contribution pattern. Cross Stitch Journal uses it for streaks. Visual consistency tracking is deeply motivating. | Medium | `StitchSession` grouped by date | Already designed as full monthly grid with project color-coding. |
| Session history table (sortable, filterable) | Users need to verify/edit logged data. StitchPal and Cross Stitch Journal both show session lists. | Low | `StitchSession` with joins | Already designed. Needs pagination for power users with 100s of sessions. |
| Personal bests / records | Strava's core hook. Cross Stitch Journal tracks "longest streak." StitchPal implies records via calculated averages. Stats nerds need a trophy case. | Medium | Computed from `StitchSession` scan | Already designed: 3-card grid with trophy/flame/star icons. Categories: best day (this year + all time), longest streak. |
| Current/longest streak | Cross Stitch Journal added this as a headline feature. Strava uses weekly streaks. Streaks drive habit formation without heavy gamification. | Low | `StitchSession` consecutive date analysis | Subset of personal bests. Low complexity but high motivational value. |
| Project-level session stats (per-project mini dashboard) | StitchPal's core feature. Users want to see "how fast am I going on THIS project?" Total, count, average per session, first/last date. | Low | `StitchSession` filtered by projectId | Already built as ProjectSessionsTab in v1.2. |
| Collection overview (status breakdown, size breakdown) | Ravelry shows project counts by status. User has 500+ charts across 7 statuses -- needs aggregate view. | Low | `Project` + `Chart` counts | Already designed in StatCards. Queries are simple counts/groups. |
| Stitch rate / speed calculation | Cross-stitch specific. 100-250 stitches/hour is the range. StitchPal and Stitchmate both calculate this. Users measure improvement over time. | Low | `StitchSession` where timeSpentMinutes is not null | Only possible when user logs time. Display as average stitches/hour. |

## Differentiators

Features that set the product apart. Not expected by every user, but valued by "stats nerds" who want their data to feel rewarding and comprehensive.

| Feature | Value Proposition | Complexity | Data Source | Notes |
|---------|-------------------|------------|-------------|-------|
| Year in Review (annual summary) | Strava's most-shared feature ("Year in Sport"). Spotify Wrapped proved annual recaps create emotional attachment. No cross-stitch app does this well. | High | All models, full-year scan | Already fully designed: hero stats, monthly pace, project timeline, top projects, favourite supplies, highlights, year selector. High complexity = many data queries. |
| "New record!" celebration toast on session log | Strava shows achievement banners immediately on activity upload. Creates dopamine hit at the moment of logging. No stitching app celebrates records in real-time. | Medium | Compare new session against stored bests | Requires post-save comparison logic. Toast with confetti or glow effect. Categories: best day, best session, new project milestone. |
| Project timeline visualization (Gantt-like) | Shows when you worked on each project across a year. Unique to this domain -- most stitchers don't track this anywhere. Makes rotation patterns visible. | Medium | `StitchSession` grouped by project + date range | Already designed in Year in Review. Horizontal bars across 12-month grid. |
| Stitching pace trends (month-over-month velocity) | Shows if you're stitching more or less than before. Strava uses "fitness" and "fatigue" curves. Stitchers care about seasonal patterns (summer slumps, winter marathons). | Medium | `StitchSession` daily averages per month | Already designed as bar chart with "trending up/down" indicator. |
| Favourite supplies analysis (most-used threads/beads) | No other stitching app surfaces this. Ravelry tracks yarn usage. Shows your DMC colour palette across projects -- fun discovery. | Medium | `ProjectThread` + `ProjectBead` join counts | Already designed in Year in Review. Color swatches + project counts. |
| Day-of-week pattern analysis | Fitness trackers show when you exercise most. "You stitch most on Saturdays" is genuinely interesting self-knowledge. | Low | `StitchSession` grouped by dayOfWeek | Not in DesignOS yet -- would be a small stat card. Simple GROUP BY. |
| Designer/genre breakdown stats | "Your favourite designer is [X]" and "60% of your collection is samplers" -- collection personality profiling. | Low | `Chart` joins to `Designer` + `Genre` | Partially in StatCards design. Simple join + count. |
| Estimated completion dates | StitchPal's differentiator. "At your current pace, you'll finish on [date]." Deeply motivating for BAP stitchers. | Medium | `StitchSession` rate calculation + `Chart.stitchCount` - `Project.stitchesCompleted` | Already in backlog (999.7). Depends on consistent session logging. Inaccurate without sufficient data. |
| Heatmap calendar (GitHub contribution style) | Denser than the existing stitching calendar -- shows intensity via color shading across months. Instantly communicates consistency at a year-level glance. | Medium | `StitchSession` count/sum per day | Alternative/complement to the designed calendar. Color intensity = stitch volume. |
| Top-3 annual records (Strava "Annual Best Efforts") | Strava recently added year-scoped records alongside all-time records. Shows "best version of you this year" without comparing to all-time peaks that may feel unbeatable. | Low | `StitchSession` filtered by year, top N | Extension of personal bests. Already partially supported by "Best Day This Year" in sample data. |

## Anti-Features

Features to explicitly NOT build for this milestone.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Social leaderboards / comparisons | Single-user app. Social comparison adds complexity and can be demotivating ("I only stitch 50/hour compared to Reddit averages"). The app is personal, not competitive. | Focus on personal records and self-improvement trends. |
| Achievement badge/trophy system with unlock mechanics | Heavy gamification (Habitica model) risks making stitching feel like a chore. Extrinsic motivation undermines intrinsic satisfaction. The "stats nerd" wants data, not game mechanics. | Personal bests with celebration moments (toasts) instead of persistent badge collection. |
| AI-generated insights / smart recommendations | "You should stitch more on Wednesdays" feels patronizing. The data should speak for itself without the app being prescriptive about user behavior. | Present patterns (day-of-week chart) and let user draw their own conclusions. |
| Real-time stitching timer (built into stats page) | Timer belongs to session logging UX, not stats consumption. StitchPal's timer is a separate mode. Mixing input and output confuses the stats dashboard role. | Keep timer in Log Session modal (already exists with optional timeSpentMinutes). |
| Projected "finish date" with countdown widget | Projections based on sparse data are wildly inaccurate and anxiety-inducing. A BAP with 3 sessions logged showing "estimated finish: 2034" is demoralizing. | Show estimated completion only when sufficient data exists (10+ sessions). Present as informational, not as a deadline/countdown. |
| Share card / social export generation | Adds image generation complexity (canvas, og:image). Deferred to post-stats milestone per PROJECT.md "Out of Scope." | Keep stats private and personal for now. Add sharing later if demanded. |
| Comparison across projects ("Project A vs Project B") | Comparing a mini (500 stitches) to a BAP (80k stitches) is meaningless. Per-project stats exist on their detail pages. | Each project has its own session tab with mini stats. No cross-project comparison needed. |
| Historical supply price tracking | Prices change, brands differ by country, sales happen. Tracking supply costs accurately is a data entry nightmare for 500+ charts worth of supplies. | If supply costs are ever added, keep it simple: optional per-project total, not per-item price history. |
| Rotation schedule integration in stats | Stats should observe behavior, not prescribe it. Rotation management is a separate feature domain (deferred in PROJECT.md). | Stats can show project distribution patterns without telling users what to stitch next. |

## Feature Dependencies

```
StitchSession data exists (v1.2 shipped)
  --> Hero counters (no additional dependencies)
  --> Monthly bar chart (no additional dependencies)
  --> Stitching calendar (no additional dependencies)
  --> Session history (no additional dependencies)
  --> Personal bests (requires: streak algorithm, max-finding queries)
  --> Stitch rate (requires: sessions with timeSpentMinutes logged)

Personal bests computed
  --> "New record!" toast (requires: compare new session against current bests)

Project + Chart data exists (v1.0 shipped)
  --> Collection overview stats (no additional dependencies)
  --> Designer/genre breakdown (no additional dependencies)

ProjectThread + ProjectBead linked (v1.0 shipped)
  --> Favourite supplies analysis (no additional dependencies)

All of the above
  --> Year in Review (requires: all queries scoped to year, year selector UI)
```

## Feature Categories

### Category 1: Activity Stats (session-derived)
Source: `StitchSession` table exclusively.
- Hero counters
- Monthly bar chart
- Stitching calendar / heatmap
- Session history
- Personal bests + streaks
- Stitch rate
- Day-of-week patterns
- Stitching pace trends
- "New record!" toast

### Category 2: Collection Stats (project/chart-derived)
Source: `Project` + `Chart` + `Designer` + `Genre`.
- Status breakdown (pie/donut or card grid)
- Size category distribution
- Designer favourites
- Genre distribution
- Projects started/finished per year

### Category 3: Supply Insights (junction-table-derived)
Source: `ProjectThread` + `ProjectBead` + `ProjectSpecialty` + joins to supply tables.
- Most-used threads/beads
- Color palette distribution
- Supply-per-project counts
- Most colors in a project

### Category 4: Synthesis / Cross-Domain
Source: Multiple tables combined.
- Year in Review (all categories)
- Project timeline (sessions x projects x time)
- Estimated completion (sessions x project.stitchCount)
- Celebration toasts (sessions x personal bests)

## MVP Recommendation

**Phase 1 priority -- build the stats computation engine + Overview tab:**
1. Hero counters (today/week/month/year) -- instant gratification, low complexity
2. Personal bests (best day this year, best day all time, longest streak) -- motivational hook
3. Monthly bar chart with drill-down -- visual storytelling
4. Collection overview stat cards -- leverages existing data

**Phase 2 priority -- Calendar + deeper insights:**
5. Stitching calendar (full monthly grid with project color-coding)
6. Session history (sortable table with pagination)
7. "New record!" celebration toast (wired into session logging flow)
8. Stitch rate calculation (average stitches/hour)

**Phase 3 priority -- Year in Review:**
9. Year in Review with all 8 sections (per DesignOS design)
10. Project timeline visualization
11. Favourite supplies analysis
12. Pace trends with trend indicators

**Defer to later milestone:**
- Day-of-week patterns (low priority, easy to add later)
- Estimated completion dates (needs robust data; add when users have more sessions)
- Heatmap calendar (alternative view -- existing calendar design is sufficient)
- Supply cost tracking (requires schema changes)

## What Makes a "Stats Nerd" Delighted

Based on research across Strava, GitHub, fitness trackers, and cross-stitch apps:

1. **Immediate feedback** -- "New record!" toast the moment you log a session that beats a personal best. Strava does this with activity upload; it's the single most motivating feature.

2. **Big numbers in monospace font** -- The hero counter row. Making lifetime totals feel impressive. "You've stitched 247,832 stitches" in JetBrains Mono 30px hits different than body text.

3. **Visual consistency patterns** -- The calendar/heatmap. Seeing a row of colored days makes consistency feel tangible. GitHub proved this drives behavior even without gamification.

4. **Annual narrative** -- Year in Review creates a story: "This was your year." Emotional, shareable (even if just mentally), and creates anticipation for next year. Spotify, Strava, GitHub all do this.

5. **Records that accumulate** -- Personal bests grow over time. Unlike badges (which you unlock and forget), records invite beating. "My best day is 1,247 -- can I beat it?" creates intrinsic challenge.

6. **Clickable deep-links** -- Every stat that mentions a project/thread/designer should link to that entity. Stats are a discovery surface, not a dead end.

7. **Trend indicators** -- "Trending up" vs "slowing down" on pace. Not prescriptive ("you should stitch more") but observational ("here's what's happening").

## Sources

- [StitchPal (App Store)](https://apps.apple.com/us/app/stitchpal/id1550536005) -- estimated completion, daily progress logging, stitch rate
- [Cross Stitch Journal (App Store)](https://apps.apple.com/us/app/cross-stitch-journal/id6443886471) -- streaks, progress charts, project status tracking
- [Pattern Keeper](https://patternkeeper.app/) -- stitch count tracking, percentage complete
- [MyCozyApp](https://mycozyapp.com/) -- progress tracking, celebration on completion
- [Strava Best Efforts](https://support.strava.com/hc/en-us/articles/19685360245005-Best-Efforts-Overview) -- personal records, annual bests, top-3 lifetime
- [Strava Year in Sport](https://support.strava.com/hc/en-us/articles/22067973274509-Your-Year-in-Sport) -- annual recap, personalized narrative
- [Strava Gamification Case Study (Trophy)](https://trophy.so/blog/strava-gamification-case-study) -- weekly streaks, badges, motivation design
- [Ravelry Community Stats](https://blog.ravelry.com/2022-community-stats/) -- aggregate yarn/project tracking
- [GitHub Calendar Heatmap patterns](https://github.com/topics/heatmap-calendar) -- consistency visualization
- [Cross Stitch Speed Metrics](https://sirithre.com/speed-test-how-to-measure-your-average-cross-stitch-rate-and-why/) -- stitch rate benchmarks (100-250/hr typical)
- [Stash2Go Features](https://www.stash2go.com/features.html) -- Ravelry companion app stats
- DesignOS: `product-plan/sections/stitching-sessions-and-statistics/` -- all component designs, types, and sample data
