import { describe, expect, it } from "vitest";
import { calculateSizeCategory, getEffectiveStitchCount, SIZE_COLORS } from "./size-category";

describe("calculateSizeCategory", () => {
  it("returns Mini for 0 stitches", () => expect(calculateSizeCategory(0)).toBe("Mini"));
  it("returns Mini for 999 stitches", () => expect(calculateSizeCategory(999)).toBe("Mini"));
  it("returns Small at 1000 boundary", () => expect(calculateSizeCategory(1000)).toBe("Small"));
  it("returns Small for 4999", () => expect(calculateSizeCategory(4999)).toBe("Small"));
  it("returns Medium at 5000 boundary", () => expect(calculateSizeCategory(5000)).toBe("Medium"));
  it("returns Medium for 24999", () => expect(calculateSizeCategory(24999)).toBe("Medium"));
  it("returns Large at 25000 boundary", () => expect(calculateSizeCategory(25000)).toBe("Large"));
  it("returns Large for 49999", () => expect(calculateSizeCategory(49999)).toBe("Large"));
  it("returns BAP at 50000 boundary", () => expect(calculateSizeCategory(50000)).toBe("BAP"));
  it("returns BAP for very large counts", () => expect(calculateSizeCategory(500000)).toBe("BAP"));
});

describe("getEffectiveStitchCount", () => {
  it("uses explicit count when > 0", () => {
    expect(getEffectiveStitchCount(10000, 100, 200)).toEqual({
      count: 10000,
      approximate: false,
    });
  });
  it("calculates from dimensions when count is 0", () => {
    expect(getEffectiveStitchCount(0, 100, 200)).toEqual({
      count: 20000,
      approximate: true,
    });
  });
  it("returns 0 when no count and no dimensions", () => {
    expect(getEffectiveStitchCount(0, 0, 0)).toEqual({
      count: 0,
      approximate: false,
    });
  });
  it("ignores dimensions when only width provided", () => {
    expect(getEffectiveStitchCount(0, 100, 0)).toEqual({
      count: 0,
      approximate: false,
    });
  });
});

describe("SIZE_COLORS", () => {
  it("uses -50 shade background for Mini", () => {
    expect(SIZE_COLORS.Mini.bg).toContain("bg-blue-50");
    expect(SIZE_COLORS.Mini.bg).not.toContain("bg-blue-100");
  });

  it("uses -50 shade background for Small", () => {
    expect(SIZE_COLORS.Small.bg).toContain("bg-green-50");
    expect(SIZE_COLORS.Small.bg).not.toContain("bg-green-100");
  });

  it("uses -50 shade background for Medium", () => {
    expect(SIZE_COLORS.Medium.bg).toContain("bg-amber-50");
    expect(SIZE_COLORS.Medium.bg).not.toContain("bg-amber-100");
  });

  it("uses -50 shade background for Large", () => {
    expect(SIZE_COLORS.Large.bg).toContain("bg-orange-50");
    expect(SIZE_COLORS.Large.bg).not.toContain("bg-orange-100");
  });

  it("uses -50 shade background for BAP", () => {
    expect(SIZE_COLORS.BAP.bg).toContain("bg-red-50");
    expect(SIZE_COLORS.BAP.bg).not.toContain("bg-red-100");
  });
});
