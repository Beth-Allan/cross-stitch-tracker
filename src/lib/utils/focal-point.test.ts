import { describe, expect, it } from "vitest";
import { getObjectPositionStyle } from "./focal-point";

describe("getObjectPositionStyle", () => {
  it("converts 0.3, 0.7 to '30% 70%'", () => {
    expect(getObjectPositionStyle(0.3, 0.7)).toEqual({
      objectPosition: "30% 70%",
    });
  });

  it("converts 0, 0 to '0% 0%'", () => {
    expect(getObjectPositionStyle(0, 0)).toEqual({
      objectPosition: "0% 0%",
    });
  });

  it("converts 1, 1 to '100% 100%'", () => {
    expect(getObjectPositionStyle(1, 1)).toEqual({
      objectPosition: "100% 100%",
    });
  });

  it("converts 0.5, 0.5 to '50% 50%'", () => {
    expect(getObjectPositionStyle(0.5, 0.5)).toEqual({
      objectPosition: "50% 50%",
    });
  });

  it("returns undefined when both are null", () => {
    expect(getObjectPositionStyle(null, null)).toBeUndefined();
  });

  it("returns undefined when x is null and y is a number", () => {
    expect(getObjectPositionStyle(null, 0.5)).toBeUndefined();
  });

  it("returns undefined when x is a number and y is null", () => {
    expect(getObjectPositionStyle(0.5, null)).toBeUndefined();
  });

  it("returns undefined when both are undefined", () => {
    expect(getObjectPositionStyle(undefined, undefined)).toBeUndefined();
  });
});
