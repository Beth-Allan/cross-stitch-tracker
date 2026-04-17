import { describe, expect, it, vi, beforeEach } from "vitest";
import { createMockPrisma, createMockStitchSession } from "@/__tests__/mocks";

// Mock auth - default to authenticated
const mockAuth = vi.fn();
vi.mock("@/lib/auth", () => ({
  auth: mockAuth,
}));

const mockPrisma = createMockPrisma();
vi.mock("@/lib/db", () => ({
  prisma: mockPrisma,
}));

const mockRevalidatePath = vi.fn();
vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
}));

describe("session-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({
      user: { id: "user-1", name: "Test", email: "test@test.com" },
    });
  });

  // ─── Auth Guard ──────────────────────────────────────────────────────────

  describe("auth guard", () => {
    it("createSession rejects unauthenticated calls", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { createSession } = await import("./session-actions");
      await expect(
        createSession({
          projectId: "proj-1",
          date: "2026-04-10",
          stitchCount: 100,
          timeSpentMinutes: null,
          photoKey: null,
        }),
      ).rejects.toThrow("Unauthorized");
    });

    it("updateSession rejects unauthenticated calls", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { updateSession } = await import("./session-actions");
      await expect(
        updateSession("session-1", {
          projectId: "proj-1",
          date: "2026-04-10",
          stitchCount: 200,
          timeSpentMinutes: null,
          photoKey: null,
        }),
      ).rejects.toThrow("Unauthorized");
    });

    it("deleteSession rejects unauthenticated calls", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { deleteSession } = await import("./session-actions");
      await expect(deleteSession("session-1")).rejects.toThrow("Unauthorized");
    });

    it("getSessionsForProject rejects unauthenticated calls", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { getSessionsForProject } = await import("./session-actions");
      await expect(getSessionsForProject("proj-1")).rejects.toThrow("Unauthorized");
    });

    it("getAllSessions rejects unauthenticated calls", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { getAllSessions } = await import("./session-actions");
      await expect(getAllSessions()).rejects.toThrow("Unauthorized");
    });

    it("getActiveProjectsForPicker rejects unauthenticated calls", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { getActiveProjectsForPicker } = await import("./session-actions");
      await expect(getActiveProjectsForPicker()).rejects.toThrow("Unauthorized");
    });

    it("getProjectSessionStats rejects unauthenticated calls", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { getProjectSessionStats } = await import("./session-actions");
      await expect(getProjectSessionStats("proj-1")).rejects.toThrow("Unauthorized");
    });
  });

  // ─── Ownership Validation ────────────────────────────────────────────────

  describe("ownership validation", () => {
    it("createSession rejects when project belongs to different user", async () => {
      mockPrisma.project.findUnique.mockResolvedValueOnce({
        id: "proj-1",
        userId: "other-user",
        chartId: "chart-1",
        startingStitches: 0,
      });

      const { createSession } = await import("./session-actions");
      const result = await createSession({
        projectId: "proj-1",
        date: "2026-04-10",
        stitchCount: 100,
        timeSpentMinutes: null,
        photoKey: null,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Project not found");
      }
    });

    it("createSession rejects when project does not exist", async () => {
      mockPrisma.project.findUnique.mockResolvedValueOnce(null);

      const { createSession } = await import("./session-actions");
      const result = await createSession({
        projectId: "nonexistent",
        date: "2026-04-10",
        stitchCount: 100,
        timeSpentMinutes: null,
        photoKey: null,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Project not found");
      }
    });

    it("updateSession rejects when session's project belongs to different user", async () => {
      mockPrisma.stitchSession.findUnique.mockResolvedValueOnce({
        ...createMockStitchSession(),
        project: { id: "proj-1", userId: "other-user", chartId: "chart-1", startingStitches: 0 },
      });

      const { updateSession } = await import("./session-actions");
      const result = await updateSession("session-1", {
        projectId: "proj-1",
        date: "2026-04-10",
        stitchCount: 200,
        timeSpentMinutes: null,
        photoKey: null,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Session not found");
      }
    });

    it("deleteSession rejects when session's project belongs to different user", async () => {
      mockPrisma.stitchSession.findUnique.mockResolvedValueOnce({
        ...createMockStitchSession(),
        project: { id: "proj-1", userId: "other-user", chartId: "chart-1", startingStitches: 0 },
      });

      const { deleteSession } = await import("./session-actions");
      const result = await deleteSession("session-1");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Session not found");
      }
    });

    it("getSessionsForProject rejects when project belongs to different user", async () => {
      mockPrisma.project.findUnique.mockResolvedValueOnce({
        id: "proj-1",
        userId: "other-user",
      });

      const { getSessionsForProject } = await import("./session-actions");
      const result = await getSessionsForProject("proj-1");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Project not found");
      }
    });

    it("getProjectSessionStats rejects when project belongs to different user", async () => {
      mockPrisma.project.findUnique.mockResolvedValueOnce({
        id: "proj-1",
        userId: "other-user",
      });

      const { getProjectSessionStats } = await import("./session-actions");
      const result = await getProjectSessionStats("proj-1");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Project not found");
      }
    });
  });

  // ─── Validation ──────────────────────────────────────────────────────────

  describe("validation", () => {
    it("createSession rejects invalid date", async () => {
      const { createSession } = await import("./session-actions");
      const result = await createSession({
        projectId: "proj-1",
        date: "not-a-date",
        stitchCount: 100,
        timeSpentMinutes: null,
        photoKey: null,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeTruthy();
      }
    });

    it("createSession rejects zero stitch count", async () => {
      const { createSession } = await import("./session-actions");
      const result = await createSession({
        projectId: "proj-1",
        date: "2026-04-10",
        stitchCount: 0,
        timeSpentMinutes: null,
        photoKey: null,
      });

      expect(result.success).toBe(false);
    });

    it("createSession rejects empty projectId", async () => {
      const { createSession } = await import("./session-actions");
      const result = await createSession({
        projectId: "",
        date: "2026-04-10",
        stitchCount: 100,
        timeSpentMinutes: null,
        photoKey: null,
      });

      expect(result.success).toBe(false);
    });
  });

  // ─── createSession ──────────────────────────────────────────────────────

  describe("createSession", () => {
    it("creates session and recalculates progress atomically", async () => {
      // Project owned by user-1
      mockPrisma.project.findUnique.mockResolvedValueOnce({
        id: "proj-1",
        userId: "user-1",
        chartId: "chart-1",
        startingStitches: 500,
      });

      const mockSession = createMockStitchSession({ id: "new-session", stitchCount: 100 });

      // Mock the $transaction callback
      mockPrisma.$transaction.mockImplementationOnce(async (cb: (tx: unknown) => unknown) => {
        return cb({
          stitchSession: {
            create: vi.fn().mockResolvedValue(mockSession),
            aggregate: vi.fn().mockResolvedValue({ _sum: { stitchCount: 600 } }),
          },
          project: {
            findUnique: vi.fn().mockResolvedValue({ startingStitches: 500 }),
            update: vi.fn().mockResolvedValue({ stitchesCompleted: 1100 }),
          },
        });
      });

      const { createSession } = await import("./session-actions");
      const result = await createSession({
        projectId: "proj-1",
        date: "2026-04-10",
        stitchCount: 100,
        timeSpentMinutes: 60,
        photoKey: null,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.session).toBeDefined();
      }
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it("calls revalidatePath for charts and sessions", async () => {
      mockPrisma.project.findUnique.mockResolvedValueOnce({
        id: "proj-1",
        userId: "user-1",
        chartId: "chart-1",
        startingStitches: 0,
      });

      const mockSession = createMockStitchSession();
      mockPrisma.$transaction.mockImplementationOnce(async (cb: (tx: unknown) => unknown) => {
        return cb({
          stitchSession: {
            create: vi.fn().mockResolvedValue(mockSession),
            aggregate: vi.fn().mockResolvedValue({ _sum: { stitchCount: 150 } }),
          },
          project: {
            findUnique: vi.fn().mockResolvedValue({ startingStitches: 0 }),
            update: vi.fn().mockResolvedValue({ stitchesCompleted: 150 }),
          },
        });
      });

      const { createSession } = await import("./session-actions");
      await createSession({
        projectId: "proj-1",
        date: "2026-04-10",
        stitchCount: 150,
        timeSpentMinutes: null,
        photoKey: null,
      });

      expect(mockRevalidatePath).toHaveBeenCalledWith("/charts/chart-1");
      expect(mockRevalidatePath).toHaveBeenCalledWith("/sessions");
    });
  });

  // ─── updateSession ─────────────────────────────────────────────────────

  describe("updateSession", () => {
    it("updates session and recalculates progress atomically", async () => {
      // Existing session with its project
      mockPrisma.stitchSession.findUnique.mockResolvedValueOnce({
        ...createMockStitchSession({ id: "session-1" }),
        project: { id: "proj-1", userId: "user-1", chartId: "chart-1", startingStitches: 100 },
      });

      const updatedSession = createMockStitchSession({ id: "session-1", stitchCount: 300 });

      mockPrisma.$transaction.mockImplementationOnce(async (cb: (tx: unknown) => unknown) => {
        return cb({
          stitchSession: {
            update: vi.fn().mockResolvedValue(updatedSession),
            aggregate: vi.fn().mockResolvedValue({ _sum: { stitchCount: 450 } }),
          },
          project: {
            findUnique: vi.fn().mockResolvedValue({ startingStitches: 100 }),
            update: vi.fn().mockResolvedValue({ stitchesCompleted: 550 }),
          },
        });
      });

      const { updateSession } = await import("./session-actions");
      const result = await updateSession("session-1", {
        projectId: "proj-1",
        date: "2026-04-10",
        stitchCount: 300,
        timeSpentMinutes: 90,
        photoKey: null,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.session).toBeDefined();
      }
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it("returns not found when session does not exist", async () => {
      mockPrisma.stitchSession.findUnique.mockResolvedValueOnce(null);

      const { updateSession } = await import("./session-actions");
      const result = await updateSession("nonexistent", {
        projectId: "proj-1",
        date: "2026-04-10",
        stitchCount: 200,
        timeSpentMinutes: null,
        photoKey: null,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Session not found");
      }
    });

    it("calls revalidatePath after update", async () => {
      mockPrisma.stitchSession.findUnique.mockResolvedValueOnce({
        ...createMockStitchSession(),
        project: { id: "proj-1", userId: "user-1", chartId: "chart-1", startingStitches: 0 },
      });

      const updatedSession = createMockStitchSession();
      mockPrisma.$transaction.mockImplementationOnce(async (cb: (tx: unknown) => unknown) => {
        return cb({
          stitchSession: {
            update: vi.fn().mockResolvedValue(updatedSession),
            aggregate: vi.fn().mockResolvedValue({ _sum: { stitchCount: 150 } }),
          },
          project: {
            findUnique: vi.fn().mockResolvedValue({ startingStitches: 0 }),
            update: vi.fn().mockResolvedValue({ stitchesCompleted: 150 }),
          },
        });
      });

      const { updateSession } = await import("./session-actions");
      await updateSession("session-1", {
        projectId: "proj-1",
        date: "2026-04-10",
        stitchCount: 150,
        timeSpentMinutes: null,
        photoKey: null,
      });

      expect(mockRevalidatePath).toHaveBeenCalledWith("/charts/chart-1");
      expect(mockRevalidatePath).toHaveBeenCalledWith("/sessions");
    });
  });

  // ─── deleteSession ─────────────────────────────────────────────────────

  describe("deleteSession", () => {
    it("deletes session and recalculates progress atomically", async () => {
      mockPrisma.stitchSession.findUnique.mockResolvedValueOnce({
        ...createMockStitchSession({ id: "session-1" }),
        project: { id: "proj-1", userId: "user-1", chartId: "chart-1", startingStitches: 200 },
      });

      mockPrisma.$transaction.mockImplementationOnce(async (cb: (tx: unknown) => unknown) => {
        return cb({
          stitchSession: {
            delete: vi.fn().mockResolvedValue({}),
            aggregate: vi.fn().mockResolvedValue({ _sum: { stitchCount: 300 } }),
          },
          project: {
            findUnique: vi.fn().mockResolvedValue({ startingStitches: 200 }),
            update: vi.fn().mockResolvedValue({ stitchesCompleted: 500 }),
          },
        });
      });

      const { deleteSession } = await import("./session-actions");
      const result = await deleteSession("session-1");

      expect(result.success).toBe(true);
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it("returns not found when session does not exist", async () => {
      mockPrisma.stitchSession.findUnique.mockResolvedValueOnce(null);

      const { deleteSession } = await import("./session-actions");
      const result = await deleteSession("nonexistent");

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Session not found");
      }
    });

    it("calls revalidatePath after deletion", async () => {
      mockPrisma.stitchSession.findUnique.mockResolvedValueOnce({
        ...createMockStitchSession(),
        project: { id: "proj-1", userId: "user-1", chartId: "chart-1", startingStitches: 0 },
      });

      mockPrisma.$transaction.mockImplementationOnce(async (cb: (tx: unknown) => unknown) => {
        return cb({
          stitchSession: {
            delete: vi.fn().mockResolvedValue({}),
            aggregate: vi.fn().mockResolvedValue({ _sum: { stitchCount: 0 } }),
          },
          project: {
            findUnique: vi.fn().mockResolvedValue({ startingStitches: 0 }),
            update: vi.fn().mockResolvedValue({ stitchesCompleted: 0 }),
          },
        });
      });

      const { deleteSession } = await import("./session-actions");
      await deleteSession("session-1");

      expect(mockRevalidatePath).toHaveBeenCalledWith("/charts/chart-1");
      expect(mockRevalidatePath).toHaveBeenCalledWith("/sessions");
    });
  });

  // ─── getSessionsForProject ─────────────────────────────────────────────

  describe("getSessionsForProject", () => {
    it("returns sessions for owned project ordered by date desc", async () => {
      mockPrisma.project.findUnique.mockResolvedValueOnce({
        id: "proj-1",
        userId: "user-1",
      });

      const sessions = [
        {
          ...createMockStitchSession({ id: "s1", date: new Date("2026-04-12") }),
          project: { chart: { name: "My Pattern" } },
        },
        {
          ...createMockStitchSession({ id: "s2", date: new Date("2026-04-10") }),
          project: { chart: { name: "My Pattern" } },
        },
      ];
      mockPrisma.stitchSession.findMany.mockResolvedValueOnce(sessions);

      const { getSessionsForProject } = await import("./session-actions");
      const result = await getSessionsForProject("proj-1");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.sessions).toHaveLength(2);
        expect(result.sessions[0].projectName).toBe("My Pattern");
      }
    });
  });

  // ─── getAllSessions ────────────────────────────────────────────────────

  describe("getAllSessions", () => {
    it("returns all sessions for the authenticated user", async () => {
      const sessions = [
        {
          ...createMockStitchSession({ id: "s1", projectId: "proj-1" }),
          project: { id: "proj-1", chart: { id: "chart-1", name: "Pattern A" } },
        },
        {
          ...createMockStitchSession({ id: "s2", projectId: "proj-2" }),
          project: { id: "proj-2", chart: { id: "chart-2", name: "Pattern B" } },
        },
      ];
      mockPrisma.stitchSession.findMany.mockResolvedValueOnce(sessions);

      const { getAllSessions } = await import("./session-actions");
      const result = await getAllSessions();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.sessions).toHaveLength(2);
        expect(result.sessions[0].projectName).toBe("Pattern A");
        expect(result.sessions[1].projectName).toBe("Pattern B");
      }
    });
  });

  // ─── getActiveProjectsForPicker ────────────────────────────────────────

  describe("getActiveProjectsForPicker", () => {
    it("returns only projects with active statuses", async () => {
      const projects = [
        {
          id: "proj-1",
          chartId: "chart-1",
          status: "IN_PROGRESS",
          stitchesCompleted: 500,
          chart: { id: "chart-1", name: "WIP Pattern", coverThumbnailUrl: null, stitchCount: 5000 },
        },
        {
          id: "proj-2",
          chartId: "chart-2",
          status: "KITTED",
          stitchesCompleted: 0,
          chart: {
            id: "chart-2",
            name: "Kitted Pattern",
            coverThumbnailUrl: "/img.jpg",
            stitchCount: 3000,
          },
        },
      ];
      mockPrisma.project.findMany.mockResolvedValueOnce(projects);

      const { getActiveProjectsForPicker } = await import("./session-actions");
      const result = await getActiveProjectsForPicker();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.projects).toHaveLength(2);
        expect(result.projects[0].chartName).toBe("WIP Pattern");
        expect(result.projects[0].status).toBe("IN_PROGRESS");
        expect(result.projects[1].chartName).toBe("Kitted Pattern");
      }
    });

    it("filters by active statuses: IN_PROGRESS, ON_HOLD, KITTING, KITTED", async () => {
      mockPrisma.project.findMany.mockResolvedValueOnce([]);

      const { getActiveProjectsForPicker } = await import("./session-actions");
      await getActiveProjectsForPicker();

      expect(mockPrisma.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: "user-1",
            status: { in: ["IN_PROGRESS", "ON_HOLD", "KITTING", "KITTED"] },
          }),
        }),
      );
    });
  });

  // ─── getProjectSessionStats ────────────────────────────────────────────

  describe("getProjectSessionStats", () => {
    it("returns computed stats for a project with sessions", async () => {
      mockPrisma.project.findUnique.mockResolvedValueOnce({
        id: "proj-1",
        userId: "user-1",
      });

      mockPrisma.stitchSession.aggregate.mockResolvedValueOnce({
        _sum: { stitchCount: 1500 },
        _count: { id: 10 },
        _min: { date: new Date("2026-01-15") },
      });

      const { getProjectSessionStats } = await import("./session-actions");
      const result = await getProjectSessionStats("proj-1");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.stats.totalStitches).toBe(1500);
        expect(result.stats.sessionsLogged).toBe(10);
        expect(result.stats.avgPerSession).toBe(150);
        expect(result.stats.activeSince).toEqual(new Date("2026-01-15"));
      }
    });

    it("returns zero stats for a project with no sessions", async () => {
      mockPrisma.project.findUnique.mockResolvedValueOnce({
        id: "proj-1",
        userId: "user-1",
      });

      mockPrisma.stitchSession.aggregate.mockResolvedValueOnce({
        _sum: { stitchCount: null },
        _count: { id: 0 },
        _min: { date: null },
      });

      const { getProjectSessionStats } = await import("./session-actions");
      const result = await getProjectSessionStats("proj-1");

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.stats.totalStitches).toBe(0);
        expect(result.stats.sessionsLogged).toBe(0);
        expect(result.stats.avgPerSession).toBe(0);
        expect(result.stats.activeSince).toBeNull();
      }
    });
  });
});
