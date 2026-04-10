import { describe, it, expect } from "vitest";
import { calculateRequiredFabricSize, doesFabricFit } from "./fabric-calculator";

describe("calculateRequiredFabricSize", () => {
  it("calculates required size for 100x150 on 14ct", () => {
    const result = calculateRequiredFabricSize(100, 150, 14);
    // (100/14) + 6 = 13.14, (150/14) + 6 = 16.71
    expect(result.requiredWidthInches).toBeCloseTo(13.14, 2);
    expect(result.requiredHeightInches).toBeCloseTo(16.71, 2);
  });

  it("calculates required size for 200x300 on 18ct", () => {
    const result = calculateRequiredFabricSize(200, 300, 18);
    // (200/18) + 6 = 17.11, (300/18) + 6 = 22.67
    expect(result.requiredWidthInches).toBeCloseTo(17.11, 2);
    expect(result.requiredHeightInches).toBeCloseTo(22.67, 2);
  });

  it("includes 3-inch margin on each side (6 inches total)", () => {
    // 140 stitches on 14ct = exactly 10 inches + 6 = 16
    const result = calculateRequiredFabricSize(140, 140, 14);
    expect(result.requiredWidthInches).toBe(16);
    expect(result.requiredHeightInches).toBe(16);
  });
});

describe("doesFabricFit", () => {
  it("returns true when fabric is larger than required", () => {
    const result = doesFabricFit(
      { shortestEdgeInches: 14, longestEdgeInches: 18 },
      { requiredWidthInches: 13.14, requiredHeightInches: 16.71 },
    );
    expect(result).toBe(true);
  });

  it("returns false when fabric is smaller than required", () => {
    const result = doesFabricFit(
      { shortestEdgeInches: 10, longestEdgeInches: 12 },
      { requiredWidthInches: 13.14, requiredHeightInches: 16.71 },
    );
    expect(result).toBe(false);
  });

  it("checks both orientations - rotated fabric can fit", () => {
    // Fabric: 17 x 14, Required: 14 x 17
    // Normal: 14 >= 14 AND 17 >= 17 -> true (rotated check also works)
    const result = doesFabricFit(
      { shortestEdgeInches: 14, longestEdgeInches: 17 },
      { requiredWidthInches: 14, requiredHeightInches: 17 },
    );
    expect(result).toBe(true);
  });

  it("returns true with exact dimensions", () => {
    const result = doesFabricFit(
      { shortestEdgeInches: 13.14, longestEdgeInches: 16.71 },
      { requiredWidthInches: 13.14, requiredHeightInches: 16.71 },
    );
    expect(result).toBe(true);
  });

  it("returns true when fabric fits only in rotated orientation", () => {
    // Fabric shortest=17, longest=14 means physical dims are 14x17
    // Required: width=14, height=17
    // Normal: shortest(17) >= width(14) AND longest(14) >= height(17) -> false (14 < 17)
    // Rotated: longest(14) >= width(14) AND shortest(17) >= height(17) -> true
    // Wait - shortest is always <= longest. Let me reconsider.
    // Fabric: shortest=13, longest=18. Required: width=17, height=12
    // Normal: 13 >= 17? No. Rotated: 18 >= 17 AND 13 >= 12? Yes.
    const result = doesFabricFit(
      { shortestEdgeInches: 13, longestEdgeInches: 18 },
      { requiredWidthInches: 17, requiredHeightInches: 12 },
    );
    expect(result).toBe(true);
  });

  it("returns false when neither orientation fits", () => {
    const result = doesFabricFit(
      { shortestEdgeInches: 10, longestEdgeInches: 15 },
      { requiredWidthInches: 17, requiredHeightInches: 12 },
    );
    expect(result).toBe(false);
  });
});
