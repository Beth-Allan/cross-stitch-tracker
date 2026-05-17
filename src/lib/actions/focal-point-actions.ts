"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { updateFocalPointSchema } from "@/lib/validations/focal-point";

export async function updateFocalPoint(chartId: string, x: number | null, y: number | null) {
  const user = await requireAuth();

  try {
    const validated = updateFocalPointSchema.parse({ chartId, x, y });

    const chart = await prisma.chart.findUnique({
      where: { id: validated.chartId },
      include: { project: { select: { userId: true } } },
    });
    if (!chart || !chart.project || chart.project.userId !== user.id) {
      return { success: false as const, error: "Chart not found" };
    }

    await prisma.chart.update({
      where: { id: validated.chartId },
      data: { focalPointX: validated.x, focalPointY: validated.y },
    });

    revalidatePath("/charts");
    revalidatePath(`/charts/${validated.chartId}`);
    revalidatePath("/");
    revalidatePath("/designers");
    revalidatePath("/genres");
    revalidatePath("/shopping");

    return { success: true as const };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: error.errors[0].message };
    }
    console.error("updateFocalPoint error:", error);
    return { success: false as const, error: "Failed to update focal point" };
  }
}
