---
name: Cross Stitch Tracker
description: Personal craft management app for tracking 500+ charts through their full lifecycle
colors:
  emerald-600: "#3d9970"
  emerald-500: "#48b584"
  amber-500: "#d4930d"
  stone-50: "#fafaf8"
  stone-100: "#f5f5f3"
  stone-300: "#d4d4ce"
  stone-500: "#79796e"
  stone-900: "#2c2c28"
  stone-950: "#1c1c19"
  sky-500: "#38bdf8"
  violet-600: "#7c3aed"
  rose-600: "#e11d48"
  orange-500: "#f97316"
  red-600: "#dc2626"
typography:
  display:
    fontFamily: "Fraunces, serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.2
  title:
    fontFamily: "Fraunces, serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "Source Sans 3, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Source Sans 3, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
  mono:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  sm: "4.8px"
  md: "6.4px"
  lg: "8px"
  xl: "11.2px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.emerald-600}"
    textColor: "#ffffff"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "32px"
  button-primary-hover:
    backgroundColor: "{colors.emerald-600}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.stone-950}"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "32px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.stone-950}"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "32px"
  card:
    backgroundColor: "#ffffff"
    textColor: "{colors.stone-950}"
    rounded: "{rounded.xl}"
    padding: "16px"
  badge-default:
    backgroundColor: "{colors.emerald-600}"
    textColor: "#ffffff"
    rounded: "9999px"
    padding: "2px 8px"
    height: "20px"
  input:
    backgroundColor: "transparent"
    textColor: "{colors.stone-950}"
    rounded: "{rounded.lg}"
    padding: "4px 10px"
    height: "32px"
---

# Design System: Cross Stitch Tracker

## 1. Overview

**Creative North Star: "The Craft Room Ledger"**

A beautifully organized notebook in a tidy craft room. Warm, precise, personal. The system celebrates the act of tracking as part of the craft itself, where recording progress is rewarding, not administrative.

The aesthetic is understated elegance with organic warmth. The emerald and amber palette feels natural and craft-adjacent without being literal or twee. Typography carries character through Fraunces headings (serif with optical sizing), while Source Sans 3 keeps body text clean and workmanlike. Data is rich but never overwhelming; hierarchy and whitespace create breathing room.

This system explicitly rejects: generic SaaS dashboard aesthetics, enterprise gray, overwhelming data density without hierarchy, anything childish or scrapbook-themed, and cold analytical interfaces. It is a personal tool that should feel like it was made _for_ its user, not _at_ them.

**Key Characteristics:**

- Data-rich without data-heavy: progressive disclosure, clear hierarchy
- Quiet until it matters: color and emphasis reserved for meaning
- Warm neutrals tinted toward stone (never pure gray)
- Serif headings bring character; sans body stays workmanlike
- Monospace reserved exclusively for numeric data (thread codes, stitch counts, percentages)

## 2. Colors

A naturalistic palette rooted in stone, emerald, and amber. The warmth comes from tinting every neutral toward the stone hue family (oklch hue ~56-75), avoiding cold gray entirely.

### Primary

- **Emerald Canopy** (oklch(0.596 0.145 163.23)): Primary actions, active navigation, focus rings, success states. The single accent that anchors the app's identity.

### Secondary

- **Amber Thread** (oklch(0.769 0.188 70.08)): Secondary actions, kitting status, warning states. Warm counterpoint to the cool emerald. Used sparingly for distinction, never decoration.

### Neutral

- **Linen** (oklch(0.985 0.002 75.3)): Page background. Barely-there warmth, never stark white.
- **Parchment** (oklch(0.971 0.007 73.68)): Muted surfaces, card alternatives, inactive tabs.
- **Soft Stone** (oklch(0.869 0.005 56.37)): Borders, dividers, input strokes.
- **Faded Ink** (oklch(0.553 0.013 58.07)): Secondary text, descriptions, muted labels.
- **Deep Stone** (oklch(0.216 0.006 56.04)): Primary text, headings, high-emphasis content.

### Status Palette (Semantic, Locked)

Seven lifecycle colors, each mapped to a project state. These are semantic and must not be used decoratively:

- Unstarted: Stone-500 (neutral, waiting)
- Kitting: Amber-500 (active preparation)
- Kitted: Emerald-600 (ready to go)
- In Progress: Sky-500 (active work)
- On Hold: Orange-500 (paused)
- Finished: Violet-600 (complete)
- FFO: Rose-600 (fully finished object, celebration)

### Named Rules

**The Quiet Accent Rule.** Emerald appears on primary actions and active states only. Its rarity is what makes it feel intentional. If emerald is everywhere, nothing is primary.

**The Warm Neutral Doctrine.** Every neutral is tinted toward the stone hue (oklch hue 50-75, chroma 0.002-0.013). Pure gray (#808080, oklch with 0 chroma) is forbidden. The warmth is subtle but structural.

## 3. Typography

**Display Font:** Fraunces (with Georgia, serif fallback)
**Body Font:** Source Sans 3 (with system sans-serif fallback)
**Data Font:** JetBrains Mono (with monospace fallback)

**Character:** Fraunces brings warmth and personality to headings through its optical sizing and slight quirkiness. Source Sans 3 is clean, readable, and quietly confident for body text. The pairing feels like a well-designed journal: distinctive headers, practical body.

### Hierarchy

- **Display** (Fraunces, 600, 1.5rem/2xl, line-height 1.2): Page titles only. One per page. Always the entry point for eye flow.
- **Title** (Fraunces, 600, 1.125rem/lg, line-height 1.3): Section headings, card titles, empty state headings. The workhorse heading level.
- **Body** (Source Sans 3, 400, 0.875rem/sm, line-height 1.5): All prose text, descriptions, table cells. Capped at ~75ch for readability in prose contexts.
- **Label** (Source Sans 3, 500, 0.75rem/xs, line-height 1.4): Form labels, metadata, badge text, chip text. Medium weight for distinction without shouting.
- **Data** (JetBrains Mono, 500, 0.75rem/xs, tabular-nums): Thread codes (DMC 310), stitch counts, quantities, percentages. Tabular numerals always.

### Named Rules

**The Mono Discipline Rule.** JetBrains Mono is used exclusively for numeric data that benefits from tabular alignment: thread codes, stitch counts, session durations, percentages. Never in headings, never in body text, never in navigation.

**The Heading Font Rule.** Every h1-h6 and every card title uses Fraunces (font-heading). Source Sans handles everything else. There are no exceptions; mixed heading fonts would break the system's visual rhythm.

## 4. Elevation

Tonal layering is the primary depth mechanism. The background/card/muted progression creates spatial hierarchy without shadows at rest. Shadows appear only as interaction feedback or for overlays that float above the page.

**Philosophy: Flat at rest, shadow on response.** A card sitting on the page has no shadow. A card being hovered gains lift (translateY + shadow-lg). A popover or dropdown uses shadow-md because it genuinely floats above content. This makes depth feel responsive and tactile rather than decorative.

### Shadow Vocabulary

- **Ambient hover** (`shadow-lg` + `translateY(-4px)`): Gallery cards on hover. The lift signals interactivity.
- **Overlay** (`shadow-md`): Popovers, dropdowns, select menus. Functional float above page content.
- **Panel** (`shadow-lg`): Sheet/drawer overlays, mobile navigation. Heavier because it must separate from everything behind it.
- **Subtle rest** (`shadow-sm`): Active tab indicators, error cards. Barely perceptible separation for special-case elements.

### Named Rules

**The Earned Shadow Rule.** Surfaces are flat at rest. Shadows appear only as a response to state (hover, focus, open) or for elements that genuinely float above the page (overlays, sheets). A shadow without a trigger is decorative and forbidden.

## 5. Components

### Buttons

Warm and tactile. Compact by default (32px height), with clear state transitions.

- **Shape:** Rounded-lg (8px). Gently curved, not pill-shaped.
- **Primary:** Emerald-600 background, white text. Dense padding (px-2.5). Active state presses down 1px (translateY).
- **Hover / Focus:** Primary darkens to 80% opacity on hover. Focus shows 3px emerald ring with 50% opacity.
- **Outline:** Border-border stroke, transparent background. Hover fills with muted. Used for secondary actions.
- **Ghost:** No border, no background. Hover fills with muted. Used for tertiary/toolbar actions.
- **Destructive:** Red-tinted background (destructive/10), red text. Hover intensifies tint. Danger without alarm.

### Badges

Full-round pills (rounded-4xl/9999px) at 20px height. Compact, legible, used for status and counts.

- **Default (Status):** Emerald background, white text. Used for primary categorical labels.
- **Outline:** Border-border stroke, transparent background. For less-emphatic metadata.
- **Secondary:** Amber background, white text. For secondary categorization.

### Cards

The primary container. Clean, warm, and unobtrusive at rest.

- **Corner Style:** Rounded-xl (11.2px). Slightly softer than buttons for visual distinction between interactive/container.
- **Background:** White (oklch(1 0 0) light / stone-900 dark). Never the same as page background.
- **Border:** 1px ring (foreground/10). Barely visible; just enough to define the edge.
- **Shadow:** None at rest. Earned on hover where applicable.
- **Internal Padding:** 16px (p-4) default, 12px (p-3) for compact (size="sm").
- **Titles:** Fraunces, font-medium, text-base. Tighter than page headings.

### Inputs

Minimal stroke, maximum clarity.

- **Style:** 1px border-input stroke, transparent background, rounded-lg (8px). Height 32px.
- **Focus:** Border shifts to emerald (border-ring), 3px ring at ring/50 opacity. Clear but not harsh.
- **Error:** Border shifts to destructive, 3px ring at destructive/20. Input group may shake (0.4s ease-in-out).
- **Disabled:** 50% opacity, input background at 50%. Cursor not-allowed.

### Navigation

Sidebar (desktop) / top-bar (mobile) pattern. Clean, icon-forward.

- **Nav items:** 20px icons (strokeWidth 1.5) + text label. Rounded-lg container.
- **Active state:** Emerald-50 background tint, emerald-700 text. Font-medium weight. No border indicators.
- **Hover:** Muted background fill, text shifts to full foreground. Smooth color transition.
- **Mobile:** Collapsed sidebar becomes top-bar with hamburger menu triggering a sheet overlay.

### Gallery Card (Signature Component)

The primary way charts are browsed. Image-forward with metadata overlay.

- **Structure:** Vertical stack (image + content). Rounded-xl, overflow hidden.
- **Interaction:** Hover lifts card (-translate-y-1) with shadow-lg. The entire card is a link target.
- **Image:** Cover-fit with aspect ratio. No rounded corners (overflow clips to card shape).
- **Content:** Title (Fraunces), status badge, metadata row. Compact vertical rhythm.

## 6. Do's and Don'ts

### Do:

- **Do** use oklch for all color definitions. Every custom property is expressed in oklch with comments naming the reference color.
- **Do** tint neutrals toward stone hue (oklch hue 50-75). Even at chroma 0.002, the warmth registers subconsciously.
- **Do** use Fraunces for every heading element (h1-h6, card titles, dialog titles, sheet titles). Consistency builds the ledger feel.
- **Do** use JetBrains Mono exclusively for numeric/code data: thread codes, stitch counts, quantities, percentages.
- **Do** use semantic color tokens (bg-card, text-muted-foreground, border-border) rather than hardcoded scales.
- **Do** celebrate progress moments. Stat updates, milestone achievements, and completion states deserve visual acknowledgment.
- **Do** respect the status color vocabulary. Seven colors, seven states, no repurposing.

### Don't:

- **Don't** use pure black (#000) or pure white (#fff) for anything. Always use the tinted stone palette equivalents.
- **Don't** make it look like a generic SaaS dashboard. No enterprise gray, no flat blue accent, no oversized hero metrics.
- **Don't** use JetBrains Mono outside of numeric data contexts. Not in headings, not in navigation, not in prose.
- **Don't** add shadows to elements at rest. Shadows are earned through interaction (hover, focus, float).
- **Don't** use border-left or border-right as colored accent stripes on cards or list items.
- **Don't** use gradient text (background-clip: text with gradient).
- **Don't** create overwhelming data density without hierarchy. If everything is equally loud, nothing communicates.
- **Don't** make it childish or scrapbook-themed. The craft is serious; the interface respects that with elegance, not twee decoration.
- **Don't** use identical card grids (same icon + heading + text repeated). Every surface should communicate unique data.
- **Don't** import from button.tsx in Server Components. Use button-variants.ts for buttonVariants access.
