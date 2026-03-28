# Design Context

> Moved from CLAUDE.md to reduce file size. Consult when building UI or making visual decisions.

## Users

Single user (the developer/stitcher) managing 500+ cross-stitch charts through their full lifecycle. Used at a desk for planning and on a couch during stitching sessions. Replaces a Notion system with something faster, more pleasant, and stat-rich.

## Brand Personality

**Calm, elegant, understated — with moments of whimsy.** Refined and quiet by default, but doesn't take itself too seriously. Milestone celebrations, playful empty states, and small delights keep it from feeling sterile.

**Emotional goals:** Satisfaction/reward from tracking progress. Excitement/motivation from stats, milestones, and the growing collection.

## Aesthetic Direction

- **Palette:** Emerald (primary), amber (secondary/CTA), stone (neutral). 7 status colors: stone, amber, emerald, sky, orange, violet, rose.
- **Typography:** Fraunces (headings, warmth), Source Sans 3 (body, clean), JetBrains Mono (hero stat numbers ONLY).
- **Theme:** Light default, dark mode supported. All components include dark: variants.
- **Whimsy accents:** Achievement badges, progress milestones, empty state character, subtle stat animations — accents, not default tone.
- **Anti-references:** No generic SaaS gray. No enterprise density without hierarchy.

## Design Principles

1. **Data-rich, not data-heavy.** Use hierarchy, whitespace, and progressive disclosure.
2. **Celebrate progress.** Stats update satisfyingly, milestones are acknowledged, completion feels like achievement.
3. **Craft-worthy aesthetics.** Typography, spacing, and color feel intentional, not templated.
4. **Quiet until it matters.** Color, animation, emphasis appear when they carry meaning — not decoration.
5. **Speed over ceremony.** Common actions are fast and frictionless. No unnecessary steps.

## Accessibility

- WCAG AA compliance (contrast, keyboard nav, screen reader support)
- Color is never the only indicator — badges include text labels alongside dots
- Focus-visible indicators matching the design system

## Design System Reference

- **Tokens:** `product-plan/design-system/tokens.css`
- **Typography:** `product-plan/design-system/fonts.md`
- **Colors:** `product-plan/design-system/tailwind-colors.md`
- **Components (50+):** `product-plan/sections/` — see `.planning/DESIGN-REFERENCE.md` for full map
- **Screenshots (30):** in each section directory
- **Full spec:** `.impeccable.md` in project root
