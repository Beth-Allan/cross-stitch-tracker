import { describe, it, expect } from "vitest";
import { calculateSkeins } from "./skein-calculator";

describe("calculateSkeins", () => {
  it("calculates ~1 skein for 1000 stitches on 14ct Aida over 1 with 2 strands, 20% waste", () => {
    // effectiveCount = 14/1 = 14
    // threadPerStitch = (2 * 1.3) / 14 = 0.1857
    // rawSkeins = (1000 * 0.1857 * 1.2) / 255 = 0.874
    // ceil = 1
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
    // effectiveCount = 14/2 = 7
    // threadPerStitch = (2 * 1.3) / 7 = 0.3714
    // rawSkeins = (1000 * 0.3714 * 1.2) / 255 = 1.747
    // ceil = 2
    const result = calculateSkeins({
      stitchCount: 1000,
      strandCount: 2,
      fabricCount: 14,
      overCount: 2,
      wastePercent: 20,
    });
    expect(result).toBe(2);
  });

  it("calculates ~18 skeins for 10000 stitches on 14ct over 2 with 2 strands, 20% waste", () => {
    // effectiveCount = 14/2 = 7
    // threadPerStitch = (2 * 1.3) / 7 = 0.3714
    // rawSkeins = (10000 * 0.3714 * 1.2) / 255 = 17.47
    // ceil = 18
    const result = calculateSkeins({
      stitchCount: 10000,
      strandCount: 2,
      fabricCount: 14,
      overCount: 2,
      wastePercent: 20,
    });
    expect(result).toBe(18);
  });

  it("calculates ~9 skeins for 10000 stitches on 14ct over 1 with 2 strands, 20% waste", () => {
    // effectiveCount = 14/1 = 14
    // threadPerStitch = (2 * 1.3) / 14 = 0.1857
    // rawSkeins = (10000 * 0.1857 * 1.2) / 255 = 8.74
    // ceil = 9
    const result = calculateSkeins({
      stitchCount: 10000,
      strandCount: 2,
      fabricCount: 14,
      overCount: 1,
      wastePercent: 20,
    });
    expect(result).toBe(9);
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

  it("over 2 uses exactly twice the thread per stitch as over 1", () => {
    // With over 2, effectiveCount halves, so thread per stitch doubles
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
    // over 2 raw value is exactly 2x over 1, but ceiling may differ slightly
    // over 1 raw = 10000 * 2.6/14 / 255 = 7.28 -> 8
    // over 2 raw = 10000 * 2.6/7 / 255 = 14.56 -> 15
    expect(over1).toBe(8);
    expect(over2).toBe(15);
  });
});
