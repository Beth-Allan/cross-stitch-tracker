import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  createMockPrisma,
  createProjectSupplies,
  mockProjectSupplyGroups,
} from "@/__tests__/mocks";

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
  revalidateTag: vi.fn(),
}));

type SupplyRow = { quantityRequired: number; quantityAcquired: number };

const chartRow = {
  id: "chart-1",
  name: "Test Chart",
  dateAdded: new Date("2026-01-15"),
  project: { id: "proj-1", status: "UNSTARTED", fabric: null },
};

function mockSupplies(rows: {
  threads?: SupplyRow[];
  beads?: SupplyRow[];
  specialty?: SupplyRow[];
}) {
  mockProjectSupplyGroups(mockPrisma, [{ projectId: "proj-1", ...rows }]);
}

describe("getChartsForGallery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({
      user: { id: "user-1", name: "Test", email: "test@test.com" },
    });
    mockSupplies({});
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

  it("scopes every supply group read to the same user", async () => {
    mockPrisma.chart.findMany.mockResolvedValueOnce([]);
    const { getChartsForGallery } = await import("./chart-actions");

    await getChartsForGallery();

    // Data isolation rests on all seven reads, not just the chart one: dropping the scope from a
    // junction read would leak another user's kitting figures onto these cards.
    for (const junction of [
      mockPrisma.projectThread.groupBy,
      mockPrisma.projectBead.groupBy,
      mockPrisma.projectSpecialty.groupBy,
    ]) {
      expect(junction).toHaveBeenCalledTimes(2);
      for (const call of junction.mock.calls) {
        expect(call[0].where).toMatchObject({ project: { userId: "user-1" } });
      }
    }
  });

  it("reads the quantities behind the kitting dots as group totals, not as rows", async () => {
    mockPrisma.chart.findMany.mockResolvedValueOnce([]);
    const { getChartsForGallery } = await import("./chart-actions");

    await getChartsForGallery();

    // The figures the dots need are still fetched — from the junction tables directly, one group
    // per project, rather than by pulling every quantity row through the chart row.
    for (const junction of [
      mockPrisma.projectThread.groupBy,
      mockPrisma.projectBead.groupBy,
      mockPrisma.projectSpecialty.groupBy,
    ]) {
      expect(junction).toHaveBeenCalledWith(
        expect.objectContaining({
          by: ["projectId"],
          _sum: expect.objectContaining({ quantityRequired: true }),
        }),
      );
    }

    const projectSelect = mockPrisma.chart.findMany.mock.calls[0][0].include.project.select;
    for (const relation of ["projectThreads", "projectBeads", "projectSpecialty"]) {
      expect(projectSelect).not.toHaveProperty(relation);
    }
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

  it("attaches each project's supply rollup to its chart", async () => {
    const threads: SupplyRow[] = [
      { quantityRequired: 3, quantityAcquired: 3 },
      { quantityRequired: 2, quantityAcquired: 1 },
    ];
    const specialty: SupplyRow[] = [{ quantityRequired: 1, quantityAcquired: 0 }];
    mockPrisma.chart.findMany.mockResolvedValueOnce([chartRow]);
    mockSupplies({ threads, specialty });

    const { getChartsForGallery } = await import("./chart-actions");
    const charts = await getChartsForGallery();

    expect(charts[0].project?.supplies).toEqual(
      createProjectSupplies({ threads, beads: [], specialty }),
    );
  });

  it("gives a project with no supply rows the empty rollup, not undefined", async () => {
    mockPrisma.chart.findMany.mockResolvedValueOnce([chartRow]);

    const { getChartsForGallery } = await import("./chart-actions");
    const charts = await getChartsForGallery();

    expect(charts[0].project?.supplies).toEqual(createProjectSupplies());
  });

  it("gives each chart its own project's figures", async () => {
    const otherChart = {
      id: "chart-2",
      name: "Other Chart",
      dateAdded: new Date("2026-01-16"),
      project: { id: "proj-2", status: "KITTED", fabric: null },
    };
    const mine: SupplyRow[] = [{ quantityRequired: 4, quantityAcquired: 4 }];
    const theirs: SupplyRow[] = [{ quantityRequired: 2, quantityAcquired: 0 }];
    mockPrisma.chart.findMany.mockResolvedValueOnce([chartRow, otherChart]);
    mockProjectSupplyGroups(mockPrisma, [
      { projectId: "proj-1", threads: mine },
      { projectId: "proj-2", threads: theirs },
    ]);

    const { getChartsForGallery } = await import("./chart-actions");
    const charts = await getChartsForGallery();

    expect(charts[0].project?.supplies).toEqual(createProjectSupplies({ threads: mine }));
    expect(charts[1].project?.supplies).toEqual(createProjectSupplies({ threads: theirs }));
  });

  it("keeps every other field of the chart row untouched", async () => {
    mockPrisma.chart.findMany.mockResolvedValueOnce([chartRow]);

    const { getChartsForGallery } = await import("./chart-actions");
    const charts = await getChartsForGallery();

    expect(charts[0]).toMatchObject({
      id: "chart-1",
      name: "Test Chart",
      dateAdded: new Date("2026-01-15"),
      project: { id: "proj-1", status: "UNSTARTED", fabric: null },
    });
  });
});
