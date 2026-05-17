import { describe, expect, it } from "vitest";
import { collectionStatusConfig } from "./chart-configs";
import type { ChartConfig } from "@/components/ui/chart";

const EXPECTED_STATUS_KEYS = [
  "UNSTARTED",
  "KITTING",
  "KITTED",
  "IN_PROGRESS",
  "ON_HOLD",
  "FINISHED",
  "FFO",
] as const;

describe("collectionStatusConfig", () => {
  it("has exactly 7 keys matching ProjectStatus enum values", () => {
    const keys = Object.keys(collectionStatusConfig);
    expect(keys).toHaveLength(7);
    expect(keys.sort()).toEqual([...EXPECTED_STATUS_KEYS].sort());
  });

  it("every value has a non-empty label and a color starting with var(--status-", () => {
    for (const key of EXPECTED_STATUS_KEYS) {
      const entry = collectionStatusConfig[key];
      expect(entry.label).toBeDefined();
      expect(typeof entry.label).toBe("string");
      expect((entry.label as string).length).toBeGreaterThan(0);
      expect(entry.color).toBeDefined();
      expect(entry.color).toMatch(/^var\(--status-/);
    }
  });

  it("satisfies ChartConfig type", () => {
    // TypeScript compile-time check via assignment
    const _config: ChartConfig = collectionStatusConfig;
    expect(_config).toBeDefined();
  });
});
