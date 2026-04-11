"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";

// ─── Types ───────────────────────────────────────────────────────────────────

export type ShoppingListProject = {
  projectId: string;
  projectName: string;
  projectStatus: string;
  unfulfilledThreads: Array<{
    id: string;
    threadId: string;
    quantityRequired: number;
    quantityAcquired: number;
    thread: {
      colorCode: string;
      colorName: string;
      hexColor: string;
      brand: { name: string };
    };
  }>;
  unfulfilledBeads: Array<{
    id: string;
    beadId: string;
    quantityRequired: number;
    quantityAcquired: number;
    bead: {
      productCode: string;
      colorName: string;
      hexColor: string;
      brand: { name: string };
    };
  }>;
  unfulfilledSpecialty: Array<{
    id: string;
    specialtyItemId: string;
    quantityRequired: number;
    quantityAcquired: number;
    specialtyItem: {
      productCode: string;
      colorName: string;
      brand: { name: string };
    };
  }>;
  needsFabric: boolean;
  fabricNeeds: { count: number; widthInches: number; heightInches: number } | null;
};

// ─── Shopping List Query ─────────────────────────────────────────────────────

export async function getShoppingList(): Promise<ShoppingListProject[]> {
  await requireAuth();

  // Single query with eager loading per Research Pattern 4
  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { projectThreads: { some: {} } },
        { projectBeads: { some: {} } },
        { projectSpecialty: { some: {} } },
      ],
    },
    include: {
      chart: {
        select: { name: true, stitchesWide: true, stitchesHigh: true },
      },
      projectThreads: {
        include: { thread: { include: { brand: true } } },
      },
      projectBeads: {
        include: { bead: { include: { brand: true } } },
      },
      projectSpecialty: {
        include: { specialtyItem: { include: { brand: true } } },
      },
      fabric: true,
    },
  });

  return projects
    .map((p) => {
      const unfulfilledThreads = p.projectThreads.filter(
        (pt) => pt.quantityAcquired < pt.quantityRequired,
      );
      const unfulfilledBeads = p.projectBeads.filter(
        (pb) => pb.quantityAcquired < pb.quantityRequired,
      );
      const unfulfilledSpecialty = p.projectSpecialty.filter(
        (ps) => ps.quantityAcquired < ps.quantityRequired,
      );
      const needsFabric =
        !p.fabric &&
        p.chart.stitchesWide > 0 &&
        p.chart.stitchesHigh > 0;

      return {
        projectId: p.id,
        projectName: p.chart.name,
        projectStatus: p.status,
        unfulfilledThreads,
        unfulfilledBeads,
        unfulfilledSpecialty,
        needsFabric,
        fabricNeeds: needsFabric
          ? {
              count: 14,
              widthInches: p.chart.stitchesWide,
              heightInches: p.chart.stitchesHigh,
            }
          : null,
      };
    })
    .filter(
      (p) =>
        p.unfulfilledThreads.length > 0 ||
        p.unfulfilledBeads.length > 0 ||
        p.unfulfilledSpecialty.length > 0 ||
        p.needsFabric,
    );
}

// ─── Fulfillment ─────────────────────────────────────────────────────────────

export async function markSupplyAcquired(
  type: "thread" | "bead" | "specialty",
  junctionId: string,
) {
  await requireAuth();

  try {
    if (type === "thread") {
      const record = await prisma.projectThread.findUnique({
        where: { id: junctionId },
      });
      if (!record) return { success: false as const, error: "Record not found" };
      await prisma.projectThread.update({
        where: { id: junctionId },
        data: { quantityAcquired: record.quantityRequired },
      });
    } else if (type === "bead") {
      const record = await prisma.projectBead.findUnique({
        where: { id: junctionId },
      });
      if (!record) return { success: false as const, error: "Record not found" };
      await prisma.projectBead.update({
        where: { id: junctionId },
        data: { quantityAcquired: record.quantityRequired },
      });
    } else {
      const record = await prisma.projectSpecialty.findUnique({
        where: { id: junctionId },
      });
      if (!record) return { success: false as const, error: "Record not found" };
      await prisma.projectSpecialty.update({
        where: { id: junctionId },
        data: { quantityAcquired: record.quantityRequired },
      });
    }

    revalidatePath("/shopping");
    return { success: true as const };
  } catch (error) {
    console.error("markSupplyAcquired error:", error);
    return { success: false as const, error: "Failed to mark as acquired" };
  }
}
