import { describe, it, expect, vi } from "vitest";
import { settled } from "./settled";

describe("settled", () => {
  it("returns value for fulfilled result", () => {
    const result: PromiseSettledResult<number> = { status: "fulfilled", value: 42 };
    expect(settled(result)).toBe(42);
  });

  it("returns null for rejected result", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const result: PromiseSettledResult<number> = { status: "rejected", reason: new Error("fail") };
    expect(settled(result)).toBeNull();
    spy.mockRestore();
  });

  it("preserves complex types", () => {
    const data = { id: "1", name: "test", count: 5 };
    const result: PromiseSettledResult<typeof data> = { status: "fulfilled", value: data };
    const extracted = settled(result);
    expect(extracted).toEqual(data);
  });

  it("logs rejection reason with label when provided", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const result: PromiseSettledResult<number> = {
      status: "rejected",
      reason: new Error("connection timeout"),
    };

    settled(result, "heroStats");

    expect(spy).toHaveBeenCalledWith("[stats] heroStats failed:", "connection timeout");
    spy.mockRestore();
  });

  it("logs rejection reason with default label when no label provided", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const result: PromiseSettledResult<number> = {
      status: "rejected",
      reason: new Error("db error"),
    };

    settled(result);

    expect(spy).toHaveBeenCalledWith("[stats] query failed:", "db error");
    spy.mockRestore();
  });

  it("logs under a caller-supplied scope so non-stats pages do not report as stats", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const result: PromiseSettledResult<number> = {
      status: "rejected",
      reason: new Error("db error"),
    };

    settled(result, "seriesData", "pattern-dive");

    expect(spy).toHaveBeenCalledWith("[pattern-dive] seriesData failed:", "db error");
    spy.mockRestore();
  });

  it("handles non-Error rejection reasons", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const result: PromiseSettledResult<number> = {
      status: "rejected",
      reason: "string error",
    };

    settled(result, "testQuery");

    expect(spy).toHaveBeenCalledWith("[stats] testQuery failed:", "string error");
    spy.mockRestore();
  });

  it("rethrows a dynamic-server bailout instead of logging it as a page failure", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const bailout = Object.assign(
      new Error("Dynamic server usage: Route /sessions couldn't be rendered statically"),
      { digest: "DYNAMIC_SERVER_USAGE" },
    );
    const result: PromiseSettledResult<number> = { status: "rejected", reason: bailout };

    expect(() => settled(result, "allSessions", "sessions")).toThrow(bailout);
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it("still logs a rejection whose digest is not the bailout code", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const reason = Object.assign(new Error("boom"), { digest: "SOMETHING_ELSE" });
    const result: PromiseSettledResult<number> = { status: "rejected", reason };

    expect(settled(result, "allSessions", "sessions")).toBeNull();
    expect(spy).toHaveBeenCalledWith("[sessions] allSessions failed:", "boom");
    spy.mockRestore();
  });

  it("does not log for fulfilled results", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const result: PromiseSettledResult<number> = { status: "fulfilled", value: 42 };

    settled(result, "heroStats");

    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
