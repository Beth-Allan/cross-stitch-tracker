import { describe, it, expect } from "vitest";
import { calculateProgressPercent } from "./progress";

describe("calculateProgressPercent", () => {
  it("returns the rounded percentage of stitches completed", () => {
    expect(calculateProgressPercent(5000, 20000)).toBe(25);
    expect(calculateProgressPercent(1, 3)).toBe(33);
  });

  it("returns 0 when the total is zero", () => {
    expect(calculateProgressPercent(500, 0)).toBe(0);
  });

  it("returns 0 when the total is negative or missing", () => {
    expect(calculateProgressPercent(500, -1)).toBe(0);
  });

  it("returns 100 when the project is exactly finished", () => {
    expect(calculateProgressPercent(20000, 20000)).toBe(100);
  });

  it("clamps an over-logged project to 100 rather than reporting 137", () => {
    expect(calculateProgressPercent(27400, 20000)).toBe(100);
  });

  it("clamps a negative completed count to 0", () => {
    expect(calculateProgressPercent(-500, 20000)).toBe(0);
  });

  it("rounds to the nearest whole percent", () => {
    expect(calculateProgressPercent(19999, 20000)).toBe(100);
    expect(calculateProgressPercent(19000, 20000)).toBe(95);
  });
});
