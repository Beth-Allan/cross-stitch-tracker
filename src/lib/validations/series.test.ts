import { describe, it, expect } from "vitest";
import { seriesSchema } from "./series";

describe("seriesSchema", () => {
  it("parses valid input with all fields", () => {
    const result = seriesSchema.parse({
      name: "Frosted Pumpkins",
      totalCount: 12,
      designerId: "d1",
      notes: "Monthly",
    });

    expect(result.name).toBe("Frosted Pumpkins");
    expect(result.totalCount).toBe(12);
    expect(result.designerId).toBe("d1");
    expect(result.notes).toBe("Monthly");
  });

  it("rejects empty name after trim", () => {
    expect(() => seriesSchema.parse({ name: "   " })).toThrow("Series name is required");
  });

  it("rejects totalCount of 0", () => {
    expect(() => seriesSchema.parse({ name: "Test", totalCount: 0 })).toThrow(
      "Total count must be at least 1",
    );
  });

  it("accepts null totalCount, null designerId, null notes", () => {
    const result = seriesSchema.parse({
      name: "Test",
      totalCount: null,
      designerId: null,
      notes: null,
    });

    expect(result.totalCount).toBeNull();
    expect(result.designerId).toBeNull();
    expect(result.notes).toBeNull();
  });

  it("rejects name longer than 200 chars", () => {
    const longName = "a".repeat(201);
    expect(() => seriesSchema.parse({ name: longName })).toThrow("Series name too long");
  });

  it("rejects notes longer than 5000 chars", () => {
    const longNotes = "a".repeat(5001);
    expect(() => seriesSchema.parse({ name: "Test", notes: longNotes })).toThrow("Notes too long");
  });

  it("stores blank notes and a cleared designer selection as absent", () => {
    const result = seriesSchema.parse({ name: "Test", designerId: "", notes: "   " });

    expect(result.designerId).toBeNull();
    expect(result.notes).toBeNull();
  });
});
