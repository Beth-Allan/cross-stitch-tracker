# UX Bug Triage — 2026-05-03

Issues identified from manual testing of the live site. Triaged into quick fixes, investigation, and larger work.

---

## Quick Fixes (do on main branch)

### QF-1: Pluralization on Progress Tab

**File:** `src/components/features/dashboard/progress-breakdown-tab.tsx` lines 126-129

**Problem:** "stages" is hardcoded — never singularized. Shows "2 projects across 1 stages".

**Fix:** Pluralize "stages" the same way "projects" is, BUT also rephrase for the single-stage case. "2 projects across 1 stage" is still awkward because "across" implies distribution. When stageCount === 1, consider phrasing like "2 projects — all [stage name]" or just "2 projects in [stage name]".

**Current code:**
```tsx
{totalProjects} project{totalProjects !== 1 ? "s" : ""} across{" "}
{buckets.filter((b) => b.count > 0).length} stages
```

**Effort:** ~15 min

---

### QF-2: Fabric Requirements — Missing Chart Thumbnail

**File:** `src/components/features/charts/fabric-requirements-tab.tsx` lines 210-225

**Problem:** The header row for each chart in Pattern Dive > Fabric Requirements shows only a status icon + text (chart name, dimensions). No chart thumbnail. User expected to see the chart image here.

**Fix:** Add a small thumbnail (e.g., 40x40 or 48x48) to the header row, next to or replacing the status icon. Will need to pass image URLs through — check how the parent component provides data and whether `coverThumbnailUrl` is available in the row data.

**Effort:** ~30 min

---

### QF-3: Spotlight Card — Oversized Image + Mismatched Buttons

**File:** `src/components/features/dashboard/spotlight-card.tsx`

**Problem (image):** The card uses `coverImageUrl` (full-size) instead of `coverThumbnailUrl`. The image container has `min-h-[260px]` but no max-height, so the image half grows with content. Result: card is visually dominant / "giant" on the dashboard.

- Initial load: `main-dashboard.tsx` line 93 prefers `coverImageUrl` over `coverThumbnailUrl`
- Shuffle: `spotlight-card.tsx` line 43 does the same (`newProject.coverImageUrl ?? newProject.coverThumbnailUrl`)

**Fix (image):**
1. Use `coverThumbnailUrl` instead of `coverImageUrl` (or at least constrain the container)
2. Add a `max-h` to the grid or image container to prevent unbounded growth
3. Consider whether `min-h-[260px]` is too tall

**Problem (buttons):** "Check It Out" (`LinkButton` with custom emerald classes, `px-5`) and "Shuffle Spotlight" (`<button>` with `px-4`) have different horizontal padding and different component types, making them visually mismatched.

**Fix (buttons):** Unify padding and consider using the same component pattern for both. Both should probably use the same px value and consistent styling approach.

**Effort:** ~1 hr

---

## Investigation Needed

### INV-1: Shopping Cart — Broken Project Thumbnails

**Files:**
- `src/app/(dashboard)/shopping/page.tsx` — fetches `coverThumbnailUrl` keys, generates presigned URLs
- `src/components/features/shopping/project-accordion.tsx` lines 128-139 — renders 40x40 `<Image>`

**Problem:** Thumbnails are broken/not displaying on the Projects tab of the shopping cart. The code path looks correct — presigned URLs are generated from `coverThumbnailUrl` keys and passed down.

**Possible causes:**
- Stale or invalid R2 object keys in the database
- Presigned URL generation failing silently for some keys
- Images not existing in R2 (deleted or never uploaded)
- Key mismatch between what's stored and what's passed to `getPresignedImageUrls`

**Investigation approach:** Check a specific project's `coverThumbnailUrl` value in the DB, then manually verify whether that R2 key exists and whether `getPresignedImageUrls` returns a working URL for it.

**Effort:** Unknown — depends on root cause

---

## Not a Bug

### NB-1: /stats Page Shows "Coming Soon"

**File:** `src/app/(dashboard)/stats/page.tsx`

**Status:** This is correct. The /stats route has been a `PlaceholderPage` since Phase 1. It was never built. What was built in v1.2/Phase 9 was the **Collection Stats Sidebar** embedded in the dashboard — not the standalone statistics page.

The comprehensive statistics engine (trends, year in review, monthly stitch charts, personal bests) is planned for **v1.3 Motivation & Planning**.

**Action:** None. Optionally add to v1.3 roadmap planning if not already captured.

---

## Large Work — Supply Adding UX Overhaul

### Issues #2 and #4 are the same problem at different scales.

**#2:** "When adding a chart, I want to add supplies right there — details page then supplies page, with a skip option."

**#4:** "Adding supplies is clunky — dropdown covers existing entries, takes up too much space, have to scroll after every item, adding stitches requires clicking off then back in, can't add colour + stitches in one step, list needs a condensed view."

**These combine into one project:** Redesign the supply-adding experience, then make it available during chart creation too.

### Current UX Pain Points (from code review)

1. **SearchToAdd is a floating overlay** (`absolute z-20`, `max-h-72`) — covers the supply list while open, so you can't see what you've already added. Shows max 8 results at a time.

2. **Stitch count is a separate interaction** — adding a colour defaults stitch count to 0. You must: close picker → scroll to find the new row → click the stitch count `EditableNumber` → type → click off. No way to set stitches during the add.

3. **Each SupplyRow is 2 lines tall** (line 1: swatch + code + name + delete; line 2: stitches → calculated skeins | Need | Have). With 30+ colours this gets very long.

4. **Full workflow per colour:** open picker → search → click to add → close → scroll → click stitch count → type → confirm. Too many discrete steps for what should be "add DMC 310, 450 stitches."

### Relevant files

| File | Role |
|------|------|
| `src/components/features/charts/project-detail/supplies-tab.tsx` | Tab orchestrator — manages SearchToAdd, InlineSupplyCreate, sections, settings |
| `src/components/features/supplies/search-to-add.tsx` | Colour picker dropdown — search, filter, select, positioned as overlay |
| `src/components/features/charts/project-detail/supply-row.tsx` | Individual supply row — 2-line layout, inline editing for stitches/need/have |
| `src/components/features/charts/project-detail/supply-section.tsx` | Section wrapper (Threads/Beads/Specialty) |
| `src/components/features/charts/project-detail/inline-supply-create.tsx` | Dialog for creating supply items not in the catalog |
| `src/components/features/charts/chart-add-form.tsx` | Chart creation form — currently no supplies step |

### Design directions to explore

- **Inline row with stitch input** — when you pick a colour, it appears as an editable row immediately with stitch count field focused
- **Side panel / drawer** — supply picker lives in a persistent sidebar instead of a floating overlay
- **Spreadsheet-style input** — paste or type "310 450\n311 200\n..." for bulk entry
- **Condensed list view toggle** — compact single-line rows (swatch + code + stitches + need + have) for when you have lots of items
- **Wizard step in chart creation** — after chart details, optional "Add supplies" step before save

### Recommendation

This needs design exploration (`/gsd-sketch` or similar) before planning. It touches the core supply workflow which is used constantly. Backlog items 999.4 (project supplies tab layout) and 999.15/999.16 (SearchToAdd improvements) are related.

**Effort:** Multiple phases — design exploration, then implementation. Good candidate for v1.3 or a dedicated mini-milestone.

---

## Existing Related Backlog Items

These overlap with the issues above and should be considered during planning:

- **999.4:** Project supplies tab layout (already in backlog — directly related to #4)
- **999.15:** SearchToAdd side-by-side layout — desktop 2-column grid
- **999.16:** SearchToAdd highlight conflict — only show keyboard highlight after arrow key use
- **999.21:** EditableNumber invalid input feedback
