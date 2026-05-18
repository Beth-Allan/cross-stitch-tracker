import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockPrisma } from "@/__tests__/mocks";

const mockPrisma = createMockPrisma();
vi.mock("@/lib/db", () => ({ prisma: mockPrisma }));

vi.mock("next/cache", () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}));

vi.mock("./timezone", () => ({
  getUserTimezone: () => "America/Edmonton",
}));

describe("getAvailableYears", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("returns empty years array when no sessions exist", async () => {
    mockPrisma.stitchSession.findMany.mockResolvedValue([]);

    const { getAvailableYears } = await import("./available-years");
    const result = await getAvailableYears("user-1");

    expect(result).toEqual({ years: [] });
  });

  it("returns distinct years descending from session dates", async () => {
    mockPrisma.stitchSession.findMany.mockResolvedValue([
      { date: new Date("2025-03-15T14:00:00Z") },
      { date: new Date("2025-06-20T14:00:00Z") },
      { date: new Date("2026-01-10T14:00:00Z") },
      { date: new Date("2026-05-17T14:00:00Z") },
    ]);

    const { getAvailableYears } = await import("./available-years");
    const result = await getAvailableYears("user-1");

    expect(result.years).toEqual([2026, 2025]);
  });

  it("deduplicates years from sessions in the same year", async () => {
    mockPrisma.stitchSession.findMany.mockResolvedValue([
      { date: new Date("2026-01-01T14:00:00Z") },
      { date: new Date("2026-06-15T14:00:00Z") },
      { date: new Date("2026-12-31T14:00:00Z") },
    ]);

    const { getAvailableYears } = await import("./available-years");
    const result = await getAvailableYears("user-1");

    expect(result.years).toEqual([2026]);
  });
});
