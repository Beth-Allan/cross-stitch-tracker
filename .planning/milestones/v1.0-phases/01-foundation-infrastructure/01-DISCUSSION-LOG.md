# Phase 1: Foundation & Infrastructure - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-28
**Phase:** 01-foundation-infrastructure
**Areas discussed:** Auth setup, App shell layout, Design token import, PWA & responsive

---

## Auth Setup

| Option | Description | Selected |
|--------|-------------|----------|
| Simple credentials | Email + password form, credentials stored in env vars | Y |
| Magic link (email) | Passwordless login via email link, requires email provider | |
| OAuth only | Login via Google/GitHub | |

**User's choice:** Simple credentials (Recommended)
**Notes:** Single-user app, simplest approach

| Option | Description | Selected |
|--------|-------------|----------|
| Main Dashboard | Land on Main Dashboard after login | Y |
| Last visited page | Remember and return to last page | |
| Pattern Dive | Land on library browser | |

**User's choice:** Main Dashboard (Recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| Long-lived sessions (30 days) | Stay logged in for 30 days | Y |
| Session-only | Log out when browser closes | |
| Permanent until logout | Never expire | |

**User's choice:** Long-lived sessions (Recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| Branded minimal | Centered card with app logo, design system styling | Y |
| Full-page hero | Login form alongside hero image | |
| Bare functional | No branding, just the form | |

**User's choice:** Branded minimal (Recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| Generic error | "Invalid credentials" message | Y |
| Specific error | "Wrong password" or "Email not found" | |

**User's choice:** Generic error (Recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| UserMenu dropdown | Logout in UserMenu component | Y |
| Dedicated page | Separate /logout route | |

**User's choice:** UserMenu dropdown (Recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| Simple delay | 5 failed attempts triggers 30s cooldown | Y |
| No rate limiting | Skip rate limiting entirely | |

**User's choice:** Simple delay (Recommended)

---

## App Shell Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Placeholders with toast | Quick actions visible but show toast when clicked | Y |
| Hide until ready | Don't show buttons until features built | |

**User's choice:** Placeholders with toast (Recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| Visual placeholder | Search bar visible, shows "Coming soon" on focus | Y |
| Hide until built | Remove search bar entirely | |

**User's choice:** Visual placeholder (Recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| Expanded | Show full labels by default | Y |
| Collapsed | Icons only by default | |
| Remember preference | Persist in localStorage | |

**User's choice:** Expanded (Recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| All items, inactive grayed | Full nav visible, placeholder pages for unbuilt | Y |
| Only Dashboard + Settings | Show only functional items | |

**User's choice:** All items, inactive ones grayed (Recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, system preference | Respect OS dark/light setting | Y |
| Yes, with toggle | Add light/dark toggle in UI | |
| Light only for now | Strip dark: classes | |

**User's choice:** Yes, system preference (Recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| localStorage | Remember collapsed/expanded state | Y |
| Reset on refresh | Always start expanded | |

**User's choice:** localStorage (Recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| Stitch icon + app name | Cross-stitch themed icon replacing 'X' placeholder | Y |
| Keep emerald 'X' | The 'X' represents a cross-stitch | |

**User's choice:** Stitch icon + app name

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, navigate home | Logo click goes to Dashboard | Y |
| No, logo is static | Logo is just branding | |

**User's choice:** Yes, navigate home (Recommended)

---

## Design Token Import

| Option | Description | Selected |
|--------|-------------|----------|
| It's the product-plan dir | Design export is the existing directory | Y |
| I'll share the path/files | Need to provide separate export path | |
| Haven't exported yet | Export from DesignOS first | |

**User's choice:** It's the product-plan dir
**Notes:** ~/projects/cross-stitch-tracker-design/product-plan/ IS the full DesignOS export

| Option | Description | Selected |
|--------|-------------|----------|
| next/font | Self-hosted via next/font/google | Y |
| Google Fonts CDN | Traditional link tag approach | |

**User's choice:** next/font (Recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| CSS custom properties | Define --status-* vars in globals.css | Y |
| TypeScript status map | statusColors object mapping status to classes | |
| Both | CSS vars + TypeScript map | |

**User's choice:** CSS custom properties (Recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| Adapt patterns, rewrite code | Use design as reference, rewrite for Next.js | Y |
| Port directly, then refactor | Copy TSX files, refactor later | |

**User's choice:** Adapt patterns, rewrite code (Recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| shadcn/ui | Initialize with design token overrides | Y |
| Raw Radix + custom | Individual @radix-ui packages | |

**User's choice:** shadcn/ui (Recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| Yes, Lucide | Tree-shakeable, consistent with design | Y |

**User's choice:** Yes, Lucide (Recommended)

---

## PWA & Responsive

| Option | Description | Selected |
|--------|-------------|----------|
| Cross-stitch themed icon | Emerald background with cross-stitch motif | Y |
| Text-based icon | "CST" initials on emerald background | |

**User's choice:** Cross-stitch themed icon (Recommended)

| Option | Description | Selected |
|--------|-------------|----------|
| iPhone (standard size) | Target ~390px width | Y |
| iPhone (Plus/Max) | Target ~430px width | |

**User's choice:** iPhone (standard size)

| Option | Description | Selected |
|--------|-------------|----------|
| Standard responsive | Follow design components as-is | Y |
| Touch-optimized | Larger tap targets, swipe gestures | |

**User's choice:** Standard responsive (Recommended)

---

## Claude's Discretion

- Database connection setup (Neon pooled/direct, Prisma config)
- ESLint + Prettier configuration
- Directory structure details
- Loading/error states for placeholder pages
- Toast notification library choice
- PWA manifest metadata

## Deferred Ideas

None — discussion stayed within phase scope
