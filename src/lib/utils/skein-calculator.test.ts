import { describe, it, expect } from "vitest";
import type { SkeinLine } from "@/types/supply";
import { calculateSkeins, usableInchesPerSkein } from "./skein-calculator";

/** THR-008, THR-016: the line every figure below is written against, 273 usable inches. */
const DMC: SkeinLine = { skeinLengthMm: 8000, strandStructure: "SIX_STRAND", cutLengthInches: 24 };

describe("calculateSkeins", () => {
  it("calculates ~1 skein for 1000 stitches on 14ct Aida over 1 with 2 strands, 20% waste", () => {
    // rawSkeins = 1000 * 2 * 1.2 / (14 * 273) = 0.628 → ceil = 1
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
    // rawSkeins = 1000 * 2 * 1.2 / (7 * 273) = 1.256 → ceil = 2
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

  it("calculates ~13 skeins for 10000 stitches on 14ct over 2 with 2 strands, 20% waste", () => {
    // rawSkeins = 10000 * 2 * 1.2 / (7 * 273) = 12.559 → ceil = 13
    const result = calculateSkeins({
      stitchCount: 10000,
      strandCount: 2,
      fabricCount: 14,
      overCount: 2,
      wastePercent: 20,
      line: DMC,
    });
    expect(result).toBe(13);
  });

  it("calculates ~7 skeins for 10000 stitches on 14ct over 1 with 2 strands, 20% waste", () => {
    // rawSkeins = 10000 * 2 * 1.2 / (14 * 273) = 6.279 → ceil = 7
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
    expect(noWaste).toBeLessThan(withWaste!);
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
    expect(oneStrand).toBeLessThan(twoStrands!);
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

  it("33678 stitches on 14ct over 1, 2 strands, 0% waste = 18 at Beth's cut, not the cited source's 19", () => {
    const result = calculateSkeins({
      stitchCount: 33678,
      strandCount: 2,
      fabricCount: 14,
      overCount: 1,
      wastePercent: 0,
      line: DMC,
    });
    expect(result).toBe(18);
  });

  it("22ct over 1, 2 strands, 0% waste: stitches_per_skein = 3003", () => {
    // 273 * 22 / 2 = 3003 stitches per skein → 1 skein for 3003 stitches
    expect(
      calculateSkeins({
        stitchCount: 3003,
        strandCount: 2,
        fabricCount: 22,
        overCount: 1,
        wastePercent: 0,
        line: DMC,
      }),
    ).toBe(1);
    expect(
      calculateSkeins({
        stitchCount: 3004,
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
    // rawSkeins = 10000 * 2 * 1.5 / (14 * 273) = 7.849 → ceil = 8
    expect(
      calculateSkeins({
        stitchCount: 10000,
        strandCount: 2,
        fabricCount: 14,
        overCount: 1,
        wastePercent: 50,
        line: DMC,
      }),
    ).toBe(8);
  });

  it("scales correctly with 6 strands", () => {
    // rawSkeins = 10000 * 6 * 1.2 / (14 * 273) = 18.838 → ceil = 19
    expect(
      calculateSkeins({
        stitchCount: 10000,
        strandCount: 6,
        fabricCount: 14,
        overCount: 1,
        wastePercent: 20,
        line: DMC,
      }),
    ).toBe(19);
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
    // over 1 raw = 10000 * 2 / (14 * 273) = 5.233 → 6
    // over 2 raw = 10000 * 2 / (7 * 273) = 10.467 → 11
    expect(over1).toBe(6);
    expect(over2).toBe(11);
  });
});

describe("usableInchesPerSkein — whole cuts of the line's own cut, less 3 inches each (THR-016)", () => {
  it.each([
    ["DMC or Anchor, 8 m (THR-008)", 8000, 24, 273],
    ["Weeks Dye Works or The Gentle Art, 5 yd (THR-009)", 4572, 24, 147],
    ["Very Fine #4 Braid, 11 m (THR-010)", 11000, 15, 336],
    ["Fine #8 Braid, 10 m (THR-010)", 10000, 15, 312],
    ["Blending Filament, 50 m (THR-010)", 50000, 15, 1572],
  ])("%s → %i mm at a %i-inch cut gives %i usable inches", (_label, mm, cut, usable) => {
    expect(usableInchesPerSkein(mm, cut)).toBe(usable);
  });

  it("counts only whole cuts, never a proportional share of the 273", () => {
    // 5 yd scaled from 8 m would be 156.0; seven whole 24-inch cuts are 147.
    expect(usableInchesPerSkein(4572, 24)).not.toBeCloseTo(156, 0);
    expect(usableInchesPerSkein(4572, 24)).toBe(147);
  });

  it("gives nothing usable from a length shorter than one cut", () => {
    expect(usableInchesPerSkein(609, 24)).toBe(0);
    expect(usableInchesPerSkein(610, 24)).toBe(21);
  });

  it.each([3, 2, 0])(
    "gives nothing usable from a %i-inch cut, which loses all of itself",
    (cut) => {
      expect(usableInchesPerSkein(8000, cut)).toBe(0);
      expect(usableInchesPerSkein(0, cut)).toBe(0);
    },
  );
});

describe("calculateSkeins — each line's own length, structure and cut (THR-010, THR-011, THR-016)", () => {
  const base = { stitchCount: 5000, fabricCount: 14, overCount: 1 as const, wastePercent: 20 };
  const ANCHOR: SkeinLine = {
    skeinLengthMm: 8000,
    strandStructure: "SIX_STRAND",
    cutLengthInches: 24,
  };
  const WEEKS: SkeinLine = { ...DMC, skeinLengthMm: 4572 };
  const KREINIK = { strandStructure: "USED_WHOLE", cutLengthInches: 15 } as const;
  const FINE_8_BRAID: SkeinLine = { ...KREINIK, skeinLengthMm: 10000 };
  const VERY_FINE_4_BRAID: SkeinLine = { ...KREINIK, skeinLengthMm: 11000 };
  const BLENDING_FILAMENT: SkeinLine = { ...KREINIK, skeinLengthMm: 50000 };

  it("gives DMC 4 skeins for 5000 stitches at 2 strands", () => {
    // 5000 × 2 × 1.2 / (14 × 273) = 3.14 → 4
    expect(calculateSkeins({ ...base, strandCount: 2, line: DMC })).toBe(4);
  });

  it("gives Anchor exactly DMC's figure for the same inputs", () => {
    for (const strandCount of [1, 2, 3, 6] as const) {
      expect(calculateSkeins({ ...base, strandCount, line: ANCHOR })).toBe(
        calculateSkeins({ ...base, strandCount, line: DMC }),
      );
    }
  });

  it("gives Weeks Dye Works 6 skeins where DMC needs 4 (5 yd, 147 usable inches)", () => {
    // 5000 × 2 × 1.2 / (14 × 147) = 5.83 → 6
    expect(calculateSkeins({ ...base, strandCount: 2, line: WEEKS })).toBe(6);
  });

  it("gives Fine #8 Braid 9 spools — a used-whole cut is one working length, not one strand (THR-013)", () => {
    // 5000 × 6 × 1.2 / (14 × 312) = 8.24 → 9; treated as one strand it would be 2
    expect(calculateSkeins({ ...base, strandCount: 2, line: FINE_8_BRAID })).toBe(9);
  });

  it("works Very Fine #4 Braid and Blending Filament from their own lengths", () => {
    // 5000 × 6 × 1.2 / (14 × 336) = 7.65 → 8;  / (14 × 1572) = 1.64 → 2
    expect(calculateSkeins({ ...base, strandCount: 2, line: VERY_FINE_4_BRAID })).toBe(8);
    expect(calculateSkeins({ ...base, strandCount: 2, line: BLENDING_FILAMENT })).toBe(2);
  });

  it("does not move a used-whole line's figure with the project's strand count", () => {
    const figures = ([1, 2, 3, 4, 5, 6] as const).map((strandCount) =>
      calculateSkeins({ ...base, strandCount, line: FINE_8_BRAID }),
    );
    expect(new Set(figures)).toEqual(new Set([9]));
  });

  it("gives a Kreinik line the shorter cut's figure, one spool more than 18/15 gave here", () => {
    // 5040 × 6 / (14 × 336) = 6.43 → 7; the cited source's 360 usable inches gave exactly 6
    const inputs = { stitchCount: 5040, fabricCount: 14, overCount: 1, wastePercent: 0 } as const;
    expect(calculateSkeins({ ...inputs, strandCount: 2, line: VERY_FINE_4_BRAID })).toBe(7);
  });

  it.each([
    ["no length", { ...DMC, skeinLengthMm: null }],
    ["no strand structure", { ...DMC, strandStructure: null }],
    [
      "no cut — it takes no default, even at a length she knows (Q-009)",
      { ...DMC, cutLengthInches: null },
    ],
    ["none of them", { skeinLengthMm: null, strandStructure: null, cutLengthInches: null }],
  ] as const)("gives an unknown need — not 0, not 1 — for a line with %s", (_label, line) => {
    expect(calculateSkeins({ ...base, strandCount: 2, line })).toBeNull();
  });

  it("gives an unknown need for a known length too short to yield one cut", () => {
    expect(
      calculateSkeins({ ...base, strandCount: 2, line: { ...DMC, skeinLengthMm: 400 } }),
    ).toBeNull();
  });

  it("gives an unknown need, never NaN, for a line whose cut did not arrive", () => {
    const { cutLengthInches: _, ...lineWithoutCut } = DMC;
    expect(
      calculateSkeins({ ...base, strandCount: 2, line: lineWithoutCut as SkeinLine }),
    ).toBeNull();
  });

  it("gives an unknown need for a cut that loses all of itself", () => {
    expect(
      calculateSkeins({ ...base, strandCount: 2, line: { ...DMC, cutLengthInches: 3 } }),
    ).toBeNull();
  });
});
