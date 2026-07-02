import { describe, expect, it } from "vitest";
import { mapFocalPoint } from "./focal-point";

describe("mapFocalPoint", () => {
  it("returns both-numbers variant when both inputs are numbers", () => {
    const result = mapFocalPoint(0.5, 0.3);
    expect(result).toEqual({ focalPointX: 0.5, focalPointY: 0.3 });
  });

  it("returns both-null variant when both inputs are null", () => {
    const result = mapFocalPoint(null, null);
    expect(result).toEqual({ focalPointX: null, focalPointY: null });
  });

  it("normalizes mismatched inputs (number, null) to both-null", () => {
    const result = mapFocalPoint(0.5, null);
    expect(result).toEqual({ focalPointX: null, focalPointY: null });
  });

  it("normalizes mismatched inputs (null, number) to both-null", () => {
    const result = mapFocalPoint(null, 0.3);
    expect(result).toEqual({ focalPointX: null, focalPointY: null });
  });

  it("treats undefined inputs as null (both-null variant)", () => {
    const result = mapFocalPoint(undefined, undefined);
    expect(result).toEqual({ focalPointX: null, focalPointY: null });
  });
});
