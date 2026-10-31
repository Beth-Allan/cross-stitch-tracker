import { describe, it, expect } from "vitest";
import type { SkeinLine } from "@/types/supply";
import { calculateSkeins, usableInchesPerSkein } from "./skein-calculator";

/** THR-008: the line every figure above was written against. */
const DMC: SkeinLine = { skeinLengthMm: 8000, strandStructure: "SIX_STRAND" };

describe("calculateSkeins", () => {
  it("calculates ~1 skein for 1000 stitches on 14ct Aida over 1 with 2 strands, 20% waste", () => {
    // rawSkeins = 1000 * 2 * 1.2 / (14 * 255) = 0.672 → ceil = 1
    const result = calculateSkeins({
      stitchCount: 1000,
      strandCount: 2,
      fabricCount: 14,
      overCount: 1,
      wastePercent: 20,
      line: DMC,
    });
    expect(result).toBe(1);
  });

  it("calculates ~2 skeins for 1000 stitches on 14ct over 2 with 2 strands, 20% waste", () => {
    // rawSkeins = 1000 * 2 * 1.2 / (7 * 255) = 1.345 → ceil = 2
    const result = calculateSkeins({
      stitchCount: 1000,
      strandCount: 2,
      fabricCount: 14,
      overCount: 2,
      wastePercent: 20,
      line: DMC,
    });
    expect(result).toBe(2);
  });

  it("calculates ~14 skeins for 10000 stitches on 14ct over 2 with 2 strands, 20% waste", () => {
    // rawSkeins = 10000 * 2 * 1.2 / (7 * 255) = 13.445 → ceil = 14
    const result = calculateSkeins({
      stitchCount: 10000,
      strandCount: 2,
      fabricCount: 14,
      overCount: 2,
      wastePercent: 20,
      line: DMC,
    });
    expect(result).toBe(14);
  });

  it("calculates ~7 skeins for 10000 stitches on 14ct over 1 with 2 strands, 20% waste", () => {
    // rawSkeins = 10000 * 2 * 1.2 / (14 * 255) = 6.723 → ceil = 7
    const result = calculateSkeins({
      stitchCount: 10000,
      strandCount: 2,
      fabricCount: 14,
      overCount: 1,
      wastePercent: 20,
      line: DMC,
    });
    expect(result).toBe(7);
  });

  it("returns 0 for stitchCount of 0", () => {
    const result = calculateSkeins({
      stitchCount: 0,
      strandCount: 2,
      fabricCount: 14,
      overCount: 2,
      wastePercent: 20,
      line: DMC,
    });
    expect(result).toBe(0);
  });

  it("returns 0 for negative stitchCount", () => {
    const result = calculateSkeins({
      stitchCount: -100,
      strandCount: 2,
      fabricCount: 14,
      overCount: 2,
      wastePercent: 20,
      line: DMC,
    });
    expect(result).toBe(0);
  });

  it("returns fewer skeins with wastePercent 0 than wastePercent 20", () => {
    const noWaste = calculateSkeins({
      stitchCount: 5000,
      strandCount: 2,
      fabricCount: 14,
      overCount: 2,
      wastePercent: 0,
      line: DMC,
    });
    const withWaste = calculateSkeins({
      stitchCount: 5000,
      strandCount: 2,
      fabricCount: 14,
      overCount: 2,
      wastePercent: 20,
      line: DMC,
    });
    expect(noWaste).toBeLessThan(withWaste);
  });

  it("returns fewer skeins with strandCount 1 than strandCount 2", () => {
    const oneStrand = calculateSkeins({
      stitchCount: 5000,
      strandCount: 1,
      fabricCount: 14,
      overCount: 2,
      wastePercent: 20,
      line: DMC,
    });
    const twoStrands = calculateSkeins({
      stitchCount: 5000,
      strandCount: 2,
      fabricCount: 14,
      overCount: 2,
      wastePercent: 20,
      line: DMC,
    });
    expect(oneStrand).toBeLessThan(twoStrands);
  });

  it("always returns a whole number (Math.ceil)", () => {
    // Use inputs that produce a fractional raw value
    const result = calculateSkeins({
      stitchCount: 100,
      strandCount: 1,
      fabricCount: 18,
      overCount: 2,
      wastePercent: 10,
      line: DMC,
    });
    expect(Number.isInteger(result)).toBe(true);
    expect(result).toBeGreaterThan(0);
  });

  it("matches mismatch.co.uk formula: 33678 stitches on 14ct over 1, 2 strands, 0% waste = 19", () => {
    const result = calculateSkeins({
      stitchCount: 33678,
      strandCount: 2,
      fabricCount: 14,
      overCount: 1,
      wastePercent: 0,
      line: DMC,
    });
    expect(result).toBe(19);
  });

  it("22ct over 1, 2 strands, 0% waste: stitches_per_skein = 2805", () => {
    // 255 * 22 / 2 = 2805 stitches per skein → 1 skein for 2805 stitches
    expect(
      calculateSkeins({
        stitchCount: 2805,
        strandCount: 2,
        fabricCount: 22,
        overCount: 1,
        wastePercent: 0,
        line: DMC,
      }),
    ).toBe(1);
    expect(
      calculateSkeins({
        stitchCount: 2806,
        strandCount: 2,
        fabricCount: 22,
        overCount: 1,
        wastePercent: 0,
        line: DMC,
      }),
    ).toBe(2);
  });

  it("returns 0 for fabricCount of 0", () => {
    expect(
      calculateSkeins({
        stitchCount: 1000,
        strandCount: 2,
        fabricCount: 0,
        overCount: 1,
        wastePercent: 20,
        line: DMC,
      }),
    ).toBe(0);
  });

  it("returns 0 for negative fabricCount", () => {
    expect(
      calculateSkeins({
        stitchCount: 1000,
        strandCount: 2,
        fabricCount: -14,
        overCount: 1,
        wastePercent: 20,
        line: DMC,
      }),
    ).toBe(0);
  });

  it("returns 0 for strandCount of 0", () => {
    // Runtime guard test: StrandCount type prevents 0 at compile time,
    // but the runtime check still handles it for defense-in-depth
    expect(
      calculateSkeins({
        stitchCount: 1000,
        strandCount: 0 as unknown as 1,
        fabricCount: 14,
        overCount: 1,
        wastePercent: 20,
        line: DMC,
      }),
    ).toBe(0);
  });

  it("calculates correct exact value at wastePercent 50", () => {
    // rawSkeins = 10000 * 2 * 1.5 / (14 * 255) = 8.403 → ceil = 9
    expect(
      calculateSkeins({
        stitchCount: 10000,
        strandCount: 2,
        fabricCount: 14,
        overCount: 1,
        wastePercent: 50,
        line: DMC,
      }),
    ).toBe(9);
  });

  it("scales correctly with 6 strands", () => {
    // rawSkeins = 10000 * 6 * 1.2 / (14 * 255) = 20.168 → ceil = 21
    expect(
      calculateSkeins({
        stitchCount: 10000,
        strandCount: 6,
        fabricCount: 14,
        overCount: 1,
        wastePercent: 20,
        line: DMC,
      }),
    ).toBe(21);
  });

  it("over 2 uses exactly twice the thread per stitch as over 1", () => {
    const over1 = calculateSkeins({
      stitchCount: 10000,
      strandCount: 2,
      fabricCount: 14,
      overCount: 1,
      wastePercent: 0,
      line: DMC,
    });
    const over2 = calculateSkeins({
      stitchCount: 10000,
      strandCount: 2,
      fabricCount: 14,
      overCount: 2,
      wastePercent: 0,
      line: DMC,
    });
    // over 1 raw = 10000 * 2 / (14 * 255) = 5.602 → 6
    // over 2 raw = 10000 * 2 / (7 * 255) = 11.204 → 12
    expect(over1).toBe(6);
    expect(over2).toBe(12);
  });
});

describe("usableInchesPerSkein — whole 18-inch cuts of 15 usable inches (THR-006)", () => {
  it.each([
    ["DMC or Anchor, 8 m (THR-008)", 8000, 255],
    ["Weeks Dye Works or The Gentle Art, 5 yd (THR-009)", 4572, 150],
    ["Very Fine #4 Braid, 11 m (THR-010)", 11000, 360],
    ["Fine #8 Braid, 10 m (THR-010)", 10000, 315],
    ["Blending Filament, 50 m (THR-010)", 50000, 1635],
  ])("%s → %i usable inches", (_label, skeinLengthMm, usable) => {
    expect(usableInchesPerSkein(skeinLengthMm)).toBe(usable);
  });

  it("counts only whole cuts, never a proportional share of the 255", () => {
    // 5 yd scaled from 8 m would be 146.6; ten whole 18-inch cuts are 150.
    expect(usableInchesPerSkein(4572)).not.toBeCloseTo(146.6, 0);
    expect(usableInchesPerSkein(4572)).toBe(150);
  });

  it("gives nothing usable from a length shorter than one cut", () => {
    expect(usableInchesPerSkein(457)).toBe(0);
  });
});

describe("calculateSkeins — each line's own length and structure (F-16a)", () => {
  const base = { stitchCount: 5000, fabricCount: 14, overCount: 1 as const, wastePercent: 20 };
  const ANCHOR: SkeinLine = { skeinLengthMm: 8000, strandStructure: "SIX_STRAND" };
  const WEEKS: SkeinLine = { skeinLengthMm: 4572, strandStructure: "SIX_STRAND" };
  const FINE_8_BRAID: SkeinLine = { skeinLengthMm: 10000, strandStructure: "USED_WHOLE" };
  const VERY_FINE_4_BRAID: SkeinLine = { skeinLengthMm: 11000, strandStructure: "USED_WHOLE" };
  const BLENDING_FILAMENT: SkeinLine = { skeinLengthMm: 50000, strandStructure: "USED_WHOLE" };

  it("gives DMC 4 skeins for 5000 stitches at 2 strands", () => {
    // 5000 × 2 × 1.2 / (14 × 255) = 3.36 → 4
    expect(calculateSkeins({ ...base, strandCount: 2, line: DMC })).toBe(4);
  });

  it("gives Anchor exactly DMC's figure for the same inputs", () => {
    for (const strandCount of [1, 2, 3, 6] as const) {
      expect(calculateSkeins({ ...base, strandCount, line: ANCHOR })).toBe(
        calculateSkeins({ ...base, strandCount, line: DMC }),
      );
    }
  });

  it("gives Weeks Dye Works 6 skeins where DMC needs 4 (5 yd, 150 usable inches)", () => {
    // 5000 × 2 × 1.2 / (14 × 150) = 5.71 → 6
    expect(calculateSkeins({ ...base, strandCount: 2, line: WEEKS })).toBe(6);
  });

  it("gives Fine #8 Braid 9 spools — a used-whole cut is one working length (trap ④)", () => {
    // 5000 × 6 × 1.2 / (14 × 315) = 8.16 → 9; treated as one strand it would be 2
    expect(calculateSkeins({ ...base, strandCount: 2, line: FINE_8_BRAID })).toBe(9);
  });

  it("works Very Fine #4 Braid and Blending Filament from their own lengths", () => {
    // 5000 × 6 × 1.2 / (14 × 360) = 7.14 → 8;  / (14 × 1635) = 1.57 → 2
    expect(calculateSkeins({ ...base, strandCount: 2, line: VERY_FINE_4_BRAID })).toBe(8);
    expect(calculateSkeins({ ...base, strandCount: 2, line: BLENDING_FILAMENT })).toBe(2);
  });

  it("does not move a used-whole line's figure with the project's strand count", () => {
    const figures = ([1, 2, 3, 4, 5, 6] as const).map((strandCount) =>
      calculateSkeins({ ...base, strandCount, line: FINE_8_BRAID }),
    );
    expect(new Set(figures)).toEqual(new Set([9]));
  });

  it.each([
    ["no length", { skeinLengthMm: null, strandStructure: "SIX_STRAND" }],
    ["no strand structure", { skeinLengthMm: 8000, strandStructure: null }],
    ["neither", { skeinLengthMm: null, strandStructure: null }],
  ] as const)("gives an unknown need — not 0, not 1 — for a line with %s", (_label, line) => {
    expect(calculateSkeins({ ...base, strandCount: 2, line })).toBeNull();
  });

  it("gives an unknown need for a known length too short to yield one cut", () => {
    const line: SkeinLine = { skeinLengthMm: 400, strandStructure: "SIX_STRAND" };
    expect(calculateSkeins({ ...base, strandCount: 2, line })).toBeNull();
  });
});
