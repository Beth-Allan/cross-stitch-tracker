import { describe, it, expect } from "vitest";
import { settled } from "./settled";

describe("settled", () => {
  it("returns value for fulfilled result", () => {
    const result: PromiseSettledResult<number> = { status: "fulfilled", value: 42 };
    expect(settled(result)).toBe(42);
  });

  it("returns null for rejected result", () => {
    const result: PromiseSettledResult<number> = { status: "rejected", reason: new Error("fail") };
    expect(settled(result)).toBeNull();
  });

  it("preserves complex types", () => {
    const data = { id: "1", name: "test", count: 5 };
    const result: PromiseSettledResult<typeof data> = { status: "fulfilled", value: data };
    const extracted = settled(result);
    expect(extracted).toEqual(data);
  });
});
