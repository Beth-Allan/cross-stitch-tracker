"use server";

import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { calculateRequiredFabricSize, classifyFabricFit } from "@/lib/utils/fabric-calculator";
import { revalidatePath } from "next/cache";
import type { WhatsNextProject, FabricRequirementRow, StorageGroup } from "@/types/session";

/**
 * Only UNSTARTED and KITTED projects.
 * Ranked by (1) wantToStartNext, (2) kitting %, (3) dateAdded.
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

      const hasSupplyItems = supplies.length > 0;
      const kittingPercent = !hasSupplyItems
        ? 0
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

  // Ranking: wantToStartNext first, then kitting % desc, then dateAdded asc
  projects.sort((a, b) => {
    if (a.wantToStartNext !== b.wantToStartNext) return a.wantToStartNext ? -1 : 1;
    if (a.kittingPercent !== b.kittingPercent) return b.kittingPercent - a.kittingPercent;
    return a.dateAdded.getTime() - b.dateAdded.getTime();
  });

  return projects;
}

/**
 * Returns all projects with stitch dimensions, calculating required fabric size with
 * `fabric-calculator.ts` and matching against the unassigned fabric stash.
 *
 * A project with no fabric assigned is matched against every unassigned piece, each judged at
 * its own count; a project with fabric assigned is matched against pieces of that same count.
 * Either way only pieces that actually fit are returned (Beth's ruling, 2026-08-17, FAB-006).
 *
 * Every size here — the project's own requirement and each candidate's — divides by the
 * project's `overCount` (FAB-004). The count comes from the fabric, the over-count from the
 * project, including in the no-assigned-fabric branch: over-count is how Beth stitches this
 * project, not a property of the piece she might buy for it, and inferring one from the fabric
 * is open question Q-002.
 *
 * A piece with no size recorded cannot be judged either way, so it is counted rather than
 * silently dropped — otherwise an unmeasured stash reads as "nothing you own fits".
 *
 * A piece that misses the project's requirement but would have covered the over-one one comes
 * back in `overOneOnlyFabrics` rather than being hidden (FAB-007): a project may not have a
 * settled over-count, so dropping the piece assumes a decision Beth has not made. It is a
 * qualifier, never a match — `matchingFabrics` stays keyed to the project's own over-count.
 * Both branches get it, assigned fabric or not: over-count is the project's setting either way,
 * and FAB-006 states its fit rule for both halves alike.
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
          overCount: true,
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
      // Prisma types overCount as Int; the write boundary constrains it to the domain's 1 | 2.
      const overCount = p.overCount as 1 | 2;
      const fabricCount = p.fabric?.count ?? null;
      // A count of 0 is nonsense data the validation boundary forbids; treat it as no count at
      // all rather than dividing by it.
      const usableCount = fabricCount !== null && fabricCount > 0 ? fabricCount : null;

      const required =
        usableCount === null
          ? null
          : calculateRequiredFabricSize(c.stitchesWide, c.stitchesHigh, usableCount, overCount);
      const requiredWidth = required?.requiredWidthInches ?? null;
      const requiredHeight = required?.requiredHeightInches ?? null;

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

      const candidates =
        usableCount === null
          ? unassignedFabrics
          : unassignedFabrics.filter((f) => f.count === usableCount);

      const measurable = candidates.filter(
        (f) => f.count > 0 && f.shortestEdgeInches > 0 && f.longestEdgeInches > 0,
      );
      const unmeasuredCandidateCount = candidates.length - measurable.length;

      const toCandidate = (f: (typeof measurable)[number]) => ({
        id: f.id,
        name: f.name,
        brandName: f.brand.name,
        count: f.count,
        shortestEdgeInches: f.shortestEdgeInches,
        longestEdgeInches: f.longestEdgeInches,
      });

      const judged = measurable.map((f) => ({
        fabric: f,
        state: classifyFabricFit(f, c.stitchesWide, c.stitchesHigh, f.count, overCount),
      }));

      const matchingFabrics = judged
        .filter((j) => j.state === "fits")
        .map((j) => toCandidate(j.fabric));
      const overOneOnlyFabrics = judged
        .filter((j) => j.state === "fits-over-one-only")
        .map((j) => toCandidate(j.fabric));

      return {
        chartId: c.id,
        projectId: p.id,
        chartName: c.name,
        coverThumbnailUrl: c.coverThumbnailUrl,
        designerName: c.designer?.name ?? null,
        stitchesWide: c.stitchesWide,
        stitchesHigh: c.stitchesHigh,
        totalStitches: c.stitchCount,
        fabricCount,
        overCount,
        fabricName: p.fabric?.name ?? null,
        fabricId: p.fabric?.id ?? null,
        requiredWidth,
        requiredHeight,
        assignedFabric,
        matchingFabrics,
        overOneOnlyFabrics,
        unmeasuredCandidateCount,
      };
    });
}

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

/**
 * Links a fabric to a project, unlinking any previously linked fabric.
 * Verifies project ownership before linking.
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

  // Atomic unlink + availability check + link (WR-01, WR-03)
  try {
    await prisma.$transaction(async (tx) => {
      // Check fabric is not already linked to another project (WR-03)
      const fabric = await tx.fabric.findUnique({
        where: { id: fabricId },
        select: { linkedProjectId: true },
      });
      if (fabric?.linkedProjectId && fabric.linkedProjectId !== projectId) {
        throw new Error("FABRIC_ALREADY_LINKED");
      }

      // Unlink previous fabric if any
      if (project.fabric && project.fabric.id !== fabricId) {
        await tx.fabric.update({
          where: { id: project.fabric.id },
          data: { linkedProjectId: null },
        });
      }

      // Link new fabric
      await tx.fabric.update({
        where: { id: fabricId },
        data: { linkedProjectId: projectId },
      });
    });
  } catch (error) {
    if (error instanceof Error && error.message === "FABRIC_ALREADY_LINKED") {
      return { success: false as const, error: "Fabric is already assigned to another project" };
    }
    console.error("assignFabricToProject error:", error);
    return { success: false as const, error: "Failed to assign fabric" };
  }

  revalidatePath(`/charts/${project.chartId}`);
  revalidatePath("/charts");
  return { success: true as const };
}
