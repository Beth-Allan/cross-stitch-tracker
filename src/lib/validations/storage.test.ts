import { describe, expect, it } from "vitest";
import { storageLocationSchema, stitchingAppSchema } from "./storage";

describe("storageLocationSchema", () => {
  it("parses valid input and trims whitespace", () => {
    const result = storageLocationSchema.parse({ name: " Bin A " });
    expect(result).toEqual({ name: "Bin A", description: null });
  });

  it("rejects empty string name after trim", () => {
    expect(() => storageLocationSchema.parse({ name: "   " })).toThrow("Name is required");
  });

  it("accepts optional description field", () => {
    const result = storageLocationSchema.parse({
      name: "Shelf B",
      description: "Top shelf in office",
    });
    expect(result).toEqual({ name: "Shelf B", description: "Top shelf in office" });
  });

  it("rejects name over 200 chars", () => {
    const longName = "A".repeat(201);
    expect(() => storageLocationSchema.parse({ name: longName })).toThrow("Name too long");
  });

  it("rejects description over 500 chars", () => {
    const longDesc = "A".repeat(501);
    expect(() => storageLocationSchema.parse({ name: "Valid", description: longDesc })).toThrow();
  });

  it("defaults description to null when not provided", () => {
    const result = storageLocationSchema.parse({ name: "Test" });
    expect(result.description).toBeNull();
  });
});

describe("stitchingAppSchema", () => {
  it("parses valid input and trims whitespace", () => {
    const result = stitchingAppSchema.parse({ name: " Markup R-XP " });
    expect(result).toEqual({ name: "Markup R-XP", description: null });
  });

  it("rejects empty string name after trim", () => {
    expect(() => stitchingAppSchema.parse({ name: "" })).toThrow("Name is required");
  });

  it("rejects name over 200 chars", () => {
    const longName = "B".repeat(201);
    expect(() => stitchingAppSchema.parse({ name: longName })).toThrow("Name too long");
  });

  it("accepts optional description field", () => {
    const result = stitchingAppSchema.parse({
      name: "Saga",
      description: "iOS app for pattern tracking",
    });
    expect(result).toEqual({ name: "Saga", description: "iOS app for pattern tracking" });
  });

  it("defaults description to null when not provided", () => {
    const result = stitchingAppSchema.parse({ name: "Test App" });
    expect(result.description).toBeNull();
  });
});
