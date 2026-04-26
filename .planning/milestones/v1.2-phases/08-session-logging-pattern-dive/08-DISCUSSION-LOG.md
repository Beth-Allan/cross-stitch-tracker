# Phase 8: Session Logging & Pattern Dive - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-04-16
**Phase:** 08-session-logging-pattern-dive
**Areas discussed:** Log Session access, Progress tracking model, What's Next ranking, Pattern Dive structure

---

## Log Session Access

| Option | Description | Selected |
|--------|-------------|----------|
| TopBar button | Always-visible emerald button in the top bar next to user menu | ✓ |
| Floating action button | Fixed FAB in bottom-right corner, mobile-app style | |
| Sidebar nav + contextual only | No global button — log from Sessions page or project detail only | |

**User's choice:** TopBar button
**Notes:** Matches SESS-02 "header" requirement. Most craft/fitness apps put the primary action here.

| Option | Description | Selected |
|--------|-------------|----------|
| Pre-fill and lock | Project is pre-selected and picker is hidden | ✓ |
| Pre-fill but allow change | Project is pre-selected but picker stays visible | |
| Always show full modal | Same modal everywhere, no pre-filling | |

**User's choice:** Pre-fill and lock
**Notes:** Faster flow when you're already on the project page.

| Option | Description | Selected |
|--------|-------------|----------|
| Global session log | Chronological list of all sessions across all projects | ✓ |
| Simple landing / redirect | Links to per-project session tabs | |
| You decide | Claude picks | |

**User's choice:** Global session log
**Notes:** Useful for seeing "what did I stitch this week?" at a glance.

---

## Progress Tracking Model

| Option | Description | Selected |
|--------|-------------|----------|
| Recalculate from sessions | stitchesCompleted = startingStitches + sum(all session stitchCounts) | ✓ |
| Increment/decrement on mutation | Each session adjusts stitchesCompleted by delta | |
| Sessions are independent | No auto-sync between sessions and stitchesCompleted | |

**User's choice:** Recalculate from sessions
**Notes:** Always consistent. Editing/deleting a session automatically fixes the total. Wrapped in $transaction.

| Option | Description | Selected |
|--------|-------------|----------|
| Preserve as startingStitches | One-time data migration so progress bar doesn't reset | ✓ |
| No migration needed | User enters startingStitches manually | |
| You decide | Claude picks | |

**User's choice:** Preserve as startingStitches
**Notes:** Prevents progress reset when session logging begins for projects with existing stitchesCompleted.

| Option | Description | Selected |
|--------|-------------|----------|
| Read-only when sessions exist | Progress derived from session data, startingStitches remains editable | ✓ |
| Always editable | Manual override always available | |
| You decide | Claude picks | |

**User's choice:** Read-only when sessions exist
**Notes:** Prevents conflicting sources of truth. startingStitches remains editable for adjustments.

---

## What's Next Ranking

| Option | Description | Selected |
|--------|-------------|----------|
| Flag + kitting readiness | wantToStartNext first, kitting % descending, dateAdded ascending | ✓ |
| Status-based tiers | Group by status: Kitted, Kitting, Unstarted | |
| Just flag + date | Simplest: flag then dateAdded | |

**User's choice:** Flag + kitting readiness
**Notes:** Uses existing data. Kitting readiness gives meaningful differentiation.

| Option | Description | Selected |
|--------|-------------|----------|
| Unstarted + Kitting + Kitted | All pre-stitching statuses | |
| Include On Hold too | Broader scope including paused projects | |
| You decide | Claude picks | |

**User's choice:** Unstarted + Kitted only (custom answer)
**Notes:** User specifically excluded Kitting — What's Next is a "ready to stitch" view, not "still gathering supplies".

---

## Pattern Dive Structure

| Option | Description | Selected |
|--------|-------------|----------|
| Wrap existing gallery as Browse tab | Keep ProjectGallery, add tab navigation above | ✓ |
| Rebuild as unified component | New PatternDive component manages all tabs | |
| Separate routes per tab | Each tab is /charts/whats-next, etc. | |

**User's choice:** Wrap existing gallery as Browse tab
**Notes:** Minimal changes to working gallery code.

| Option | Description | Selected |
|--------|-------------|----------|
| Eager load all tabs | Promise.all() in page.tsx, instant tab switching | ✓ |
| Lazy load per tab | Fetch on tab click with loading skeleton | |
| You decide | Claude picks | |

**User's choice:** Eager load all tabs
**Notes:** User asked what a senior developer would suggest. Explanation: small dataset (500 charts), Promise.all() runs queries in parallel, instant tab switching is better UX.

| Option | Description | Selected |
|--------|-------------|----------|
| URL-persisted with nuqs | Same pattern as ProjectTabs, /charts?tab=whats-next | ✓ |
| Client state only | Refresh resets to Browse | |
| You decide | Claude picks | |

**User's choice:** URL-persisted with nuqs
**Notes:** Consistent with existing project detail tabs pattern.

| Option | Description | Selected |
|--------|-------------|----------|
| Rename to Pattern Dive | Nav label changes, URL stays /charts | ✓ |
| Keep as Projects | Only page heading changes | |
| You decide | Claude picks | |

**User's choice:** Rename to Pattern Dive
**Notes:** Matches PDIV-01 requirement exactly.

---

## Claude's Discretion

- StitchSession model field names and types
- Session photo upload implementation details
- Fabric Requirements tab calculation details
- Storage View tab grouping implementation
- Empty state messaging
- Sort options within each tab

## Deferred Ideas

None — discussion stayed within phase scope
