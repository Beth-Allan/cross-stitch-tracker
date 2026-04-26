# Image Optimization on Upload — Research & Analysis

> Pre-phase research for adding WebP conversion to the upload pipeline.
> Analyzed: 2026-04-26

## Decision

Convert display images (covers, session photos) to optimized WebP on upload via Sharp.
Do NOT touch working copy files (PDFs, .saga, .oxs, .xsd, or images uploaded as digital working copies).

**Scope rule:** Anything you're *looking at* gets optimized for display. Anything you're *working from* stays pristine.

The upload system already distinguishes by category (`"covers"`, `"sessions"`, `"files"`), so optimization triggers only for `covers` and `sessions`. The `"files"` category passes through untouched.

---

## Current State

### Upload Pipeline (`src/lib/actions/upload-actions.ts`)

1. `getPresignedUploadUrl()` — generates presigned PUT URL for client-side upload to R2
2. Client uploads raw file directly to R2 (PNG/JPEG/WebP, up to 10MB)
3. `confirmUpload()` — saves R2 key in DB, auto-generates 400x400 WebP thumbnail for covers

### Thumbnail Generation (already exists)

`generateThumbnail()` in `upload-actions.ts:236` already does:
- Fetch original from R2 → Sharp resize 400x400 (fit: cover, withoutEnlargement) → WebP q80 → upload to R2 → save key

This is the exact same pattern the optimized full-size version will follow.

### Image Display Contexts

| Context | Component | Rendered size | Currently loads |
|---------|-----------|--------------|-----------------|
| Gallery card (4:3) | `gallery-card.tsx` | ~300-400px (800px retina) | Full raw upload |
| Hero banner | `hero-cover-banner.tsx` | max 1200px wide, 256px tall | Full raw upload |
| Thumbnail (lists) | `cover-thumbnail.tsx` | 40x40px | Already optimized WebP |
| Session table | `session-table.tsx` | Icon only (camera) | Not displayed |

All `<Image>` components use `unoptimized={true}` — no Next.js optimization.

### Key Files

- `src/lib/actions/upload-actions.ts` — server actions (main change target)
- `src/components/features/charts/form-primitives/cover-image-upload.tsx` — client upload component
- `src/lib/validations/upload.ts` — file type/size validation
- `src/lib/r2.ts` — R2 client init
- `src/components/features/charts/project-detail/hero-cover-banner.tsx` — hero display
- `src/components/features/gallery/gallery-card.tsx` — gallery card display
- `src/components/features/charts/cover-thumbnail.tsx` — thumbnail display
- `src/components/features/sessions/log-session-modal.tsx` — session photo upload (category: "sessions")

---

## Technical Approach

### Architecture: Extend `confirmUpload()`

```
Current:  raw upload → fetch → sharp(400x400 WebP) → save thumbnail
New:      raw upload → fetch → sharp(1200px WebP q80) → save optimized cover
                             → sharp(400x400 WebP q80) → save thumbnail  (existing)
                             → delete raw original from R2
```

Both Sharp operations share the same fetched buffer and run in parallel:

```ts
const buffer = /* fetch from R2 */;
const [optimized, thumbnail] = await Promise.all([
  sharp(buffer).resize(1200, null, { withoutEnlargement: true }).webp({ quality: 80 }).toBuffer(),
  sharp(buffer).resize(400, 400, { fit: "cover", withoutEnlargement: true }).webp({ quality: 80 }).toBuffer(),
]);
```

### Session Photos

Same approach applies to `"sessions"` category uploads. Consider whether session progress photos need higher fidelity (users may zoom into stitching detail). Options:
- Same 1200px/q80 as covers (consistent, good enough)
- Higher res like 1600px/q85 (preserves more detail for zoom)
- Decide during implementation

### Raw Original: Delete After Processing

Cover photos are reference images, not archival assets. The original exists on retailer sites or physical patterns. No need to keep the raw upload — 1200px WebP is more than enough for any future regeneration.

### Migration of Existing Images

Two options:
1. **Forward-only** (recommended to start): new uploads get optimized, existing stay as-is
2. **One-time script** (future): batch process existing covers through same pipeline

---

## Impact Analysis

### Image Quality

- WebP quality 80 ≈ JPEG quality 88-92. Visually indistinguishable at display sizes.
- 1200px wide covers all display contexts with retina sharpness (hero max ~1200px, gallery cards ~800px retina).
- `withoutEnlargement: true` means small images stay at their original resolution, just get format-converted.
- PNG transparency preserved (WebP supports alpha).
- Already-WebP re-encoding is nearly lossless at same quality level.

### Storage (estimated for 500 charts)

| Scenario | Per cover | 500 charts | Reduction |
|----------|-----------|------------|-----------|
| Current (raw uploads) | ~1.5MB avg | ~750MB | — |
| Optimized (1200px WebP q80) | ~100-150KB | ~60-75MB | ~90% |
| Thumbnails (no change) | ~15KB | ~7.5MB | — |

R2 free tier: 10GB storage, 10GB/month egress. Both scenarios fit easily.

### Bandwidth Per Page Load

**Gallery page with 20 cards:**
- Current: 20 × ~1.5MB = ~30MB transferred
- Optimized: 20 × ~130KB = ~2.6MB transferred
- **~12x reduction** — the biggest practical win

Presigned URLs expire hourly and can't be browser-cached long-term, making this bandwidth cost real on every visit.

### Processing Time

- Sharp resize + WebP encode: ~200-400ms per operation
- Both operations parallel from same buffer: ~400-500ms total
- Hidden behind existing UX (user sees local preview via `URL.createObjectURL()`)
- Vercel limits: well within 1024MB RAM default and 300s timeout

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Quality too low for some images | Very low | q80 is conservative; could bump to q85 |
| Sharp processing failure on edge-case image | Low | Already handled — thumbnail gen has try/catch with graceful fallback |
| Vercel memory pressure on very large images | Very low | 10MB cap, Sharp needs ~50-100MB, Vercel gives 1024MB |
| Session photos need higher fidelity | Medium | Decide per-category; easy to use different settings |

---

## Summary

- **Feasibility:** Very high — extends existing thumbnail pipeline
- **Effort:** Small — primarily `confirmUpload()` changes + tests
- **Quality loss:** Imperceptible at all display sizes
- **Storage saving:** ~90% (~750MB → ~70MB at 500 charts)
- **Bandwidth saving:** ~12x per gallery page load
- **Risk:** Very low — same library, same pattern, graceful fallback exists
