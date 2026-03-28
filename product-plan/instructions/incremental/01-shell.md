# Milestone 1: Application Shell

**Provide alongside:** `product-overview.md`, `design-system/`

**Prerequisites:** None — this is the first milestone.

---

## About This Handoff

**What you're receiving:**
- Finished UI designs (React components with full styling)
- Product requirements and user flow specifications
- Design system tokens (colors, typography)
- Sample data showing the shape of data components expect
- Test specs focused on user-facing behavior

**Your job:**
- Integrate these components into your application
- Wire up callback props to your routing and business logic
- Replace sample data with real data from your backend
- Implement loading, error, and empty states

The components are props-based — they accept data and fire callbacks. How you architect the backend, data layer, and business logic is up to you.

---

## Goal

Set up the design system tokens and application shell so every subsequent milestone has a consistent visual foundation and navigation chrome.

## Overview

The shell is a sidebar + top bar layout that wraps every page. The sidebar provides primary navigation (Dashboard, Charts, Supplies, Stats, Shopping, Settings). The top bar provides global search, quick-action buttons (Log Stitches, Add Chart), and the user menu. The shell must be responsive across desktop, tablet, and mobile breakpoints.

## Key Functionality

- Configure design tokens: emerald (primary), amber (secondary), stone (neutral)
- Load Google Fonts: Fraunces (headings), Source Sans 3 (body), JetBrains Mono (hero stats only)
- Render sidebar with icon + label nav items and collapsible icon-only mode
- Render top bar with search, quick-action buttons, and user menu
- Wire nav items to your router (Dashboard, Charts, Supplies, Stats, Shopping, Settings)
- User menu dropdown: display name, avatar, profile settings link, logout action
- Responsive behaviour: full sidebar on desktop, collapsed on tablet, drawer on mobile

## Components Provided

| Component | File | Purpose |
|-----------|------|---------|
| `AppShell` | `shell/components/AppShell.tsx` | Root layout wrapping sidebar + top bar + content area |
| `MainNav` | `shell/components/MainNav.tsx` | Sidebar navigation with collapsible icon-only mode |
| `TopBar` | `shell/components/TopBar.tsx` | Top bar with search, quick actions, user menu |
| `UserMenu` | `shell/components/UserMenu.tsx` | Avatar dropdown with profile and logout |

## Props Reference

### AppShell

| Prop | Type | Description |
|------|------|-------------|
| `children` | `ReactNode` | Page content rendered in the main area |
| `userName` | `string` | Display name for the user menu |
| `userAvatarUrl` | `string \| null` | Avatar image URL |
| `onLogout` | `() => void` | Fired when user clicks logout |
| `onSearch` | `(query: string) => void` | Fired on search submit |
| `onLogStitches` | `() => void` | Fired when "Log Stitches" quick action is clicked |
| `onAddChart` | `() => void` | Fired when "Add Chart" quick action is clicked |

### MainNav

| Prop | Type | Description |
|------|------|-------------|
| `activePath` | `string` | Current route path to highlight active nav item |
| `collapsed` | `boolean` | Whether sidebar is in icon-only mode |
| `onToggleCollapse` | `() => void` | Toggle collapsed/expanded state |
| `onNavigate` | `(path: string) => void` | Fired when a nav item is clicked |

## Expected User Flows

### 1. Navigate Between Sections
1. User clicks "Charts" in the sidebar
2. Sidebar highlights "Charts" as active
3. Main content area renders the Charts page
4. **Outcome:** URL updates, active indicator moves, content swaps

### 2. Use Quick Actions
1. User clicks "Log Stitches" button in the top bar
2. App opens the session logging modal (implemented in Milestone 4)
3. **Outcome:** Callback fires; parent handles modal display

### 3. Collapse Sidebar
1. User clicks the collapse toggle on the sidebar
2. Sidebar shrinks to icon-only mode
3. Collapsed state persists across navigation
4. **Outcome:** More horizontal space for content; labels hidden, icons remain

### 4. Mobile Drawer
1. On mobile, user taps the hamburger icon in the top bar
2. Sidebar slides in as a drawer overlay
3. User taps a nav item; drawer closes and page navigates
4. **Outcome:** Full nav accessible on small screens without permanent sidebar

## Empty States

- No empty states for the shell itself. The shell always renders; page content handles its own empty states.

## Files to Reference

- `design-system/tokens.css` — CSS custom properties for colors and fonts
- `design-system/tailwind-colors.md` — Tailwind color class reference
- `design-system/fonts.md` — Font loading instructions
- `shell/components/AppShell.tsx` — Root shell component
- `shell/components/MainNav.tsx` — Sidebar navigation
- `shell/components/TopBar.tsx` — Top bar
- `shell/components/UserMenu.tsx` — User menu dropdown

## Done When

- [ ] Design tokens are configured (emerald, amber, stone palette; Fraunces, Source Sans 3, JetBrains Mono fonts)
- [ ] Shell renders with sidebar and top bar on all pages
- [ ] All 6 nav items are present and route correctly (Dashboard, Charts, Supplies, Stats, Shopping, Settings)
- [ ] Sidebar collapses to icon-only mode on desktop and persists the preference
- [ ] Top bar shows search input, "Log Stitches" and "Add Chart" buttons, and user menu
- [ ] User menu shows name, avatar, and logout action
- [ ] Mobile: sidebar is hidden; hamburger opens a slide-over drawer
- [ ] Tablet: sidebar starts collapsed (icon-only)
- [ ] Light and dark mode work correctly
