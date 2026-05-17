import { describe, expect, it } from "vitest";
import {
  collectionStatusConfig,
  sizeCategoryConfig,
  designerBarConfig,
  genreDistributionConfig,
  monthlyBarConfig,
  dayOfWeekConfig,
} from "./chart-configs";
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

// ─── Size Category Config ─────────────────────────────────────────────────

const EXPECTED_SIZE_KEYS = ["Mini", "Small", "Medium", "Large", "BAP"] as const;

describe("sizeCategoryConfig", () => {
  it("has exactly 5 keys: Mini, Small, Medium, Large, BAP", () => {
    const keys = Object.keys(sizeCategoryConfig);
    expect(keys).toHaveLength(5);
    expect(keys).toEqual([...EXPECTED_SIZE_KEYS]);
  });

  it("values have labels matching key names and colors matching var(--chart-N) pattern", () => {
    EXPECTED_SIZE_KEYS.forEach((key, index) => {
      const entry = sizeCategoryConfig[key];
      expect(entry.label).toBe(key);
      expect(entry.color).toBe(`var(--chart-${index + 1})`);
    });
  });

  it("satisfies ChartConfig type", () => {
    const _config: ChartConfig = sizeCategoryConfig;
    expect(_config).toBeDefined();
  });
});

// ─── Designer Bar Config ──────────────────────────────────────────────────

describe("designerBarConfig", () => {
  it("has exactly 1 key 'count' with label 'Charts' and color 'var(--chart-1)'", () => {
    const keys = Object.keys(designerBarConfig);
    expect(keys).toHaveLength(1);
    expect(keys[0]).toBe("count");
    expect(designerBarConfig.count.label).toBe("Charts");
    expect(designerBarConfig.count.color).toBe("var(--chart-1)");
  });

  it("satisfies ChartConfig type", () => {
    const _config: ChartConfig = designerBarConfig;
    expect(_config).toBeDefined();
  });
});

// ─── Genre Distribution Config ────────────────────────────────────────────

describe("genreDistributionConfig", () => {
  it("has exactly 1 key 'count' with label 'Charts' and color 'var(--chart-3)'", () => {
    const keys = Object.keys(genreDistributionConfig);
    expect(keys).toHaveLength(1);
    expect(keys[0]).toBe("count");
    expect(genreDistributionConfig.count.label).toBe("Charts");
    expect(genreDistributionConfig.count.color).toBe("var(--chart-3)");
  });

  it("satisfies ChartConfig type", () => {
    const _config: ChartConfig = genreDistributionConfig;
    expect(_config).toBeDefined();
  });
});

// ─── Monthly Bar Config ─────────────────────────────────────────────────

describe("monthlyBarConfig", () => {
  it("has exactly 1 key 'totalStitches' with label 'Stitches' and color 'var(--chart-1)'", () => {
    const keys = Object.keys(monthlyBarConfig);
    expect(keys).toHaveLength(1);
    expect(keys[0]).toBe("totalStitches");
    expect(monthlyBarConfig.totalStitches.label).toBe("Stitches");
    expect(monthlyBarConfig.totalStitches.color).toBe("var(--chart-1)");
  });

  it("satisfies ChartConfig type", () => {
    const _config: ChartConfig = monthlyBarConfig;
    expect(_config).toBeDefined();
  });
});

// ─── Day of Week Config ──────────────────────────────────────────────────

describe("dayOfWeekConfig", () => {
  it("has exactly 1 key 'avgStitches' with label 'Avg Stitches' and color 'var(--chart-1)'", () => {
    const keys = Object.keys(dayOfWeekConfig);
    expect(keys).toHaveLength(1);
    expect(keys[0]).toBe("avgStitches");
    expect(dayOfWeekConfig.avgStitches.label).toBe("Avg Stitches");
    expect(dayOfWeekConfig.avgStitches.color).toBe("var(--chart-1)");
  });

  it("satisfies ChartConfig type", () => {
    const _config: ChartConfig = dayOfWeekConfig;
    expect(_config).toBeDefined();
  });
});
