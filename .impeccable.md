## Design Context

### Users

Single user (the developer/stitcher) managing 500+ cross-stitch charts through their full lifecycle — acquisition, kitting, stitching, completion, and finishing. Used at a desk for planning/data entry and on a couch/chair during stitching sessions. The job: replace a sprawling Notion system with something faster, more pleasant, and stat-rich. This is a personal tool that should feel like it was made _for_ them, not _at_ them.

### Brand Personality

**Calm, elegant, understated — with moments of whimsy.**

The app is refined and quiet by default. It lets the craft and the data speak. But it doesn't take itself too seriously — milestone celebrations, playful empty states, and small delightful touches keep it from feeling sterile. Think: a beautifully organized craft room that has a few fun pins on the corkboard.

**Emotional goals:** Satisfaction and reward from tracking progress. Excitement and motivation from seeing stats, milestones, and the growing collection. The interface should make stitching _more_ rewarding, not add busywork.

### Aesthetic Direction

- **Visual tone:** Understated elegance with organic warmth. Emerald/amber/stone palette provides a natural, craft-adjacent feel — not corporate, not childish.
- **Typography:** Fraunces (serif) for headings brings character and warmth. Source Sans 3 (sans) for body keeps things clean and readable. JetBrains Mono reserved _only_ for hero stat numbers and progress percentages — never in tables or body text.
- **Dark mode:** Supported (light default). All components include dark: variants. Stone neutrals anchor both themes.
- **Status colors:** 7 distinct lifecycle colors (stone, amber, emerald, sky, orange, violet, rose) — these are semantic and locked.
- **Whimsy moments:** Achievement badges, progress milestones, empty state illustrations, subtle animations on stat changes. These are _accents_, not the default tone.
- **Anti-references:** Nothing that looks like a generic SaaS dashboard. No enterprise gray. No overwhelming data density without hierarchy.

### Design Principles

1. **Data-rich, not data-heavy.** Show comprehensive statistics and details, but use hierarchy, whitespace, and progressive disclosure so nothing feels overwhelming.
2. **Celebrate progress.** Every interaction that tracks progress should feel rewarding — stats update satisfyingly, milestones are acknowledged, completion feels like an achievement.
3. **Craft-worthy aesthetics.** The app should feel as considered and beautiful as the craft it tracks. Typography, spacing, and color choices should feel intentional, not templated.
4. **Quiet until it matters.** The default state is calm and clean. Color, animation, and emphasis appear when they carry meaning — status changes, achievements, warnings — not as decoration.
5. **Speed over ceremony.** Common actions (log a session, check supplies, find a chart) should be fast and frictionless. No unnecessary modals, confirmations, or steps.

### Accessibility

- WCAG AA compliance (contrast ratios, keyboard navigation, screen reader support)
- Semantic HTML and ARIA labels for all interactive elements
- Focus-visible indicators that match the design system
- Color is never the _only_ indicator — status badges include text labels alongside colored dots

### Design System Reference

- **Design tokens:** `~/projects/cross-stitch-tracker-design/product-plan/design-system/tokens.css`
- **Typography rules:** `~/projects/cross-stitch-tracker-design/product-plan/design-system/fonts.md`
- **Color usage guide:** `~/projects/cross-stitch-tracker-design/product-plan/design-system/tailwind-colors.md`
- **Components (43 total):** `~/projects/cross-stitch-tracker-design/product-plan/`
- **Screenshots (30):** `~/projects/cross-stitch-tracker-design/product-plan/product/sections/`
