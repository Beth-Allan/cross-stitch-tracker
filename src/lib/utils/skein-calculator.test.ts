import { describe, it, expect } from "vitest";
import { calculateSkeins } from "./skein-calculator";

describe("calculateSkeins", () => {
  it("calculates correct skeins for 1000 stitches, 14ct, 2 strands, over 2, 20% waste", () => {
    // effectiveCount = 14/2 = 7
    // threadPerStitch = (2 * 6) / 7 = 1.714 inches
    // wasteFactor = 1.2
    // rawSkeins = (1000 * 1.714 * 1.2) / 255 = 2057.14 / 255 = 8.067
    // ceil(8.067) = 9
    const result = calculateSkeins({
      stitchCount: 1000,
      strandCount: 2,
      fabricCount: 14,
      overCount: 2,
      wastePercent: 20,
    });
    expect(result).toBe(9);
  });

  it("calculates correct skeins for 10000 stitches, 14ct, 2 strands, over 2, 20% waste", () => {
    // effectiveCount = 14/2 = 7
    // threadPerStitch = (2 * 6) / 7 = 1.714
    // rawSkeins = (10000 * 1.714 * 1.2) / 255 = 20571.4 / 255 = 80.67
    // ceil(80.67) = 81
    const result = calculateSkeins({
      stitchCount: 10000,
      strandCount: 2,
      fabricCount: 14,
      overCount: 2,
      wastePercent: 20,
    });
    expect(result).toBe(81);
  });

  it("calculates correct skeins for 10000 stitches with over 1 (uses less thread)", () => {
    // effectiveCount = 14/1 = 14
    // threadPerStitch = (2 * 6) / 14 = 0.857
    // rawSkeins = (10000 * 0.857 * 1.2) / 255 = 10285.7 / 255 = 40.34
    // ceil(40.34) = 41
    const result = calculateSkeins({
      stitchCount: 10000,
      strandCount: 2,
      fabricCount: 14,
      overCount: 1,
      wastePercent: 20,
    });
    expect(result).toBe(41);
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

  it("handles typical 14ct Aida over 1 correctly", () => {
    // 14ct Aida is typically stitched over 1
    // effectiveCount = 14/1 = 14
    // threadPerStitch = (2 * 6) / 14 = 0.857
    // rawSkeins = (1000 * 0.857 * 1.2) / 255 = 1028.57 / 255 = 4.03
    // ceil(4.03) = 5
    const result = calculateSkeins({
      stitchCount: 1000,
      strandCount: 2,
      fabricCount: 14,
      overCount: 1,
      wastePercent: 20,
    });
    expect(result).toBe(5);
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
    // over 1 raw = 10000 * 12/14 / 255 = 33.61 -> 34
    // over 2 raw = 10000 * 12/7 / 255 = 67.23 -> 68
    expect(over2).toBe(68);
    expect(over1).toBe(34);
  });
});
