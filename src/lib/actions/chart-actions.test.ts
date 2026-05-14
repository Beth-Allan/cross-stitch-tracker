import { describe, expect, it, vi } from "vitest";
import { createMockPrisma } from "@/__tests__/mocks";

// Mock auth to return null (unauthenticated)
vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue(null),
}));

// Mock prisma to prevent actual DB calls
const mockPrisma = createMockPrisma();
vi.mock("@/lib/db", () => ({
  prisma: mockPrisma,
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

  it("createChartWithSupplies throws Unauthorized when no session", async () => {
    const { createChartWithSupplies } = await import("./chart-actions");
    await expect(createChartWithSupplies({}, {})).rejects.toThrow("Unauthorized");
  });
});

// ─── createChartWithSupplies (authenticated) ─────────────────────────────

describe("createChartWithSupplies", () => {
  const validChartInput = {
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
      fabricId: null,
      needsOnionSkinning: false,
      startDate: null,
      finishDate: null,
      ffoDate: null,
      wantToStartNext: false,
      preferredStartSeason: null,
      startingStitches: 0,
    },
  };

  it("with empty supplies creates chart without supply inserts", async () => {
    // Re-mock auth to return a valid user
    const auth = await import("@/lib/auth");
    (auth.auth as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      user: { id: "user-1", email: "test@test.com" },
    });

    const createdChart = {
      id: "chart-new",
      project: { id: "proj-new" },
      designer: null,
      genres: [],
    };
    mockPrisma.$transaction.mockImplementationOnce(async (fn: (tx: typeof mockPrisma) => Promise<unknown>) => {
      mockPrisma.chart.create.mockResolvedValueOnce(createdChart);
      return fn(mockPrisma);
    });

    const { createChartWithSupplies } = await import("./chart-actions");
    const result = await createChartWithSupplies(validChartInput, {
      threads: [],
      beads: [],
      specialty: [],
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.chartId).toBe("chart-new");
    }
  });

  it("with thread supplies calls createMany with correct data shape", async () => {
    const auth = await import("@/lib/auth");
    (auth.auth as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      user: { id: "user-1", email: "test@test.com" },
    });

    const createdChart = {
      id: "chart-new",
      project: { id: "proj-new" },
      designer: null,
      genres: [],
    };
    mockPrisma.$transaction.mockImplementationOnce(async (fn: (tx: typeof mockPrisma) => Promise<unknown>) => {
      mockPrisma.chart.create.mockResolvedValueOnce(createdChart);
      mockPrisma.projectThread.createMany.mockResolvedValueOnce({ count: 1 });
      return fn(mockPrisma);
    });

    const { createChartWithSupplies } = await import("./chart-actions");
    const result = await createChartWithSupplies(validChartInput, {
      threads: [
        { supplyId: "thread-1", stitchCount: 500, need: 2, isNeedOverridden: false },
      ],
      beads: [],
      specialty: [],
    });

    expect(result.success).toBe(true);
    expect(mockPrisma.projectThread.createMany).toHaveBeenCalledWith({
      data: [
        {
          projectId: "proj-new",
          threadId: "thread-1",
          stitchCount: 500,
          quantityRequired: 2,
          quantityAcquired: 0,
          isNeedOverridden: false,
        },
      ],
      skipDuplicates: true,
    });
  });

  it("with mixed supplies creates all three junction types", async () => {
    const auth = await import("@/lib/auth");
    (auth.auth as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      user: { id: "user-1", email: "test@test.com" },
    });

    const createdChart = {
      id: "chart-new",
      project: { id: "proj-new" },
      designer: null,
      genres: [],
    };
    mockPrisma.$transaction.mockImplementationOnce(async (fn: (tx: typeof mockPrisma) => Promise<unknown>) => {
      mockPrisma.chart.create.mockResolvedValueOnce(createdChart);
      mockPrisma.projectThread.createMany.mockResolvedValueOnce({ count: 1 });
      mockPrisma.projectBead.createMany.mockResolvedValueOnce({ count: 1 });
      mockPrisma.projectSpecialty.createMany.mockResolvedValueOnce({ count: 1 });
      return fn(mockPrisma);
    });

    const { createChartWithSupplies } = await import("./chart-actions");
    const result = await createChartWithSupplies(validChartInput, {
      threads: [{ supplyId: "t1", stitchCount: 500, need: 2, isNeedOverridden: false }],
      beads: [{ supplyId: "b1", need: 1 }],
      specialty: [{ supplyId: "s1", need: 1 }],
    });

    expect(result.success).toBe(true);
    expect(mockPrisma.projectThread.createMany).toHaveBeenCalled();
    expect(mockPrisma.projectBead.createMany).toHaveBeenCalled();
    expect(mockPrisma.projectSpecialty.createMany).toHaveBeenCalled();
  });

  it("returns chartId on success", async () => {
    const auth = await import("@/lib/auth");
    (auth.auth as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      user: { id: "user-1", email: "test@test.com" },
    });

    const createdChart = {
      id: "chart-abc",
      project: { id: "proj-abc" },
      designer: null,
      genres: [],
    };
    mockPrisma.$transaction.mockImplementationOnce(async (fn: (tx: typeof mockPrisma) => Promise<unknown>) => {
      mockPrisma.chart.create.mockResolvedValueOnce(createdChart);
      return fn(mockPrisma);
    });

    const { createChartWithSupplies } = await import("./chart-actions");
    const result = await createChartWithSupplies(validChartInput, {});

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.chartId).toBe("chart-abc");
    }
  });

  it("returns error on ZodError (invalid form data)", async () => {
    const auth = await import("@/lib/auth");
    (auth.auth as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      user: { id: "user-1", email: "test@test.com" },
    });

    const { createChartWithSupplies } = await import("./chart-actions");
    // Pass invalid chart data (missing name)
    const result = await createChartWithSupplies(
      { chart: { name: "" }, project: {} },
      {},
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeTruthy();
    }
  });
});
