# Phase 30: Code Quality - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-24
**Phase:** 30-code-quality
**Areas discussed:** Status color centralization, Silent failure cleanup scope, R2 photo orphan handling, Shared extractions approach

---

## Status Color Centralization

### How should status colors be centralized?

| Option | Description | Selected |
|--------|-------------|----------|
| CSS custom properties | Define --status-* vars in globals.css (light + dark). STATUS_CONFIG references them. Single source for dark/light. | ✓ |
| Keep Tailwind classes, just deduplicate | Keep STATUS_CONFIG as-is with raw Tailwind, ensure all consumers reference it | |
| Tailwind theme extension | Extend theme with status-* colors (bg-status-kitting). More Tailwind-native. | |

**User's choice:** CSS custom properties
**Notes:** None — straightforward selection of recommended approach.

### Which components should consume the new CSS properties?

| Option | Description | Selected |
|--------|-------------|----------|
| All status consumers | StatusBadge, GalleryCard, BucketProjectRow, WhatsNextTab, log-session-modal | ✓ |
| Only targeted QUAL-04 files | Just the 4 files with scattered scales, leave log-session-modal separate | |

**User's choice:** All status consumers

### Log-session-modal emerald: status or accent?

| Option | Description | Selected |
|--------|-------------|----------|
| Status variable — it IS the in-progress color | Unify with --status-in-progress-* | ✓ |
| Keep as primary accent (semantic token) | Replace with text-primary/bg-primary instead | |

**User's choice:** Status variable — it IS the in-progress color

### Size colors: CSS vars too?

| Option | Description | Selected |
|--------|-------------|----------|
| CSS vars for size too | Same treatment as status | |
| Leave size colors as-is | Already centralized, low ROI | ✓ |

**User's choice:** Leave size colors as-is

---

## Silent Failure Cleanup

### Scope of silent failure fix

| Option | Description | Selected |
|--------|-------------|----------|
| QUAL-02 targets only | Fix upload-actions, chart page, log-session-modal (3 files, ~6 locations) | ✓ |
| QUAL-02 + console.error to all client catches | Fix 3 targets AND add logging to ~20 client-component catches | |
| QUAL-02 + audit/classify all | Fix 3 targets, classify remaining as correct vs needs-logging | |

**User's choice:** QUAL-02 targets only

### Log-session-modal catches: toast or just log?

| Option | Description | Selected |
|--------|-------------|----------|
| console.error + toast.error | User should know if photo/session failed. Both debug + user feedback. | ✓ |
| console.error only | Keep silent to user, just add dev logging | |

**User's choice:** console.error + toast.error

### Chart page estimate catch: null or placeholder?

| Option | Description | Selected |
|--------|-------------|----------|
| Log + return null (page still loads) | Graceful degradation, non-critical data | ✓ |
| Log + show 'estimate unavailable' placeholder | Show message instead of hiding section | |

**User's choice:** Log + return null

---

## R2 Photo Orphan Handling

### When to delete old photo

| Option | Description | Selected |
|--------|-------------|----------|
| Delete old photo after new one succeeds | Fire-and-forget with console.warn on failure | ✓ |
| Delete old photo before updating DB | Guarantees no orphans but risks data loss | |

**User's choice:** Delete old photo after new one succeeds

### Scope: session only or include chart covers?

| Option | Description | Selected |
|--------|-------------|----------|
| Session photos only (QUAL-03 as written) | Just fix session photo replace | |
| Session + chart cover photos | Fix both — same pattern, same fix shape | ✓ |

**User's choice:** Session + chart cover photos

---

## Shared Extractions

### DEFAULT_SUPPLY_HEX location

| Option | Description | Selected |
|--------|-------------|----------|
| src/lib/constants.ts | General constants file for magic values | ✓ |
| src/lib/validations/supply.ts | Co-locate with supply validation schema | |
| src/types/supply.ts | Keep in supply domain layer | |

**User's choice:** src/lib/constants.ts

### useRejectionFlash location and API

| Option | Description | Selected |
|--------|-------------|----------|
| src/components/hooks/use-rejection-flash.ts | Dedicated hooks dir, returns { showRejection, triggerRejection } | ✓ |
| src/lib/hooks/use-rejection-flash.ts | Under lib/ with other utilities | |
| Inline in shared editable-number utils | Keep near the 2 consumers | |

**User's choice:** src/components/hooks/use-rejection-flash.ts

### TypeScript error fix approach

| Option | Description | Selected |
|--------|-------------|----------|
| as unknown as Type[] cast | Standard pattern for intentionally-invalid test inputs | ✓ |
| @ts-expect-error comment | Less ceremony, signals intentionally wrong | |

**User's choice:** as unknown as Type[] cast

---

## Claude's Discretion

- Test strategy and plan structure/grouping
- Exact oklch color values (match current Tailwind visual appearance)
- Whether `src/lib/constants.ts` is new file or extends existing
- Work ordering across plans

## Deferred Ideas

None — discussion stayed within phase scope.
