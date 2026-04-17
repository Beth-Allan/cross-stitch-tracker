"use server";

import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import type { WhatsNextProject } from "@/types/session";

/**
 * D-07: Only UNSTARTED and KITTED projects.
 * D-08: Ranked by (1) wantToStartNext, (2) kitting %, (3) dateAdded.
 */
export async function getWhatsNextProjects(): Promise<WhatsNextProject[]> {
  const user = await requireAuth();

  const charts = await prisma.chart.findMany({
    where: {
      project: {
        userId: user.id,
        status: { in: ["UNSTARTED", "KITTED"] },
      },
    },
    include: {
      designer: { select: { name: true } },
      project: {
        select: {
          id: true,
          status: true,
          wantToStartNext: true,
          fabric: { select: { id: true } },
          projectThreads: {
            select: { quantityRequired: true, quantityAcquired: true },
          },
          projectBeads: {
            select: { quantityRequired: true, quantityAcquired: true },
          },
          projectSpecialty: {
            select: { quantityRequired: true, quantityAcquired: true },
          },
        },
      },
    },
  });

  const projects: WhatsNextProject[] = charts
    .filter((c) => c.project)
    .map((c) => {
      const p = c.project!;
      const supplies = [
        ...p.projectThreads,
        ...p.projectBeads,
        ...p.projectSpecialty,
      ];

      // Fabric counts as 1 supply item
      const fabricRequired = 1;
      const fabricAcquired = p.fabric ? 1 : 0;

      const totalRequired =
        supplies.reduce((s, i) => s + i.quantityRequired, 0) + fabricRequired;
      const totalAcquired =
        supplies.reduce(
          (s, i) => s + Math.min(i.quantityAcquired, i.quantityRequired),
          0,
        ) + fabricAcquired;

      const kittingPercent =
        totalRequired === 0
          ? 100
          : Math.round((totalAcquired / totalRequired) * 100);

      return {
        chartId: c.id,
        chartName: c.name,
        coverThumbnailUrl: c.coverThumbnailUrl,
        designerName: c.designer?.name ?? null,
        status: p.status,
        wantToStartNext: p.wantToStartNext,
        kittingPercent,
        dateAdded: c.dateAdded,
        totalStitches: c.stitchCount,
      };
    });

  // D-08 ranking: wantToStartNext first, then kitting % desc, then dateAdded asc
  projects.sort((a, b) => {
    if (a.wantToStartNext !== b.wantToStartNext)
      return a.wantToStartNext ? -1 : 1;
    if (a.kittingPercent !== b.kittingPercent)
      return b.kittingPercent - a.kittingPercent;
    return a.dateAdded.getTime() - b.dateAdded.getTime();
  });

  return projects;
}
