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

describe("createChart happy path", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.$transaction.mockImplementation(async (fnOrArray: unknown) => {
      if (typeof fnOrArray === "function")
        return (fnOrArray as (tx: typeof mockPrisma) => unknown)(mockPrisma);
      return fnOrArray;
    });
  });

  it("creates a chart with correct shape including userId on nested project", async () => {
    const { createChart } = await import("./chart-actions");
    mockPrisma.chart.create.mockResolvedValueOnce({ id: "new-chart-1", project: { id: "proj-1" } });

    const result = await createChart(validFormData);

    expect(result).toEqual({ success: true, chartId: "new-chart-1" });
    expect(mockPrisma.chart.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: "Test Chart",
          stitchCount: 5000,
          stitchCountApproximate: false,
          project: {
            create: expect.objectContaining({
              userId: "user-1",
              status: "UNSTARTED",
            }),
          },
        }),
      }),
    );
  });

  it("auto-calculates stitch count when stitchCount is 0 with dimensions", async () => {
    const { createChart } = await import("./chart-actions");
    mockPrisma.chart.create.mockResolvedValueOnce({ id: "new-chart-2", project: { id: "proj-2" } });

    const autoCalcData = {
      ...validFormData,
      chart: { ...validFormData.chart, stitchCount: 0, stitchesWide: 100, stitchesHigh: 150 },
    };
    const result = await createChart(autoCalcData);

    expect(result.success).toBe(true);
    expect(mockPrisma.chart.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          stitchCount: 15000,
          stitchCountApproximate: true,
        }),
      }),
    );
  });

  it("uses explicit stitchCount without auto-calculating", async () => {
    const { createChart } = await import("./chart-actions");
    mockPrisma.chart.create.mockResolvedValueOnce({ id: "new-chart-3", project: { id: "proj-3" } });

    const result = await createChart(validFormData);

    expect(result.success).toBe(true);
    expect(mockPrisma.chart.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          stitchCount: 5000,
          stitchCountApproximate: false,
        }),
      }),
    );
  });
});

describe("updateChart fabric link/unlink", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.$transaction.mockImplementation(async (fnOrArray: unknown) => {
      if (typeof fnOrArray === "function")
        return (fnOrArray as (tx: typeof mockPrisma) => unknown)(mockPrisma);
      return fnOrArray;
    });
  });

  it("links a new fabric when no previous fabric exists", async () => {
    const { updateChart } = await import("./chart-actions");
    mockPrisma.chart.findUnique.mockResolvedValueOnce({
      coverImageUrl: null,
      project: { id: "proj-1", userId: "user-1" },
    });
    mockPrisma.chart.update.mockResolvedValueOnce({ id: "chart-1" });
    // No current fabric linked
    mockPrisma.fabric.findUnique.mockResolvedValueOnce(null);
    // Ownership check for new fabric — unlinked fabric (no linkedProject)
    mockPrisma.fabric.findUnique.mockResolvedValueOnce({ linkedProject: null });
    mockPrisma.fabric.update.mockResolvedValueOnce({});

    const formData = {
      ...validFormData,
      project: { ...validFormData.project, fabricId: "fabric-new" },
    };
    const result = await updateChart("chart-1", formData);

    expect(result.success).toBe(true);
    // Should link the new fabric
    expect(mockPrisma.fabric.update).toHaveBeenCalledWith({
      where: { id: "fabric-new" },
      data: { linkedProjectId: "proj-1" },
    });
  });

  it("swaps fabric A for fabric B (unlinks A, links B)", async () => {
    const { updateChart } = await import("./chart-actions");
    mockPrisma.chart.findUnique.mockResolvedValueOnce({
      coverImageUrl: null,
      project: { id: "proj-1", userId: "user-1" },
    });
    mockPrisma.chart.update.mockResolvedValueOnce({ id: "chart-1" });
    // Current fabric is A
    mockPrisma.fabric.findUnique.mockResolvedValueOnce({
      id: "fabric-A",
      linkedProjectId: "proj-1",
    });
    // Ownership check for new fabric B — unlinked
    mockPrisma.fabric.findUnique.mockResolvedValueOnce({ linkedProject: null });
    mockPrisma.fabric.update.mockResolvedValue({});

    const formData = {
      ...validFormData,
      project: { ...validFormData.project, fabricId: "fabric-B" },
    };
    const result = await updateChart("chart-1", formData);

    expect(result.success).toBe(true);
    // Should unlink A then link B
    const fabricUpdateCalls = mockPrisma.fabric.update.mock.calls;
    expect(fabricUpdateCalls[0][0]).toEqual({
      where: { id: "fabric-A" },
      data: { linkedProjectId: null },
    });
    expect(fabricUpdateCalls[1][0]).toEqual({
      where: { id: "fabric-B" },
      data: { linkedProjectId: "proj-1" },
    });
  });

  it("removes fabric link when no fabricId provided", async () => {
    const { updateChart } = await import("./chart-actions");
    mockPrisma.chart.findUnique.mockResolvedValueOnce({
      coverImageUrl: null,
      project: { id: "proj-1", userId: "user-1" },
    });
    mockPrisma.chart.update.mockResolvedValueOnce({ id: "chart-1" });
    // Current fabric linked
    mockPrisma.fabric.findUnique.mockResolvedValueOnce({
      id: "fabric-old",
      linkedProjectId: "proj-1",
    });
    mockPrisma.fabric.update.mockResolvedValueOnce({});

    // No fabricId in project
    const result = await updateChart("chart-1", validFormData);

    expect(result.success).toBe(true);
    // Should unlink old fabric
    expect(mockPrisma.fabric.update).toHaveBeenCalledWith({
      where: { id: "fabric-old" },
      data: { linkedProjectId: null },
    });
    // Should NOT link a new fabric (only 1 fabric.update call)
    expect(mockPrisma.fabric.update).toHaveBeenCalledTimes(1);
  });
});
