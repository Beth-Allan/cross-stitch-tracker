# Skein Calculator Fix Plan

## Status: COMPLETE

### What's Done

**Formula fix:** Removed the bogus `INCHES_PER_STITCH_UNIT = 1.3` constant from `src/lib/utils/skein-calculator.ts`. The formula now matches the standard mismatch.co.uk derivation:

```
skeins = ceil(stitches * strands / (effectiveCount * 255) * wasteFactor)
```

- All 1,193+ tests pass
- New tests added: mismatch.co.uk validation (33678 stitches = 19 skeins) and 22ct boundary test
- Edge case tests added: fabricCount=0, negative fabricCount, strandCount=0, wastePercent=50, strandCount=6
- Backlog item 999.13 added for per-brand skein length (`skeinLengthMeters` on ThreadBrand)

**Schema default fix:** Changed `overCount` default from 2 to 1 in `prisma/schema.prisma`. Aida (over 1) is far more common than evenweave/linen (over 2). Pushed to Neon DB.

**Backlogged:** Auto-infer overCount from fabric count (999.14) — when fabric is linked to a project, auto-set based on fabric count (≤25 → over 1, ≥28 → over 2).

### Root Cause Summary

The old formula had three stacking issues producing 59 skeins instead of 19:
1. `INCHES_PER_STITCH_UNIT = 1.3` inflated all results by 30% (FIXED)
2. `overCount` schema default of 2 doubled the estimate for Aida projects (FIXED)
3. 20% waste factor on top — this is a feature, not a bug

### Files Changed
- `src/lib/utils/skein-calculator.ts` — removed 1.3 constant, updated formula, added strandCount guard
- `src/lib/utils/skein-calculator.test.ts` — updated expected values, added validation + edge case tests
- `src/components/features/charts/project-detail/supply-row.test.tsx` — updated stale formula comment
- `prisma/schema.prisma` — overCount default 2 → 1
- `CLAUDE.md` — added backlog items 999.13, 999.14
