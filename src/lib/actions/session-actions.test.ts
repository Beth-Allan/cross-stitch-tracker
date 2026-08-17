import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  createMockPrisma,
  createMockStitchSession,
  assertSuccess,
  assertFailure,
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

const mockRevalidatePath = vi.fn();
const mockRevalidateTag = vi.fn();
vi.mock("next/cache", () => ({
  revalidatePath: mockRevalidatePath,
  revalidateTag: mockRevalidateTag,
}));

const mockProcessAndStoreImage = vi.fn();
const mockDeleteFile = vi.fn().mockResolvedValue({ success: true });
vi.mock("@/lib/actions/upload-actions", () => ({
  processAndStoreImage: (...args: unknown[]) => mockProcessAndStoreImage(...args),
  deleteFile: (...args: unknown[]) => mockDeleteFile(...args),
}));

const mockDetectBrokenRecords = vi.fn().mockResolvedValue([]);
vi.mock("@/lib/queries/stats/record-detection", () => ({
  detectBrokenRecords: (...args: unknown[]) => mockDetectBrokenRecords(...args),
}));

describe("session-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({
      user: { id: "user-1", name: "Test", email: "test@test.com" },
    });
    mockProcessAndStoreImage.mockResolvedValue({
      success: true,
      optimizedKey: "sessions/s1/opt-test.webp",
      thumbnailKey: "sessions/s1/thumb-test.webp",
    });
  });

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

      assertFailure(result);
      expect(result.error).toBe("Project not found");
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

      assertFailure(result);
      expect(result.error).toBe("Project not found");
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

      assertFailure(result);
      expect(result.error).toBe("Session not found");
    });

    it("deleteSession rejects when session's project belongs to different user", async () => {
      mockPrisma.stitchSession.findUnique.mockResolvedValueOnce({
        ...createMockStitchSession(),
        project: { id: "proj-1", userId: "other-user", chartId: "chart-1", startingStitches: 0 },
      });

      const { deleteSession } = await import("./session-actions");
      const result = await deleteSession("session-1");

      assertFailure(result);
      expect(result.error).toBe("Session not found");
    });

    it("getSessionsForProject rejects when project belongs to different user", async () => {
      mockPrisma.project.findUnique.mockResolvedValueOnce({
        id: "proj-1",
        userId: "other-user",
      });

      const { getSessionsForProject } = await import("./session-actions");
      const result = await getSessionsForProject("proj-1");

      assertFailure(result);
      expect(result.error).toBe("Project not found");
    });

    it("getProjectSessionStats rejects when project belongs to different user", async () => {
      mockPrisma.project.findUnique.mockResolvedValueOnce({
        id: "proj-1",
        userId: "other-user",
      });

      const { getProjectSessionStats } = await import("./session-actions");
      const result = await getProjectSessionStats("proj-1");

      assertFailure(result);
      expect(result.error).toBe("Project not found");
    });
  });

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

      assertFailure(result);
      expect(result.error).toBeTruthy();
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

      assertSuccess(result);
      expect(result.session).toBeDefined();
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it("createSession calls revalidatePath and revalidateTag('stats') after successful creation", async () => {
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
      expect(mockRevalidateTag).toHaveBeenCalledWith("stats", { expire: 0 });
    });

    it("optimizes session photo when photoKey is provided", async () => {
      mockPrisma.project.findUnique.mockResolvedValueOnce({
        id: "proj-1",
        userId: "user-1",
        chartId: "chart-1",
        startingStitches: 0,
      });

      const mockSession = createMockStitchSession({
        id: "session-1",
        photoKey: "sessions/p1/raw-photo.jpg",
      });
      mockPrisma.$transaction.mockImplementationOnce(async (cb: (tx: unknown) => unknown) => {
        return cb({
          stitchSession: {
            create: vi.fn().mockResolvedValue(mockSession),
            aggregate: vi.fn().mockResolvedValue({ _sum: { stitchCount: 100 } }),
          },
          project: {
            findUnique: vi.fn().mockResolvedValue({ startingStitches: 0 }),
            update: vi.fn().mockResolvedValue({ stitchesCompleted: 100 }),
          },
        });
      });

      const { createSession } = await import("./session-actions");
      const result = await createSession({
        projectId: "proj-1",
        date: "2026-04-10",
        stitchCount: 100,
        timeSpentMinutes: 60,
        photoKey: "sessions/p1/raw-photo.jpg",
      });

      expect(result.success).toBe(true);
      expect(mockProcessAndStoreImage).toHaveBeenCalledWith(
        "session-1",
        "sessions/p1/raw-photo.jpg",
        "sessions",
      );
      expect(mockPrisma.stitchSession.update).toHaveBeenCalledWith({
        where: { id: "session-1" },
        data: { photoKey: "sessions/s1/opt-test.webp" },
      });
    });

    it("returns success even when photo optimization fails on create", async () => {
      mockProcessAndStoreImage.mockResolvedValueOnce({
        success: false,
        error: "Sharp failed",
      });

      mockPrisma.project.findUnique.mockResolvedValueOnce({
        id: "proj-1",
        userId: "user-1",
        chartId: "chart-1",
        startingStitches: 0,
      });

      const mockSession = createMockStitchSession({
        id: "session-1",
        photoKey: "sessions/p1/raw-photo.jpg",
      });
      mockPrisma.$transaction.mockImplementationOnce(async (cb: (tx: unknown) => unknown) => {
        return cb({
          stitchSession: {
            create: vi.fn().mockResolvedValue(mockSession),
            aggregate: vi.fn().mockResolvedValue({ _sum: { stitchCount: 100 } }),
          },
          project: {
            findUnique: vi.fn().mockResolvedValue({ startingStitches: 0 }),
            update: vi.fn().mockResolvedValue({ stitchesCompleted: 100 }),
          },
        });
      });

      const { createSession } = await import("./session-actions");
      const result = await createSession({
        projectId: "proj-1",
        date: "2026-04-10",
        stitchCount: 100,
        timeSpentMinutes: 60,
        photoKey: "sessions/p1/raw-photo.jpg",
      });

      expect(result.success).toBe(true);
      // photoKey update should NOT have been called since optimization failed
      expect(mockPrisma.stitchSession.update).not.toHaveBeenCalled();
    });

    it("does not optimize when photoKey is null on create", async () => {
      mockPrisma.project.findUnique.mockResolvedValueOnce({
        id: "proj-1",
        userId: "user-1",
        chartId: "chart-1",
        startingStitches: 0,
      });

      const mockSession = createMockStitchSession({ id: "session-1", photoKey: null });
      mockPrisma.$transaction.mockImplementationOnce(async (cb: (tx: unknown) => unknown) => {
        return cb({
          stitchSession: {
            create: vi.fn().mockResolvedValue(mockSession),
            aggregate: vi.fn().mockResolvedValue({ _sum: { stitchCount: 100 } }),
          },
          project: {
            findUnique: vi.fn().mockResolvedValue({ startingStitches: 0 }),
            update: vi.fn().mockResolvedValue({ stitchesCompleted: 100 }),
          },
        });
      });

      const { createSession } = await import("./session-actions");
      await createSession({
        projectId: "proj-1",
        date: "2026-04-10",
        stitchCount: 100,
        timeSpentMinutes: null,
        photoKey: null,
      });

      expect(mockProcessAndStoreImage).not.toHaveBeenCalled();
    });

    it("returns brokenRecords from detectBrokenRecords on success", async () => {
      mockPrisma.project.findUnique.mockResolvedValueOnce({
        id: "proj-1",
        userId: "user-1",
        chartId: "chart-1",
        startingStitches: 0,
      });

      const mockSession = createMockStitchSession({ id: "new-session", stitchCount: 500 });
      mockPrisma.$transaction.mockImplementationOnce(async (cb: (tx: unknown) => unknown) => {
        return cb({
          stitchSession: {
            create: vi.fn().mockResolvedValue(mockSession),
            aggregate: vi.fn().mockResolvedValue({ _sum: { stitchCount: 500 } }),
          },
          project: {
            findUnique: vi.fn().mockResolvedValue({ startingStitches: 0 }),
            update: vi.fn().mockResolvedValue({ stitchesCompleted: 500 }),
          },
        });
      });

      const brokenRecords = [
        {
          type: "bestSession",
          label: "Best Session",
          oldValue: 300,
          newValue: 500,
          unit: "stitches",
        },
      ];
      mockDetectBrokenRecords.mockResolvedValueOnce(brokenRecords);

      const { createSession } = await import("./session-actions");
      const result = await createSession({
        projectId: "proj-1",
        date: "2026-04-10",
        stitchCount: 500,
        timeSpentMinutes: null,
        photoKey: null,
      });

      assertSuccess(result);
      expect(result.brokenRecords).toEqual(brokenRecords);
      expect(mockDetectBrokenRecords).toHaveBeenCalledWith("user-1", {
        date: new Date("2026-04-10"),
        stitchCount: 500,
        projectId: "proj-1",
      });
    });

    it("returns empty brokenRecords when no records broken", async () => {
      mockPrisma.project.findUnique.mockResolvedValueOnce({
        id: "proj-1",
        userId: "user-1",
        chartId: "chart-1",
        startingStitches: 0,
      });

      const mockSession = createMockStitchSession({ id: "new-session", stitchCount: 50 });
      mockPrisma.$transaction.mockImplementationOnce(async (cb: (tx: unknown) => unknown) => {
        return cb({
          stitchSession: {
            create: vi.fn().mockResolvedValue(mockSession),
            aggregate: vi.fn().mockResolvedValue({ _sum: { stitchCount: 50 } }),
          },
          project: {
            findUnique: vi.fn().mockResolvedValue({ startingStitches: 0 }),
            update: vi.fn().mockResolvedValue({ stitchesCompleted: 50 }),
          },
        });
      });

      mockDetectBrokenRecords.mockResolvedValueOnce([]);

      const { createSession } = await import("./session-actions");
      const result = await createSession({
        projectId: "proj-1",
        date: "2026-04-10",
        stitchCount: 50,
        timeSpentMinutes: null,
        photoKey: null,
      });

      assertSuccess(result);
      expect(result.brokenRecords).toEqual([]);
    });

    it("succeeds when detectBrokenRecords throws (non-blocking)", async () => {
      mockPrisma.project.findUnique.mockResolvedValueOnce({
        id: "proj-1",
        userId: "user-1",
        chartId: "chart-1",
        startingStitches: 0,
      });

      const mockSession = createMockStitchSession({ id: "new-session", stitchCount: 100 });
      mockPrisma.$transaction.mockImplementationOnce(async (cb: (tx: unknown) => unknown) => {
        return cb({
          stitchSession: {
            create: vi.fn().mockResolvedValue(mockSession),
            aggregate: vi.fn().mockResolvedValue({ _sum: { stitchCount: 100 } }),
          },
          project: {
            findUnique: vi.fn().mockResolvedValue({ startingStitches: 0 }),
            update: vi.fn().mockResolvedValue({ stitchesCompleted: 100 }),
          },
        });
      });

      mockDetectBrokenRecords.mockRejectedValueOnce(new Error("Prisma connection timeout"));

      const { createSession } = await import("./session-actions");
      const result = await createSession({
        projectId: "proj-1",
        date: "2026-04-10",
        stitchCount: 100,
        timeSpentMinutes: null,
        photoKey: null,
      });

      assertSuccess(result);
      expect(result.brokenRecords).toEqual([]);
    });

    it("logs warning when raw file cleanup fails", async () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      mockPrisma.project.findUnique.mockResolvedValueOnce({
        id: "proj-1",
        userId: "user-1",
        chartId: "chart-1",
        startingStitches: 0,
      });

      const mockSession = createMockStitchSession({
        id: "session-1",
        photoKey: "sessions/p1/raw-photo.jpg",
      });
      mockPrisma.$transaction.mockImplementationOnce(async (cb: (tx: unknown) => unknown) => {
        return cb({
          stitchSession: {
            create: vi.fn().mockResolvedValue(mockSession),
            aggregate: vi.fn().mockResolvedValue({ _sum: { stitchCount: 100 } }),
          },
          project: {
            findUnique: vi.fn().mockResolvedValue({ startingStitches: 0 }),
            update: vi.fn().mockResolvedValue({ stitchesCompleted: 100 }),
          },
        });
      });

      mockDeleteFile.mockRejectedValueOnce(new Error("R2 error"));

      const { createSession } = await import("./session-actions");
      const result = await createSession({
        projectId: "proj-1",
        date: "2026-04-10",
        stitchCount: 100,
        timeSpentMinutes: null,
        photoKey: "sessions/p1/raw-photo.jpg",
      });

      expect(result.success).toBe(true);
      expect(warnSpy).toHaveBeenCalledWith(
        "[R2] raw file cleanup failed:",
        expect.any(String),
        expect.any(Error),
      );

      warnSpy.mockRestore();
    });

    it("returns overTotal warning when session pushes progress past 100%", async () => {
      mockPrisma.project.findUnique.mockResolvedValueOnce({
        id: "proj-1",
        userId: "user-1",
        chartId: "chart-1",
        startingStitches: 0,
        stitchesCompleted: 900,
        chart: { stitchCount: 1000 },
      });

      const mockSession = createMockStitchSession({ id: "new-session", stitchCount: 200 });
      mockPrisma.$transaction.mockImplementationOnce(async (cb: (tx: unknown) => unknown) => {
        return cb({
          stitchSession: {
            create: vi.fn().mockResolvedValue(mockSession),
            aggregate: vi.fn().mockResolvedValue({ _sum: { stitchCount: 1100 } }),
          },
          project: {
            findUnique: vi.fn().mockResolvedValue({ startingStitches: 0 }),
            update: vi.fn().mockResolvedValue({ stitchesCompleted: 1100 }),
          },
        });
      });

      const { createSession } = await import("./session-actions");
      const result = await createSession({
        projectId: "proj-1",
        date: "2026-04-10",
        stitchCount: 200,
        timeSpentMinutes: null,
        photoKey: null,
      });

      assertSuccess(result);
      expect(result.warning).toBe("overTotal");
    });

    it("does not return warning when progress stays under 100%", async () => {
      mockPrisma.project.findUnique.mockResolvedValueOnce({
        id: "proj-1",
        userId: "user-1",
        chartId: "chart-1",
        startingStitches: 0,
        stitchesCompleted: 500,
        chart: { stitchCount: 1000 },
      });

      const mockSession = createMockStitchSession({ id: "new-session", stitchCount: 200 });
      mockPrisma.$transaction.mockImplementationOnce(async (cb: (tx: unknown) => unknown) => {
        return cb({
          stitchSession: {
            create: vi.fn().mockResolvedValue(mockSession),
            aggregate: vi.fn().mockResolvedValue({ _sum: { stitchCount: 700 } }),
          },
          project: {
            findUnique: vi.fn().mockResolvedValue({ startingStitches: 0 }),
            update: vi.fn().mockResolvedValue({ stitchesCompleted: 700 }),
          },
        });
      });

      const { createSession } = await import("./session-actions");
      const result = await createSession({
        projectId: "proj-1",
        date: "2026-04-10",
        stitchCount: 200,
        timeSpentMinutes: null,
        photoKey: null,
      });

      assertSuccess(result);
      expect(result.warning).toBeUndefined();
    });

    it("does not return warning when chart has no stitchCount", async () => {
      mockPrisma.project.findUnique.mockResolvedValueOnce({
        id: "proj-1",
        userId: "user-1",
        chartId: "chart-1",
        startingStitches: 0,
        stitchesCompleted: 900,
        chart: { stitchCount: null },
      });

      const mockSession = createMockStitchSession({ id: "new-session", stitchCount: 200 });
      mockPrisma.$transaction.mockImplementationOnce(async (cb: (tx: unknown) => unknown) => {
        return cb({
          stitchSession: {
            create: vi.fn().mockResolvedValue(mockSession),
            aggregate: vi.fn().mockResolvedValue({ _sum: { stitchCount: 1100 } }),
          },
          project: {
            findUnique: vi.fn().mockResolvedValue({ startingStitches: 0 }),
            update: vi.fn().mockResolvedValue({ stitchesCompleted: 1100 }),
          },
        });
      });

      const { createSession } = await import("./session-actions");
      const result = await createSession({
        projectId: "proj-1",
        date: "2026-04-10",
        stitchCount: 200,
        timeSpentMinutes: null,
        photoKey: null,
      });

      assertSuccess(result);
      expect(result.warning).toBeUndefined();
    });

    it("saves session even when overTotal warning is returned", async () => {
      mockPrisma.project.findUnique.mockResolvedValueOnce({
        id: "proj-1",
        userId: "user-1",
        chartId: "chart-1",
        startingStitches: 0,
        stitchesCompleted: 900,
        chart: { stitchCount: 1000 },
      });

      const mockSession = createMockStitchSession({ id: "new-session", stitchCount: 200 });
      mockPrisma.$transaction.mockImplementationOnce(async (cb: (tx: unknown) => unknown) => {
        return cb({
          stitchSession: {
            create: vi.fn().mockResolvedValue(mockSession),
            aggregate: vi.fn().mockResolvedValue({ _sum: { stitchCount: 1100 } }),
          },
          project: {
            findUnique: vi.fn().mockResolvedValue({ startingStitches: 0 }),
            update: vi.fn().mockResolvedValue({ stitchesCompleted: 1100 }),
          },
        });
      });

      const { createSession } = await import("./session-actions");
      const result = await createSession({
        projectId: "proj-1",
        date: "2026-04-10",
        stitchCount: 200,
        timeSpentMinutes: null,
        photoKey: null,
      });

      assertSuccess(result);
      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(result.warning).toBe("overTotal");
      expect(result.session).toBeDefined();
    });
  });

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

      assertSuccess(result);
      expect(result.session).toBeDefined();
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

      assertFailure(result);
      expect(result.error).toBe("Session not found");
    });

    it("updateSession calls revalidatePath and revalidateTag('stats') after successful update", async () => {
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
      expect(mockRevalidateTag).toHaveBeenCalledWith("stats", { expire: 0 });
    });

    it("returns overTotal warning when updated stitch count pushes past 100%", async () => {
      mockPrisma.stitchSession.findUnique.mockResolvedValueOnce({
        ...createMockStitchSession({ id: "session-1", stitchCount: 50 }),
        project: {
          id: "proj-1",
          userId: "user-1",
          chartId: "chart-1",
          startingStitches: 0,
          stitchesCompleted: 950,
          chart: { stitchCount: 1000 },
        },
      });

      const updatedSession = createMockStitchSession({ id: "session-1", stitchCount: 200 });
      mockPrisma.$transaction.mockImplementationOnce(async (cb: (tx: unknown) => unknown) => {
        return cb({
          stitchSession: {
            update: vi.fn().mockResolvedValue(updatedSession),
            aggregate: vi.fn().mockResolvedValue({ _sum: { stitchCount: 1100 } }),
          },
          project: {
            findUnique: vi.fn().mockResolvedValue({ startingStitches: 0 }),
            update: vi.fn().mockResolvedValue({ stitchesCompleted: 1100 }),
          },
        });
      });

      const { updateSession } = await import("./session-actions");
      const result = await updateSession("session-1", {
        projectId: "proj-1",
        date: "2026-04-10",
        stitchCount: 200,
        timeSpentMinutes: null,
        photoKey: null,
      });

      assertSuccess(result);
      expect(result.warning).toBe("overTotal");
    });

    it("does not return overTotal warning when updated stitch count stays under 100%", async () => {
      mockPrisma.stitchSession.findUnique.mockResolvedValueOnce({
        ...createMockStitchSession({ id: "session-1", stitchCount: 50 }),
        project: {
          id: "proj-1",
          userId: "user-1",
          chartId: "chart-1",
          startingStitches: 0,
          stitchesCompleted: 500,
          chart: { stitchCount: 1000 },
        },
      });

      const updatedSession = createMockStitchSession({ id: "session-1", stitchCount: 100 });
      mockPrisma.$transaction.mockImplementationOnce(async (cb: (tx: unknown) => unknown) => {
        return cb({
          stitchSession: {
            update: vi.fn().mockResolvedValue(updatedSession),
            aggregate: vi.fn().mockResolvedValue({ _sum: { stitchCount: 550 } }),
          },
          project: {
            findUnique: vi.fn().mockResolvedValue({ startingStitches: 0 }),
            update: vi.fn().mockResolvedValue({ stitchesCompleted: 550 }),
          },
        });
      });

      const { updateSession } = await import("./session-actions");
      const result = await updateSession("session-1", {
        projectId: "proj-1",
        date: "2026-04-10",
        stitchCount: 100,
        timeSpentMinutes: null,
        photoKey: null,
      });

      assertSuccess(result);
      expect(result.warning).toBeUndefined();
    });

    it("optimizes new photo on update when photoKey is present", async () => {
      mockPrisma.stitchSession.findUnique.mockResolvedValueOnce({
        ...createMockStitchSession({ id: "session-1" }),
        project: { id: "proj-1", userId: "user-1", chartId: "chart-1", startingStitches: 0 },
      });

      const updatedSession = createMockStitchSession({
        id: "session-1",
        photoKey: "sessions/p1/new-photo.jpg",
      });
      mockPrisma.$transaction.mockImplementationOnce(async (cb: (tx: unknown) => unknown) => {
        return cb({
          stitchSession: {
            update: vi.fn().mockResolvedValue(updatedSession),
            aggregate: vi.fn().mockResolvedValue({ _sum: { stitchCount: 200 } }),
          },
          project: {
            findUnique: vi.fn().mockResolvedValue({ startingStitches: 0 }),
            update: vi.fn().mockResolvedValue({ stitchesCompleted: 200 }),
          },
        });
      });

      const { updateSession } = await import("./session-actions");
      const result = await updateSession("session-1", {
        projectId: "proj-1",
        date: "2026-04-10",
        stitchCount: 200,
        timeSpentMinutes: 90,
        photoKey: "sessions/p1/new-photo.jpg",
      });

      expect(result.success).toBe(true);
      expect(mockProcessAndStoreImage).toHaveBeenCalledWith(
        "session-1",
        "sessions/p1/new-photo.jpg",
        "sessions",
      );
      expect(mockPrisma.stitchSession.update).toHaveBeenCalledWith({
        where: { id: "session-1" },
        data: { photoKey: "sessions/s1/opt-test.webp" },
      });
    });

    it("returns success even when photo optimization fails on update", async () => {
      mockProcessAndStoreImage.mockResolvedValueOnce({
        success: false,
        error: "Sharp failed",
      });

      mockPrisma.stitchSession.findUnique.mockResolvedValueOnce({
        ...createMockStitchSession({ id: "session-1" }),
        project: { id: "proj-1", userId: "user-1", chartId: "chart-1", startingStitches: 0 },
      });

      const updatedSession = createMockStitchSession({
        id: "session-1",
        photoKey: "sessions/p1/new-photo.jpg",
      });
      mockPrisma.$transaction.mockImplementationOnce(async (cb: (tx: unknown) => unknown) => {
        return cb({
          stitchSession: {
            update: vi.fn().mockResolvedValue(updatedSession),
            aggregate: vi.fn().mockResolvedValue({ _sum: { stitchCount: 200 } }),
          },
          project: {
            findUnique: vi.fn().mockResolvedValue({ startingStitches: 0 }),
            update: vi.fn().mockResolvedValue({ stitchesCompleted: 200 }),
          },
        });
      });

      const { updateSession } = await import("./session-actions");
      const result = await updateSession("session-1", {
        projectId: "proj-1",
        date: "2026-04-10",
        stitchCount: 200,
        timeSpentMinutes: 90,
        photoKey: "sessions/p1/new-photo.jpg",
      });

      expect(result.success).toBe(true);
      // photoKey update should NOT have been called since optimization failed
      expect(mockPrisma.stitchSession.update).not.toHaveBeenCalled();
    });

    it("does not optimize when photoKey is unchanged on update", async () => {
      mockPrisma.stitchSession.findUnique.mockResolvedValueOnce({
        ...createMockStitchSession({ id: "session-1", photoKey: "sessions/p1/existing.webp" }),
        project: { id: "proj-1", userId: "user-1", chartId: "chart-1", startingStitches: 0 },
      });

      const updatedSession = createMockStitchSession({
        id: "session-1",
        photoKey: "sessions/p1/existing.webp",
      });
      mockPrisma.$transaction.mockImplementationOnce(async (cb: (tx: unknown) => unknown) => {
        return cb({
          stitchSession: {
            update: vi.fn().mockResolvedValue(updatedSession),
            aggregate: vi.fn().mockResolvedValue({ _sum: { stitchCount: 200 } }),
          },
          project: {
            findUnique: vi.fn().mockResolvedValue({ startingStitches: 0 }),
            update: vi.fn().mockResolvedValue({ stitchesCompleted: 200 }),
          },
        });
      });

      const { updateSession } = await import("./session-actions");
      const result = await updateSession("session-1", {
        projectId: "proj-1",
        date: "2026-04-10",
        stitchCount: 200,
        timeSpentMinutes: 90,
        photoKey: "sessions/p1/existing.webp",
      });

      expect(result.success).toBe(true);
      expect(mockProcessAndStoreImage).not.toHaveBeenCalled();
    });

    it("does not optimize when photoKey is null on update", async () => {
      mockPrisma.stitchSession.findUnique.mockResolvedValueOnce({
        ...createMockStitchSession({ id: "session-1" }),
        project: { id: "proj-1", userId: "user-1", chartId: "chart-1", startingStitches: 0 },
      });

      const updatedSession = createMockStitchSession({ id: "session-1", photoKey: null });
      mockPrisma.$transaction.mockImplementationOnce(async (cb: (tx: unknown) => unknown) => {
        return cb({
          stitchSession: {
            update: vi.fn().mockResolvedValue(updatedSession),
            aggregate: vi.fn().mockResolvedValue({ _sum: { stitchCount: 200 } }),
          },
          project: {
            findUnique: vi.fn().mockResolvedValue({ startingStitches: 0 }),
            update: vi.fn().mockResolvedValue({ stitchesCompleted: 200 }),
          },
        });
      });

      const { updateSession } = await import("./session-actions");
      await updateSession("session-1", {
        projectId: "proj-1",
        date: "2026-04-10",
        stitchCount: 200,
        timeSpentMinutes: null,
        photoKey: null,
      });

      expect(mockProcessAndStoreImage).not.toHaveBeenCalled();
    });

    it("logs warning when raw file cleanup fails on update", async () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      mockPrisma.stitchSession.findUnique.mockResolvedValueOnce({
        ...createMockStitchSession({ id: "session-1" }),
        project: { id: "proj-1", userId: "user-1", chartId: "chart-1", startingStitches: 0 },
      });

      const updatedSession = createMockStitchSession({
        id: "session-1",
        photoKey: "sessions/p1/new-photo.jpg",
      });
      mockPrisma.$transaction.mockImplementationOnce(async (cb: (tx: unknown) => unknown) => {
        return cb({
          stitchSession: {
            update: vi.fn().mockResolvedValue(updatedSession),
            aggregate: vi.fn().mockResolvedValue({ _sum: { stitchCount: 200 } }),
          },
          project: {
            findUnique: vi.fn().mockResolvedValue({ startingStitches: 0 }),
            update: vi.fn().mockResolvedValue({ stitchesCompleted: 200 }),
          },
        });
      });

      mockDeleteFile.mockRejectedValueOnce(new Error("R2 error"));

      const { updateSession } = await import("./session-actions");
      const result = await updateSession("session-1", {
        projectId: "proj-1",
        date: "2026-04-10",
        stitchCount: 200,
        timeSpentMinutes: 90,
        photoKey: "sessions/p1/new-photo.jpg",
      });

      expect(result.success).toBe(true);
      expect(warnSpy).toHaveBeenCalledWith(
        "[R2] raw file cleanup failed:",
        expect.any(String),
        expect.any(Error),
      );

      warnSpy.mockRestore();
    });
  });

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

      assertFailure(result);
      expect(result.error).toBe("Session not found");
    });

    it("deleteSession does not invalidate when the session does not exist", async () => {
      mockPrisma.stitchSession.findUnique.mockResolvedValueOnce(null);

      const { deleteSession } = await import("./session-actions");
      const result = await deleteSession("nonexistent");

      assertFailure(result);
      expect(mockRevalidateTag).not.toHaveBeenCalled();
    });

    it("deleteSession calls revalidatePath and revalidateTag('stats') after successful deletion", async () => {
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
      expect(mockRevalidateTag).toHaveBeenCalledWith("stats", { expire: 0 });
    });

    it("cleans up R2 photo when session has photoKey", async () => {
      mockPrisma.stitchSession.findUnique.mockResolvedValueOnce({
        ...createMockStitchSession({ id: "session-1", photoKey: "sessions/p1/photo.jpg" }),
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
      const result = await deleteSession("session-1");

      expect(result.success).toBe(true);
      expect(mockDeleteFile).toHaveBeenCalledWith("sessions/p1/photo.jpg");
    });

    it("succeeds when photo cleanup fails on delete", async () => {
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      mockPrisma.stitchSession.findUnique.mockResolvedValueOnce({
        ...createMockStitchSession({ id: "session-1", photoKey: "sessions/p1/photo.jpg" }),
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

      mockDeleteFile.mockRejectedValueOnce(new Error("R2 error"));

      const { deleteSession } = await import("./session-actions");
      const result = await deleteSession("session-1");

      expect(result.success).toBe(true);
      expect(warnSpy).toHaveBeenCalledWith(
        "[R2] raw file cleanup failed:",
        expect.any(String),
        expect.any(Error),
      );

      warnSpy.mockRestore();
    });

    it("skips photo cleanup when session has no photoKey", async () => {
      mockPrisma.stitchSession.findUnique.mockResolvedValueOnce({
        ...createMockStitchSession({ id: "session-1", photoKey: null }),
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
      const result = await deleteSession("session-1");

      expect(result.success).toBe(true);
      expect(mockDeleteFile).not.toHaveBeenCalled();
    });
  });

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

      assertSuccess(result);
      expect(result.sessions).toHaveLength(2);
      expect(result.sessions[0].projectName).toBe("My Pattern");
    });
  });

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

      assertSuccess(result);
      expect(result.sessions).toHaveLength(2);
      expect(result.sessions[0].projectName).toBe("Pattern A");
      expect(result.sessions[1].projectName).toBe("Pattern B");
    });
  });

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

      assertSuccess(result);
      expect(result.projects).toHaveLength(2);
      expect(result.projects[0].chartName).toBe("WIP Pattern");
      expect(result.projects[0].status).toBe("IN_PROGRESS");
      expect(result.projects[1].chartName).toBe("Kitted Pattern");
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

      assertSuccess(result);
      expect(result.stats.totalStitches).toBe(1500);
      expect(result.stats.sessionsLogged).toBe(10);
      expect(result.stats.avgPerSession).toBe(150);
      expect(result.stats.activeSince).toEqual(new Date("2026-01-15"));
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

      assertSuccess(result);
      expect(result.stats.totalStitches).toBe(0);
      expect(result.stats.sessionsLogged).toBe(0);
      expect(result.stats.avgPerSession).toBe(0);
      expect(result.stats.activeSince).toBeNull();
    });
  });
});

describe("session-actions — calendar-date convention", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({
      user: { id: "user-1", name: "Test", email: "test@test.com" },
    });
    mockPrisma.project.findUnique.mockResolvedValue({
      id: "proj-1",
      userId: "user-1",
      chartId: "chart-1",
      startingStitches: 0,
      stitchesCompleted: 0,
      chart: { stitchCount: 10000 },
    });
  });

  function stubTransaction(captured: { date?: Date }) {
    mockPrisma.$transaction.mockImplementation(async (cb: (tx: unknown) => unknown) => {
      return cb({
        stitchSession: {
          create: vi.fn().mockImplementation((args: { data: { date: Date } }) => {
            captured.date = args.data.date;
            return Promise.resolve(createMockStitchSession({ date: args.data.date }));
          }),
          update: vi.fn().mockImplementation((args: { data: { date: Date } }) => {
            captured.date = args.data.date;
            return Promise.resolve(createMockStitchSession({ date: args.data.date }));
          }),
          aggregate: vi.fn().mockResolvedValue({ _sum: { stitchCount: 100 } }),
        },
        project: {
          findUnique: vi.fn().mockResolvedValue({ startingStitches: 0 }),
          update: vi.fn().mockResolvedValue({ stitchesCompleted: 100 }),
        },
      });
    });
  }

  it("stores a session date as the UTC-midnight instant of that calendar date", async () => {
    const captured: { date?: Date } = {};
    stubTransaction(captured);

    const { createSession } = await import("./session-actions");
    const result = await createSession({
      projectId: "proj-1",
      date: "2026-08-17",
      stitchCount: 100,
      timeSpentMinutes: null,
      photoKey: null,
    });

    assertSuccess(result);
    expect(captured.date!.toISOString()).toBe("2026-08-17T00:00:00.000Z");
  });

  it("stores a DST-transition date without shifting it", async () => {
    const captured: { date?: Date } = {};
    stubTransaction(captured);

    const { createSession } = await import("./session-actions");
    await createSession({
      projectId: "proj-1",
      date: "2026-03-08",
      stitchCount: 100,
      timeSpentMinutes: null,
      photoKey: null,
    });

    expect(captured.date!.toISOString()).toBe("2026-03-08T00:00:00.000Z");
  });

  it("passes the same instant to record detection", async () => {
    const captured: { date?: Date } = {};
    stubTransaction(captured);

    const { createSession } = await import("./session-actions");
    await createSession({
      projectId: "proj-1",
      date: "2026-08-17",
      stitchCount: 100,
      timeSpentMinutes: null,
      photoKey: null,
    });

    expect(mockDetectBrokenRecords).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({ date: new Date("2026-08-17T00:00:00.000Z") }),
    );
  });

  it("rejects a date that is in the future in the user's timezone", async () => {
    const captured: { date?: Date } = {};
    stubTransaction(captured);

    const { createSession } = await import("./session-actions");
    const result = await createSession({
      projectId: "proj-1",
      date: "2999-01-01",
      stitchCount: 100,
      timeSpentMinutes: null,
      photoKey: null,
    });

    assertFailure(result);
    expect(result.error).toBe("Date cannot be in the future");
  });

  it("rejects tomorrow during the evening hours, when UTC has already rolled over", async () => {
    const captured: { date?: Date } = {};
    stubTransaction(captured);
    // 2026-08-18T01:00Z is 19:00 on 2026-08-17 in Edmonton -- tomorrow is 2026-08-18
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-18T01:00:00.000Z"));

    try {
      const { createSession } = await import("./session-actions");
      const result = await createSession({
        projectId: "proj-1",
        date: "2026-08-18",
        stitchCount: 100,
        timeSpentMinutes: null,
        photoKey: null,
      });

      assertFailure(result);
      expect(result.error).toBe("Date cannot be in the future");
    } finally {
      vi.useRealTimers();
    }
  });

  it("accepts the user's own today during those same evening hours", async () => {
    const captured: { date?: Date } = {};
    stubTransaction(captured);
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-18T01:00:00.000Z"));

    try {
      const { createSession } = await import("./session-actions");
      const result = await createSession({
        projectId: "proj-1",
        date: "2026-08-17",
        stitchCount: 100,
        timeSpentMinutes: null,
        photoKey: null,
      });

      assertSuccess(result);
      expect(captured.date!.toISOString()).toBe("2026-08-17T00:00:00.000Z");
    } finally {
      vi.useRealTimers();
    }
  });

  it("accepts today's date in the user's timezone", async () => {
    const captured: { date?: Date } = {};
    stubTransaction(captured);
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Edmonton",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());

    const { createSession } = await import("./session-actions");
    const result = await createSession({
      projectId: "proj-1",
      date: today,
      stitchCount: 100,
      timeSpentMinutes: null,
      photoKey: null,
    });

    assertSuccess(result);
  });

  it("updateSession stores the calendar date as UTC midnight too", async () => {
    const captured: { date?: Date } = {};
    stubTransaction(captured);
    mockPrisma.stitchSession.findUnique.mockResolvedValue({
      id: "sess-1",
      photoKey: null,
      stitchCount: 50,
      project: {
        id: "proj-1",
        userId: "user-1",
        chartId: "chart-1",
        startingStitches: 0,
        stitchesCompleted: 50,
        chart: { stitchCount: 10000 },
      },
    });

    const { updateSession } = await import("./session-actions");
    const result = await updateSession("sess-1", {
      projectId: "proj-1",
      date: "2026-03-08",
      stitchCount: 100,
      timeSpentMinutes: null,
      photoKey: null,
    });

    assertSuccess(result);
    expect(captured.date!.toISOString()).toBe("2026-03-08T00:00:00.000Z");
  });
});
