# Phase 1: Foundation & Infrastructure - Context

**Gathered:** 2026-03-28
**Status:** Ready for planning

<domain>
## Phase Boundary

A working, authenticated app shell with the design system applied, responsive on Mac and iPhone, installable as a PWA. Database connected to Neon with Prisma. This phase delivers the skeleton that all subsequent phases build on — no domain features yet, just infrastructure and chrome.

</domain>

<decisions>
## Implementation Decisions

### Authentication
- **D-01:** Simple credentials provider (Auth.js v5) — email + password stored in environment variables, no registration page
- **D-02:** Generic error message on failed login ("Invalid credentials") — don't reveal whether email or password is wrong
- **D-03:** Long-lived sessions (30 days) — single-user app on personal devices, frequent re-login is annoying
- **D-04:** Branded minimal login page — centered card with app logo/name, email + password fields, emerald/stone design system
- **D-05:** Simple rate limiting — 5 failed attempts triggers 30-second cooldown, no external dependencies
- **D-06:** Post-login landing page is Main Dashboard (placeholder until DASH-01 is built in Phase 8)

### App Shell Layout
- **D-07:** Collapsible sidebar navigation on desktop (expanded by default), slide-out drawer on mobile — matches existing design components
- **D-08:** Sidebar collapse state persisted in localStorage across page refreshes
- **D-09:** All nav items visible from Phase 1 — inactive items grayed out with placeholder pages ("Coming in Phase X")
- **D-10:** TopBar quick actions (Log Stitches, Add Chart) shown as placeholders — toast notification on click ("Coming in Phase X")
- **D-11:** Search input visible as placeholder — shows "Coming soon" on focus
- **D-12:** Dark mode from Phase 1, following OS system preference (prefers-color-scheme)
- **D-13:** App logo: cross-stitch themed icon (not the 'X' placeholder) + "Cross Stitch Tracker" text in Fraunces
- **D-14:** Logo click navigates to Dashboard (home)
- **D-15:** Logout action lives in UserMenu dropdown in TopBar

### Design System Import
- **D-16:** Design source of truth is `~/projects/cross-stitch-tracker-design/product-plan/` — tokens.css, fonts.md, tailwind-colors.md, and shell component TSX files
- **D-17:** Fonts via next/font/google (Fraunces, Source Sans 3, JetBrains Mono) — self-hosted, no CDN dependency
- **D-18:** Status colors as CSS custom properties in globals.css (--status-unstarted through --status-ffo)
- **D-19:** Adapt design component patterns to Next.js App Router — rewrite code, don't port Vite components directly. Server Components where possible, Client Components only for interactive parts
- **D-20:** shadcn/ui as component foundation — initialize with design token overrides (emerald/amber/stone). Radix primitives come through shadcn
- **D-21:** Lucide as the icon library — already used throughout design components, tree-shakeable
- **D-22:** Tailwind v4 with CSS-native @theme configuration (no tailwind.config.js)

### PWA & Responsive
- **D-23:** Phase 1 PWA scope: manifest + installability only — no service workers, no offline support (deferred to v2)
- **D-24:** Cross-stitch themed PWA icon — emerald background with cross-stitch motif, generated at 192x192 and 512x512
- **D-25:** Primary mobile target: iPhone standard size (~390px width) with safe area insets
- **D-26:** Standard responsive behavior following design components — hamburger nav on mobile, hidden button labels on small screens, no special gestures

### Claude's Discretion
- Database connection setup details (Neon pooled vs direct URLs, Prisma config)
- ESLint + Prettier configuration
- Project directory structure within the conventions defined in CLAUDE.md
- Loading/error states for placeholder pages
- Exact toast notification library and styling
- PWA manifest metadata (description, theme_color, display mode)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Design system
- `~/projects/cross-stitch-tracker-design/product-plan/design-system/tokens.css` — CSS custom properties for colors, typography, status colors
- `~/projects/cross-stitch-tracker-design/product-plan/design-system/fonts.md` — Font usage rules, weight mapping, JetBrains Mono restrictions
- `~/projects/cross-stitch-tracker-design/product-plan/design-system/tailwind-colors.md` — Color palette, status color mapping, usage examples

### Shell components (visual/behavioral reference — rewrite for Next.js)
- `~/projects/cross-stitch-tracker-design/product-plan/shell/components/AppShell.tsx` — Layout structure, sidebar + mobile drawer pattern
- `~/projects/cross-stitch-tracker-design/product-plan/shell/components/MainNav.tsx` — Nav items, icon mapping, collapse toggle, active state styling
- `~/projects/cross-stitch-tracker-design/product-plan/shell/components/TopBar.tsx` — Search, quick actions, mobile hamburger
- `~/projects/cross-stitch-tracker-design/product-plan/shell/components/UserMenu.tsx` — Avatar, dropdown, logout/settings actions

### Project requirements
- `CROSS_STITCH_TRACKER_PLAN.md` — Full requirements, data model (section 5), phased build plan
- `.planning/REQUIREMENTS.md` — INFRA-01 through INFRA-05 define this phase's acceptance criteria
- `CLAUDE.md` — Tech stack table, architecture conventions, security rules

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- No existing codebase — this is a greenfield scaffold. All code will be new.

### Established Patterns
- No patterns established yet. Phase 1 sets the patterns all subsequent phases follow:
  - Server Components by default, Client Components for interactivity
  - Server Actions for mutations
  - Zod validation at boundaries
  - Prisma as data access layer through src/lib/db.ts

### Integration Points
- Design components in external directory need adaptation, not direct import
- Neon database connection (pooled for app, direct for migrations)
- Vercel deployment pipeline (push-to-deploy from main)

</code_context>

<specifics>
## Specific Ideas

- Design components use Lucide icons with `strokeWidth={1.5}` consistently — maintain this
- JetBrains Mono is ONLY for hero stat numbers and progress percentages — never in card detail rows or table cells (per fonts.md)
- All numbers in tables must explicitly set Source Sans 3 to prevent font inheritance from Fraunces headings
- Use `font-variant-numeric: tabular-nums` on number columns for alignment
- Nav icon mapping: dashboard=LayoutDashboard, charts=Scissors, supplies=Package, sessions=Clock, stats=BarChart3, shopping=ShoppingCart, settings=Settings

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation-infrastructure*
*Context gathered: 2026-03-28*
