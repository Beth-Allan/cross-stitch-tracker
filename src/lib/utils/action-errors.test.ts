import { describe, expect, it } from "vitest";
import { z } from "zod";
import { firstValidationMessage, isDuplicateKeyError } from "./action-errors";

describe("firstValidationMessage", () => {
  it("returns the first issue's message", () => {
    const schema = z.object({ name: z.string().min(1, "Name is required") });
    const result = schema.safeParse({ name: "" });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(firstValidationMessage(result.error)).toBe("Name is required");
  });

  it("returns the first message when several fields fail", () => {
    const schema = z.object({
      name: z.string().min(1, "Name is required"),
      count: z.number().min(1, "Count is required"),
    });
    const result = schema.safeParse({ name: "", count: 0 });

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(firstValidationMessage(result.error)).toBe("Name is required");
  });
});

describe("isDuplicateKeyError", () => {
  it("recognises a Prisma unique-constraint error", () => {
    expect(isDuplicateKeyError({ code: "P2002" })).toBe(true);
  });

  it("rejects any other Prisma error code", () => {
    expect(isDuplicateKeyError({ code: "P2025" })).toBe(false);
  });

  it("rejects values that carry no code at all", () => {
    expect(isDuplicateKeyError(new Error("boom"))).toBe(false);
    expect(isDuplicateKeyError(null)).toBe(false);
    expect(isDuplicateKeyError(undefined)).toBe(false);
    expect(isDuplicateKeyError("P2002")).toBe(false);
  });

  it("rejects a non-string code that happens to match loosely", () => {
    expect(isDuplicateKeyError({ code: 2002 })).toBe(false);
  });
});
