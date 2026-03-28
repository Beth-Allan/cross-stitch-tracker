# Phase 1: Foundation & Infrastructure - Research

**Researched:** 2026-03-28
**Domain:** Next.js 16 App Router scaffold, Auth.js v5 credentials, design system integration, PWA manifest, Prisma 7 + Neon
**Confidence:** HIGH

## Summary

Phase 1 is a greenfield scaffold of a Next.js 16 application with authentication, a design system, PWA installability, and database connectivity. The project has no existing code -- everything is new. The design system is fully specified in an external design directory with exact CSS tokens, font rules, and reference shell components (AppShell, MainNav, TopBar, UserMenu) that must be adapted (not copied) for Next.js App Router patterns.

The key technical challenges are: (1) Next.js 16 renamed `middleware.ts` to `proxy.ts` -- Auth.js route protection must use the new convention; (2) Prisma 7 moved connection configuration from `schema.prisma` to `prisma.config.ts` and imports from `./generated/prisma` instead of `@prisma/client`; (3) Tailwind v4 uses CSS-native `@theme` configuration instead of `tailwind.config.js` -- shadcn/ui components are updated for this; (4) PWA installability on iOS requires only a manifest + icons (no service worker needed for Phase 1).

**Primary recommendation:** Use `create-next-app` with defaults (TypeScript, Tailwind, App Router, Turbopack), then layer in shadcn/ui, Auth.js v5 credentials, Prisma 7 with Neon adapter, and a `manifest.ts` for PWA. Build the app shell as a layout with Server Components for structure and a single Client Component for sidebar collapse/mobile drawer state.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Simple credentials provider (Auth.js v5) -- email + password stored in environment variables, no registration page
- **D-02:** Generic error message on failed login ("Invalid credentials") -- don't reveal whether email or password is wrong
- **D-03:** Long-lived sessions (30 days) -- single-user app on personal devices, frequent re-login is annoying
- **D-04:** Branded minimal login page -- centered card with app logo/name, email + password fields, emerald/stone design system
- **D-05:** Simple rate limiting -- 5 failed attempts triggers 30-second cooldown, no external dependencies
- **D-06:** Post-login landing page is Main Dashboard (placeholder until DASH-01 is built in Phase 8)
- **D-07:** Collapsible sidebar navigation on desktop (expanded by default), slide-out drawer on mobile -- matches existing design components
- **D-08:** Sidebar collapse state persisted in localStorage across page refreshes
- **D-09:** All nav items visible from Phase 1 -- inactive items grayed out with placeholder pages ("Coming in Phase X")
- **D-10:** TopBar quick actions (Log Stitches, Add Chart) shown as placeholders -- toast notification on click ("Coming in Phase X")
- **D-11:** Search input visible as placeholder -- shows "Coming soon" on focus
- **D-12:** Dark mode from Phase 1, following OS system preference (prefers-color-scheme)
- **D-13:** App logo: cross-stitch themed icon (not the 'X' placeholder) + "Cross Stitch Tracker" text in Fraunces
- **D-14:** Logo click navigates to Dashboard (home)
- **D-15:** Logout action lives in UserMenu dropdown in TopBar
- **D-16:** Design source of truth is `~/projects/cross-stitch-tracker-design/product-plan/` -- tokens.css, fonts.md, tailwind-colors.md, and shell component TSX files
- **D-17:** Fonts via next/font/google (Fraunces, Source Sans 3, JetBrains Mono) -- self-hosted, no CDN dependency
- **D-18:** Status colors as CSS custom properties in globals.css (--status-unstarted through --status-ffo)
- **D-19:** Adapt design component patterns to Next.js App Router -- rewrite code, don't port Vite components directly. Server Components where possible, Client Components only for interactive parts
- **D-20:** shadcn/ui as component foundation -- initialize with design token overrides (emerald/amber/stone). Radix primitives come through shadcn
- **D-21:** Lucide as the icon library -- already used throughout design components, tree-shakeable
- **D-22:** Tailwind v4 with CSS-native @theme configuration (no tailwind.config.js)
- **D-23:** Phase 1 PWA scope: manifest + installability only -- no service workers, no offline support (deferred to v2)
- **D-24:** Cross-stitch themed PWA icon -- emerald background with cross-stitch motif, generated at 192x192 and 512x512
- **D-25:** Primary mobile target: iPhone standard size (~390px width) with safe area insets
- **D-26:** Standard responsive behavior following design components -- hamburger nav on mobile, hidden button labels on small screens, no special gestures

### Claude's Discretion
- Database connection setup details (Neon pooled vs direct URLs, Prisma config)
- ESLint + Prettier configuration
- Project directory structure within the conventions defined in CLAUDE.md
- Loading/error states for placeholder pages
- Exact toast notification library and styling
- PWA manifest metadata (description, theme_color, display mode)

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| INFRA-01 | Auth.js single-user authentication protecting all app routes | Auth.js v5 beta credentials provider + proxy.ts route protection pattern verified. Single auth.ts config exports auth(), handlers, signIn, signOut. |
| INFRA-02 | App shell with MainNav, TopBar, UserMenu matching design system | Design reference components read and analyzed. Sidebar (w-60 expanded, w-16 collapsed), TopBar (h-14), UserMenu dropdown all documented with exact Tailwind classes. |
| INFRA-03 | Responsive design working on Mac browser and iPhone | Design components include md: breakpoint patterns, mobile drawer with translate-x animation, hidden sm:inline for button labels. Safe area insets needed for iPhone PWA. |
| INFRA-04 | PWA installable (home screen icon, full-screen launch) | Next.js 16 built-in manifest.ts support verified. No service worker needed for installability. manifest + icons in public/ sufficient. |
| INFRA-05 | Design system tokens (emerald/amber/stone, Fraunces/Source Sans 3/JetBrains Mono, status colors) | tokens.css, fonts.md, tailwind-colors.md all read. Exact CSS custom properties, font weights, status color mapping documented. shadcn/ui Tailwind v4 theming via @theme inline verified. |
</phase_requirements>

## Standard Stack

### Core (Phase 1 Only)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.2.1 | Full-stack React framework | Active LTS. Ships React 19.2, Turbopack default, proxy.ts for route protection. |
| TypeScript | 5.7+ | Type safety | Ships with Next.js 16. Strict mode via tsconfig. |
| React | 19.2 | UI library | Ships with Next.js 16. React Compiler integration. |
| Prisma | 7.6.0 | ORM | Latest stable. prisma.config.ts for connection, adapter pattern for Neon. |
| @prisma/adapter-neon | 7.6.0 | Neon serverless driver | GA. Bundles @neondatabase/serverless and ws. |
| Tailwind CSS | 4.2.2 | Utility-first CSS | CSS-native @theme config, OKLCH colors, no tailwind.config.js needed. |
| next-auth (v5 beta) | 5.0.0-beta.30 | Authentication | Only version supporting Next.js 16 App Router. Credentials provider. |
| bcryptjs | 3.0.3 | Password hashing | Pure JS, no native compilation on Vercel. For env-stored password comparison. |
| Zod | 4.3.6 | Schema validation | Login form validation at server boundary. |

### Supporting (Phase 1 Only)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | 1.7.0 | Icons | All nav icons, UI icons. Tree-shakeable. strokeWidth={1.5} convention. |
| sonner | 2.0.7 | Toast notifications | Placeholder action clicks ("Coming in Phase X"). Lightweight, accessible. |
| clsx | 2.1.1 | Conditional classes | Component variant logic. |
| tailwind-merge | 3.5.0 | Merge Tailwind classes | Prevent class conflicts in component composition. |
| tw-animate-css | 1.4.0 | Tailwind v4 animations | Replaces deprecated tailwindcss-animate. Required by shadcn/ui. |

### shadcn/ui Components (Phase 1)

| Component | Purpose |
|-----------|---------|
| button | Login form, nav actions, quick actions |
| input | Login form fields, search placeholder |
| card | Login page card |
| dropdown-menu | UserMenu dropdown (Radix-based) |
| toast/sonner | Placeholder action notifications |
| avatar | UserMenu avatar display |
| sheet | Mobile navigation drawer (alternative to custom implementation) |
| tooltip | Collapsed sidebar icon labels |

### Alternatives Considered

| Recommended | Alternative | Tradeoff |
|-------------|-------------|----------|
| proxy.ts (Auth.js export) | Layout-level auth check only | Proxy catches ALL routes including API; layout only catches page renders. Use both: proxy for redirect, layout for session access. |
| shadcn/ui Sheet | Custom mobile drawer | Sheet gives accessible animation, focus trap, and backdrop for free. Design reference uses custom drawer but Sheet matches behavior. |
| sonner | react-hot-toast | sonner is shadcn/ui's recommended toast. Smaller bundle, better accessibility. |
| localStorage for sidebar | Cookie for sidebar state | localStorage is simpler, no server overhead. Sidebar collapse is a UI preference, not auth-critical. |

**Installation:**
```bash
# Scaffold project
npx create-next-app@latest cross-stitch-tracker --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack

# Auth
npm install next-auth@beta bcryptjs
npm install -D @types/bcryptjs

# Database
npm install @prisma/adapter-neon
npm install -D prisma

# Validation
npm install zod

# UI utilities
npm install lucide-react sonner clsx tailwind-merge tw-animate-css

# Initialize shadcn/ui (after project scaffold)
npx shadcn@latest init

# Add Phase 1 shadcn components
npx shadcn@latest add button input card dropdown-menu avatar sheet tooltip
```

## Architecture Patterns

### Recommended Project Structure

```
src/
  app/
    (auth)/
      login/
        page.tsx          # Login page (Server Component wrapper)
        login-form.tsx    # Login form (Client Component - interactivity)
      layout.tsx          # Auth layout (no sidebar, centered card)
    (dashboard)/
      layout.tsx          # Dashboard layout with AppShell
      page.tsx            # Dashboard home (placeholder)
      charts/page.tsx     # Placeholder page
      supplies/page.tsx   # Placeholder page
      sessions/page.tsx   # Placeholder page
      stats/page.tsx      # Placeholder page
      shopping/page.tsx   # Placeholder page
      settings/page.tsx   # Placeholder page
    api/
      auth/[...nextauth]/
        route.ts          # Auth.js route handler
    layout.tsx            # Root layout (fonts, metadata, Toaster)
    manifest.ts           # PWA manifest
    globals.css           # Tailwind @theme, design tokens, status colors
  components/
    ui/                   # shadcn/ui generated components
    shell/
      app-shell.tsx       # Layout wrapper (Server Component)
      sidebar.tsx         # Sidebar nav (Client Component - collapse state)
      top-bar.tsx         # Header bar (Client Component - mobile menu)
      user-menu.tsx       # User dropdown (Client Component - dropdown state)
      nav-items.ts        # Navigation item definitions (shared config)
    placeholder-page.tsx  # Reusable "Coming in Phase X" page
  lib/
    db.ts                 # Prisma client singleton with Neon adapter
    auth.ts               # Auth.js configuration (credentials provider)
    utils.ts              # cn() helper (clsx + tailwind-merge)
    validations/
      auth.ts             # Login form Zod schema
  types/
    index.ts              # Shared TypeScript types
  generated/
    prisma/               # Prisma generated client (output target)
prisma/
  schema.prisma           # Database schema (datasource + generator only for Phase 1)
prisma.config.ts          # Prisma 7 connection configuration
proxy.ts                  # Auth.js route protection (was middleware.ts)
public/
  icon-192x192.png        # PWA icon
  icon-512x512.png        # PWA icon
.env.example              # Environment variable template
```

### Pattern 1: Auth.js v5 Credentials with proxy.ts

**What:** Single-user credentials auth with route-level protection via Next.js 16 proxy.
**When to use:** All routes under `(dashboard)/` require authentication; `(auth)/login` is public.

```typescript
// src/lib/auth.ts
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (
          credentials.email === process.env.AUTH_USER_EMAIL &&
          await bcrypt.compare(
            credentials.password as string,
            process.env.AUTH_USER_PASSWORD_HASH!
          )
        ) {
          return { id: "1", name: "Stitcher", email: credentials.email as string }
        }
        return null
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 }, // 30 days
  pages: { signIn: "/login" },
  callbacks: {
    authorized: async ({ auth }) => !!auth,
  },
})
```

```typescript
// proxy.ts (root of project)
export { auth as proxy } from "@/lib/auth"

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|icon-.*\\.png|manifest\\.webmanifest).*)"],
}
```

### Pattern 2: Prisma 7 + Neon Adapter

**What:** Prisma Client with serverless Neon connection via adapter pattern.
**When to use:** All database access throughout the app.

```typescript
// prisma.config.ts (project root)
import "dotenv/config"
import { defineConfig, env } from "prisma/config"

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DIRECT_URL"), // Direct connection for CLI operations
  },
})
```

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  // No url here -- configured in prisma.config.ts
}

generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"
}
```

```typescript
// src/lib/db.ts
import { PrismaClient } from "@/generated/prisma"
import { PrismaNeon } from "@prisma/adapter-neon"

const adapter = new PrismaNeon({
  connectionString: process.env.DATABASE_URL!,
})

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
```

### Pattern 3: App Shell with Server/Client Component Split

**What:** Layout structure as Server Component with Client Component islands for interactivity.
**When to use:** The dashboard layout wrapping all authenticated pages.

```typescript
// src/app/(dashboard)/layout.tsx (Server Component)
import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AppShell } from "@/components/shell/app-shell"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user) redirect("/login")

  return (
    <AppShell user={{ name: session.user.name ?? "Stitcher" }}>
      {children}
    </AppShell>
  )
}
```

```typescript
// src/components/shell/app-shell.tsx (Server Component)
import { Sidebar } from "./sidebar"
import { TopBar } from "./top-bar"

interface AppShellProps {
  children: React.ReactNode
  user: { name: string }
}

export function AppShell({ children, user }: AppShellProps) {
  return (
    <div className="h-screen flex bg-stone-50 dark:bg-stone-950 overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar user={user} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
```

The Sidebar and TopBar are Client Components (`"use client"`) because they manage interactive state (collapse toggle, mobile drawer open/close, dropdown menus).

### Pattern 4: Tailwind v4 Design Tokens via @theme

**What:** CSS-native token configuration in globals.css instead of tailwind.config.js.
**When to use:** All design system token definitions.

```css
/* src/app/globals.css */
@import "tailwindcss";
@import "tw-animate-css";

@theme inline {
  --font-heading: "Fraunces", serif;
  --font-body: "Source Sans 3", sans-serif;
  --font-mono: "JetBrains Mono", monospace;
}

:root {
  /* Status colors (project lifecycle) */
  --status-unstarted: var(--color-stone-400);
  --status-kitting: var(--color-amber-500);
  --status-kitted: var(--color-emerald-500);
  --status-in-progress: var(--color-sky-500);
  --status-on-hold: var(--color-orange-500);
  --status-finished: var(--color-violet-500);
  --status-ffo: var(--color-rose-500);
}

/* shadcn/ui theme overrides -- emerald primary, amber accent, stone neutral */
/* These will be set by shadcn init and customized to match design tokens */
```

### Pattern 5: next/font/google Font Configuration

**What:** Self-hosted Google Fonts via Next.js font optimization.
**When to use:** Root layout font loading.

```typescript
// src/app/layout.tsx
import { Fraunces, Source_Sans_3, JetBrains_Mono } from "next/font/google"

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
})

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600"],
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${sourceSans.variable} ${jetbrainsMono.variable}`}>
      <body className="font-body antialiased">
        {children}
      </body>
    </html>
  )
}
```

### Pattern 6: PWA Manifest (No Service Worker)

**What:** Installability via manifest.ts alone -- no Serwist/service worker in Phase 1.
**When to use:** Phase 1 PWA requirement (D-23).

```typescript
// src/app/manifest.ts
import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Cross Stitch Tracker",
    short_name: "StitchTracker",
    description: "Track cross-stitch projects, supplies, and stitching sessions",
    start_url: "/",
    display: "standalone",
    background_color: "#fafaf9", // stone-50
    theme_color: "#059669", // emerald-600
    icons: [
      { src: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  }
}
```

### Anti-Patterns to Avoid
- **Copying Vite design components directly:** The reference TSX files use `useState`, client-side routing callbacks, and inline styles. Rewrite for App Router: Server Components for layout, Client Components only for interactive parts. Replace `onNavigate` callbacks with Next.js `<Link>` and `usePathname()`.
- **Using middleware.ts:** Next.js 16 renamed it to `proxy.ts`. The old name is deprecated and will cause warnings or breakage.
- **Importing PrismaClient from @prisma/client:** Prisma 7 generates to a custom output path. Import from `@/generated/prisma` (or whatever `output` is set to in the generator block).
- **Including url in schema.prisma datasource:** Prisma 7 with adapters configures the connection in `prisma.config.ts`, not the schema file.
- **Adding "use client" to AppShell wrapper:** The outer layout structure can be a Server Component. Only the interactive children (Sidebar with collapse state, TopBar with mobile menu, UserMenu with dropdown) need `"use client"`.
- **Using tailwind.config.js:** Tailwind v4 uses CSS-native `@theme` in globals.css. No JS config file.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dropdown menu | Custom click-outside + portal | shadcn/ui DropdownMenu (Radix) | Accessibility (keyboard nav, focus trap, screen readers), portal rendering, animation |
| Mobile drawer | Custom overlay + translate animation | shadcn/ui Sheet | Focus trap, body scroll lock, accessible close, animation built-in |
| Toast notifications | Custom toast container | sonner (via shadcn/ui) | Queue management, auto-dismiss, accessibility, animation |
| Tooltip on collapsed nav | Custom hover tooltip | shadcn/ui Tooltip (Radix) | Delay management, portal positioning, accessibility |
| Dark mode detection | Custom media query listener | Tailwind `dark:` + `prefers-color-scheme` | Tailwind v4 handles this natively via `@media (prefers-color-scheme: dark)` |
| Password hashing | Custom crypto | bcryptjs | Timing attack resistance, salt generation, proven security |
| Form validation | Custom validation logic | Zod schemas | Type inference, composable, error messages, shared client/server |
| Rate limiting | Complex middleware | In-memory counter (Map) | Single-user app -- simple in-memory Map with timestamp is sufficient for D-05 |

**Key insight:** Phase 1 has very little custom logic -- it is primarily assembly of well-established libraries. The value is in correct integration and design fidelity, not novel code.

## Common Pitfalls

### Pitfall 1: Prisma 7 Import Path Change
**What goes wrong:** `import { PrismaClient } from "@prisma/client"` fails or uses wrong client.
**Why it happens:** Prisma 7 changed the default import path. The `output` in the generator block determines where the client is generated.
**How to avoid:** Set `output = "../src/generated/prisma"` in schema.prisma generator block. Import from `@/generated/prisma`. After any schema change, run `npx prisma generate`.
**Warning signs:** "Cannot find module '@prisma/client'" or type mismatches on Prisma models.

### Pitfall 2: proxy.ts Not Protecting API Routes
**What goes wrong:** API routes like `/api/auth/[...nextauth]` get caught by the proxy matcher and redirect to login, breaking auth flow.
**Why it happens:** The matcher pattern is too broad.
**How to avoid:** Exclude `api/auth` from the matcher: `/((?!api/auth|_next/static|_next/image|favicon.ico|icon-.*\\.png|manifest\\.webmanifest).*)`.
**Warning signs:** Login page redirects in a loop, or auth API returns HTML instead of JSON.

### Pitfall 3: next/font Variable Not Applying
**What goes wrong:** Fonts load but don't apply -- body text still shows system font.
**Why it happens:** The CSS variable from `next/font` (e.g., `--font-body`) must be referenced in Tailwind's `@theme` directive AND applied to the body element.
**How to avoid:** (1) Define font variables in both `next/font` config AND `@theme inline` in globals.css. (2) Apply `font-body` class to `<body>`. (3) Ensure the `@theme` variable name matches the `next/font` `variable` prop.
**Warning signs:** Font inspector shows "system-ui" or generic serif/sans-serif.

### Pitfall 4: Tailwind v4 @theme vs shadcn/ui Conflict
**What goes wrong:** shadcn/ui components don't pick up custom colors, or default Zinc theme persists.
**Why it happens:** shadcn/ui generates its own CSS variables (--primary, --secondary, etc.) that must be mapped to the emerald/amber/stone palette.
**How to avoid:** After `shadcn init`, manually update the generated CSS variables in globals.css to use emerald for primary, amber for accent/secondary, and stone for background/muted. Check both `:root` and `.dark` blocks.
**Warning signs:** Components render in gray/zinc instead of emerald, or dark mode colors are wrong.

### Pitfall 5: iOS PWA Safe Area Insets
**What goes wrong:** Content renders behind the iPhone notch or home indicator in standalone mode.
**Why it happens:** PWA standalone mode doesn't include the browser chrome, so safe areas must be handled explicitly.
**How to avoid:** Add `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />` and use `env(safe-area-inset-*)` padding on the app shell edges.
**Warning signs:** TopBar text hidden behind notch, bottom navigation overlaps home indicator bar.

### Pitfall 6: Auth.js v5 Session in Server Components
**What goes wrong:** `auth()` returns null in server components even though user is logged in.
**Why it happens:** Auth.js v5 requires the route handler to be set up at `/api/auth/[...nextauth]/route.ts` exporting the handlers from your auth config.
**How to avoid:** Create `src/app/api/auth/[...nextauth]/route.ts` with `export { GET, POST } from "@/lib/auth"` (destructure `handlers` as `{ GET, POST }`).
**Warning signs:** Session is always null, login appears to succeed but redirects back to login.

### Pitfall 7: Neon Pooled vs Direct Connection Confusion
**What goes wrong:** Prisma migrations fail or time out.
**Why it happens:** Migrations need the DIRECT_URL (non-pooled), but the app uses DATABASE_URL (pooled).
**How to avoid:** `prisma.config.ts` uses `env("DIRECT_URL")` for CLI operations. `src/lib/db.ts` uses `process.env.DATABASE_URL` (pooled) for the adapter. Both must be in `.env`.
**Warning signs:** `prisma migrate dev` hangs or returns connection errors.

### Pitfall 8: Rate Limiting State Lost on Server Restart
**What goes wrong:** In-memory rate limit map resets when dev server restarts, or in production on cold start.
**Why it happens:** In-memory state doesn't persist across serverless invocations.
**How to avoid:** For a single-user app this is acceptable behavior -- rate limiting is a deterrent, not a security boundary. Document this limitation. The 30-second cooldown is short enough that persistence isn't critical.
**Warning signs:** None significant for single-user. If multi-user were needed, this would need Redis.

## Code Examples

### Rate Limiting for Login (D-05)

```typescript
// src/lib/rate-limit.ts
const attempts = new Map<string, { count: number; lastAttempt: number }>()
const MAX_ATTEMPTS = 5
const COOLDOWN_MS = 30_000 // 30 seconds

export function checkRateLimit(key: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const record = attempts.get(key)

  if (!record) {
    attempts.set(key, { count: 1, lastAttempt: now })
    return { allowed: true }
  }

  // Reset if cooldown has passed
  if (now - record.lastAttempt > COOLDOWN_MS) {
    attempts.set(key, { count: 1, lastAttempt: now })
    return { allowed: true }
  }

  if (record.count >= MAX_ATTEMPTS) {
    const retryAfter = Math.ceil((COOLDOWN_MS - (now - record.lastAttempt)) / 1000)
    return { allowed: false, retryAfter }
  }

  record.count++
  record.lastAttempt = now
  return { allowed: true }
}

export function resetRateLimit(key: string): void {
  attempts.delete(key)
}
```

### Placeholder Page Component

```typescript
// src/components/placeholder-page.tsx
interface PlaceholderPageProps {
  title: string
  phase: number
  description?: string
}

export function PlaceholderPage({ title, phase, description }: PlaceholderPageProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h1 className="font-heading text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-2">
        {title}
      </h1>
      <p className="text-stone-500 dark:text-stone-400 text-sm">
        {description ?? `Coming in Phase ${phase}`}
      </p>
    </div>
  )
}
```

### Navigation Items Configuration

```typescript
// src/components/shell/nav-items.ts
export interface NavItem {
  label: string
  href: string
  icon: string
  phase: number  // which phase enables this feature
}

export const navigationItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: "dashboard", phase: 8 },
  { label: "Charts", href: "/charts", icon: "charts", phase: 2 },
  { label: "Supplies", href: "/supplies", icon: "supplies", phase: 5 },
  { label: "Sessions", href: "/sessions", icon: "sessions", phase: 6 },
  { label: "Statistics", href: "/stats", icon: "stats", phase: 6 },
  { label: "Shopping", href: "/shopping", icon: "shopping", phase: 5 },
  { label: "Settings", href: "/settings", icon: "settings", phase: 1 },
]
```

### Dark Mode Setup (OS Preference)

```
No JavaScript needed for D-12.
Tailwind v4 dark: variant respects prefers-color-scheme by default.
In globals.css, define .dark variables for shadcn/ui components.
The HTML element does NOT need a class toggle -- Tailwind v4 uses @media query.
```

**Important:** Tailwind v4's default dark mode strategy is `media` (CSS `prefers-color-scheme`), which matches D-12 exactly. No JS toggle needed.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| middleware.ts | proxy.ts | Next.js 16 (Jan 2026) | Rename file, export `proxy` instead of `middleware` |
| tailwind.config.js | CSS @theme directive | Tailwind v4 (Jan 2025) | All config in globals.css, no JS config file |
| import from @prisma/client | import from ./generated/prisma | Prisma 7 (2025) | Custom output path, prisma.config.ts for connection |
| datasource url in schema.prisma | datasource url in prisma.config.ts | Prisma 7 (2025) | Adapter pattern, no url in schema |
| next-auth v4 (stable) | next-auth v5 (beta) | 2024-ongoing | Single auth() function works everywhere, proxy export pattern |
| tailwindcss-animate | tw-animate-css | Tailwind v4 (2025) | Old plugin incompatible with Tailwind v4 |

## Open Questions

1. **shadcn/ui Preset for Emerald/Amber/Stone**
   - What we know: shadcn/ui March 2026 added a preset system. You can encode colors, fonts, icons, radius into a short code.
   - What's unclear: Whether a preset exists that matches emerald/amber/stone, or if manual CSS variable editing is needed after init.
   - Recommendation: Run `npx shadcn@latest init` with default, then manually adjust CSS variables in globals.css. The manual approach is more reliable than finding a matching preset.

2. **Auth.js v5 + Prisma Adapter Compatibility**
   - What we know: Auth.js v5 supports Prisma adapter for database sessions. But D-01 specifies JWT strategy with env-stored credentials (no user table).
   - What's unclear: Whether the Prisma adapter is needed at all for Phase 1 (no database user table, just env var comparison).
   - Recommendation: Do NOT use @auth/prisma-adapter in Phase 1. JWT sessions with credentials from env vars require no database. If multi-user is added later, add the adapter then.

3. **PWA Icon Generation**
   - What we know: D-24 specifies a cross-stitch themed icon with emerald background at 192x192 and 512x512.
   - What's unclear: How to generate the icon -- manual design vs. tool-generated.
   - Recommendation: Create a simple SVG with emerald background + white cross-stitch "X" motif, export to PNG at both sizes. Can use any favicon generator tool.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Next.js 16 (requires >=20.9) | Yes | 25.2.1 | -- |
| npm | Package management | Yes | 11.6.2 | -- |
| Prisma CLI | Database migrations | Yes | 7.6.0 | -- |
| PostgreSQL (Neon) | Data storage | Remote | 17 (Neon managed) | -- |
| Git | Version control | Yes | (installed) | -- |

**Missing dependencies with no fallback:** None.

**Missing dependencies with fallback:** None.

All required tools are available at compatible versions.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest (recommended for Next.js 16) or Jest |
| Config file | None -- needs Wave 0 setup |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INFRA-01 | Auth.js credentials authorize function validates correctly | unit | `npx vitest run src/__tests__/auth.test.ts -t "authorize"` | No -- Wave 0 |
| INFRA-01 | Proxy redirects unauthenticated users to /login | integration | `npx vitest run src/__tests__/proxy.test.ts` | No -- Wave 0 |
| INFRA-01 | Rate limiting blocks after 5 attempts, resets after 30s | unit | `npx vitest run src/__tests__/rate-limit.test.ts` | No -- Wave 0 |
| INFRA-02 | Navigation items render with correct icons and labels | unit | `npx vitest run src/__tests__/nav.test.ts` | No -- Wave 0 |
| INFRA-02 | Sidebar collapse toggles between w-60 and w-16 | unit | `npx vitest run src/__tests__/sidebar.test.ts` | No -- Wave 0 |
| INFRA-03 | Mobile drawer opens/closes on hamburger click | manual-only | Visual testing on iPhone viewport | -- |
| INFRA-03 | No horizontal scroll on 390px viewport | manual-only | Browser dev tools responsive mode | -- |
| INFRA-04 | manifest.ts returns valid PWA manifest | unit | `npx vitest run src/__tests__/manifest.test.ts` | No -- Wave 0 |
| INFRA-05 | CSS custom properties for status colors are defined | unit | `npx vitest run src/__tests__/tokens.test.ts` | No -- Wave 0 |
| INFRA-05 | Fonts load correctly (Fraunces, Source Sans 3, JetBrains Mono) | manual-only | Visual inspection in browser | -- |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green + manual visual checks on responsive viewports

### Wave 0 Gaps
- [ ] `vitest.config.ts` -- Vitest configuration for Next.js
- [ ] `src/__tests__/auth.test.ts` -- Auth.js authorize function tests
- [ ] `src/__tests__/rate-limit.test.ts` -- Rate limiting logic tests
- [ ] `src/__tests__/manifest.test.ts` -- PWA manifest validation
- [ ] Test utilities / setup file for mocking Next.js APIs

## Project Constraints (from CLAUDE.md)

**Enforced by CLAUDE.md -- planner MUST comply:**

1. **TypeScript strict mode** -- no `any` types
2. **Server Components by default** -- `"use client"` only when genuinely needed for interactivity
3. **Server Actions for mutations** (login action)
4. **Zod at form/API boundaries** (login form validation)
5. **Prisma schema is source of truth** -- run `prisma generate` after changes
6. **PascalCase components, camelCase functions, kebab-case files**
7. **All dashboard routes require auth** -- layout-level check
8. **Server Actions MUST verify session** before mutations
9. **Never hardcode secrets** -- env vars only
10. **Pin exact versions** in package.json (no `^` or `~`)
11. **Run `npm run build` and `npm run lint` before commits**
12. **No calculated fields stored in DB** (not relevant for Phase 1 but establishes convention)
13. **Security headers** in next.config.ts (X-Content-Type-Options, X-Frame-Options, Referrer-Policy)
14. **Safe rendering only** -- no dangerous HTML injection escape hatches
15. **Validate MIME type and size for file uploads** (not in Phase 1 but convention set)

## Sources

### Primary (HIGH confidence)
- [Next.js 16 Installation Docs](https://nextjs.org/docs/app/getting-started/installation) -- create-next-app defaults, Turbopack
- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16) -- proxy.ts rename, breaking changes
- [Next.js PWA Guide](https://nextjs.org/docs/app/guides/progressive-web-apps) -- manifest.ts pattern, installability without service worker
- [Next.js proxy.ts File Convention](https://nextjs.org/docs/app/api-reference/file-conventions/proxy) -- matcher config, runtime
- [Auth.js Protecting Routes](https://authjs.dev/getting-started/session-management/protecting) -- proxy export pattern, authorized callback
- [Auth.js Migration to v5](https://authjs.dev/getting-started/migrating-to-v5) -- credentials provider, JWT sessions
- [Neon Prisma Integration](https://neon.com/docs/guides/prisma) -- prisma.config.ts, adapter setup, pooled vs direct URLs
- [shadcn/ui Next.js Installation](https://ui.shadcn.com/docs/installation/next) -- init command, Tailwind v4 compatibility
- [shadcn/ui Tailwind v4](https://ui.shadcn.com/docs/tailwind-v4) -- tw-animate-css, @theme inline
- npm registry -- all package versions verified via `npm view` on 2026-03-28

### Secondary (MEDIUM confidence)
- [Next.js Font Optimization](https://nextjs.org/docs/app/getting-started/fonts) -- next/font/google pattern
- Design reference files in `~/projects/cross-stitch-tracker-design/product-plan/` -- exact Tailwind classes, component structure

### Tertiary (LOW confidence)
- None -- all findings verified with primary sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all versions verified against npm registry, official docs confirm compatibility
- Architecture: HIGH -- patterns from official Next.js 16, Auth.js v5, and Prisma 7 documentation
- Pitfalls: HIGH -- based on documented breaking changes (proxy.ts, Prisma import path, Tailwind v4 config)
- Design system: HIGH -- source design files read directly, exact tokens and font rules documented

**Research date:** 2026-03-28
**Valid until:** 2026-04-28 (stable stack, no fast-moving components except next-auth beta)
