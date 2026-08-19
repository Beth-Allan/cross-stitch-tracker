import { describe, it, expect } from "vitest";
import {
  FABRIC_MARGIN_INCHES,
  calculateEffectiveCount,
  calculateRequiredFabricEdge,
  calculateRequiredFabricSize,
  classifyFabricFit,
  doesFabricFit,
  formatRequiredInches,
} from "./fabric-calculator";

describe("calculateRequiredFabricSize", () => {
  it("calculates required size for 100x150 on 14ct", () => {
    const result = calculateRequiredFabricSize(100, 150, 14, 1);
    // (100/14) + 6 = 13.14, (150/14) + 6 = 16.71
    expect(result.requiredWidthInches).toBeCloseTo(13.14, 2);
    expect(result.requiredHeightInches).toBeCloseTo(16.71, 2);
  });

  it("calculates required size for 200x300 on 18ct", () => {
    const result = calculateRequiredFabricSize(200, 300, 18, 1);
    // (200/18) + 6 = 17.11, (300/18) + 6 = 22.67
    expect(result.requiredWidthInches).toBeCloseTo(17.11, 2);
    expect(result.requiredHeightInches).toBeCloseTo(22.67, 2);
  });

  it("includes 3-inch margin on each side (6 inches total)", () => {
    // 140 stitches on 14ct = exactly 10 inches + 6 = 16
    const result = calculateRequiredFabricSize(140, 140, 14, 1);
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
    // Unrotated the 13" edge is short of the 17" width; turned, 18 >= 17 and 13 >= 12.
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

describe("rounding contract", () => {
  it("returns the exact requirement, unrounded", () => {
    const result = calculateRequiredFabricSize(289, 100, 14, 1);
    expect(result.requiredWidthInches).toBe(26.642857142857142);
    expect(result.requiredHeightInches).toBe(13.142857142857142);
  });

  it("calculateRequiredFabricEdge returns the exact requirement for one dimension", () => {
    expect(calculateRequiredFabricEdge(289, 14, 1)).toBe(26.642857142857142);
  });

  it("rejects a fabric that is short of the exact requirement by less than a tenth of an inch", () => {
    const required = calculateRequiredFabricSize(289, 289, 14, 1);
    const result = doesFabricFit({ shortestEdgeInches: 26.6, longestEdgeInches: 26.6 }, required);
    expect(result).toBe(false);
  });
});

describe("formatRequiredInches", () => {
  it("rounds a requirement up, never down, so the displayed number is never short", () => {
    // 289/14 + 6 = 26.642857…" — a 26.6" piece is rejected by doesFabricFit, so 26.6 must not
    // be the number Beth is told to buy.
    expect(formatRequiredInches(26.642857142857142)).toBe("26.7");
    expect(formatRequiredInches(13.142857142857142)).toBe("13.2");
  });

  it("leaves an exact tenth alone", () => {
    expect(formatRequiredInches(16)).toBe("16.0");
    expect(formatRequiredInches(20.3)).toBe("20.3");
  });
});

describe("over-count", () => {
  it("divides the fabric count by the project's over-count", () => {
    // FAB-004: 28ct worked over two behaves like 14ct, so it needs the 14ct size.
    expect(calculateRequiredFabricEdge(200, 28, 2)).toBe(calculateRequiredFabricEdge(200, 14, 1));
  });

  it("adds the margin after the effective count divides, never before", () => {
    // 280 stitches at 28ct over two = 280 / 14 = 20" of design, then + 6" of margin.
    expect(calculateRequiredFabricEdge(280, 28, 2)).toBe(26);
  });

  it("doubles the design inches for an over-two project, leaving the margin alone", () => {
    const overOne = calculateRequiredFabricSize(200, 300, 28, 1);
    const overTwo = calculateRequiredFabricSize(200, 300, 28, 2);

    expect(overTwo.requiredWidthInches - FABRIC_MARGIN_INCHES).toBeCloseTo(
      (overOne.requiredWidthInches - FABRIC_MARGIN_INCHES) * 2,
      10,
    );
    expect(overTwo.requiredHeightInches - FABRIC_MARGIN_INCHES).toBeCloseTo(
      (overOne.requiredHeightInches - FABRIC_MARGIN_INCHES) * 2,
      10,
    );
  });

  it("leaves an over-one project's size exactly as it was", () => {
    const result = calculateRequiredFabricSize(100, 150, 14, 1);
    expect(result.requiredWidthInches).toBe(13.142857142857142);
    expect(result.requiredHeightInches).toBe(16.714285714285715);
  });

  it("rejects a piece that would have fitted had the project been stitched over one", () => {
    const piece = { shortestEdgeInches: 14, longestEdgeInches: 18 };
    expect(doesFabricFit(piece, calculateRequiredFabricSize(200, 300, 28, 1))).toBe(true);
    expect(doesFabricFit(piece, calculateRequiredFabricSize(200, 300, 28, 2))).toBe(false);
  });
});

describe("calculateEffectiveCount", () => {
  it("returns the fabric count itself when the project is stitched over one", () => {
    expect(calculateEffectiveCount(28, 1)).toBe(28);
  });

  it("halves the fabric count when the project is stitched over two", () => {
    expect(calculateEffectiveCount(28, 2)).toBe(14);
  });
});

describe("classifyFabricFit", () => {
  it("says a piece fits when it covers the requirement at the project's over-count", () => {
    expect(
      classifyFabricFit({ shortestEdgeInches: 30, longestEdgeInches: 40 }, 200, 300, 28, 2),
    ).toBe("fits");
  });

  it("says a piece fits only at over one when it covers the over-one requirement but not the project's", () => {
    // FAB-007: 14x18 covers 200x300 at 28ct over one, but not the doubled over-two requirement.
    expect(
      classifyFabricFit({ shortestEdgeInches: 14, longestEdgeInches: 18 }, 200, 300, 28, 2),
    ).toBe("fits-over-one-only");
  });

  it("says a piece is too small when it covers neither requirement", () => {
    expect(
      classifyFabricFit({ shortestEdgeInches: 6, longestEdgeInches: 8 }, 200, 300, 28, 2),
    ).toBe("too-small");
  });

  it("never reports the over-one qualifier for an over-one project — over one is already the smallest requirement", () => {
    expect(
      classifyFabricFit({ shortestEdgeInches: 6, longestEdgeInches: 8 }, 200, 300, 28, 1),
    ).toBe("too-small");
    expect(
      classifyFabricFit({ shortestEdgeInches: 14, longestEdgeInches: 18 }, 200, 300, 28, 1),
    ).toBe("fits");
  });

  it("honours the rotated orientation, exactly as doesFabricFit does", () => {
    // Required at 14ct over one: 17.1" x 12.1". The piece is 13x18, so only rotated fits.
    expect(
      classifyFabricFit({ shortestEdgeInches: 13, longestEdgeInches: 18 }, 156, 86, 14, 1),
    ).toBe("fits");
  });
});
