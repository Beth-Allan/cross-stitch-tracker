# Phase 18: Stats Engine & Charting Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-17
**Phase:** 18-Stats Engine & Charting Foundation
**Areas discussed:** Stats freshness, Timezone handling, Phase 18 visible output, Chart component setup
**Mode:** Advisor (research-backed comparison tables)

---

## Stats Freshness

| Option | Description | Selected |
|--------|-------------|----------|
| Smart TTLs | Persistent cache with per-query TTLs (5min hero, 1hr historical) + instant invalidation on session mutations | ✓ |
| Single 5-min TTL | One TTL for everything + mutation invalidation. Simpler but less optimal for historical data | |
| No cache | Always fresh, zero cache infrastructure. Risk: may exceed 2s load target | |

**User's choice:** Smart TTLs (Recommended)
**Notes:** No additional discussion needed. Usage pattern (stitch on iPad, check stats later) means "instant" = fresh on navigate.

---

## Timezone Handling

| Option | Description | Selected |
|--------|-------------|----------|
| Env var + abstraction | STATS_TIMEZONE env var accessed via getUserTimezone() function. Simplest, easily swappable | ✓ |
| Auto-detect into JWT | Browser detects timezone on login, stores in JWT token. Touches auth.ts | |
| Client Component detection | Browser API detects timezone per-request. Adds client wrapper + loading state | |

**User's choice:** Env var + abstraction
**Notes:** User corrected timezone assumption — they are in **Mountain Time** (America/Denver), not Pacific Time. The researcher had assumed Pacific based on project context. This correction is captured in D-04.

---

## Phase 18 Visible Output

| Option | Description | Selected |
|--------|-------------|----------|
| Permanent page shell | Replace /stats placeholder with real page + one working chart using real data | ✓ |
| Pure infrastructure | Query layer + tests only. Stats page stays as placeholder until Phase 19 | |
| Full shell + loading states | Real page shell plus Suspense skeletons, error boundaries, end-to-end cache validation | |

**User's choice:** Permanent page shell (Recommended)
**Notes:** /stats route already exists as placeholder with nav link wired. Phase 18 replaces it; Phase 19 fills it in.

---

## Chart Component Setup

| Option | Description | Selected |
|--------|-------------|----------|
| shadcn + shared configs | shadcn ChartContainer directly + shared chart-configs.ts for centralized color/label mappings | ✓ |
| shadcn ChartContainer only | Each chart defines its own inline chartConfig. No shared file | |
| Wrapper components | Pre-baked wrapper components that bake in design tokens. Higher abstraction | |

**User's choice:** shadcn + shared configs (Recommended)
**Notes:** globals.css already has --chart-1 through --chart-5 and --status-* tokens. shadcn chartConfig bridges CSS vars to Recharts automatically.

---

## Claude's Discretion

- Query function granularity and file organization within `src/lib/queries/stats/`
- Which specific chart to render on the Phase 18 shell page
- Exact TTL values (5min/1hr are guidelines)

## Deferred Ideas

None — discussion stayed within phase scope.
