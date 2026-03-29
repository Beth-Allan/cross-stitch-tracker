import { describe, expect, it, vi } from "vitest";

// Mock auth to return null (unauthenticated)
vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue(null),
}));

// Mock prisma to prevent actual DB calls
vi.mock("@/lib/db", () => ({
  prisma: {
    chart: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    project: { update: vi.fn() },
    designer: { create: vi.fn(), findMany: vi.fn() },
    genre: { create: vi.fn(), findMany: vi.fn() },
  },
}));

// Mock next/cache to prevent server-only errors in test
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("chart-actions auth guard", () => {
  it("createChart throws Unauthorized when no session", async () => {
    const { createChart } = await import("./chart-actions");
    await expect(createChart({})).rejects.toThrow("Unauthorized");
  });

  it("deleteChart throws Unauthorized when no session", async () => {
    const { deleteChart } = await import("./chart-actions");
    await expect(deleteChart("some-id")).rejects.toThrow("Unauthorized");
  });

  it("updateChartStatus throws Unauthorized when no session", async () => {
    const { updateChartStatus } = await import("./chart-actions");
    await expect(updateChartStatus("some-id", "IN_PROGRESS")).rejects.toThrow("Unauthorized");
  });

  it("getChart throws Unauthorized when no session", async () => {
    const { getChart } = await import("./chart-actions");
    await expect(getChart("some-id")).rejects.toThrow("Unauthorized");
  });

  it("getCharts throws Unauthorized when no session", async () => {
    const { getCharts } = await import("./chart-actions");
    await expect(getCharts()).rejects.toThrow("Unauthorized");
  });
});
