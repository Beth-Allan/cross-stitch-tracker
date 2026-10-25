import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  optionalDateString,
  optionalChoice,
  optionalText,
  optionalUrl,
  wholeNumber,
} from "./fields";

describe("optionalText", () => {
  const schema = z.object({ notes: optionalText(20, "Notes too long") });

  it("trims surrounding whitespace", () => {
    expect(schema.parse({ notes: "  hello  " }).notes).toBe("hello");
  });

  it("turns a whitespace-only value into null", () => {
    expect(schema.parse({ notes: "   " }).notes).toBeNull();
  });

  it("turns an empty string into null", () => {
    expect(schema.parse({ notes: "" }).notes).toBeNull();
  });

  it("keeps an explicit null", () => {
    expect(schema.parse({ notes: null }).notes).toBeNull();
  });

  it("defaults to null when the field is absent", () => {
    expect(schema.parse({}).notes).toBeNull();
  });

  it("measures the length limit against the trimmed value", () => {
    expect(schema.parse({ notes: `${"a".repeat(20)}     ` }).notes).toBe("a".repeat(20));
    expect(() => schema.parse({ notes: "a".repeat(21) })).toThrow("Notes too long");
  });
});

describe("optionalUrl", () => {
  const schema = z.object({ website: optionalUrl() });

  it("trims surrounding whitespace", () => {
    expect(schema.parse({ website: "  https://example.com  " }).website).toBe(
      "https://example.com",
    );
  });

  it("turns a whitespace-only value into null instead of failing the URL rule", () => {
    expect(schema.parse({ website: "   " }).website).toBeNull();
  });

  it("defaults to null when the field is absent", () => {
    expect(schema.parse({}).website).toBeNull();
  });

  it("still rejects a value that is not a URL", () => {
    expect(() => schema.parse({ website: "not a url" })).toThrow("Must be a valid URL");
  });

  it("uses a caller-supplied message", () => {
    const custom = z.object({ website: optionalUrl("Website must be a link") });
    expect(() => custom.parse({ website: "nope" })).toThrow("Website must be a link");
  });
});

describe("optionalChoice", () => {
  const schema = z.object({ designerId: optionalChoice() });

  it("turns an empty selection into null rather than an empty id", () => {
    expect(schema.parse({ designerId: "" }).designerId).toBeNull();
    expect(schema.parse({ designerId: "   " }).designerId).toBeNull();
  });

  it("trims a real id", () => {
    expect(schema.parse({ designerId: " abc123 " }).designerId).toBe("abc123");
  });

  it("defaults to null when the field is absent", () => {
    expect(schema.parse({}).designerId).toBeNull();
  });
});

describe("optionalDateString", () => {
  const schema = z.object({ startDate: optionalDateString() });

  it("accepts a calendar date string", () => {
    expect(schema.parse({ startDate: "2026-08-19" }).startDate).toBe("2026-08-19");
  });

  it("accepts null and defaults to null", () => {
    expect(schema.parse({ startDate: null }).startDate).toBeNull();
    expect(schema.parse({}).startDate).toBeNull();
  });

  it("rejects an unparseable date", () => {
    expect(() => schema.parse({ startDate: "not-a-date" })).toThrow("Invalid date");
  });
});

describe("wholeNumber", () => {
  const schema = wholeNumber();

  it("accepts a whole number", () => {
    expect(schema.parse(12)).toBe(12);
  });

  it("keeps Zod 3's wording for a fraction, which a number box can send", () => {
    expect(schema.safeParse(2.5).error?.issues[0].message).toBe("Expected integer, received float");
  });

  it("refuses a number too large to hold exactly without calling it a fraction", () => {
    const result = schema.safeParse(1e20);

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).not.toBe("Expected integer, received float");
  });
});
