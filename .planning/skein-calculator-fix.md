# Skein Calculator Fix Plan

## Status: IN PROGRESS

### What's Done

**Formula fix (COMPLETE):** Removed the bogus `INCHES_PER_STITCH_UNIT = 1.3` constant from `src/lib/utils/skein-calculator.ts`. The formula now matches the standard mismatch.co.uk derivation:

```
skeins = ceil(stitches * strands / (effectiveCount * 255) * wasteFactor)
```

- All 1,193 tests pass
- New tests added: mismatch.co.uk validation (33678 stitches = 19 skeins) and 22ct boundary test
- Backlog item 999.13 added for per-brand skein length (`skeinLengthMeters` on ThreadBrand)

### What's Left

**1. Change schema default for `overCount` from 2 to 1**

File: `prisma/schema.prisma` — change `overCount Int @default(2)` to `@default(1)`

Aida (over 1) is far more common than evenweave/linen (over 2), so 1 is a better default. The user can toggle over count in the calculator settings bar on the supplies tab.

**2. Auto-infer `overCount` when fabric is linked to a project**

Domain rule from the user:
- Fabric counts 14, 16, 18, 20, 22, 25 → over 1 (Aida / low-count)
- Fabric counts 28, 32, 36, 40 → over 2 (evenweave / linen)

When a fabric is linked to a project, auto-set `overCount` based on the fabric's count. This needs:
- A utility function to infer over count from fabric count (threshold: counts ≤ 25 → over 1, ≥ 28 → over 2)
- Update the "link fabric" action to set overCount when fabric is assigned
- The user can still override via the settings bar toggle

**Decision needed:** Should we do #2 now or backlog it? It's more involved than #1.

### Root Cause Summary

The old formula had three stacking issues producing 59 skeins instead of 19:
1. `INCHES_PER_STITCH_UNIT = 1.3` inflated all results by 30% (FIXED)
2. `overCount` schema default of 2 doubled the estimate for Aida projects (TODO)
3. 20% waste factor on top — this is a feature, not a bug

### Files Changed
- `src/lib/utils/skein-calculator.ts` — removed 1.3 constant, updated formula and comments
- `src/lib/utils/skein-calculator.test.ts` — updated expected values, added mismatch validation tests
- `CLAUDE.md` — added backlog item 999.13 (per-brand skein length)
