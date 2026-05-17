import { describe, expect, it } from "vitest";
import { updateFocalPointSchema } from "./focal-point";

describe("updateFocalPointSchema", () => {
  it("accepts valid coordinates", () => {
    const result = updateFocalPointSchema.safeParse({ chartId: "chart-1", x: 0.5, y: 0.7 });
    expect(result.success).toBe(true);
  });

  it("accepts boundary value 0", () => {
    const result = updateFocalPointSchema.safeParse({ chartId: "chart-1", x: 0, y: 0 });
    expect(result.success).toBe(true);
  });

  it("accepts boundary value 1", () => {
    const result = updateFocalPointSchema.safeParse({ chartId: "chart-1", x: 1, y: 1 });
    expect(result.success).toBe(true);
  });

  it("accepts both null (reset)", () => {
    const result = updateFocalPointSchema.safeParse({ chartId: "chart-1", x: null, y: null });
    expect(result.success).toBe(true);
  });

  it("rejects x=null when y is provided", () => {
    const result = updateFocalPointSchema.safeParse({ chartId: "chart-1", x: null, y: 0.5 });
    expect(result.success).toBe(false);
  });

  it("rejects y=null when x is provided", () => {
    const result = updateFocalPointSchema.safeParse({ chartId: "chart-1", x: 0.5, y: null });
    expect(result.success).toBe(false);
  });

  it("rejects x > 1", () => {
    const result = updateFocalPointSchema.safeParse({ chartId: "chart-1", x: 1.5, y: 0.5 });
    expect(result.success).toBe(false);
  });

  it("rejects x < 0", () => {
    const result = updateFocalPointSchema.safeParse({ chartId: "chart-1", x: -0.1, y: 0.5 });
    expect(result.success).toBe(false);
  });

  it("rejects y > 1", () => {
    const result = updateFocalPointSchema.safeParse({ chartId: "chart-1", x: 0.5, y: 2.0 });
    expect(result.success).toBe(false);
  });

  it("rejects y < 0", () => {
    const result = updateFocalPointSchema.safeParse({ chartId: "chart-1", x: 0.5, y: -0.5 });
    expect(result.success).toBe(false);
  });

  it("rejects empty chartId", () => {
    const result = updateFocalPointSchema.safeParse({ chartId: "", x: 0.5, y: 0.5 });
    expect(result.success).toBe(false);
  });

  it("rejects missing chartId", () => {
    const result = updateFocalPointSchema.safeParse({ x: 0.5, y: 0.5 });
    expect(result.success).toBe(false);
  });
});
