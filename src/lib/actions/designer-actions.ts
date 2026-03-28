"use server";

import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { designerSchema } from "@/lib/validations/chart";

async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session;
}

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

  return prisma.designer.findMany({ orderBy: { name: "asc" } });
}
