# Phase 16: Input & Dashboard Fixes - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-16
**Phase:** 16-input-dashboard-fixes
**Areas discussed:** Keystroke bug scope, Spotlight proportions, Button consistency

---

## Keystroke Bug Scope

**Key finding:** Original SearchToAdd component is orphaned (no imports). Bug confirmed present in new PortalAutocomplete flow — root cause is focus jump when portal mounts and auto-focuses its own input mid-typing.

| Option | Description | Selected |
|--------|-------------|----------|
| B: Single input architecture | Remove portal's duplicate input. One input, one focus owner. Medium effort, eliminates root cause. | ✓ |
| A+C+D: Pragmatic combo | Stop auto-focus + useTransition + adapter fix. Lower effort, covers bug without refactoring. | |
| A+D: Minimal fix | Just stop focus jump and fix adapter identity. Lowest effort. | |

**User's choice:** B: Single input (Recommended)
**Notes:** Also including C (useTransition) and D (adapter identity fix) as free add-ons. Orphaned SearchToAdd to be deleted.

---

## Spotlight Proportions

**Current state:** max-h-[360px] min-h-[260px] with 50/50 grid split. Image panel ~550×360px at 1100px width.

| Option | Description | Selected |
|--------|-------------|----------|
| C: Fixed 320px column | Image column locked at 320px, content stretches. Max height lowered to 300px. Gallery-card-sized thumbnail. | ✓ |
| B: 40/60 split | Image gets 40% width (~440px). Simpler one-line change. | |
| E: 300px square-ish cap | Max-width 300px + max-height 300px. Most constrained. | |

**User's choice:** C: Fixed 320px column (Recommended)
**Notes:** Cross-stitch images are typically portrait/square. 320px matches gallery card proportions.

---

## Button Consistency

**Key finding:** Buttons already share the same padding (px-5 py-2.5). Imbalance is from font-weight difference (semibold vs medium) and hardcoded emerald bypassing design system tokens.

| Option | Description | Selected |
|--------|-------------|----------|
| C: Migrate primary + align weight | Check It Out uses buttonVariants default (dark mode for free), Shuffle bumped to font-semibold. | ✓ |
| A: Migrate both to buttonVariants | Full design system alignment for both buttons. | |
| B: Just align font-weight | Minimal change — one class swap. Leaves hardcoded colors. | |

**User's choice:** C: Migrate primary + align weight (Recommended)
**Notes:** --primary CSS var is already emerald, confirming swap is safe.

---

## Claude's Discretion

- useTransition wrapping scope
- ARIA attribute migration when portal input is removed
- Whether min-h-[260px] still needed at 300px max
- Test refactoring scope for PortalAutocomplete

## Deferred Ideas

None — discussion stayed within phase scope
