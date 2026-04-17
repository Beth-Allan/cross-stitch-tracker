"use server";

import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { WhatsNextProject, FabricRequirementRow, StorageGroup } from "@/types/session";

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
      const supplies = [...p.projectThreads, ...p.projectBeads, ...p.projectSpecialty];

      // Fabric counts as 1 supply item
      const fabricRequired = 1;
      const fabricAcquired = p.fabric ? 1 : 0;

      const totalRequired = supplies.reduce((s, i) => s + i.quantityRequired, 0) + fabricRequired;
      const totalAcquired =
        supplies.reduce((s, i) => s + Math.min(i.quantityAcquired, i.quantityRequired), 0) +
        fabricAcquired;

      const kittingPercent =
        totalRequired === 0 ? 100 : Math.round((totalAcquired / totalRequired) * 100);

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
    if (a.wantToStartNext !== b.wantToStartNext) return a.wantToStartNext ? -1 : 1;
    if (a.kittingPercent !== b.kittingPercent) return b.kittingPercent - a.kittingPercent;
    return a.dateAdded.getTime() - b.dateAdded.getTime();
  });

  return projects;
}

// ─── Fabric Requirements ──────────────────────────────────────────────────

const MARGIN_PER_SIDE = 3; // inches
const MARGIN_TOTAL = MARGIN_PER_SIDE * 2; // 6 inches

/**
 * Returns all projects with stitch dimensions, calculating required fabric size
 * using the 3" margin-per-side formula and matching against unassigned fabric stash.
 */
export async function getFabricRequirements(): Promise<FabricRequirementRow[]> {
  const user = await requireAuth();

  // Get all projects with stitch dimensions
  const charts = await prisma.chart.findMany({
    where: {
      project: { userId: user.id },
      stitchesWide: { gt: 0 },
      stitchesHigh: { gt: 0 },
    },
    include: {
      designer: { select: { name: true } },
      project: {
        select: {
          id: true,
          fabric: {
            select: {
              id: true,
              name: true,
              count: true,
              shortestEdgeInches: true,
              longestEdgeInches: true,
              brand: { select: { name: true } },
            },
          },
        },
      },
    },
  });

  // Get all unassigned fabrics for matching
  const unassignedFabrics = await prisma.fabric.findMany({
    where: { linkedProjectId: null },
    include: { brand: { select: { name: true } } },
  });

  return charts
    .filter((c) => c.project)
    .map((c) => {
      const p = c.project!;
      const fabricCount = p.fabric?.count ?? null;

      const requiredWidth = fabricCount
        ? Math.round((c.stitchesWide / fabricCount + MARGIN_TOTAL) * 10) / 10
        : null;
      const requiredHeight = fabricCount
        ? Math.round((c.stitchesHigh / fabricCount + MARGIN_TOTAL) * 10) / 10
        : null;

      const assignedFabric = p.fabric
        ? {
            id: p.fabric.id,
            name: p.fabric.name,
            brandName: p.fabric.brand.name,
            count: p.fabric.count,
            shortestEdgeInches: p.fabric.shortestEdgeInches,
            longestEdgeInches: p.fabric.longestEdgeInches,
          }
        : null;

      // Match unassigned fabrics: same count (if known) and check size
      const matchingFabrics =
        fabricCount && requiredWidth && requiredHeight
          ? unassignedFabrics
              .filter((f) => f.count === fabricCount)
              .map((f) => {
                // Compare either edge to required dimensions (fabric can be rotated)
                const fitsWidth =
                  f.shortestEdgeInches >= requiredWidth || f.longestEdgeInches >= requiredWidth;
                const fitsHeight =
                  f.shortestEdgeInches >= requiredHeight || f.longestEdgeInches >= requiredHeight;
                return {
                  id: f.id,
                  name: f.name,
                  brandName: f.brand.name,
                  count: f.count,
                  shortestEdgeInches: f.shortestEdgeInches,
                  longestEdgeInches: f.longestEdgeInches,
                  fitsWidth,
                  fitsHeight,
                };
              })
          : [];

      return {
        chartId: c.id,
        chartName: c.name,
        coverThumbnailUrl: c.coverThumbnailUrl,
        designerName: c.designer?.name ?? null,
        stitchesWide: c.stitchesWide,
        stitchesHigh: c.stitchesHigh,
        totalStitches: c.stitchCount,
        fabricCount,
        fabricName: p.fabric?.name ?? null,
        fabricId: p.fabric?.id ?? null,
        requiredWidth,
        requiredHeight,
        assignedFabric,
        matchingFabrics,
      };
    });
}

// ─── Storage Groups ───────────────────────────────────────────────────────

/**
 * Groups projects by storage location and fabrics into "No Location".
 * Named locations sorted alphabetically, "No Location" always last.
 */
export async function getStorageGroups(): Promise<StorageGroup[]> {
  const user = await requireAuth();

  // Projects with storage locations
  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      status: true,
      storageLocationId: true,
      storageLocation: { select: { id: true, name: true } },
      chart: { select: { id: true, name: true, coverThumbnailUrl: true } },
    },
  });

  // Fabrics (no storageLocationId -- go into "No Location")
  const fabrics = await prisma.fabric.findMany({
    where: {
      OR: [
        { linkedProject: { userId: user.id } },
        { linkedProjectId: null }, // Unassigned fabrics
      ],
    },
    select: {
      id: true,
      name: true,
      count: true,
      brand: { select: { name: true } },
    },
  });

  // Group by storage location
  const groups = new Map<string | null, StorageGroup>();

  for (const p of projects) {
    const locId = p.storageLocationId;
    const locName = p.storageLocation?.name ?? "No Location";

    if (!groups.has(locId)) {
      groups.set(locId, { locationId: locId, locationName: locName, items: [] });
    }

    groups.get(locId)!.items.push({
      type: "project",
      id: p.chart.id, // chartId for navigation
      name: p.chart.name,
      coverThumbnailUrl: p.chart.coverThumbnailUrl,
      status: p.status,
    });
  }

  // Fabrics go into "No Location" group
  if (fabrics.length > 0) {
    if (!groups.has(null)) {
      groups.set(null, {
        locationId: null,
        locationName: "No Location",
        items: [],
      });
    }
    for (const f of fabrics) {
      groups.get(null)!.items.push({
        type: "fabric",
        id: f.id,
        name: f.name,
        coverThumbnailUrl: null,
        fabricCount: f.count,
        brandName: f.brand.name,
      });
    }
  }

  // Sort: named locations alphabetically, "No Location" last
  return Array.from(groups.values()).sort((a, b) => {
    if (a.locationId === null) return 1;
    if (b.locationId === null) return -1;
    return a.locationName.localeCompare(b.locationName);
  });
}

// ─── Assign Fabric to Project ─────────────────────────────────────────────

/**
 * Links a fabric to a project, unlinking any previously linked fabric.
 * T-08-14: Verifies project ownership before linking.
 */
export async function assignFabricToProject(fabricId: string, projectId: string) {
  const user = await requireAuth();

  // Verify project ownership
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      userId: true,
      chartId: true,
      fabric: { select: { id: true } },
    },
  });
  if (!project || project.userId !== user.id) {
    return { success: false as const, error: "Project not found" };
  }

  // Unlink previous fabric if any
  if (project.fabric) {
    await prisma.fabric.update({
      where: { id: project.fabric.id },
      data: { linkedProjectId: null },
    });
  }

  // Link new fabric
  await prisma.fabric.update({
    where: { id: fabricId },
    data: { linkedProjectId: projectId },
  });

  revalidatePath(`/charts/${project.chartId}`);
  revalidatePath("/charts");
  return { success: true as const };
}
