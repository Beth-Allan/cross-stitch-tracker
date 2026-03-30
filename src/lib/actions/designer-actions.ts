"use server";

import { z } from "zod";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { designerSchema } from "@/lib/validations/chart";

export async function createDesigner(formData: unknown) {
  await requireAuth();

  try {
    const validated = designerSchema.parse(formData);
    const designer = await prisma.designer.create({ data: validated });
    return { success: true as const, designer };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: error.errors[0].message };
    }
    console.error("createDesigner error:", error);
    return { success: false as const, error: "Failed to create designer" };
  }
}

export async function getDesigners() {
  await requireAuth();

  try {
    return await prisma.designer.findMany({ orderBy: { name: "asc" } });
  } catch (error) {
    console.error("getDesigners error:", error);
    return [];
  }
}
