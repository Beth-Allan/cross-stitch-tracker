"use server";

import { z } from "zod";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { genreSchema } from "@/lib/validations/chart";

export async function createGenre(formData: unknown) {
  await requireAuth();

  try {
    const validated = genreSchema.parse(formData);
    const genre = await prisma.genre.create({ data: validated });
    return { success: true as const, genre };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: error.errors[0].message };
    }
    console.error("createGenre error:", error);
    return { success: false as const, error: "Failed to create genre" };
  }
}

export async function getGenres() {
  await requireAuth();

  try {
    return await prisma.genre.findMany({ orderBy: { name: "asc" } });
  } catch (error) {
    console.error("getGenres error:", error);
    return [];
  }
}
