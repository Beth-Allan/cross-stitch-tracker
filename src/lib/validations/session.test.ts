import { describe, expect, it } from "vitest";
import { sessionFormSchema } from "./session";

describe("sessionFormSchema", () => {
  const validInput = {
    projectId: "proj-1",
    date: "2026-04-10",
    stitchCount: 100,
    timeSpentMinutes: 60,
    photoKey: "sessions/proj-1/abc123.jpg",
  };

  it("parses valid session with all fields", () => {
    const result = sessionFormSchema.parse(validInput);
    expect(result).toEqual(validInput);
  });

  it("parses valid session with optional fields null", () => {
    const result = sessionFormSchema.parse({
      projectId: "proj-1",
      date: "2026-04-10",
      stitchCount: 100,
      timeSpentMinutes: null,
      photoKey: null,
    });
    expect(result.timeSpentMinutes).toBeNull();
    expect(result.photoKey).toBeNull();
  });

  it("rejects empty projectId", () => {
    expect(() => sessionFormSchema.parse({ ...validInput, projectId: "" })).toThrow(
      "Project is required",
    );
  });

  it("rejects stitchCount of 0", () => {
    expect(() => sessionFormSchema.parse({ ...validInput, stitchCount: 0 })).toThrow(
      "Stitch count must be at least 1",
    );
  });

  it("rejects negative stitchCount", () => {
    expect(() => sessionFormSchema.parse({ ...validInput, stitchCount: -5 })).toThrow(
      "Stitch count must be at least 1",
    );
  });

  it("rejects non-integer stitchCount", () => {
    expect(() => sessionFormSchema.parse({ ...validInput, stitchCount: 1.5 })).toThrow(
      "Stitch count must be a whole number",
    );
  });

  it("rejects invalid date string", () => {
    expect(() => sessionFormSchema.parse({ ...validInput, date: "not-a-date" })).toThrow(
      "Invalid date",
    );
  });

  it("rejects negative timeSpentMinutes", () => {
    expect(() => sessionFormSchema.parse({ ...validInput, timeSpentMinutes: -1 })).toThrow(
      "Time cannot be negative",
    );
  });

  it("defaults timeSpentMinutes to null when omitted", () => {
    const { timeSpentMinutes: _, ...withoutTime } = validInput;
    const result = sessionFormSchema.parse(withoutTime);
    expect(result.timeSpentMinutes).toBeNull();
  });

  it("defaults photoKey to null when omitted", () => {
    const { photoKey: _, ...withoutPhoto } = validInput;
    const result = sessionFormSchema.parse(withoutPhoto);
    expect(result.photoKey).toBeNull();
  });
});
