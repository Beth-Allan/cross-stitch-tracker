"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";

// ─── Types ───────────────────────────────────────────────────────────────────

export type ShoppingListProject = {
  projectId: string;
  chartId: string;
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
  fabricNeeds: Array<{
    label: string;
    count: number;
    widthInches: number;
    heightInches: number;
  }> | null;
};

// ─── Fabric Count Reference ─────────────────────────────────────────────────

const FABRIC_COUNT_OPTIONS = [
  { label: "14 / 28 over 2", count: 14 },
  { label: "16 / 32 over 2", count: 16 },
  { label: "18 / 36 over 2", count: 18 },
  { label: "20 / 40 over 2", count: 20 },
  { label: "22", count: 22 },
  { label: "25", count: 25 },
] as const;

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
      const needsFabric = !p.fabric && p.chart.stitchesWide > 0 && p.chart.stitchesHigh > 0;

      return {
        projectId: p.id,
        chartId: p.chartId,
        projectName: p.chart.name,
        projectStatus: p.status,
        unfulfilledThreads,
        unfulfilledBeads,
        unfulfilledSpecialty,
        needsFabric,
        fabricNeeds: needsFabric
          ? FABRIC_COUNT_OPTIONS.map(({ label, count }) => ({
              label,
              count,
              widthInches: Math.ceil(p.chart.stitchesWide / count) + 6,
              heightInches: Math.ceil(p.chart.stitchesHigh / count) + 6,
            }))
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
