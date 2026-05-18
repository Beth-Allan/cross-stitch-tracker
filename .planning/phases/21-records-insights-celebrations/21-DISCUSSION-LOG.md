# Phase 21: Records, Insights & Celebrations - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-18
**Phase:** 21-records-insights-celebrations
**Areas discussed:** Records tab structure, Celebration toast trigger, Supply & designer insights, Completion estimates

---

## Records Tab Structure

### Q1: Primary shape of the Records tab

| Option | Description | Selected |
|--------|-------------|----------|
| Year in Review page | Full YearInReview layout with year selector, personal bests, timeline, highlights, etc. | |
| Personal bests board + insights | Focused layout: bests cards + fastest completions + insight lists. Single scrollable page. | |
| Tabbed sub-views | Sub-tabs within Records for "Personal Bests" and "Year in Review" | |

**User's choice:** Rejected all — clarified that Year in Review is a separate future feature (shareable snapshot), not part of Records tab. Records is a living dashboard.

### Q1b (revised): Primary shape of the Records tab

| Option | Description | Selected |
|--------|-------------|----------|
| Personal bests + insights sections | Top: bests board. Then fastest completions. Then insights. All-time default with year filter toggle. | ✓ |
| Two-column split | Left: bests stacked. Right: insights. Fastest completions full-width below. | |
| Bests board only, insights elsewhere | Records = purely bests. Insights move to Overview tab. | |

**User's choice:** Personal bests + insights sections
**Notes:** None

### Q2: Year scope toggle

| Option | Description | Selected |
|--------|-------------|----------|
| Segmented control | Small button group (All-time / 2026 / 2025). All sections update. Years auto-detected. | |
| Per-section toggles | Each section has its own scope toggle. | |
| All-time only | Skip year scoping. | |

**User's choice:** Initially selected segmented control, then reconsidered — proposed a table layout showing all years as columns instead, to differentiate from YiR.

### Q3: Multi-year records table layout

| Option | Description | Selected |
|--------|-------------|----------|
| Rows = record types, columns = years | Each row is a record. Columns: All-time, 2026, 2025... Values show number + project link. | ✓ |
| Cards at top + table below | Hero cards for all-time, comparison table below. | |
| You decide | Claude picks best layout. | |

**User's choice:** Rows = record types, columns = years
**Notes:** User specifically wanted multi-year comparison at a glance to differentiate from future YiR

### Q4: Personal bests card count

| Option | Description | Selected |
|--------|-------------|----------|
| 4 cards in a row | One per record (Best Day, Best Session, Longest Streak, Current Streak). 4-col desktop, 2×2 mobile. | ✓ |
| 3 cards (match DesignOS) | Combine some records or drop current streak. | |
| 6 cards (expanded) | Add most in a week and most projects in a day. | |

**User's choice:** 4 cards — but this was superseded by the table layout decision (D-04). Records show as table rows, not cards.

### Q5: Fastest completions placement

| Option | Description | Selected |
|--------|-------------|----------|
| Same table, grouped section | Divider row, then Fastest Mini/Small/Medium/Large/BAP rows below personal bests. | ✓ |
| Separate section below | Own card/table with different styling. | |
| You decide | Claude picks. | |

**User's choice:** Same table, grouped section

---

## Celebration Toast Trigger

### Q1: Record-breaking detection mechanism

| Option | Description | Selected |
|--------|-------------|----------|
| Server action returns record flags | createSession checks records server-side, returns brokenRecords array in response. | ✓ |
| Client-side comparison | Fetch bests before saving, compare after. Extra query, logic in client. | |
| Background check + notification | Decoupled mechanism with polling/SSE. | |

**User's choice:** Server action returns record flags
**Notes:** None

### Q2: Toast appearance

| Option | Description | Selected |
|--------|-------------|----------|
| Themed toast with record details | Custom amber toast with trophy icon, record type, old vs new value, project name. 5s dismiss. | |
| Simple success toast | Standard sonner success: "🏆 New record! ..." | |
| You decide | Claude picks. | |

**User's choice:** User rejected options — requested full-page confetti in addition to toast. "Something fun like full page confetti would be super fun."

### Q3: Confetti details

| Option | Description | Selected |
|--------|-------------|----------|
| Confetti burst + themed toast | canvas-confetti burst (1-2s, gold/amber/emerald) + themed amber toast. Multiple records = multiple bursts. | ✓ |
| Single confetti + stacked toasts | One burst regardless of count. All records as stacked toasts. | |
| You decide | Claude picks. | |

**User's choice:** Confetti burst + themed toast

---

## Supply & Designer Insights

### Q1: Differentiation from Overview tab

| Option | Description | Selected |
|--------|-------------|----------|
| Deeper stats, not charts | Overview = chart count. Records = thread usage by project count, designer completion rate, genre by stitches. List-based. | ✓ |
| Move to Overview tab | Move insights to Overview alongside existing charts. | |
| You decide | Claude determines differentiation. | |

**User's choice:** Deeper stats, not charts
**Notes:** Clear distinction: Overview = chart-count bar charts, Records = deeper metrics (rates, totals, usage)

### Q2: Thread color swatches

| Option | Description | Selected |
|--------|-------------|----------|
| Use hexCode when available, placeholder when not | Query ThreadColor.hexCode. Gray placeholder for missing. Ranked by project count. | ✓ |
| Only show threads with hex codes | Skip threads without hex. | |
| You decide | Claude determines fallback. | |

**User's choice:** Use hexCode when available, placeholder when not

### Q3: Insights year scoping

| Option | Description | Selected |
|--------|-------------|----------|
| Always all-time | Only bests table responds to scope. Insights always all-time. | |
| Scope everything | All sections respond to year toggle. | ✓ |
| You decide | Claude picks. | |

**User's choice:** Scope everything
**Notes:** User wants complete year picture when switching scope

---

## Completion Estimates

### Q1: Calculation method

| Option | Description | Selected |
|--------|-------------|----------|
| Rolling average pace | avg_per_day from all sessions. Need totalStitches target + ≥3 sessions. Display "~Month Year". | ✓ |
| Recent pace only (last 30 days) | Only last 30 days for pace. More responsive but volatile. | |
| You decide | Claude picks method. | |

**User's choice:** Rolling average pace

### Q2: Display location

| Option | Description | Selected |
|--------|-------------|----------|
| Records tab + project detail, defer gallery cards | Two surfaces. Gallery card estimate as backlog item. | ✓ |
| Records tab + project detail + gallery cards | Include gallery cards in Phase 21 scope. | |
| Records tab only | Single surface. | |

**User's choice:** Records tab + project detail, defer gallery cards
**Notes:** User asked about gallery cards — agreed to defer as a follow-up quick fix

---

## Claude's Discretion

- Responsive breakpoint for records table (horizontal scroll vs stacked on mobile)
- Number of items per insight list (top 10 recommended)
- Progress bar styling for completion estimates
- Empty state messaging for sparse year data
- Current streak display in year columns
- Confetti particle count and exact color mix
- Toast position (match existing sonner config)

## Deferred Ideas

- **Gallery card completion estimates** — Show est. date on Browse page cards. Small change but touches Phase 6 component.
- **Year in Review** — Shareable year-at-a-glance page. Separate from Records tab. Future milestone.
