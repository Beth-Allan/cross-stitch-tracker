import { describe, it, expect } from "vitest";
import { calculateSkeins } from "./skein-calculator";

describe("calculateSkeins", () => {
  it("calculates ~1 skein for 1000 stitches on 14ct Aida over 1 with 2 strands, 20% waste", () => {
    // rawSkeins = 1000 * 2 * 1.2 / (14 * 255) = 0.672 → ceil = 1
    const result = calculateSkeins({
      stitchCount: 1000,
      strandCount: 2,
      fabricCount: 14,
      overCount: 1,
      wastePercent: 20,
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
    });
    const withWaste = calculateSkeins({
      stitchCount: 5000,
      strandCount: 2,
      fabricCount: 14,
      overCount: 2,
      wastePercent: 20,
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
    });
    const twoStrands = calculateSkeins({
      stitchCount: 5000,
      strandCount: 2,
      fabricCount: 14,
      overCount: 2,
      wastePercent: 20,
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
      }),
    ).toBe(1);
    expect(
      calculateSkeins({
        stitchCount: 2806,
        strandCount: 2,
        fabricCount: 22,
        overCount: 1,
        wastePercent: 0,
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
    });
    const over2 = calculateSkeins({
      stitchCount: 10000,
      strandCount: 2,
      fabricCount: 14,
      overCount: 2,
      wastePercent: 0,
    });
    // over 1 raw = 10000 * 2 / (14 * 255) = 5.602 → 6
    // over 2 raw = 10000 * 2 / (7 * 255) = 11.204 → 12
    expect(over1).toBe(6);
    expect(over2).toBe(12);
  });
});
