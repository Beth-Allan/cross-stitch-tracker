import { describe, expect, it, vi, beforeEach } from "vitest";
import { createMockPrisma } from "@/__tests__/mocks";

// Mock auth to return authenticated session
vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: "user-1", name: "Test", email: "test@test.com" } }),
}));

const mockPrisma = createMockPrisma();
vi.mock("@/lib/db", () => ({
  prisma: mockPrisma,
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const validFormData = {
  chart: {
    name: "Test Chart",
    designerId: null,
    coverImageUrl: null,
    coverThumbnailUrl: null,
    digitalFileUrl: null,
    stitchCount: 5000,
    stitchCountApproximate: false,
    stitchesWide: 100,
    stitchesHigh: 50,
    genreIds: [],
    isPaperChart: false,
    isFormalKit: false,
    isSAL: false,
    kitColorCount: null,
    notes: null,
  },
  project: {
    status: "UNSTARTED",
    storageLocationId: null,
    stitchingAppId: null,
    needsOnionSkinning: false,
    startDate: null,
    finishDate: null,
    ffoDate: null,
    wantToStartNext: false,
    preferredStartSeason: null,
    startingStitches: 0,
  },
};

describe("chart-actions authenticated error paths", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Support interactive transactions (function arg) and batch transactions (array arg)
    mockPrisma.$transaction.mockImplementation(async (fnOrArray: unknown) => {
      if (typeof fnOrArray === "function")
        return (fnOrArray as (tx: typeof mockPrisma) => unknown)(mockPrisma);
      return fnOrArray;
    });
  });

  it("createChart returns error on Zod validation failure (empty object)", async () => {
    const { createChart } = await import("./chart-actions");
    const result = await createChart({});

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(typeof result.error).toBe("string");
      expect(result.error.length).toBeGreaterThan(0);
    }
  });

  it("createChart returns error on DB failure", async () => {
    const { createChart } = await import("./chart-actions");
    mockPrisma.chart.create.mockRejectedValueOnce(new Error("DB connection lost"));

    const result = await createChart(validFormData);

    expect(result).toEqual({ success: false, error: "Failed to create chart" });
  });

  it("updateChart returns error on Zod validation failure", async () => {
    const { updateChart } = await import("./chart-actions");
    const result = await updateChart("chart-1", { bad: "data" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(typeof result.error).toBe("string");
    }
  });

  it("updateChart returns error on DB failure", async () => {
    const { updateChart } = await import("./chart-actions");
    // Ownership check must pass before the update is attempted
    mockPrisma.chart.findUnique.mockResolvedValueOnce({ project: { userId: "user-1" } });
    mockPrisma.chart.update.mockRejectedValueOnce(new Error("DB connection lost"));

    const result = await updateChart("chart-1", validFormData);

    expect(result).toEqual({ success: false, error: "Failed to update chart" });
  });

  it("updateChart returns not found for unowned chart", async () => {
    const { updateChart } = await import("./chart-actions");
    mockPrisma.chart.findUnique.mockResolvedValueOnce({ project: { userId: "other-user" } });

    const result = await updateChart("chart-1", validFormData);

    expect(result).toEqual({ success: false, error: "Chart not found" });
  });

  it("deleteChart returns error on DB failure", async () => {
    const { deleteChart } = await import("./chart-actions");
    // Ownership check must pass before the delete is attempted
    mockPrisma.chart.findUnique.mockResolvedValueOnce({ project: { userId: "user-1" } });
    mockPrisma.chart.delete.mockRejectedValueOnce(new Error("DB connection lost"));

    const result = await deleteChart("chart-1");

    expect(result).toEqual({ success: false, error: "Failed to delete chart" });
  });

  it("deleteChart returns not found for unowned chart", async () => {
    const { deleteChart } = await import("./chart-actions");
    mockPrisma.chart.findUnique.mockResolvedValueOnce({ project: { userId: "other-user" } });

    const result = await deleteChart("chart-1");

    expect(result).toEqual({ success: false, error: "Chart not found" });
  });

  it("updateChartStatus returns error for invalid status string", async () => {
    const { updateChartStatus } = await import("./chart-actions");
    const result = await updateChartStatus("chart-1", "INVALID_STATUS");

    expect(result).toEqual({ success: false, error: "Invalid status value" });
  });

  it("updateChartStatus returns error on DB failure", async () => {
    const { updateChartStatus } = await import("./chart-actions");
    // Ownership check must pass before the update is attempted
    mockPrisma.project.findUnique.mockResolvedValueOnce({ userId: "user-1" });
    mockPrisma.project.update.mockRejectedValueOnce(new Error("DB connection lost"));

    const result = await updateChartStatus("chart-1", "IN_PROGRESS");

    expect(result).toEqual({ success: false, error: "Failed to update chart status" });
  });

  it("getChart throws on DB error (handled by error boundary)", async () => {
    const { getChart } = await import("./chart-actions");
    mockPrisma.chart.findUnique.mockRejectedValueOnce(new Error("DB connection lost"));

    await expect(getChart("chart-1")).rejects.toThrow("DB connection lost");
  });

  it("getCharts throws on DB error (handled by error boundary)", async () => {
    const { getCharts } = await import("./chart-actions");
    mockPrisma.chart.findMany.mockRejectedValueOnce(new Error("DB connection lost"));

    await expect(getCharts()).rejects.toThrow("DB connection lost");
  });
});
