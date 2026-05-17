# Phase 17: Image Focal Point - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-17
**Phase:** 17-image-focal-point
**Areas discussed:** Focal point setter UI, Display context behavior, Data model & persistence

---

## Focal Point Setter UI

### Where should the setter live?

| Option | Description | Selected |
|--------|-------------|----------|
| Project detail hero area | Click the hero banner image on the project detail page to set focal point. Already a prominent image display — natural place to interact with it. | ✓ |
| Dedicated edit modal | A 'Set focal point' action opens a modal showing the full image with a click-to-place marker. More intentional, less accidental clicks. | |
| Gallery card long-press/icon | Set focal point directly from gallery card view via a small edit icon overlay or long-press interaction. | |

**User's choice:** Project detail hero area

### How should the user interact?

| Option | Description | Selected |
|--------|-------------|----------|
| Click/tap to place marker | Single click anywhere on the image drops a crosshair/dot marker at that position. Click again to move it. | ✓ |
| Drag a marker | A draggable pin/crosshair appears on the image that the user repositions. | |
| You decide | Claude picks the simplest approach. | |

**User's choice:** Click/tap to place marker

### Marker visibility

| Option | Description | Selected |
|--------|-------------|----------|
| Show while setting only | Marker appears when user enters edit mode. Disappears after saving. Clean hero view normally. | ✓ |
| Always visible on hero | A subtle dot/crosshair always shows on the hero image. | |
| Visible on hover only | Marker shows when hovering over the hero image. | |

**User's choice:** Show while setting only

### How to enter edit mode

| Option | Description | Selected |
|--------|-------------|----------|
| Button on hero image | A small 'Set focal point' button (crosshair icon) overlays the hero image corner. Click to enter edit mode, click image to place, Save to confirm. | ✓ |
| Kebab menu action | Add 'Set Focal Point' to the existing hero kebab menu. | |
| Direct click (no mode) | Clicking the hero image always sets the focal point immediately (auto-saves). | |

**User's choice:** Button on hero image

---

## Display Context Behavior

### Hero banner focal point

| Option | Description | Selected |
|--------|-------------|----------|
| Keep object-contain (no change) | Hero stays as-is — shows full image. Focal point only affects contexts that use object-cover. Hero is where you SET it, but it doesn't APPLY there. | ✓ |
| Switch hero to object-cover | Make hero crop with object-cover, then focal point applies. Changes current look. | |
| You decide | Claude picks based on architecture. | |

**User's choice:** Keep object-contain (no change)

### Which contexts respect focal point?

| Option | Description | Selected |
|--------|-------------|----------|
| Gallery cards + Spotlight only | The two main object-cover contexts. Smaller thumbnails use center-crop. | |
| All object-cover contexts | Every context that uses object-cover gets focal point — gallery, spotlight, genre/designer, shopping. | ✓ |
| You decide | Claude determines based on image size and crop severity. | |

**User's choice:** All object-cover contexts

### Live crop preview during editing

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — live preview overlay | While in edit mode, show aspect-4/3 crop guide overlay so user can see what gallery cards will show. | ✓ |
| No — just the marker | User clicks to place marker. Check gallery cards afterward. Simpler to build. | |

**User's choice:** Yes — live preview overlay

---

## Data Model & Persistence

### Storage approach

| Option | Description | Selected |
|--------|-------------|----------|
| Two nullable Floats (0-1) | focalPointX Float? and focalPointY Float? on Chart. Normalized 0-1. Maps to CSS object-position. | |
| Single JSON field | focalPoint Json? storing {x, y}. Fewer columns but harder to validate. | |
| You decide | Claude picks best fit for Prisma 7 and existing patterns. | ✓ |

**User's choice:** You decide
**Notes:** Claude will use two nullable Float fields — cleaner for Prisma schema validation and direct CSS mapping.

### Default when no focal point set

| Option | Description | Selected |
|--------|-------------|----------|
| Center (50% 50%) | Standard CSS default. No visual change for existing images. | ✓ |
| Top-center (50% 25%) | Bias toward top quarter. Domain-aware but opinionated. | |
| Keep browser default | Don't set object-position at all when null. | |

**User's choice:** Center (50% 50%)

### Reset mechanism

| Option | Description | Selected |
|--------|-------------|----------|
| Yes — reset button in edit mode | 'Reset to center' button alongside Save/Cancel. Clears back to null. | ✓ |
| No — click center to reset | User clicks center to effectively reset. No explicit action. | |

**User's choice:** Yes — reset button in edit mode

---

## Claude's Discretion

- Crosshair/dot marker visual design (size, color, border, animation)
- Crop preview overlay rendering style
- Edit mode button placement on hero
- Optimistic UI vs. waiting for server response
- Server action structure
- Touch handling nuances for mobile
- Two nullable Float fields chosen for schema (user said "you decide")

## Deferred Ideas

None — discussion stayed within phase scope
