"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { genreSchema } from "@/lib/validations/chart";
import type { GenreWithStats, GenreDetail } from "@/types/genre";

export async function createGenre(formData: unknown) {
  await requireAuth();

  try {
    const validated = genreSchema.parse(formData);
    const genre = await prisma.genre.create({ data: validated });
    revalidatePath("/genres");
    return { success: true as const, genre };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: error.errors[0].message };
    }
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return { success: false as const, error: "A genre with that name already exists" };
    }
    console.error("createGenre error:", error);
    return { success: false as const, error: "Failed to create genre" };
  }
}

export async function updateGenre(id: string, formData: unknown) {
  await requireAuth();

  try {
    const validated = genreSchema.parse(formData);
    const genre = await prisma.genre.update({
      where: { id },
      data: validated,
    });
    revalidatePath("/genres");
    revalidatePath(`/genres/${id}`);
    return { success: true as const, genre };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: error.errors[0].message };
    }
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code: string }).code === "P2002"
    ) {
      return { success: false as const, error: "A genre with that name already exists" };
    }
    console.error("updateGenre error:", error);
    return { success: false as const, error: "Failed to update genre" };
  }
}

export async function deleteGenre(id: string) {
  await requireAuth();

  try {
    const genre = await prisma.genre.findUnique({
      where: { id },
      include: { _count: { select: { charts: true } } },
    });
    if (!genre) {
      return { success: false as const, error: "Genre not found" };
    }

    await prisma.$transaction([
      prisma.genre.update({
        where: { id },
        data: { charts: { set: [] } },
      }),
      prisma.genre.delete({ where: { id } }),
    ]);

    revalidatePath("/genres");
    revalidatePath("/charts");
    return { success: true as const };
  } catch (error) {
    console.error("deleteGenre error:", error);
    return { success: false as const, error: "Failed to delete genre" };
  }
}

export async function getGenre(id: string): Promise<GenreDetail | null> {
  await requireAuth();

  const genre = await prisma.genre.findUnique({
    where: { id },
    include: {
      _count: { select: { charts: true } },
      charts: {
        select: {
          id: true,
          name: true,
          coverThumbnailUrl: true,
          stitchCount: true,
          stitchesWide: true,
          stitchesHigh: true,
          project: { select: { status: true, stitchesCompleted: true } },
        },
      },
    },
  });

  if (!genre) return null;

  return {
    id: genre.id,
    name: genre.name,
    chartCount: genre._count.charts,
    charts: genre.charts.map((c) => ({
      id: c.id,
      name: c.name,
      coverThumbnailUrl: c.coverThumbnailUrl,
      stitchCount: c.stitchCount,
      stitchesWide: c.stitchesWide,
      stitchesHigh: c.stitchesHigh,
      status: c.project?.status ?? null,
      stitchesCompleted: c.project?.stitchesCompleted ?? 0,
    })),
  };
}

export async function getGenresWithStats(): Promise<GenreWithStats[]> {
  await requireAuth();

  const genres = await prisma.genre.findMany({
    include: { _count: { select: { charts: true } } },
    orderBy: { name: "asc" },
  });
  return genres.map((g) => ({
    id: g.id,
    name: g.name,
    chartCount: g._count.charts,
  }));
}

export async function getGenres() {
  await requireAuth();

  return await prisma.genre.findMany({ orderBy: { name: "asc" } });
}
