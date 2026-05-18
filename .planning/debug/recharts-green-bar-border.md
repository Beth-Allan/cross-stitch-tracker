---
status: resolved
trigger: "Green rectangular border/outline appears around bar chart elements when hovering in Recharts 3.8.0 BarChart components"
created: 2026-05-17
updated: 2026-05-17
---

# Debug: Recharts Green Bar Border

## Symptoms

- expected: No green rectangle/border around bars when hovering or clicking
- actual: A large green rectangular outline wraps around one or more bars on hover in both Monthly Stitches and Day of Week charts. The rectangle has green stroke matching var(--chart-1) color, with rounded corners. Appears on hover, persists during tooltip display.
- errors: None in console
- timeline: Since Phase 20 built these charts using Recharts 3.8.0
- reproduction: Hover over any bar in Monthly Stitches chart or Day of Week chart on the Activity tab of /stats page
- files: src/components/features/stats/monthly-stitch-chart.tsx, src/components/features/stats/day-of-week-chart.tsx

## Already Tried (by orchestrator -- all failed)

1. `activeBar={false}` on `<Bar>` component -- green border persists
2. Removed `accessibilityLayer` from `<BarChart>` -- green border persists
3. `cursor={false}` on `<ChartTooltip>` -- green border persists
4. CSS in ChartContainer already has `[&_.recharts-layer]:outline-hidden` and `[&_.recharts-surface]:outline-hidden` -- not targeting the right element

## Current Focus

- hypothesis: CONFIRMED -- The green outline comes from the global CSS rule `* { outline-color: var(--ring) }` in globals.css, where --ring is emerald-600. Recharts 3.8.0 creates multiple DOM elements (recharts-wrapper div, SVG surface with tabIndex=0, ZIndex portal g elements with tabIndex=-1, recharts-rectangle path elements) that can receive focus. The existing outline-hidden selectors only targeted recharts-layer, recharts-surface, and recharts-sector -- missing the recharts-wrapper div, recharts-rectangle paths, and SVG child elements.
- test: Added comprehensive outline-hidden selectors to ChartContainer
- expecting: Green border no longer appears on any Recharts element during hover or focus
- next_action: Verify fix in browser

## Evidence

- timestamp: 2026-05-17T19:00
  - source: Recharts 3.8.0 source analysis (node_modules/recharts/es6/)
  - finding: Bar.js renders each bar inside BarStackClipLayer (g.recharts-bar-rectangle), which passes event handlers (onMouseEnter, onMouseLeave, onClick) to g elements. These g elements have class recharts-layer but also recharts-bar-rectangle. The SVG surface gets tabIndex=0 from accessibilityLayer (default: true). ZIndex portal g elements get tabIndex=-1.
  - conclusion: Multiple Recharts elements can receive browser focus and show the green outline from the global CSS rule

- timestamp: 2026-05-17T19:10
  - source: globals.css line 240
  - finding: `* { @apply border-border outline-ring/50; }` sets outline-color to var(--ring) (emerald-600) on ALL elements. This is the standard shadcn/ui base layer approach, but it means any focusable element without outline-hidden will show a green outline.
  - conclusion: Root cause confirmed -- global outline-color bleeds into Recharts SVG elements

- timestamp: 2026-05-17T19:15
  - source: chart.tsx CSS analysis
  - finding: Only 3 selectors suppressed outlines: recharts-layer, recharts-surface, recharts-sector. Missing: recharts-wrapper (div), recharts-rectangle (path), svg element itself, and all SVG child elements
  - conclusion: Incomplete CSS coverage was the proximate cause

## Eliminated

- activeBar prop: Setting `activeBar={false}` correctly prevents Recharts from rendering BarRectangleWithActiveState (uses BarRectangleNeverActive instead). The green border is not from active bar rendering.
- Tooltip cursor: Setting `cursor={false}` correctly prevents CursorInternal from rendering (returns null at line 60). The green border is not from the cursor rectangle.
- accessibilityLayer: Only controls tabIndex/role on SVG surface and keyboard navigation. Removing it doesn't prevent the outline because the global CSS applies to ALL elements regardless of tabIndex.

## Resolution

- root_cause: The global CSS rule `* { outline-color: var(--ring) }` (emerald green) in globals.css sets outline-color on all elements including Recharts SVG internals. The existing ChartContainer CSS only suppressed outlines for .recharts-layer, .recharts-surface, and .recharts-sector -- but missed .recharts-wrapper (div), .recharts-rectangle (path elements), the svg element itself, and other SVG child elements that can receive focus.
- fix: Added comprehensive outline-hidden selectors to ChartContainer in chart.tsx covering all Recharts elements: recharts-wrapper, recharts-rectangle, svg, and svg * (all SVG children). Also reformatted the className for readability using cn() array format.
- verification: 111 tests pass across 16 stats test files. TypeScript compiles cleanly. Visual verification needed in browser.
- files_changed: src/components/ui/chart.tsx
