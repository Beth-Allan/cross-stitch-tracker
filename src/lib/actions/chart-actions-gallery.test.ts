import { describe, expect, it, vi, beforeEach } from "vitest";
import { createMockPrisma } from "@/__tests__/mocks";

// Mock auth - default to authenticated
const mockAuth = vi.fn();
vi.mock("@/lib/auth", () => ({
  auth: mockAuth,
}));

const mockPrisma = createMockPrisma();
vi.mock("@/lib/db", () => ({
  prisma: mockPrisma,
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("getChartsForGallery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({
      user: { id: "user-1", name: "Test", email: "test@test.com" },
    });
  });

  it("calls requireAuth before querying", async () => {
    mockAuth.mockResolvedValueOnce(null);
    const { getChartsForGallery } = await import("./chart-actions");

    await expect(getChartsForGallery()).rejects.toThrow("Unauthorized");
  });

  it("queries charts scoped to authenticated user.id", async () => {
    mockPrisma.chart.findMany.mockResolvedValueOnce([]);
    const { getChartsForGallery } = await import("./chart-actions");

    await getChartsForGallery();

    expect(mockPrisma.chart.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { project: { userId: "user-1" } },
      }),
    );
  });

  it("includes project supply counts via _count select", async () => {
    mockPrisma.chart.findMany.mockResolvedValueOnce([]);
    const { getChartsForGallery } = await import("./chart-actions");

    await getChartsForGallery();

    const call = mockPrisma.chart.findMany.mock.calls[0][0];

    // The project select/include should contain _count with supply tables
    const projectConfig = call.include?.project ?? call.select?.project;
    expect(projectConfig).toBeDefined();

    // Check that _count is requested for supply junction tables
    const selectOrInclude = projectConfig.select ?? projectConfig.include ?? projectConfig;
    const countConfig = selectOrInclude._count;
    expect(countConfig).toBeDefined();

    const countSelect = countConfig.select ?? countConfig;
    expect(countSelect.projectThreads).toBe(true);
    expect(countSelect.projectBeads).toBe(true);
    expect(countSelect.projectSpecialty).toBe(true);
  });

  it("includes designer and genres", async () => {
    mockPrisma.chart.findMany.mockResolvedValueOnce([]);
    const { getChartsForGallery } = await import("./chart-actions");

    await getChartsForGallery();

    const call = mockPrisma.chart.findMany.mock.calls[0][0];
    expect(call.include.designer).toBe(true);
    expect(call.include.genres).toBe(true);
  });

  it("orders by dateAdded descending", async () => {
    mockPrisma.chart.findMany.mockResolvedValueOnce([]);
    const { getChartsForGallery } = await import("./chart-actions");

    await getChartsForGallery();

    const call = mockPrisma.chart.findMany.mock.calls[0][0];
    expect(call.orderBy).toEqual({ dateAdded: "desc" });
  });

  it("includes fabric existence check on project", async () => {
    mockPrisma.chart.findMany.mockResolvedValueOnce([]);
    const { getChartsForGallery } = await import("./chart-actions");

    await getChartsForGallery();

    const call = mockPrisma.chart.findMany.mock.calls[0][0];
    const projectConfig = call.include?.project ?? call.select?.project;
    const selectOrInclude = projectConfig.select ?? projectConfig.include ?? projectConfig;

    // fabric should be included (select or truthy)
    expect(selectOrInclude.fabric).toBeDefined();
  });
});
