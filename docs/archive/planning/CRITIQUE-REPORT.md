# Design Critique Report

**Date:** 2026-04-12
**Phase:** 5 (Foundation & Quick Wins) — post-execution, pre-verification
**Method:** Dual-assessment (LLM design review + automated anti-pattern detection)
**Overall Score:** 24/40 (Nielsen's heuristics)
**AI Slop Verdict:** Clean — zero AI-generated tells detected

---

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | No loading states for 10/11 routes; no skeleton screens |
| 2 | Match System / Real World | 4 | Domain vocabulary is precise and authentic |
| 3 | User Control and Freedom | 2 | No undo for any action; no draft saving; no soft delete |
| 4 | Consistency and Standards | 3 | Minor: raw `<select>` vs SearchableSelect in some filters |
| 5 | Error Prevention | 3 | Good validation; stitch count vs dimensions conflict unwarned |
| 6 | Recognition Rather Than Recall | 3 | Strong status badges + color swatches; chart detail doesn't link to designer |
| 7 | Flexibility and Efficiency | 1 | No search/filter on charts page; no keyboard shortcuts; no bulk ops |
| 8 | Aesthetic and Minimalist Design | 3 | Cohesive palette; designer table shows 4 empty columns |
| 9 | Error Recovery | 2 | Generic "Something went wrong" x15; no differentiated error messages |
| 10 | Help and Documentation | 1 | No onboarding; no contextual help for domain terms |
| **Total** | | **24/40** | **Moderate — strong foundations, needs UX maturity** |

---

## Anti-Patterns Verdict

**This interface does NOT look AI-generated.** Both assessments agree.

**LLM assessment:** The emerald/amber/stone palette reads "craft store," not "SaaS dashboard." Typography is intentional (Fraunces + Source Sans 3 is a personality-bearing stack, not defaults). Zero gradient text, zero glassmorphism, zero neon-on-dark, zero side-stripe borders. The only mild tell is uniform card treatment (`rounded-xl border shadow-sm` everywhere) — monotonous but not sloppy.

**Deterministic scan:** `npx impeccable detect` found 3 findings, all false positives — `bg-black/10` and `bg-black/50` in dialog/sheet overlays and image button backgrounds, which are standard patterns.

**Manual pattern scan (25 checks):**

| Category | Checked | Found | True Positives |
|----------|---------|-------|----------------|
| AI Slop Tells | 10 | 0 | 0 |
| CLI Findings (pure-black-white) | 3 | 3 | 0 (all false positives) |
| Design Quality - Missing States | 2 | 2 | 2 |
| Design Quality - Spacing/Layout | 2 | 2 | 2 |
| Design Quality - Minor | 2 | 2 | 2 |
| **Total** | **19** | **9** | **6** |

---

## Overall Impression

This is a well-built app with a distinctive identity that hasn't yet graduated from "organized" to "resonant." The color system (7 semantic lifecycle statuses) is genuinely excellent and the empty states show real personality. But the interface is **flat** — every page, every card, every surface gets identical visual treatment. The brand promises "whimsy" but delivers it only in microcopy, never in interaction. And the most significant scaling miss: the app's primary entity (charts, 500+ items) has no search, no filters, and no pagination.

---

## What's Working

### 1. Status color system is the standout design decision
Seven lifecycle states, seven distinct hues (stone, amber, emerald, sky, orange, violet, rose), consistent dot+label+bg treatment across badges and dropdowns, proper light/dark variants. This makes the project lifecycle instantly scannable and gives the interface domain-appropriate richness. Both assessments flagged this as the strongest asset.
- Files: `src/lib/utils/status.ts`, `src/components/features/charts/status-badge.tsx`

### 2. Empty states are consistently warm and actionable
Every list view has a unique empty state with domain-aware copy and clear CTAs. "Your collection awaits," "All caught up! Time to stitch!" — better than most production apps. The charts empty state has a cross-stitch grid pattern. This is where the "whimsy" promise actually lands.
- Files: `chart-list.tsx` lines 79-135, `shopping-list.tsx` lines 163-177

### 3. Domain vocabulary is precise and authentic
"Chart" vs "Project," "Kitted," "FFO," "BAP," "SAL" — the app speaks the community's language fluently. The shopping list organized by project matches how stitchers actually shop. Builds trust immediately.

---

## Priority Issues

### [P1] Charts page has no search or filtering for a 500+ item collection
- **Why:** Primary entity, flat table, no search/status filter/designer filter/pagination. The supplies page already has search + brand filter + color family filter — charts has none.
- **Fix:** Add filter bar mirroring supply catalog: search input, status multi-select, designer dropdown, size category filter. Add pagination or virtual scrolling.
- **Command:** `/impeccable:harden`
- **Status:** Deferred to future roadmap phase (browse & organize)

### [P2] The "project finished" moment has zero emotional design
- **Why:** Completing a months-long project is a dropdown change with generic toast — identical to "On Hold." Peak-end rule means this moment shapes the user's memory of the product. Contradicts "celebrate progress" (design principle #2).
- **Fix:** Detect transitions to "Finished"/"FFO," show celebration — congratulations dialog, confetti, special toast with project stats.
- **Command:** `/impeccable:delight`
- **Status:** Deferred to future roadmap phase (emotional design pass)

### [P3] Missing loading states for 10 of 11 dashboard routes
- **Why:** Only `/charts` has `loading.tsx`. All other data-heavy routes show nothing during server-side fetching. App feels frozen during navigation.
- **Fix:** Add `loading.tsx` with skeleton screens for each route. Add `global-error.tsx` and route-level `not-found.tsx`.
- **Command:** `/impeccable:harden`
- **Status:** ACTION NOW

### [P4] Sidebar has 12 unstructured nav items competing equally
- **Why:** Reference data (Genres, Storage, Apps, Fabric) competes equally with primary workflows (Charts, Shopping, Sessions). Violates "fewer than 5 options" principle.
- **Fix:** Group with section dividers: Projects (Dashboard, Charts, Shopping), Track (Sessions, Statistics), Reference (Designers, Genres, Supplies, Fabric, Storage, Apps), System (Settings).
- **Command:** `/impeccable:layout`
- **Status:** ACTION NOW

### [P5] Generic error messages across the entire app
- **Why:** "Something went wrong. Please try again." appears 15+ times. User can't distinguish network errors from auth expiry from validation failures.
- **Fix:** Differentiate: "Connection lost" vs "Session expired" vs "Could not save — {reason}."
- **Command:** `/impeccable:clarify`
- **Status:** Deferred to future phase

---

## Persona Red Flags

### The Prolific Collector (500+ charts, bulk workflow)
No search on charts page. No bulk edit. No pagination. No saved views or filters. Designer table shows 4 empty columns wasting space. At scale, scrolling endlessly through flat table with no way to find what they need. **Will hit frustration within 2 weeks of real use.**

### The Couch Stitcher (mobile, during stitching sessions)
Edit/delete actions use `opacity-40` hover reveal — invisible on touch devices. Chart add form is a single long scroll with no progress indicator. Sidebar collapses but 12-item list is dense on mobile. "Log Stitches" quick action styled as secondary/outline — equal weight to "Add Chart" when it should dominate during stitching. **Primary workflow (log session) is buried.**

### The Celebrator (motivated by progress tracking)
Status change to "Finished" is a flat dropdown with no celebration. No achievement badges. No progress milestones acknowledged. Progress bar functional but no animation at 25%/50%/75%/100%. Brand promises "satisfaction and reward" but delivers spreadsheet experience. **Emotional motivation loop is broken.**

---

## Cognitive Load Assessment

| # | Check | Result |
|---|-------|--------|
| 1 | Labels visible at all times? | PARTIAL FAIL — supply catalog filter selects have no associated `<label>` |
| 2 | Related items grouped visually? | PASS — form sections, InfoCard groupings, tab organization |
| 3 | Clear visual hierarchy? | PARTIAL FAIL — info cards on chart detail are equally weighted |
| 4 | Fewer than 5 options at decision points? | PARTIAL FAIL — sidebar has 12 items; status dropdown has 7 (mitigated by color dots) |
| 5 | Complexity revealed progressively? | PASS — hover-reveal actions, contextual filters |
| 6 | Defaults provided? | PASS — status defaults, view mode persistence |
| 7 | Can undo or go back? | PARTIAL FAIL — no undo for any action; no soft delete |
| 8 | Current state visible? | PASS — status badges, active tab indicators, sort direction |

**Result: 3 partial failures = Moderate cognitive load**

---

## Emotional Journey

- **Primary emotion evoked:** Competent calm. Reassuring predictability. Does not excite, surprise, or delight beyond empty state copy.
- **Peak positive moment:** First time entering a chart and seeing cover image + status badge + stitch count layout. "My collection looks real."
- **Peak negative moment:** Deleting a chart with project data. Dialog is appropriately scary but offers no off-ramp (no archive, no export-before-delete).
- **Biggest emotional miss:** Status change from "Stitching" to "Finished" — represents months/years of work, treated identically to changing status to "On Hold." Single biggest emotional design gap.
- **Untapped moment:** "Mark Acquired" on shopping list is inherently satisfying (checking things off) but row disappears with no animation, no progress feedback toward "fully kitted."

---

## Minor Observations

- `font-fraunces` in `chart-add-form.tsx:65` should be `font-heading` for consistency
- Supply catalog filter selects use raw `<select>` vs `SearchableSelect` elsewhere — visual inconsistency
- `user-menu.tsx:41` hardcodes `bg-amber-100 text-amber-700` instead of semantic tokens
- `button-variants.ts` still uses `transition-all` — should be `transition-colors`
- No `max-width` on main content area (`app-shell.tsx:23`) — text stretches on ultra-wide monitors
- Size category colors partially overlap with status colors (amber = both "kitting" and "medium size")
- Designer detail page exists but isn't linked from chart detail — missed cross-linking
- Designer table shows 4 columns (Website, Started, Finished, Top Genre) displaying em-dashes — empty columns signal unfinished interface
- Card boundaries are low-contrast (`ring-foreground/10` + `shadow-sm`) — may be hard to perceive in bright light
- Cover image `object-contain` with fixed `max-h-80` renders portrait images very small (known backlog item 999.6)

---

## Questions to Consider

1. **What if the charts list page was a kanban board by default?** The 7-status lifecycle is begging to be spatial. A user with 500 charts doesn't want a sorted table — they want to see what's in each phase. This would transform the app from "Notion replacement" to something that improves on Notion for this use case.

2. **What if each "Mark Acquired" click on the shopping list showed how close the project is to being fully kitted?** A small progress ring accumulating toward the "kitted" milestone would turn a flat checklist into a satisfying gathering loop. The emotional language of "collecting your materials" is rich and completely untapped.

3. **What if the sidebar prioritized based on your current projects' states?** If 3 projects are in "Kitting" status, the "Shopping" link should pulse or show a badge count. If a project is "In Progress," the "Sessions" link matters more. An adaptive nav would reduce the 12-item cognitive load without removing any items.

---

## Action Plan (User Decision: 2026-04-12)

### Action Now
1. `/impeccable:harden` — Loading skeletons (10 routes), `global-error.tsx`, `not-found.tsx`
2. `/impeccable:layout` — Sidebar nav grouping into labeled sections
3. `/impeccable:polish` — Minor fixes: `transition-all`, hardcoded amber, `max-width`, `font-heading` consistency

### Deferred (future roadmap phases)
- Chart search/filter/pagination (browse & organize phase)
- Completion celebrations + emotional design (delight phase)
- Error message differentiation
- Kanban view exploration
- Shopping list kitting progress
- Adaptive sidebar

### Tone Direction
User chose "Go bolder" — push past understated toward more visual personality and energy when emotional design phases arrive.
