# Phase 26: UX Polish - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-19
**Phase:** 26-ux-polish
**Areas discussed:** Card row accessibility, Visual feedback & copy, Focal point editing UX, Thread insights interaction
**Mode:** Advisor (research-backed comparison tables)

---

## Card Row Accessibility (UX-02)

Advisor research found that existing code is closer to correct than expected — name Links and action buttons are already siblings, not nested. Main gaps are missing ARIA attributes.

| Option | Description | Selected |
|--------|-------------|----------|
| Flat DOM + ARIA attributes | Keep structure, add role="group" + aria-labelledby + aria-labels. Extend GalleryCard Link to wrap image. | ✓ |
| Flat DOM, name-only click target | Same ARIA fix but GalleryCard keeps name-only click target | |
| Pseudo-element overlay | Invisible Link covers full card, action buttons float above via z-index | |

**User's choice:** Flat DOM + ARIA attributes with GalleryCard image Link extension
**Notes:** BucketProjectRow and ChartRow already correct — no changes needed. Fix is primarily additive ARIA attributes.

---

## Visual Feedback & Copy (UX-03, UX-05, UX-06)

### EditableNumber (UX-03)

| Option | Description | Selected |
|--------|-------------|----------|
| Red border flash + background tint | 600ms red border flash on rejection + pink tint during invalid draft | ✓ |
| Persistent red border + shake | Stays red until corrected, shake animation | |
| Tooltip with error message | Popover explaining the rule | |
| Keep silent revert | Status quo — no visual feedback | |

### Kitting Label at 0% (UX-05)

| Option | Description | Selected |
|--------|-------------|----------|
| Three-state copy | "Not kitted" at 0%, "Kitting" at 1-99%, "Fully kitted" at 100% | ✓ |
| Percentage only | Remove label, show only number | |
| Suppress label at 0% | Show nothing below progress bar | |

### Shopping-for Bar Pills (UX-06)

Advisor research discovered the DesignOS source also uses full-round (borderRadius: 999), contradicting backlog 999.12's description of "squared chips."

| Option | Description | Selected |
|--------|-------------|----------|
| Match DesignOS (tighten padding) | Keep full-round, adjust padding to match mockup | |
| Add border to existing pills | Keep full-round + add visible border | |
| Squared chips (rounded-lg + border) | Intentional DesignOS deviation — more shopping-cart-appropriate | ✓ |

**User's choice:** All recommended options + squared chips (intentional DesignOS deviation)
**Notes:** User chose to deviate from DesignOS for pills — squared chips with border are more conventional for shopping cart filter UIs. This should be flagged as an intentional deviation per project conventions.

---

## Focal Point Editing UX (UX-10, UX-13)

### Action Bar Repositioning (UX-10)

| Option | Description | Selected |
|--------|-------------|----------|
| Move bar below image as sibling | Split FocalPointEditor into click-area + action-bar, bar renders outside banner | ✓ |
| Float bar to top edge | Change bottom-0 to top-0 | |
| Icon-only compact buttons | Shrink bar height without moving it | |

### Cover Image Preview (UX-13)

| Option | Description | Selected |
|--------|-------------|----------|
| Dynamic aspect ratio from image dimensions | Container adjusts via onLoad + aspect-ratio CSS | ✓ |
| Fixed 16:9 container | Better default than pseudo-square | |
| Keep current | No change | |

**User's choice:** Bar below image + dynamic preview ratio
**Notes:** Hero banner (object-contain + blur fill) confirmed as intentional — no change needed there. Only edit form preview and action bar positioning need fixes.

---

## Thread Insights Interaction (UX-12)

Advisor research found items have NO interactive styling today — no hover, no cursor-pointer, no links. Issue is purely visual inconsistency with sister cards.

| Option | Description | Selected |
|--------|-------------|----------|
| Match sister card styling | Add rank numbers, align visual grammar with Designer/Genre insight cards | ✓ |
| Add tooltip on click | "Used in X projects" popover | |
| No change | Accept visual inconsistency | |

**User's choice:** Match sister card styling (recommended)
**Notes:** User noted thread insight items don't currently appear on their stats page (likely insufficient thread data). Fix is still worthwhile for visual consistency. Actual thread detail linking deferred to backlog 999.1.

---

## Claude's Discretion

- UX-01: SearchToAdd keyboard highlight tracking approach
- UX-04: Supplies page first-load flash investigation and fix
- UX-07: Supply table commit button icon, sizing, positioning
- UX-08: InlineCreateDialog contextual label mapping per supply type
- UX-09: BucketProject focal point integration approach
- UX-11: Fabric matching null fabricCount logic fix
- UX-14: What's Next gallery card styling reuse strategy
- Plan structure and grouping of 14 requirements into plans/waves

## Deferred Ideas

None — discussion stayed within phase scope.
