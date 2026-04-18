"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import type { ShoppingCartData } from "@/types/dashboard";

// ─── Validation ─────────────────────────────────────────────────────────────

const updateSupplyAcquiredSchema = z.object({
  type: z.enum(["thread", "bead", "specialty"]),
  junctionId: z.string().min(1),
  acquiredQuantity: z.number().int().min(0),
});

// ─── Shopping Cart Data ─────────────────────────────────────────────────────

export async function getShoppingCartData(): Promise<ShoppingCartData> {
  const user = await requireAuth();

  const projects = await prisma.project.findMany({
    where: {
      userId: user.id,
      status: { notIn: ["FINISHED", "FFO"] },
    },
    include: {
      chart: {
        select: {
          name: true,
          stitchesWide: true,
          stitchesHigh: true,
          coverThumbnailUrl: true,
          designer: { select: { name: true } },
        },
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
      fabric: { select: { name: true } },
    },
  });

  const cartProjects = projects.map((p) => ({
    projectId: p.id,
    chartId: p.chartId,
    projectName: p.chart.name,
    designerName: p.chart.designer?.name ?? null,
    coverThumbnailUrl: p.chart.coverThumbnailUrl,
    status: p.status,
    threadCount: p.projectThreads.length,
    beadCount: p.projectBeads.length,
    specialtyCount: p.projectSpecialty.length,
    fabricNeeded: !p.fabric && p.chart.stitchesWide > 0 && p.chart.stitchesHigh > 0,
  }));

  const threads = projects.flatMap((p) =>
    p.projectThreads.map((pt) => ({
      junctionId: pt.id,
      supplyId: pt.threadId,
      brandName: pt.thread.brand.name,
      code: pt.thread.colorCode,
      colorName: pt.thread.colorName,
      hexColor: pt.thread.hexColor,
      quantityRequired: pt.quantityRequired,
      quantityAcquired: pt.quantityAcquired,
      unit: "skeins",
      projectId: p.id,
      projectName: p.chart.name,
    })),
  );

  const beads = projects.flatMap((p) =>
    p.projectBeads.map((pb) => ({
      junctionId: pb.id,
      supplyId: pb.beadId,
      brandName: pb.bead.brand.name,
      code: pb.bead.productCode,
      colorName: pb.bead.colorName,
      hexColor: pb.bead.hexColor,
      quantityRequired: pb.quantityRequired,
      quantityAcquired: pb.quantityAcquired,
      unit: "packs",
      projectId: p.id,
      projectName: p.chart.name,
    })),
  );

  const specialty = projects.flatMap((p) =>
    p.projectSpecialty.map((ps) => ({
      junctionId: ps.id,
      supplyId: ps.specialtyItemId,
      brandName: ps.specialtyItem.brand.name,
      code: ps.specialtyItem.productCode,
      colorName: ps.specialtyItem.colorName,
      hexColor: ps.specialtyItem.hexColor,
      quantityRequired: ps.quantityRequired,
      quantityAcquired: ps.quantityAcquired,
      unit: "packs",
      projectId: p.id,
      projectName: p.chart.name,
    })),
  );

  const fabrics = projects
    .filter((p) => !p.fabric && p.chart.stitchesWide > 0 && p.chart.stitchesHigh > 0)
    .map((p) => ({
      projectId: p.id,
      projectName: p.chart.name,
      stitchesWide: p.chart.stitchesWide,
      stitchesHigh: p.chart.stitchesHigh,
      hasFabric: false,
      fabricName: null,
    }));

  return { projects: cartProjects, threads, beads, specialty, fabrics };
}

// ─── Update Supply Acquired ─────────────────────────────────────────────────

export async function updateSupplyAcquired(
  type: "thread" | "bead" | "specialty",
  junctionId: string,
  acquiredQuantity: number,
): Promise<{ success: true } | { success: false; error: string }> {
  const user = await requireAuth();

  // Validate input
  const parseResult = updateSupplyAcquiredSchema.safeParse({
    type,
    junctionId,
    acquiredQuantity,
  });
  if (!parseResult.success) {
    return { success: false, error: parseResult.error.errors[0].message };
  }

  try {
    // Look up junction record with project ownership check
    let record: { id: string; project: { userId: string } } | null = null;

    if (type === "thread") {
      record = await prisma.projectThread.findUnique({
        where: { id: junctionId },
        include: { project: { select: { userId: true } } },
      });
    } else if (type === "bead") {
      record = await prisma.projectBead.findUnique({
        where: { id: junctionId },
        include: { project: { select: { userId: true } } },
      });
    } else {
      record = await prisma.projectSpecialty.findUnique({
        where: { id: junctionId },
        include: { project: { select: { userId: true } } },
      });
    }

    if (!record) {
      return { success: false, error: "Record not found" };
    }

    // IDOR protection: verify ownership
    if (record.project.userId !== user.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Update quantity
    if (type === "thread") {
      await prisma.projectThread.update({
        where: { id: junctionId },
        data: { quantityAcquired: acquiredQuantity },
      });
    } else if (type === "bead") {
      await prisma.projectBead.update({
        where: { id: junctionId },
        data: { quantityAcquired: acquiredQuantity },
      });
    } else {
      await prisma.projectSpecialty.update({
        where: { id: junctionId },
        data: { quantityAcquired: acquiredQuantity },
      });
    }

    revalidatePath("/shopping");
    return { success: true };
  } catch (error) {
    console.error("updateSupplyAcquired error:", error);
    return { success: false, error: "Failed to update supply" };
  }
}
