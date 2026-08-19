import { describe, it, expect } from "vitest";
import { isStrandCount } from "./supply";
import type { StrandCount } from "./supply";

describe("StrandCount type guard", () => {
  describe("valid values", () => {
    it.each([1, 2, 3, 4, 5, 6])("returns true for %d", (value) => {
      expect(isStrandCount(value)).toBe(true);
    });
  });

  describe("invalid values", () => {
    it.each([0, 7, -1, 1.5, NaN])("returns false for %s", (value) => {
      expect(isStrandCount(value)).toBe(false);
    });

    it("returns false for Infinity", () => {
      expect(isStrandCount(Infinity)).toBe(false);
    });
  });

  it("narrows type after guard check", () => {
    expect.assertions(1);
    const value: number = 3;
    if (isStrandCount(value)) {
      // TypeScript should narrow to StrandCount here
      const narrowed: StrandCount = value;
      expect(narrowed).toBe(3);
    }
  });
});
