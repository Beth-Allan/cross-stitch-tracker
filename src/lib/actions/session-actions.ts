"use server";

import { cache } from "react";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { sessionFormSchema } from "@/lib/validations/session";
import type {
  StitchSessionRow,
  ActiveProjectForPicker,
  ProjectSessionStats,
} from "@/types/session";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Recalculate stitchesCompleted for a project inside a transaction.
 * Formula: stitchesCompleted = startingStitches + sum(session.stitchCount)
 * Per D-04, startingStitches is fetched inside the transaction to stay atomic.
 */
async function recalculateProgress(tx: Prisma.TransactionClient, projectId: string): Promise<void> {
  const [aggregation, project] = await Promise.all([
    tx.stitchSession.aggregate({
      where: { projectId },
      _sum: { stitchCount: true },
    }),
    tx.project.findUnique({
      where: { id: projectId },
      select: { startingStitches: true },
    }),
  ]);

  const sessionSum = aggregation._sum.stitchCount ?? 0;
  const startingStitches = project?.startingStitches ?? 0;

  await tx.project.update({
    where: { id: projectId },
    data: { stitchesCompleted: startingStitches + sessionSum },
  });
}

// ─── Active Project Statuses ────────────────────────────────────────────────

const ACTIVE_STATUSES = ["IN_PROGRESS", "ON_HOLD", "KITTING", "KITTED"] as const;

// ─── createSession ──────────────────────────────────────────────────────────

export async function createSession(formData: unknown) {
  const user = await requireAuth();

  try {
    const validated = sessionFormSchema.parse(formData);

    // Verify project ownership
    const project = await prisma.project.findUnique({
      where: { id: validated.projectId },
      select: { id: true, userId: true, chartId: true, startingStitches: true },
    });
    if (!project || project.userId !== user.id) {
      return { success: false as const, error: "Project not found" };
    }

    const session = await prisma.$transaction(async (tx) => {
      const created = await tx.stitchSession.create({
        data: {
          projectId: validated.projectId,
          date: new Date(validated.date),
          stitchCount: validated.stitchCount,
          timeSpentMinutes: validated.timeSpentMinutes,
          photoKey: validated.photoKey,
        },
      });

      await recalculateProgress(tx, validated.projectId);

      return created;
    });

    revalidatePath(`/charts/${project.chartId}`);
    revalidatePath("/sessions");
    return { success: true as const, session };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: error.errors[0].message };
    }
    console.error("createSession error:", error);
    return { success: false as const, error: "Failed to create session" };
  }
}

// ─── updateSession ──────────────────────────────────────────────────────────

export async function updateSession(sessionId: string, formData: unknown) {
  const user = await requireAuth();

  try {
    const validated = sessionFormSchema.parse(formData);

    // Find session and verify ownership via project
    const existing = await prisma.stitchSession.findUnique({
      where: { id: sessionId },
      include: {
        project: {
          select: { id: true, userId: true, chartId: true, startingStitches: true },
        },
      },
    });
    if (!existing || !existing.project || existing.project.userId !== user.id) {
      return { success: false as const, error: "Session not found" };
    }

    const projectId = existing.project.id;
    const chartId = existing.project.chartId;

    const session = await prisma.$transaction(async (tx) => {
      const updated = await tx.stitchSession.update({
        where: { id: sessionId },
        data: {
          date: new Date(validated.date),
          stitchCount: validated.stitchCount,
          timeSpentMinutes: validated.timeSpentMinutes,
          photoKey: validated.photoKey,
        },
      });

      await recalculateProgress(tx, projectId);

      return updated;
    });

    revalidatePath(`/charts/${chartId}`);
    revalidatePath("/sessions");
    return { success: true as const, session };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: error.errors[0].message };
    }
    console.error("updateSession error:", error);
    return { success: false as const, error: "Failed to update session" };
  }
}

// ─── deleteSession ──────────────────────────────────────────────────────────

export async function deleteSession(sessionId: string) {
  const user = await requireAuth();

  try {
    // Find session and verify ownership via project
    const existing = await prisma.stitchSession.findUnique({
      where: { id: sessionId },
      include: {
        project: {
          select: { id: true, userId: true, chartId: true, startingStitches: true },
        },
      },
    });
    if (!existing || !existing.project || existing.project.userId !== user.id) {
      return { success: false as const, error: "Session not found" };
    }

    const projectId = existing.project.id;
    const chartId = existing.project.chartId;

    await prisma.$transaction(async (tx) => {
      await tx.stitchSession.delete({
        where: { id: sessionId },
      });

      await recalculateProgress(tx, projectId);
    });

    revalidatePath(`/charts/${chartId}`);
    revalidatePath("/sessions");
    return { success: true as const };
  } catch (error) {
    console.error("deleteSession error:", error);
    return { success: false as const, error: "Failed to delete session" };
  }
}

// ─── getSessionsForProject ──────────────────────────────────────────────────

export async function getSessionsForProject(projectId: string) {
  const user = await requireAuth();

  try {
    // Verify project ownership
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, userId: true },
    });
    if (!project || project.userId !== user.id) {
      return { success: false as const, error: "Project not found" };
    }

    const sessions = await prisma.stitchSession.findMany({
      where: { projectId },
      include: {
        project: {
          include: {
            chart: { select: { name: true } },
          },
        },
      },
      orderBy: { date: "desc" },
    });

    const mapped: StitchSessionRow[] = sessions.map((s) => ({
      id: s.id,
      projectId: s.projectId,
      projectName: s.project.chart.name,
      date: s.date,
      stitchCount: s.stitchCount,
      timeSpentMinutes: s.timeSpentMinutes,
      photoKey: s.photoKey,
      createdAt: s.createdAt,
    }));

    return { success: true as const, sessions: mapped };
  } catch (error) {
    console.error("getSessionsForProject error:", error);
    return { success: false as const, error: "Failed to load sessions" };
  }
}

// ─── getAllSessions ─────────────────────────────────────────────────────────

export async function getAllSessions() {
  const user = await requireAuth();

  try {
    const sessions = await prisma.stitchSession.findMany({
      where: {
        project: { userId: user.id },
      },
      include: {
        project: {
          include: {
            chart: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { date: "desc" },
    });

    const mapped: StitchSessionRow[] = sessions.map((s) => ({
      id: s.id,
      projectId: s.projectId,
      projectName: s.project.chart.name,
      date: s.date,
      stitchCount: s.stitchCount,
      timeSpentMinutes: s.timeSpentMinutes,
      photoKey: s.photoKey,
      createdAt: s.createdAt,
    }));

    return { success: true as const, sessions: mapped };
  } catch (error) {
    console.error("getAllSessions error:", error);
    return { success: false as const, error: "Failed to load sessions" };
  }
}

// ─── getActiveProjectsForPicker ─────────────────────────────────────────────
// Wrapped with React cache() to deduplicate within a single request
// (layout.tsx + page.tsx both call this — cache ensures only one DB query)

export const getActiveProjectsForPicker = cache(async function getActiveProjectsForPicker() {
  const user = await requireAuth();

  try {
    const projects = await prisma.project.findMany({
      where: {
        userId: user.id,
        status: { in: [...ACTIVE_STATUSES] },
      },
      include: {
        chart: {
          select: { id: true, name: true, coverThumbnailUrl: true, stitchCount: true },
        },
      },
      orderBy: { chart: { name: "asc" } },
    });

    const mapped: ActiveProjectForPicker[] = projects.map((p) => ({
      projectId: p.id,
      chartId: p.chart.id,
      chartName: p.chart.name,
      coverThumbnailUrl: p.chart.coverThumbnailUrl,
      status: p.status,
      stitchesCompleted: p.stitchesCompleted,
      totalStitches: p.chart.stitchCount,
    }));

    return { success: true as const, projects: mapped };
  } catch (error) {
    console.error("getActiveProjectsForPicker error:", error);
    return { success: false as const, error: "Failed to load projects" };
  }
});

// ─── getProjectSessionStats ─────────────────────────────────────────────────

export async function getProjectSessionStats(projectId: string) {
  const user = await requireAuth();

  try {
    // Verify project ownership
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, userId: true },
    });
    if (!project || project.userId !== user.id) {
      return { success: false as const, error: "Project not found" };
    }

    const aggregation = await prisma.stitchSession.aggregate({
      where: { projectId },
      _sum: { stitchCount: true },
      _count: { id: true },
      _min: { date: true },
    });

    const totalStitches = aggregation._sum.stitchCount ?? 0;
    const sessionsLogged = aggregation._count.id;
    const avgPerSession = sessionsLogged > 0 ? Math.round(totalStitches / sessionsLogged) : 0;
    const activeSince = aggregation._min.date ?? null;

    const stats: ProjectSessionStats = {
      totalStitches,
      sessionsLogged,
      avgPerSession,
      activeSince,
    };

    return { success: true as const, stats };
  } catch (error) {
    console.error("getProjectSessionStats error:", error);
    return { success: false as const, error: "Failed to load session stats" };
  }
}
