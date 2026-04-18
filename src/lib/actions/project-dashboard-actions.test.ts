import { describe, expect, it, vi, beforeEach } from "vitest";
import { createMockPrisma } from "@/__tests__/mocks";
import type { ProjectDashboardData } from "@/types/dashboard";

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

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Build a mock project with chart + sessions + junction tables for findMany results */
function mockProject(overrides: {
  id?: string;
  status?: string;
  stitchesCompleted?: number;
  startDate?: Date | null;
  finishDate?: Date | null;
  chartName?: string;
  stitchCount?: number;
  coverThumbnailUrl?: string | null;
  designerName?: string | null;
  sessions?: Array<{ date: Date; stitchCount: number }>;
  projectThreads?: Array<{ id: string }>;
  projectBeads?: Array<{ id: string }>;
  projectSpecialty?: Array<{ id: string }>;
  fabricName?: string | null;
  fabricBrandName?: string | null;
  genres?: Array<{ name: string }>;
}) {
  const {
    id = "proj-1",
    status = "IN_PROGRESS",
    stitchesCompleted = 0,
    startDate = null,
    finishDate = null,
    chartName = "Test Chart",
    stitchCount = 10000,
    coverThumbnailUrl = null,
    designerName = null,
    sessions = [],
    projectThreads = [],
    projectBeads = [],
    projectSpecialty = [],
    fabricName = null,
    fabricBrandName = null,
    genres = [],
  } = overrides;

  return {
    id,
    userId: "user-1",
    status,
    stitchesCompleted,
    startDate,
    finishDate,
    chart: {
      id: `chart-${id}`,
      name: chartName,
      stitchCount,
      coverThumbnailUrl,
      designer: designerName ? { name: designerName } : null,
      genres,
    },
    sessions: sessions.map((s, i) => ({ id: `sess-${i}`, ...s })),
    projectThreads,
    projectBeads,
    projectSpecialty,
    fabric:
      fabricName && fabricBrandName
        ? { name: fabricName, brand: { name: fabricBrandName } }
        : null,
  };
}

describe("project-dashboard-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({
      user: { id: "user-1", name: "Test", email: "test@test.com" },
    });
  });

  // ─── Auth ───────────────────────────────────────────────────────────────────

  describe("getProjectDashboardData", () => {
    it("rejects unauthenticated calls", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { getProjectDashboardData } = await import("./project-dashboard-actions");
      await expect(getProjectDashboardData()).rejects.toThrow("Unauthorized");
    });

    // ─── Hero Stats ─────────────────────────────────────────────────────────

    describe("heroStats", () => {
      it("totalWIPs counts only IN_PROGRESS projects", async () => {
        mockPrisma.project.findMany.mockResolvedValue([
          mockProject({ id: "p1", status: "IN_PROGRESS", stitchesCompleted: 100 }),
          mockProject({ id: "p2", status: "IN_PROGRESS", stitchesCompleted: 200 }),
          mockProject({ id: "p3", status: "UNSTARTED" }),
          mockProject({ id: "p4", status: "FINISHED" }),
          mockProject({ id: "p5", status: "ON_HOLD", stitchesCompleted: 50 }),
        ]);

        const { getProjectDashboardData } = await import("./project-dashboard-actions");
        const result: ProjectDashboardData = await getProjectDashboardData();

        expect(result.heroStats.totalWIPs).toBe(2);
      });

      it("averageProgress computes mean of all WIP progressPercent values, 0 when no WIPs", async () => {
        // Two WIPs: 50% and 80% -> average = 65%
        mockPrisma.project.findMany.mockResolvedValue([
          mockProject({
            id: "p1",
            status: "IN_PROGRESS",
            stitchesCompleted: 5000,
            stitchCount: 10000,
          }),
          mockProject({
            id: "p2",
            status: "IN_PROGRESS",
            stitchesCompleted: 8000,
            stitchCount: 10000,
          }),
          mockProject({ id: "p3", status: "UNSTARTED" }),
        ]);

        const { getProjectDashboardData } = await import("./project-dashboard-actions");
        const result: ProjectDashboardData = await getProjectDashboardData();

        expect(result.heroStats.averageProgress).toBe(65);
      });

      it("averageProgress returns 0 when no WIPs exist", async () => {
        mockPrisma.project.findMany.mockResolvedValue([
          mockProject({ id: "p1", status: "UNSTARTED" }),
        ]);

        const { getProjectDashboardData } = await import("./project-dashboard-actions");
        const result: ProjectDashboardData = await getProjectDashboardData();

        expect(result.heroStats.averageProgress).toBe(0);
      });

      it("closestToCompletion returns the WIP with highest progressPercent, null when no WIPs", async () => {
        mockPrisma.project.findMany.mockResolvedValue([
          mockProject({
            id: "p1",
            status: "IN_PROGRESS",
            stitchesCompleted: 5000,
            stitchCount: 10000,
            chartName: "Half Done",
          }),
          mockProject({
            id: "p2",
            status: "IN_PROGRESS",
            stitchesCompleted: 9000,
            stitchCount: 10000,
            chartName: "Almost Done",
          }),
          mockProject({
            id: "p3",
            status: "FINISHED",
            stitchesCompleted: 10000,
            stitchCount: 10000,
            chartName: "Done",
          }),
        ]);

        const { getProjectDashboardData } = await import("./project-dashboard-actions");
        const result: ProjectDashboardData = await getProjectDashboardData();

        expect(result.heroStats.closestToCompletion).toEqual({
          projectId: "p2",
          name: "Almost Done",
          percent: 90,
        });
      });

      it("closestToCompletion returns null when no WIPs exist", async () => {
        mockPrisma.project.findMany.mockResolvedValue([
          mockProject({ id: "p1", status: "UNSTARTED" }),
        ]);

        const { getProjectDashboardData } = await import("./project-dashboard-actions");
        const result: ProjectDashboardData = await getProjectDashboardData();

        expect(result.heroStats.closestToCompletion).toBeNull();
      });

      it("finishedThisYear counts projects with finishDate in current year", async () => {
        const thisYear = new Date().getFullYear();
        mockPrisma.project.findMany.mockResolvedValue([
          mockProject({
            id: "p1",
            status: "FINISHED",
            finishDate: new Date(`${thisYear}-03-15`),
          }),
          mockProject({
            id: "p2",
            status: "FFO",
            finishDate: new Date(`${thisYear}-01-10`),
          }),
          mockProject({
            id: "p3",
            status: "FINISHED",
            finishDate: new Date(`${thisYear - 1}-12-31`),
          }),
        ]);

        const { getProjectDashboardData } = await import("./project-dashboard-actions");
        const result: ProjectDashboardData = await getProjectDashboardData();

        expect(result.heroStats.finishedThisYear).toBe(2);
      });

      it("finishedAllTime counts all FINISHED + FFO projects", async () => {
        mockPrisma.project.findMany.mockResolvedValue([
          mockProject({ id: "p1", status: "FINISHED" }),
          mockProject({ id: "p2", status: "FFO" }),
          mockProject({ id: "p3", status: "FINISHED" }),
          mockProject({ id: "p4", status: "IN_PROGRESS" }),
        ]);

        const { getProjectDashboardData } = await import("./project-dashboard-actions");
        const result: ProjectDashboardData = await getProjectDashboardData();

        expect(result.heroStats.finishedAllTime).toBe(3);
      });

      it("totalStitchesAllProjects sums stitchesCompleted across every project", async () => {
        mockPrisma.project.findMany.mockResolvedValue([
          mockProject({ id: "p1", stitchesCompleted: 1000 }),
          mockProject({ id: "p2", stitchesCompleted: 2500 }),
          mockProject({ id: "p3", stitchesCompleted: 500 }),
        ]);

        const { getProjectDashboardData } = await import("./project-dashboard-actions");
        const result: ProjectDashboardData = await getProjectDashboardData();

        expect(result.heroStats.totalStitchesAllProjects).toBe(4000);
      });
    });

    // ─── Progress Buckets ───────────────────────────────────────────────────

    describe("progressBuckets", () => {
      it("assigns UNSTARTED project to 'unstarted' bucket", async () => {
        mockPrisma.project.findMany.mockResolvedValue([
          mockProject({ id: "p1", status: "UNSTARTED", stitchesCompleted: 0 }),
        ]);

        const { getProjectDashboardData } = await import("./project-dashboard-actions");
        const result: ProjectDashboardData = await getProjectDashboardData();

        const unstartedBucket = result.progressBuckets.find((b) => b.id === "unstarted");
        expect(unstartedBucket!.count).toBe(1);
        expect(unstartedBucket!.projects[0].projectId).toBe("p1");
      });

      it("assigns KITTING and KITTED projects to 'unstarted' bucket", async () => {
        mockPrisma.project.findMany.mockResolvedValue([
          mockProject({ id: "p1", status: "KITTING" }),
          mockProject({ id: "p2", status: "KITTED" }),
        ]);

        const { getProjectDashboardData } = await import("./project-dashboard-actions");
        const result: ProjectDashboardData = await getProjectDashboardData();

        const unstartedBucket = result.progressBuckets.find((b) => b.id === "unstarted");
        expect(unstartedBucket!.count).toBe(2);
      });

      it("assigns 15% project to '0-25' bucket, 40% to '25-50', 60% to '50-75', 85% to '75-100'", async () => {
        mockPrisma.project.findMany.mockResolvedValue([
          // 15% = 1500/10000
          mockProject({
            id: "p15",
            status: "IN_PROGRESS",
            stitchesCompleted: 1500,
            stitchCount: 10000,
          }),
          // 40% = 4000/10000
          mockProject({
            id: "p40",
            status: "IN_PROGRESS",
            stitchesCompleted: 4000,
            stitchCount: 10000,
          }),
          // 60% = 6000/10000
          mockProject({
            id: "p60",
            status: "IN_PROGRESS",
            stitchesCompleted: 6000,
            stitchCount: 10000,
          }),
          // 85% = 8500/10000
          mockProject({
            id: "p85",
            status: "IN_PROGRESS",
            stitchesCompleted: 8500,
            stitchCount: 10000,
          }),
        ]);

        const { getProjectDashboardData } = await import("./project-dashboard-actions");
        const result: ProjectDashboardData = await getProjectDashboardData();

        const bucket0_25 = result.progressBuckets.find((b) => b.id === "0-25");
        expect(bucket0_25!.projects.some((p) => p.projectId === "p15")).toBe(true);

        const bucket25_50 = result.progressBuckets.find((b) => b.id === "25-50");
        expect(bucket25_50!.projects.some((p) => p.projectId === "p40")).toBe(true);

        const bucket50_75 = result.progressBuckets.find((b) => b.id === "50-75");
        expect(bucket50_75!.projects.some((p) => p.projectId === "p60")).toBe(true);

        const bucket75_100 = result.progressBuckets.find((b) => b.id === "75-100");
        expect(bucket75_100!.projects.some((p) => p.projectId === "p85")).toBe(true);
      });

      it("each bucket has correct label and range strings", async () => {
        mockPrisma.project.findMany.mockResolvedValue([]);

        const { getProjectDashboardData } = await import("./project-dashboard-actions");
        const result: ProjectDashboardData = await getProjectDashboardData();

        const bucketMap = new Map(result.progressBuckets.map((b) => [b.id, b]));

        expect(bucketMap.get("unstarted")!.label).toBe("Unstarted");
        expect(bucketMap.get("unstarted")!.range).toBe("0%");

        expect(bucketMap.get("0-25")!.label).toBe("Just Getting Started");
        expect(bucketMap.get("0-25")!.range).toBe("1-25%");

        expect(bucketMap.get("25-50")!.label).toBe("Making Progress");
        expect(bucketMap.get("25-50")!.range).toBe("25-50%");

        expect(bucketMap.get("50-75")!.label).toBe("Over Halfway");
        expect(bucketMap.get("50-75")!.range).toBe("50-75%");

        expect(bucketMap.get("75-100")!.label).toBe("Almost There");
        expect(bucketMap.get("75-100")!.range).toBe("75-100%");
      });

      it("excludes FINISHED and FFO projects from buckets", async () => {
        mockPrisma.project.findMany.mockResolvedValue([
          mockProject({ id: "p1", status: "FINISHED" }),
          mockProject({ id: "p2", status: "FFO" }),
        ]);

        const { getProjectDashboardData } = await import("./project-dashboard-actions");
        const result: ProjectDashboardData = await getProjectDashboardData();

        const totalInBuckets = result.progressBuckets.reduce((sum, b) => sum + b.count, 0);
        expect(totalInBuckets).toBe(0);
      });
    });

    // ─── Finished Projects ──────────────────────────────────────────────────

    describe("finishedProjects", () => {
      it("includes startToFinishDays calculated as days between startDate and finishDate", async () => {
        mockPrisma.project.findMany.mockResolvedValue([
          mockProject({
            id: "p1",
            status: "FINISHED",
            startDate: new Date("2026-01-01"),
            finishDate: new Date("2026-03-15"),
            stitchesCompleted: 10000,
            stitchCount: 10000,
          }),
        ]);

        const { getProjectDashboardData } = await import("./project-dashboard-actions");
        const result: ProjectDashboardData = await getProjectDashboardData();

        // Jan 1 to Mar 15 = 73 days
        expect(result.finishedProjects[0].startToFinishDays).toBe(73);
      });

      it("startToFinishDays is null when startDate or finishDate is missing", async () => {
        mockPrisma.project.findMany.mockResolvedValue([
          mockProject({
            id: "p1",
            status: "FINISHED",
            startDate: null,
            finishDate: new Date("2026-03-15"),
            stitchesCompleted: 5000,
            stitchCount: 10000,
          }),
        ]);

        const { getProjectDashboardData } = await import("./project-dashboard-actions");
        const result: ProjectDashboardData = await getProjectDashboardData();

        expect(result.finishedProjects[0].startToFinishDays).toBeNull();
      });

      it("includes stitchingDays from distinct session dates", async () => {
        mockPrisma.project.findMany.mockResolvedValue([
          mockProject({
            id: "p1",
            status: "FINISHED",
            stitchesCompleted: 10000,
            stitchCount: 10000,
            sessions: [
              { date: new Date("2026-01-01T10:00:00Z"), stitchCount: 100 },
              { date: new Date("2026-01-01T15:00:00Z"), stitchCount: 50 }, // same day
              { date: new Date("2026-01-02T10:00:00Z"), stitchCount: 200 },
              { date: new Date("2026-01-03T10:00:00Z"), stitchCount: 150 },
            ],
          }),
        ]);

        const { getProjectDashboardData } = await import("./project-dashboard-actions");
        const result: ProjectDashboardData = await getProjectDashboardData();

        // 3 distinct dates (Jan 1, Jan 2, Jan 3)
        expect(result.finishedProjects[0].stitchingDays).toBe(3);
      });

      it("includes threadCount, beadCount, specialtyCount from junction table lengths", async () => {
        mockPrisma.project.findMany.mockResolvedValue([
          mockProject({
            id: "p1",
            status: "FINISHED",
            stitchesCompleted: 10000,
            stitchCount: 10000,
            projectThreads: [{ id: "pt1" }, { id: "pt2" }, { id: "pt3" }],
            projectBeads: [{ id: "pb1" }],
            projectSpecialty: [{ id: "ps1" }, { id: "ps2" }],
          }),
        ]);

        const { getProjectDashboardData } = await import("./project-dashboard-actions");
        const result: ProjectDashboardData = await getProjectDashboardData();

        expect(result.finishedProjects[0].threadCount).toBe(3);
        expect(result.finishedProjects[0].beadCount).toBe(1);
        expect(result.finishedProjects[0].specialtyCount).toBe(2);
      });

      it("computes avgDailyStitches = totalStitches / stitchingDays (0 when no stitching days)", async () => {
        mockPrisma.project.findMany.mockResolvedValue([
          mockProject({
            id: "p1",
            status: "FINISHED",
            stitchesCompleted: 9000,
            stitchCount: 9000,
            sessions: [
              { date: new Date("2026-01-01"), stitchCount: 3000 },
              { date: new Date("2026-01-02"), stitchCount: 3000 },
              { date: new Date("2026-01-03"), stitchCount: 3000 },
            ],
          }),
        ]);

        const { getProjectDashboardData } = await import("./project-dashboard-actions");
        const result: ProjectDashboardData = await getProjectDashboardData();

        // 9000 / 3 = 3000
        expect(result.finishedProjects[0].avgDailyStitches).toBe(3000);
      });

      it("avgDailyStitches is 0 when no sessions (zero stitching days)", async () => {
        mockPrisma.project.findMany.mockResolvedValue([
          mockProject({
            id: "p1",
            status: "FINISHED",
            stitchesCompleted: 5000,
            stitchCount: 5000,
            sessions: [],
          }),
        ]);

        const { getProjectDashboardData } = await import("./project-dashboard-actions");
        const result: ProjectDashboardData = await getProjectDashboardData();

        expect(result.finishedProjects[0].avgDailyStitches).toBe(0);
      });

      it("includes genres from chart", async () => {
        mockPrisma.project.findMany.mockResolvedValue([
          mockProject({
            id: "p1",
            status: "FINISHED",
            stitchesCompleted: 10000,
            stitchCount: 10000,
            genres: [{ name: "Fantasy" }, { name: "Animals" }],
          }),
        ]);

        const { getProjectDashboardData } = await import("./project-dashboard-actions");
        const result: ProjectDashboardData = await getProjectDashboardData();

        expect(result.finishedProjects[0].genres).toEqual(["Fantasy", "Animals"]);
      });

      it("includes fabricDescription from linked fabric", async () => {
        mockPrisma.project.findMany.mockResolvedValue([
          mockProject({
            id: "p1",
            status: "FINISHED",
            stitchesCompleted: 10000,
            stitchCount: 10000,
            fabricName: "White Aida 14ct",
            fabricBrandName: "Zweigart",
          }),
        ]);

        const { getProjectDashboardData } = await import("./project-dashboard-actions");
        const result: ProjectDashboardData = await getProjectDashboardData();

        expect(result.finishedProjects[0].fabricDescription).toBe("Zweigart White Aida 14ct");
      });

      it("sorts finishedProjects by finishDate DESC (most recent first)", async () => {
        mockPrisma.project.findMany.mockResolvedValue([
          mockProject({
            id: "p1",
            status: "FINISHED",
            finishDate: new Date("2026-01-15"),
            chartName: "Older Finish",
            stitchesCompleted: 5000,
            stitchCount: 5000,
          }),
          mockProject({
            id: "p2",
            status: "FINISHED",
            finishDate: new Date("2026-03-20"),
            chartName: "Newer Finish",
            stitchesCompleted: 5000,
            stitchCount: 5000,
          }),
          mockProject({
            id: "p3",
            status: "FFO",
            finishDate: new Date("2026-02-10"),
            chartName: "Middle Finish",
            stitchesCompleted: 5000,
            stitchCount: 5000,
          }),
        ]);

        const { getProjectDashboardData } = await import("./project-dashboard-actions");
        const result: ProjectDashboardData = await getProjectDashboardData();

        expect(result.finishedProjects[0].projectName).toBe("Newer Finish");
        expect(result.finishedProjects[1].projectName).toBe("Middle Finish");
        expect(result.finishedProjects[2].projectName).toBe("Older Finish");
      });
    });

    // ─── Query Security ─────────────────────────────────────────────────────

    describe("security", () => {
      it("all queries filter by userId", async () => {
        mockPrisma.project.findMany.mockResolvedValue([]);

        const { getProjectDashboardData } = await import("./project-dashboard-actions");
        await getProjectDashboardData();

        expect(mockPrisma.project.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: expect.objectContaining({
              userId: "user-1",
            }),
          }),
        );
      });
    });
  });
});
