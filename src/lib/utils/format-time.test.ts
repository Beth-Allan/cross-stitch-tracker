import { describe, it, expect } from "vitest";
import { formatTime } from "./format-time";

describe("formatTime", () => {
  it("returns '0h' for 0 minutes", () => {
    expect(formatTime(0)).toBe("0h");
  });

  it("returns minutes only when under an hour", () => {
    expect(formatTime(30)).toBe("30m");
    expect(formatTime(1)).toBe("1m");
    expect(formatTime(59)).toBe("59m");
  });

  it("returns hours only when minutes are exactly divisible", () => {
    expect(formatTime(60)).toBe("1h");
    expect(formatTime(120)).toBe("2h");
    expect(formatTime(1440)).toBe("24h");
  });

  it("returns hours and minutes for mixed values", () => {
    expect(formatTime(90)).toBe("1h 30m");
    expect(formatTime(61)).toBe("1h 1m");
    expect(formatTime(150)).toBe("2h 30m");
  });
});
