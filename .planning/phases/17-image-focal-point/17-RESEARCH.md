# Phase 17: Image Focal Point - Research

**Researched:** 2026-05-17
**Domain:** CSS object-position, click-to-coordinate mapping, Prisma schema extension, Next.js Image component
**Confidence:** HIGH

## Summary

Phase 17 adds a focal point feature to cover images, allowing users to control which area of their cross-stitch chart cover stays visible when the image is cropped in gallery cards and other display contexts. The implementation is straightforward: two nullable Float fields on the Chart model, a click-to-set editor UI on the hero banner, and CSS `object-position` propagation to all `object-cover` image contexts.

The primary complexity is in the editor interaction (coordinate calculation relative to the displayed image, crop guide overlay positioning with boundary clamping) rather than the data model or propagation layer. All required patterns already exist in the codebase -- server actions with `requireAuth`, `useTransition` for optimistic UI, absolute-positioned overlays on the hero (kebab menu as reference), and typed data flowing through props from server pages.

**Primary recommendation:** Build the schema + server action first (simplest), then the propagation layer (add `objectPosition` style to all `object-cover` contexts), then the editor UI (most complex). This ordering lets you verify propagation works with hardcoded test values before building the editor.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** Focal point setter lives on the project detail hero banner area
- **D-02:** Click/tap to place marker interaction model
- **D-03:** Marker visible only in edit mode
- **D-04:** Edit mode triggered by button overlaying hero image corner (crosshair icon, "Set Focal Point")
- **D-05:** "Reset to center" button in edit mode alongside Save/Cancel
- **D-06:** Hero banner keeps `object-contain` -- focal point does NOT apply to hero rendering
- **D-07:** ALL `object-cover` contexts respect the focal point
- **D-08:** Live aspect-4/3 crop guide overlay in edit mode
- **D-09:** Two nullable Float fields on Chart: `focalPointX Float?` and `focalPointY Float?` (0-1 normalized)
- **D-10:** Default when null is center (50% 50%) -- no visual change for existing images

### Claude's Discretion
- Exact crosshair/dot marker visual design (size, color, border, animation)
- How the crop preview overlay renders (semi-transparent dimming, dashed border, etc.)
- Edit mode button placement (top-right corner vs. bottom-right)
- Whether to use optimistic UI or wait for server response on save
- Server action structure (single `updateFocalPoint` or reuse existing)
- Touch handling nuances for mobile

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| IMG-01 | User can set a focal point on cover images to control which area is displayed when cropped | Editor UI (FocalPointEditor), server action persistence, schema fields |
| IMG-02 | Focal point is respected across all image display contexts (gallery cards, dashboard, hero banners, project detail) | CSS object-position propagation to all object-cover contexts (6+ components) |
</phase_requirements>

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|------------|-------------|----------------|-----------|
| Focal point storage | Database / Storage | -- | Two Float fields on Chart model, persisted via Prisma |
| Focal point setting UI | Browser / Client | -- | Click interaction, coordinate calculation, visual overlays -- all client-side |
| Focal point persistence | API / Backend | -- | Server action with auth guard + Prisma update |
| Focal point display | Browser / Client | Frontend Server (SSR) | CSS `object-position` applied client-side; data fetched server-side in page queries |
| Data flow (queries) | Frontend Server (SSR) | -- | All page-level data fetching includes focalPointX/Y from server components |

## Standard Stack

### Core (already installed -- no new dependencies)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Prisma | 7.7.0 | Schema extension + data persistence | Already the ORM; add 2 fields to Chart model |
| Next.js Image | 16.2.4 | Image rendering with `fill` + `style={{ objectPosition }}` | Already used in gallery-card and all display contexts |
| React | 19.2.5 | useState, useTransition, useRef for editor state | Already the UI framework |
| lucide-react | 1.8.0 | `Crosshair` icon for edit mode trigger button | Already used for all icons |
| sonner | (installed) | Toast notifications for save/error feedback | Already used across the app |

### Supporting (no new packages needed)

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Zod | (installed) | Validate focal point coordinates in server action | Input validation at action boundary |
| next/cache `revalidatePath` | -- | Cache invalidation after focal point save | Ensure gallery/dashboard reflect new position |

**Installation:** No new packages needed. Zero new dependencies.

## Architecture Patterns

### System Architecture Diagram

```
User clicks image in Edit Mode
        |
        v
[FocalPointEditor (client)]
  - Calculates click position relative to image natural dimensions
  - Normalizes to 0-1 coordinates
  - Updates pendingPoint state
  - Positions marker + crop guide overlay
        |
        v (on Save)
[updateFocalPoint server action]
  - requireAuth()
  - Zod validates { chartId, x: 0-1, y: 0-1 } or null for reset
  - Prisma update Chart { focalPointX, focalPointY }
  - revalidatePath("/charts", "/charts/[id]", "/")
        |
        v (on next render)
[Page-level server queries]
  - getChart(), getChartsForGallery(), getMainDashboardData(), etc.
  - All now include focalPointX/Y in their select/include
        |
        v
[Display components (client)]
  - gallery-card, spotlight-card, genre-detail, designer-detail, project-accordion
  - Apply: style={{ objectPosition: `${x*100}% ${y*100}%` }}
```

### Recommended Project Structure

```
src/
  components/features/charts/project-detail/
    focal-point-editor.tsx      # NEW - main editor (client component)
    focal-point-marker.tsx      # NEW - crosshair marker (child)
    crop-guide-overlay.tsx      # NEW - 4:3 crop preview (child)
    hero-cover-banner.tsx       # MODIFIED - accepts focalPointX/Y, renders editor
  lib/actions/
    focal-point-actions.ts      # NEW - updateFocalPoint server action
  lib/validations/
    focal-point.ts              # NEW - Zod schema for focal point input
```

### Pattern 1: Click-to-Coordinate Mapping

**What:** Convert a mouse/touch event on a displayed image to normalized 0-1 coordinates relative to the image's natural dimensions.
**When to use:** When the user clicks on the hero image to place their focal point.

```typescript
// [VERIFIED: standard DOM API — getBoundingClientRect]
function getClickPosition(
  event: React.MouseEvent<HTMLDivElement>,
  containerRef: React.RefObject<HTMLDivElement>
): { x: number; y: number } {
  const rect = containerRef.current!.getBoundingClientRect();
  const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
  const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
  return { x, y };
}
```

**Key insight:** Since the hero uses `object-contain`, the displayed image maps 1:1 to the container's visible area (no cropping). The click position relative to the container IS the position relative to the image content area -- BUT only if we account for letterboxing/pillarboxing. For `object-contain` with `fill` in the hero, we need to calculate the actual image bounds within the container.

### Pattern 2: Object-Position Propagation

**What:** Apply stored focal point as CSS `object-position` to cropped images.
**When to use:** Every component with `object-cover` that displays a cover image.

```typescript
// [VERIFIED: CSS spec — object-position accepts percentages]
// Utility function for consistent application
function getFocalPointStyle(
  focalPointX: number | null | undefined,
  focalPointY: number | null | undefined
): React.CSSProperties | undefined {
  if (focalPointX == null || focalPointY == null) return undefined;
  return { objectPosition: `${focalPointX * 100}% ${focalPointY * 100}%` };
}
```

### Pattern 3: Crop Guide Boundary Clamping

**What:** Position a 4:3 rectangle centered on the focal point, clamped to image bounds.
**When to use:** The live crop preview overlay in edit mode.

```typescript
// [ASSUMED] — standard clamping math
function getCropGuidePosition(
  focalX: number, // 0-1
  focalY: number, // 0-1
  containerWidth: number,
  containerHeight: number,
  guideWidth: number, // e.g., containerWidth * 0.6
): { left: number; top: number; width: number; height: number } {
  const guideHeight = guideWidth * (3 / 4); // 4:3 aspect ratio
  
  // Center on focal point, then clamp to bounds
  let left = focalX * containerWidth - guideWidth / 2;
  let top = focalY * containerHeight - guideHeight / 2;
  
  left = Math.max(0, Math.min(containerWidth - guideWidth, left));
  top = Math.max(0, Math.min(containerHeight - guideHeight, top));
  
  return { left, top, width: guideWidth, height: guideHeight };
}
```

### Pattern 4: Server Action with Optimistic UI

**What:** Save focal point with immediate UI feedback, rollback on failure.
**When to use:** When user clicks Save in edit mode.

```typescript
// [VERIFIED: codebase pattern from hero-kebab-menu.tsx, hero-status-badge]
const [isPending, startTransition] = useTransition();

function handleSave() {
  startTransition(async () => {
    try {
      const result = await updateFocalPoint(chartId, pendingPoint.x, pendingPoint.y);
      if (result.success) {
        setIsEditMode(false);
        toast.success("Focal point saved");
      } else {
        toast.error("Couldn't save focal point. Try again.");
      }
    } catch {
      toast.error("Couldn't save focal point. Try again.");
    }
  });
}
```

### Anti-Patterns to Avoid

- **Don't use `onLoad` to get image natural dimensions dynamically** -- the hero image uses `object-contain` with fixed max-heights. Calculate position relative to the rendered container, not the natural image dimensions.
- **Don't store pixel coordinates** -- always store normalized 0-1 values. Pixel positions are meaningless across different screen sizes.
- **Don't apply `objectPosition` to the hero banner** -- per D-06, the hero uses `object-contain` (no cropping) so focal point is irrelevant there.
- **Don't create a separate "focal point" API route** -- use a server action matching existing patterns (see chart-actions.ts).

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Click-to-coordinate math | Complex gesture library | Simple `getBoundingClientRect` + division | Standard DOM API is sufficient for single-click placement |
| Image crop preview | Canvas-based cropper library | CSS overlay with clip-path or positioned div | We only PREVIEW a crop, not actually crop. CSS-only approach. |
| Notification feedback | Custom notification system | `sonner` toast (already installed) | Already the app's toast library |
| Form validation | Manual checks | Zod schema (already the pattern) | Consistent with all other server actions |

**Key insight:** This feature is deceptively simple at its core (2 floats and a CSS property). The complexity is entirely in the editor UX -- and that's solved with basic DOM APIs and CSS, not third-party libraries.

## Common Pitfalls

### Pitfall 1: Object-Contain Letterboxing in Coordinate Calculation

**What goes wrong:** The hero uses `object-contain`, which letterboxes/pillarboxes the image. A click in the letterbox area (outside the actual image) would yield incorrect coordinates.
**Why it happens:** `getBoundingClientRect()` returns the full container dimensions, not just the visible image area within `object-contain`.
**How to avoid:** The hero component uses `width={1200} height={800}` (not `fill`) with `object-contain`. The image stretches to fit within `max-h` constraints while maintaining aspect ratio. Since we render it with explicit width/height and `w-full`, the image fills the container width and the height adjusts. For a landscape container with portrait images, there will be pillarboxing on the sides. The click handler should either: (a) calculate the actual image bounds using `naturalWidth/naturalHeight` ratio against container dimensions, OR (b) more pragmatically, simply use the container bounds directly since `object-position` percentages are always relative to the content box regardless.
**Warning signs:** Focal point appears offset from where user clicked; markers near edges are cut off.

### Pitfall 2: Object-Position Percentage Semantics

**What goes wrong:** Misunderstanding how `object-position: X% Y%` works. It's NOT "move the image X% to the right." It aligns the X% point of the image with the X% point of the container.
**Why it happens:** CSS object-position percentages are unintuitive. `50% 50%` centers the image. `0% 0%` shows top-left. `100% 100%` shows bottom-right.
**How to avoid:** Store 0-1 normalized coordinates where (0,0) = top-left and (1,1) = bottom-right. Convert to `object-position: ${x*100}% ${y*100}%`. This maps correctly because CSS interprets `object-position: 30% 70%` as "align the 30% point of the image horizontally with the 30% point of the container."
**Warning signs:** Focal point stored correctly but image displays wrong crop area.

### Pitfall 3: Missing Focal Point in Data Queries

**What goes wrong:** Focal point is saved but gallery cards still center-crop because the query doesn't include `focalPointX/Y`.
**Why it happens:** The Chart model uses `include` without explicit `select` in `getChart()` (so all fields come through), but `getChartsForGallery()` and dashboard queries use specific `select` clauses that won't include new fields automatically.
**How to avoid:** Audit ALL queries that feed image display contexts. Since `getChartsForGallery()` uses `include: { project: { select: ... } }` at the project level but doesn't restrict chart fields, chart-level fields (including new ones) will be included by default. BUT dashboard actions like `getRandomSpotlightProject` use `chart: { select: { ... } }` -- these MUST be updated explicitly.
**Warning signs:** Focal point works on gallery page but not on dashboard spotlight.

### Pitfall 4: Thumbnail vs. Full Image Contexts

**What goes wrong:** Small thumbnail contexts (40x40px in genre/designer detail, shopping accordion) get focal point applied, but the visual difference is negligible and the extra prop-threading adds complexity.
**Why it happens:** D-07 says ALL `object-cover` contexts respect focal point. But 40x40 thumbnails barely show any difference.
**How to avoid:** Still implement per D-07 (user decision is locked), but prioritize gallery card and spotlight card (where cropping is dramatic) over tiny thumbnails (where it matters less). Test with a portrait image that has the subject clearly off-center.
**Warning signs:** No visual difference in small thumbnails -- that's expected and fine.

### Pitfall 5: Click Coordinate Accuracy on Mobile

**What goes wrong:** Touch events on mobile return coordinates that don't account for scroll position or viewport offset.
**Why it happens:** `clientX/clientY` is viewport-relative, but `getBoundingClientRect()` returns viewport-relative too, so the subtraction should be correct. However, if the hero area is scrollable or has transforms, coordinates can drift.
**How to avoid:** Use `event.clientX - rect.left` consistently (both are viewport-relative). The hero container has no transforms or scroll. Touch events: use `event.touches[0].clientX` for touchstart/touchmove, `event.changedTouches[0]` for touchend. Alternatively, just use `onClick` which works for both mouse and tap.
**Warning signs:** Marker appears at wrong position on mobile; position drifts when page is scrolled.

## Code Examples

### Schema Change

```prisma
// Source: [VERIFIED: prisma/schema.prisma existing Chart model]
model Chart {
  // ... existing fields ...
  focalPointX  Float?
  focalPointY  Float?
  // ... rest of model ...
}
```

### Server Action

```typescript
// Source: [VERIFIED: codebase pattern from chart-actions.ts updateProjectSettings]
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";

const updateFocalPointSchema = z.object({
  chartId: z.string().min(1),
  x: z.number().min(0).max(1).nullable(),
  y: z.number().min(0).max(1).nullable(),
});

export async function updateFocalPoint(chartId: string, x: number | null, y: number | null) {
  const user = await requireAuth();

  try {
    const validated = updateFocalPointSchema.parse({ chartId, x, y });

    const chart = await prisma.chart.findUnique({
      where: { id: validated.chartId },
      include: { project: { select: { userId: true } } },
    });
    if (!chart || !chart.project || chart.project.userId !== user.id) {
      return { success: false as const, error: "Chart not found" };
    }

    await prisma.chart.update({
      where: { id: validated.chartId },
      data: {
        focalPointX: validated.x,
        focalPointY: validated.y,
      },
    });

    revalidatePath("/charts");
    revalidatePath(`/charts/${validated.chartId}`);
    revalidatePath("/");
    return { success: true as const };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: error.errors[0].message };
    }
    return { success: false as const, error: "Failed to update focal point" };
  }
}
```

### Object-Position Utility

```typescript
// Source: [VERIFIED: CSS spec + UI-SPEC pattern]
/**
 * Converts stored focal point (0-1 normalized) to CSS object-position value.
 * Returns undefined when no focal point is set (browser defaults to 50% 50%).
 */
export function getObjectPositionStyle(
  focalPointX: number | null | undefined,
  focalPointY: number | null | undefined,
): React.CSSProperties | undefined {
  if (focalPointX == null || focalPointY == null) return undefined;
  return { objectPosition: `${focalPointX * 100}% ${focalPointY * 100}%` };
}
```

### Gallery Card Integration

```tsx
// Source: [VERIFIED: gallery-card.tsx line 172-178]
<Image
  src={card.coverImageUrl!}
  alt={card.name}
  fill
  className="object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transform-none"
  style={getObjectPositionStyle(card.focalPointX, card.focalPointY)}
  onError={() => setImgFailed(true)}
  unoptimized
/>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| CSS `background-position` on div | `object-position` on img/Image | CSS3+ (2015+) | Works with `<img>` elements directly, no background-image hacks |
| JavaScript crop libraries (cropperjs) | CSS-only `object-position` for display | Always available | No image manipulation needed -- just CSS display control |
| Storing pixel coordinates | Storing normalized 0-1 values | Best practice | Resolution-independent, works across all display sizes |

**Deprecated/outdated:**
- `background-image` + `background-position` approach: Replaced by `object-fit`/`object-position` which work directly on `<img>` elements and Next.js `Image` component.
- Canvas-based crop previews: Unnecessary when you only need to preview (not produce) a crop -- CSS overlay is simpler.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|-------|---------|---------------|
| A1 | Crop guide clamping math (Pattern 3) works correctly at image boundaries | Architecture Patterns | Low -- standard min/max clamping, easily verified visually |
| A2 | `onClick` on a div wrapping the hero image captures both mouse and touch events correctly across all browsers | Pitfalls | Medium -- may need explicit touch event handling on some mobile browsers |

## Open Questions (RESOLVED)

1. **Object-contain coordinate mapping accuracy** ✓
   - What we know: Hero uses `width={1200} height={800}` with `object-contain` and `w-full`. For images with different aspect ratios, there will be letterboxing.
   - Resolution: Clamp all coordinates to 0-1 range. In practice, users click on visible image content, not the letterbox. The `getBoundingClientRect()` + `offsetX/offsetY` approach produces coordinates relative to the element, and dividing by element dimensions gives normalized 0-1 regardless of letterboxing. Edge clicks produce clamped edge values which is acceptable behavior.

2. **Which queries need focalPointX/Y added explicitly?** ✓
   - What we know: `getChart()` uses full `include` (all Chart fields come through automatically). `getChartsForGallery()` uses `include` at chart level without field restriction (all chart fields). Dashboard actions use `chart: { select: { ... } }` which requires explicit field listing.
   - Resolution: Audit confirms these files need explicit `focalPointX: true, focalPointY: true` in their `chart: { select: {} }` blocks: `dashboard-actions.ts` (getRandomSpotlightProject, getCurrentlyStitchingProjects, getStartNextProjects, getBuriedTreasures), `genre-actions.ts` (getGenreWithCharts), `designer-actions.ts` (getDesignerWithCharts), `shopping-cart-actions.ts` (getShoppingCartData). Files using full includes (getChart, getChartsForGallery) need no changes.

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | Vitest 3.1.1 + @testing-library/react |
| Config file | `vitest.config.ts` |
| Quick run command | `npm test -- --reporter=dot` |
| Full suite command | `npm test` |

### Phase Requirements to Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| IMG-01a | Server action validates + persists focal point | unit | `npm test -- src/lib/actions/focal-point-actions.test.ts -t "persists"` | Wave 0 |
| IMG-01b | Server action rejects invalid coordinates | unit | `npm test -- src/lib/actions/focal-point-actions.test.ts -t "invalid"` | Wave 0 |
| IMG-01c | Server action rejects unauthorized users | unit | `npm test -- src/lib/actions/focal-point-actions.test.ts -t "auth"` | Wave 0 |
| IMG-01d | FocalPointEditor renders edit mode on trigger click | unit | `npm test -- src/components/features/charts/project-detail/focal-point-editor.test.tsx` | Wave 0 |
| IMG-01e | Click on image calculates normalized coordinates | unit | `npm test -- src/components/features/charts/project-detail/focal-point-editor.test.tsx -t "coordinate"` | Wave 0 |
| IMG-02a | Gallery card applies objectPosition style when focal point provided | unit | `npm test -- src/components/features/gallery/gallery-card.test.tsx -t "focal"` | Wave 0 |
| IMG-02b | Gallery card uses no objectPosition when focal point is null | unit | `npm test -- src/components/features/gallery/gallery-card.test.tsx -t "null focal"` | Wave 0 |
| IMG-02c | getObjectPositionStyle utility returns correct CSS | unit | `npm test -- src/lib/utils/focal-point.test.ts` | Wave 0 |
| IMG-02d | transformToGalleryCard passes focal point through | unit | `npm test -- src/components/features/gallery/gallery-utils.test.ts -t "focal"` | Wave 0 |

### Sampling Rate

- **Per task commit:** `npm test -- --reporter=dot`
- **Per wave merge:** `npm test`
- **Phase gate:** Full suite green before `/gsd-verify-work`

### Wave 0 Gaps

- [ ] `src/lib/actions/focal-point-actions.test.ts` -- covers IMG-01a/b/c (server action tests)
- [ ] `src/components/features/charts/project-detail/focal-point-editor.test.tsx` -- covers IMG-01d/e (editor UI tests)
- [ ] `src/lib/utils/focal-point.test.ts` -- covers IMG-02c (utility tests)
- [ ] Update `src/components/features/gallery/gallery-card.test.tsx` -- add focal point cases (IMG-02a/b)
- [ ] Update `src/components/features/gallery/gallery-utils.test.ts` -- add focal point transform case (IMG-02d)

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---------------|---------|-----------------|
| V2 Authentication | yes | `requireAuth()` in server action |
| V3 Session Management | no | No session changes |
| V4 Access Control | yes | Ownership check (chart.project.userId === user.id) |
| V5 Input Validation | yes | Zod schema validates Float 0-1 range |
| V6 Cryptography | no | No crypto operations |

### Known Threat Patterns

| Pattern | STRIDE | Standard Mitigation |
|---------|--------|---------------------|
| Unauthorized focal point update on another user's chart | Elevation of Privilege | Ownership validation in server action |
| Invalid coordinate injection (NaN, Infinity) | Tampering | Zod `.number().min(0).max(1)` validation |
| CSRF on server action | Spoofing | Next.js server actions have built-in CSRF protection |

## Sources

### Primary (HIGH confidence)

- **Codebase inspection** -- `prisma/schema.prisma`, `chart-actions.ts`, `gallery-card.tsx`, `hero-cover-banner.tsx`, `spotlight-card.tsx`, `dashboard-actions.ts`, `gallery-utils.ts`, `project-detail-hero.tsx`, `hero-kebab-menu.tsx`
- **Context7 /vercel/next.js** -- Image component `fill` prop + `style` prop compatibility confirmed
- **Phase 17 CONTEXT.md** -- All locked decisions (D-01 through D-10)
- **Phase 17 UI-SPEC** -- Component inventory, interaction contract, visual specifications

### Secondary (MEDIUM confidence)

- **CSS `object-position` spec** -- percentage semantics verified against MDN documentation understanding [ASSUMED but well-established CSS3 spec]

### Tertiary (LOW confidence)

- None -- all claims verified against codebase or documented specs.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- zero new dependencies, all existing patterns
- Architecture: HIGH -- straightforward data model + CSS property + click handler
- Pitfalls: HIGH -- identified from direct codebase inspection of query patterns and component structure

**Research date:** 2026-05-17
**Valid until:** 2026-06-17 (stable -- no external API dependencies, CSS is evergreen)
