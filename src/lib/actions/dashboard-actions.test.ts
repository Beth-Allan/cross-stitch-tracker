import { describe, expect, it, vi, beforeEach } from "vitest";
import { createMockPrisma } from "@/__tests__/mocks";
import type {
  CurrentlyStitchingProject,
  CollectionStats,
  SpotlightProject,
  MainDashboardData,
  BuriedTreasure,
  StartNextProject,
} from "@/types/dashboard";

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

describe("dashboard-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({
      user: { id: "user-1", name: "Test", email: "test@test.com" },
    });
  });

  // ─── getMainDashboardData ─────────────────────────────────────────────────

  describe("getMainDashboardData", () => {
    // Test 1: Auth guard
    it("rejects unauthenticated calls", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { getMainDashboardData } = await import("./dashboard-actions");
      await expect(getMainDashboardData()).rejects.toThrow("Unauthorized");
    });

    // Test 2: Currently stitching returns IN_PROGRESS and ON_HOLD only
    it("currentlyStitching returns IN_PROGRESS and ON_HOLD projects only", async () => {
      mockPrisma.project.findMany.mockResolvedValue([
        {
          id: "p1",
          userId: "user-1",
          status: "IN_PROGRESS",
          stitchesCompleted: 1000,
          chart: {
            id: "c1",
            name: "Active Chart",
            stitchCount: 5000,
            coverThumbnailUrl: null,
            designer: { name: "Designer A" },
          },
          sessions: [
            { date: new Date("2026-04-10"), stitchCount: 200, timeSpentMinutes: 60 },
          ],
        },
        {
          id: "p2",
          userId: "user-1",
          status: "ON_HOLD",
          stitchesCompleted: 500,
          chart: {
            id: "c2",
            name: "Paused Chart",
            stitchCount: 3000,
            coverThumbnailUrl: null,
            designer: null,
          },
          sessions: [],
        },
      ]);
      // Mock other queries needed by getMainDashboardData
      mockPrisma.chart.findMany.mockResolvedValue([]); // startNext + buriedTreasures
      mockPrisma.project.count.mockResolvedValue(0); // spotlight

      const { getMainDashboardData } = await import("./dashboard-actions");
      const result = await getMainDashboardData();

      expect(result.currentlyStitching).toHaveLength(2);
      const statuses = result.currentlyStitching.map(
        (p: CurrentlyStitchingProject) => p.status,
      );
      expect(statuses).toContain("IN_PROGRESS");
      expect(statuses).toContain("ON_HOLD");
    });

    // Test 3: Currently stitching sorts by most recent session date DESC, null last
    it("currentlyStitching sorts by most recent session date DESC, null dates last", async () => {
      mockPrisma.project.findMany.mockResolvedValue([
        {
          id: "p1",
          userId: "user-1",
          status: "IN_PROGRESS",
          stitchesCompleted: 100,
          chart: {
            id: "c1",
            name: "No Sessions",
            stitchCount: 5000,
            coverThumbnailUrl: null,
            designer: null,
          },
          sessions: [],
        },
        {
          id: "p2",
          userId: "user-1",
          status: "IN_PROGRESS",
          stitchesCompleted: 200,
          chart: {
            id: "c2",
            name: "Older Session",
            stitchCount: 3000,
            coverThumbnailUrl: null,
            designer: null,
          },
          sessions: [{ date: new Date("2026-04-01"), stitchCount: 100, timeSpentMinutes: 30 }],
        },
        {
          id: "p3",
          userId: "user-1",
          status: "IN_PROGRESS",
          stitchesCompleted: 300,
          chart: {
            id: "c3",
            name: "Recent Session",
            stitchCount: 8000,
            coverThumbnailUrl: null,
            designer: null,
          },
          sessions: [{ date: new Date("2026-04-15"), stitchCount: 150, timeSpentMinutes: 45 }],
        },
      ]);
      mockPrisma.chart.findMany.mockResolvedValue([]);
      mockPrisma.project.count.mockResolvedValue(0);

      const { getMainDashboardData } = await import("./dashboard-actions");
      const result = await getMainDashboardData();

      // Most recent first, null last
      expect(result.currentlyStitching[0].projectName).toBe("Recent Session");
      expect(result.currentlyStitching[1].projectName).toBe("Older Session");
      expect(result.currentlyStitching[2].projectName).toBe("No Sessions");
      expect(result.currentlyStitching[2].lastSessionDate).toBeNull();
    });

    // Test 4: progressPercent capped at 100, 0 when stitchCount is 0
    it("currentlyStitching progressPercent capped at 100 and 0 when stitchCount is 0", async () => {
      mockPrisma.project.findMany.mockResolvedValue([
        {
          id: "p1",
          userId: "user-1",
          status: "IN_PROGRESS",
          stitchesCompleted: 6000, // Over total (110% raw)
          chart: {
            id: "c1",
            name: "Over 100%",
            stitchCount: 5000,
            coverThumbnailUrl: null,
            designer: null,
          },
          sessions: [{ date: new Date("2026-04-10"), stitchCount: 100, timeSpentMinutes: 30 }],
        },
        {
          id: "p2",
          userId: "user-1",
          status: "IN_PROGRESS",
          stitchesCompleted: 100,
          chart: {
            id: "c2",
            name: "Zero Stitch Count",
            stitchCount: 0, // Edge case
            coverThumbnailUrl: null,
            designer: null,
          },
          sessions: [],
        },
        {
          id: "p3",
          userId: "user-1",
          status: "IN_PROGRESS",
          stitchesCompleted: 2500,
          chart: {
            id: "c3",
            name: "Normal Progress",
            stitchCount: 10000,
            coverThumbnailUrl: null,
            designer: null,
          },
          sessions: [{ date: new Date("2026-04-12"), stitchCount: 100, timeSpentMinutes: 30 }],
        },
      ]);
      mockPrisma.chart.findMany.mockResolvedValue([]);
      mockPrisma.project.count.mockResolvedValue(0);

      const { getMainDashboardData } = await import("./dashboard-actions");
      const result = await getMainDashboardData();

      const over100 = result.currentlyStitching.find(
        (p: CurrentlyStitchingProject) => p.projectName === "Over 100%",
      )!;
      expect(over100.progressPercent).toBe(100); // Capped

      const zeroCount = result.currentlyStitching.find(
        (p: CurrentlyStitchingProject) => p.projectName === "Zero Stitch Count",
      )!;
      expect(zeroCount.progressPercent).toBe(0); // 0 when stitchCount is 0

      const normal = result.currentlyStitching.find(
        (p: CurrentlyStitchingProject) => p.projectName === "Normal Progress",
      )!;
      expect(normal.progressPercent).toBe(25); // 2500/10000 = 25%
    });

    // Test 5: startNextProjects returns only wantToStartNext=true with UNSTARTED or KITTED
    it("startNextProjects returns only projects with wantToStartNext=true and status UNSTARTED or KITTED", async () => {
      mockPrisma.project.findMany.mockResolvedValue([]); // currently stitching
      mockPrisma.chart.findMany.mockImplementation(async (args: { where?: { project?: { wantToStartNext?: boolean } } }) => {
        // Start Next query has wantToStartNext filter
        if (args?.where?.project?.wantToStartNext === true) {
          return [
            {
              id: "c1",
              name: "Start Me",
              coverThumbnailUrl: null,
              coverImageUrl: null,
              stitchCount: 5000,
              dateAdded: new Date("2026-01-01"),
              designer: { name: "Designer A" },
              genres: [{ name: "Landscape" }],
              project: {
                id: "p1",
                status: "UNSTARTED",
                wantToStartNext: true,
              },
            },
            {
              id: "c2",
              name: "Start Me Too",
              coverThumbnailUrl: null,
              coverImageUrl: null,
              stitchCount: 3000,
              dateAdded: new Date("2026-02-01"),
              designer: null,
              genres: [],
              project: {
                id: "p2",
                status: "KITTED",
                wantToStartNext: true,
              },
            },
          ];
        }
        return []; // buried treasures
      });
      mockPrisma.project.count.mockResolvedValue(0);

      const { getMainDashboardData } = await import("./dashboard-actions");
      const result = await getMainDashboardData();

      expect(result.startNextProjects).toHaveLength(2);
      expect(result.startNextProjects[0].projectName).toBe("Start Me");
      expect(result.startNextProjects[1].projectName).toBe("Start Me Too");
    });

    // Test 6: buriedTreasures returns oldest 10% of UNSTARTED, max 5, sorted oldest-first
    it("buriedTreasures returns oldest 10% of UNSTARTED charts, max 5, sorted oldest-first", async () => {
      // Create 20 unstarted charts so 10% = 2
      const charts = Array.from({ length: 20 }, (_, i) => ({
        id: `c${i}`,
        name: `Chart ${i}`,
        coverThumbnailUrl: null,
        stitchCount: 5000,
        dateAdded: new Date(`2025-${String(i + 1).padStart(2, "0")}-01`),
        designer: null,
        genres: [],
        project: i < 10 ? { id: `p${i}`, status: "UNSTARTED" } : null, // Half have projects
      }));

      mockPrisma.project.findMany.mockResolvedValue([]); // currently stitching
      mockPrisma.chart.findMany.mockImplementation(async (args: { where?: { project?: { wantToStartNext?: boolean } } }) => {
        if (args?.where?.project?.wantToStartNext === true) {
          return []; // start next
        }
        return charts; // buried treasures (all unstarted)
      });
      mockPrisma.project.count.mockResolvedValue(0);

      const { getMainDashboardData } = await import("./dashboard-actions");
      const result = await getMainDashboardData();

      // 10% of 20 = 2
      expect(result.buriedTreasures.length).toBe(2);
      // Sorted oldest-first
      const dates = result.buriedTreasures.map((b: BuriedTreasure) => b.dateAdded);
      expect(dates[0].getTime()).toBeLessThan(dates[1].getTime());
    });

    // Test 7: buriedTreasures returns at least 1 even when 10% rounds to 0
    it("buriedTreasures returns at least 1 even when 10% rounds to 0", async () => {
      // Only 5 unstarted charts; 10% = 0.5 -> Math.ceil -> 1
      const charts = Array.from({ length: 5 }, (_, i) => ({
        id: `c${i}`,
        name: `Chart ${i}`,
        coverThumbnailUrl: null,
        stitchCount: 5000,
        dateAdded: new Date(`2025-0${i + 1}-01`),
        designer: null,
        genres: [],
        project: { id: `p${i}`, status: "UNSTARTED" },
      }));

      mockPrisma.project.findMany.mockResolvedValue([]); // currently stitching
      mockPrisma.chart.findMany.mockImplementation(async (args: { where?: { project?: { wantToStartNext?: boolean } } }) => {
        if (args?.where?.project?.wantToStartNext === true) {
          return []; // start next
        }
        return charts;
      });
      mockPrisma.project.count.mockResolvedValue(0);

      const { getMainDashboardData } = await import("./dashboard-actions");
      const result = await getMainDashboardData();

      // Math.max(Math.ceil(5 * 0.1), 1) = Math.max(1, 1) = 1
      expect(result.buriedTreasures.length).toBeGreaterThanOrEqual(1);
    });

    // Test 8: collectionStats returns correct counts
    it("collectionStats returns correct counts for totalProjects, totalWIP, totalOnHold, totalUnstarted, totalFinished", async () => {
      const allProjects = [
        { id: "p1", status: "IN_PROGRESS", stitchesCompleted: 1000, finishDate: null, chart: { id: "c1", name: "C1", stitchCount: 5000 } },
        { id: "p2", status: "IN_PROGRESS", stitchesCompleted: 2000, finishDate: null, chart: { id: "c2", name: "C2", stitchCount: 8000 } },
        { id: "p3", status: "ON_HOLD", stitchesCompleted: 500, finishDate: null, chart: { id: "c3", name: "C3", stitchCount: 3000 } },
        { id: "p4", status: "UNSTARTED", stitchesCompleted: 0, finishDate: null, chart: { id: "c4", name: "C4", stitchCount: 1000 } },
        { id: "p5", status: "KITTING", stitchesCompleted: 0, finishDate: null, chart: { id: "c5", name: "C5", stitchCount: 2000 } },
        { id: "p6", status: "KITTED", stitchesCompleted: 0, finishDate: null, chart: { id: "c6", name: "C6", stitchCount: 4000 } },
        { id: "p7", status: "FINISHED", stitchesCompleted: 10000, finishDate: new Date("2026-03-01"), chart: { id: "c7", name: "C7", stitchCount: 10000 } },
        { id: "p8", status: "FFO", stitchesCompleted: 6000, finishDate: new Date("2026-04-01"), chart: { id: "c8", name: "C8", stitchCount: 6000 } },
      ];

      // Currently stitching query returns WIPs
      mockPrisma.project.findMany.mockImplementation(async (args: { where?: { status?: { in?: string[] } } }) => {
        if (args?.where?.status?.in) {
          return allProjects.filter((p) => args.where!.status!.in!.includes(p.status));
        }
        return allProjects; // collection stats
      });
      mockPrisma.chart.findMany.mockResolvedValue([]); // start next + buried treasures
      mockPrisma.project.count.mockResolvedValue(0);

      const { getMainDashboardData } = await import("./dashboard-actions");
      const result = await getMainDashboardData();

      expect(result.collectionStats.totalProjects).toBe(8);
      expect(result.collectionStats.totalWIP).toBe(2); // IN_PROGRESS
      expect(result.collectionStats.totalOnHold).toBe(1); // ON_HOLD
      expect(result.collectionStats.totalUnstarted).toBe(3); // UNSTARTED + KITTING + KITTED
      expect(result.collectionStats.totalFinished).toBe(2); // FINISHED + FFO
    });

    // Test 9: collectionStats totalStitchesCompleted
    it("collectionStats returns totalStitchesCompleted sum across all projects", async () => {
      const allProjects = [
        { id: "p1", status: "IN_PROGRESS", stitchesCompleted: 1000, finishDate: null, chart: { id: "c1", name: "C1", stitchCount: 5000 } },
        { id: "p2", status: "FINISHED", stitchesCompleted: 8000, finishDate: new Date("2026-03-01"), chart: { id: "c2", name: "C2", stitchCount: 8000 } },
        { id: "p3", status: "UNSTARTED", stitchesCompleted: 0, finishDate: null, chart: { id: "c3", name: "C3", stitchCount: 3000 } },
      ];

      mockPrisma.project.findMany.mockImplementation(async (args: { where?: { status?: { in?: string[] } } }) => {
        if (args?.where?.status?.in) {
          return allProjects.filter((p) => args.where!.status!.in!.includes(p.status));
        }
        return allProjects;
      });
      mockPrisma.chart.findMany.mockResolvedValue([]);
      mockPrisma.project.count.mockResolvedValue(0);

      const { getMainDashboardData } = await import("./dashboard-actions");
      const result = await getMainDashboardData();

      expect(result.collectionStats.totalStitchesCompleted).toBe(9000); // 1000 + 8000 + 0
    });

    // Test 10: collectionStats mostRecentFinish and largestProject
    it("collectionStats returns mostRecentFinish and largestProject", async () => {
      const allProjects = [
        { id: "p1", status: "FINISHED", stitchesCompleted: 5000, finishDate: new Date("2026-02-01"), chart: { id: "c1", name: "Old Finish", stitchCount: 5000 } },
        { id: "p2", status: "FFO", stitchesCompleted: 3000, finishDate: new Date("2026-04-10"), chart: { id: "c2", name: "Recent Finish", stitchCount: 3000 } },
        { id: "p3", status: "IN_PROGRESS", stitchesCompleted: 1000, finishDate: null, chart: { id: "c3", name: "Big WIP", stitchCount: 50000 } },
      ];

      mockPrisma.project.findMany.mockImplementation(async (args: { where?: { status?: { in?: string[] } } }) => {
        if (args?.where?.status?.in) {
          return allProjects.filter((p) => args.where!.status!.in!.includes(p.status));
        }
        return allProjects;
      });
      mockPrisma.chart.findMany.mockResolvedValue([]);
      mockPrisma.project.count.mockResolvedValue(0);

      const { getMainDashboardData } = await import("./dashboard-actions");
      const result = await getMainDashboardData();

      // Most recent finish is "Recent Finish" on 2026-04-10
      expect(result.collectionStats.mostRecentFinish).toEqual({
        projectId: "p2",
        name: "Recent Finish",
        finishDate: new Date("2026-04-10"),
      });

      // Largest project by chart.stitchCount is "Big WIP" at 50000
      expect(result.collectionStats.largestProject).toEqual({
        projectId: "p3",
        name: "Big WIP",
        stitchCount: 50000,
      });
    });

    // Test 13: All queries filter by userId from requireAuth()
    it("all queries filter by userId from requireAuth()", async () => {
      mockPrisma.project.findMany.mockResolvedValue([]);
      mockPrisma.chart.findMany.mockResolvedValue([]);
      mockPrisma.project.count.mockResolvedValue(0);

      const { getMainDashboardData } = await import("./dashboard-actions");
      await getMainDashboardData();

      // Verify currently stitching query includes userId filter
      expect(mockPrisma.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: "user-1",
          }),
        }),
      );

      // Verify chart queries include userId filter via project relation
      for (const call of mockPrisma.chart.findMany.mock.calls) {
        const args = call[0] as { where?: { project?: { userId?: string }; OR?: Array<{ project?: { userId?: string } | null }> } };
        if (args?.where?.project) {
          expect(args.where.project.userId).toBe("user-1");
        }
        // Some chart queries use OR for charts without projects too
        if (args?.where?.OR) {
          const projectFilter = args.where.OR.find(
            (o: { project?: { userId?: string } | null }) => o.project !== null && o.project !== undefined,
          );
          if (projectFilter?.project) {
            expect(projectFilter.project.userId).toBe("user-1");
          }
        }
      }
    });
  });

  // ─── getSpotlightProject ──────────────────────────────────────────────────

  describe("getSpotlightProject", () => {
    // Test 11: Auth guard
    it("rejects unauthenticated calls", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { getSpotlightProject } = await import("./dashboard-actions");
      await expect(getSpotlightProject()).rejects.toThrow("Unauthorized");
    });

    // Test 12: Returns project with chart, designer, genre data
    it("returns a project with chart, designer, and genre data", async () => {
      mockPrisma.project.count.mockResolvedValue(3);
      mockPrisma.project.findFirst.mockResolvedValue({
        id: "p1",
        status: "IN_PROGRESS",
        stitchesCompleted: 2500,
        chart: {
          id: "c1",
          name: "Spotlight Chart",
          stitchCount: 10000,
          coverThumbnailUrl: "thumb.jpg",
          coverImageUrl: "full.jpg",
          designer: { name: "Famous Designer" },
          genres: [{ name: "Fantasy" }, { name: "Animals" }],
        },
      });

      const { getSpotlightProject } = await import("./dashboard-actions");
      const result = await getSpotlightProject();

      expect(result).not.toBeNull();
      expect(result!.projectId).toBe("p1");
      expect(result!.projectName).toBe("Spotlight Chart");
      expect(result!.designerName).toBe("Famous Designer");
      expect(result!.genres).toEqual(["Fantasy", "Animals"]);
      expect(result!.progressPercent).toBe(25); // 2500/10000
      expect(result!.coverThumbnailUrl).toBe("thumb.jpg");
      expect(result!.coverImageUrl).toBe("full.jpg");

      // Verify query filters by userId
      expect(mockPrisma.project.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: "user-1" },
        }),
      );
    });

    it("returns null when user has no projects", async () => {
      mockPrisma.project.count.mockResolvedValue(0);

      const { getSpotlightProject } = await import("./dashboard-actions");
      const result = await getSpotlightProject();

      expect(result).toBeNull();
      expect(mockPrisma.project.findFirst).not.toHaveBeenCalled();
    });
  });
});
