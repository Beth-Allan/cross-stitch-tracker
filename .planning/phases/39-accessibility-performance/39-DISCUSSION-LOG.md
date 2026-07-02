# Phase 39: Accessibility & Performance - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-01
**Phase:** 39-accessibility-performance
**Areas discussed:** Card row ARIA pattern, SSR hydration fix, Refactor scope

---

## Card Row ARIA Pattern

### How to restructure clickable card rows?

| Option | Description | Selected |
|--------|-------------|----------|
| Stretched link | Keep card as plain `<div>`. Add visually-hidden `<Link>` stretched via absolute inset-0. Edit/delete buttons float above via z-index. | ✓ |
| Separate nav link | Remove onClick from card. Add visible "View" link alongside edit/delete. Clearest semantics but changes visual interaction. | |
| Link as container | Wrap entire card in `<Link>`. Use preventDefault on nested buttons. Simpler DOM but links-containing-buttons is still invalid HTML. | |

**User's choice:** Stretched link
**Notes:** Well-documented a11y pattern. Screen readers see Link + buttons as siblings.

### Link label approach?

| Option | Description | Selected |
|--------|-------------|----------|
| Visually hidden | sr-only class on link text. Card appearance identical to today. | ✓ |
| Visible link text | Make entity name the clickable Link element. | |

**User's choice:** Visually hidden
**Notes:** None

### Keyboard navigation handler?

| Option | Description | Selected |
|--------|-------------|----------|
| Remove entirely | Link handles Enter natively. Space is for buttons, not links. | ✓ |
| Keep for Space key | Some users expect Space for card navigation. | |

**User's choice:** Remove entirely
**Notes:** Correct semantics — simplifies code.

### Hover effect scope?

| Option | Description | Selected |
|--------|-------------|----------|
| Keep whole-card hover | Stretched link fills card, group-hover maintains existing transitions. | ✓ |
| Scope to link only | Only show cursor-pointer over link area. | |

**User's choice:** Keep whole-card hover
**Notes:** No visual change from today.

---

## SSR Hydration Fix

### Fix approach?

| Option | Description | Selected |
|--------|-------------|----------|
| useEffect post-mount | Initialize with defaults, useEffect reads localStorage. Simple, slight flash. | ✓ |
| useSyncExternalStore | React-recommended pattern. No flash but adds complexity. | |
| Accept & document | Console warning only, not user-visible. Document as intentional trade-off. | |

**User's choice:** useEffect post-mount
**Notes:** Simplest fix, matches established patterns in the codebase.

### Loading skeleton for flash?

| Option | Description | Selected |
|--------|-------------|----------|
| No skeleton | Flash barely perceptible, only when stored view differs from default. | ✓ |
| Brief skeleton | Avoids any flash but adds complexity for rare scenario. | |

**User's choice:** No skeleton
**Notes:** Over-engineering for a single-frame shift.

### Gallery hydration check?

| Option | Description | Selected |
|--------|-------------|----------|
| Check but don't fix | Verify pattern exists, document. Gallery's synchronous localStorage was intentional Key Decision. | ✓ |
| Fix if found | Fix alongside supply catalog for consistency. | |
| Skip | Stay scoped to supply catalog only. | |

**User's choice:** Check but don't fix
**Notes:** Gallery approach was deliberate per PROJECT.md Key Decisions.

---

## Refactor Scope

### ARIA refactor scope?

| Option | Description | Selected |
|--------|-------------|----------|
| Just storage + app lists | Only two components with role="button" containing child buttons. Others are valid. | ✓ |
| Include chart-file-row | Also clean up role="link" while at it. | |
| Broader sweep | Full audit of all role attributes. | |

**User's choice:** Just those two (storage-location-list + stitching-app-list)
**Notes:** Designer/genre rows, gallery cards, and chart-file-row confirmed structurally valid.

### Extract shared component?

| Option | Description | Selected |
|--------|-------------|----------|
| Keep separate | Both files small, domain-specific. Fix is ~5 lines per component. | ✓ |
| Extract shared | Create ClickableEntityCard for reuse. | |

**User's choice:** Keep separate
**Notes:** Minimal deduplication doesn't justify abstraction.

### useMemo depth?

| Option | Description | Selected |
|--------|-------------|----------|
| Aggregation only | Wrap aggregateSupplies + filterAggregatedSupplies. Booleans are trivial. | ✓ |
| All derived values | Memoize everything including booleans. | |

**User's choice:** Aggregation only
**Notes:** Over-memoizing adds cognitive overhead.

---

## Claude's Discretion

- Plan structure (single plan vs separate ARIA/performance plans)
- Exact useMemo dependency arrays after verifying prop references
- Whether to add TDD tests for stretched link ARIA pattern
- Whether `initialView` prop needs special handling in useEffect migration

## Deferred Ideas

None — discussion stayed within phase scope.
