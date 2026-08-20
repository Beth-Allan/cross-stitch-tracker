import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";

/**
 * One project's standing in one junction table, as the kitting rule reads it.
 *
 * `acquired` is `Σ min(quantityAcquired, quantityRequired)` — capped per row, never against the
 * project total, so a surplus of one supply cannot cover a shortfall in another. A bare
 * `_sum: { quantityAcquired: true }` does not reproduce it.
 */
export type SupplyRollup = {
  count: number;
  required: number;
  acquired: number;
  allFulfilled: boolean;
  anyAcquired: boolean;
};

export type ProjectSupplies = {
  threads: SupplyRollup;
  beads: SupplyRollup;
  specialty: SupplyRollup;
};

const EMPTY_ROLLUP: SupplyRollup = {
  count: 0,
  required: 0,
  acquired: 0,
  // Vacuously true, exactly as `[].every(...)` was: a junction with no rows is "not applicable"
  // at every surface that reads it, and the count is what decides that.
  allFulfilled: true,
  anyAcquired: false,
};

export const EMPTY_PROJECT_SUPPLIES: ProjectSupplies = {
  threads: EMPTY_ROLLUP,
  beads: EMPTY_ROLLUP,
  specialty: EMPTY_ROLLUP,
};

type TotalsGroup = {
  projectId: string;
  _count: { _all: number };
  _sum: { quantityRequired: number | null };
  _max: { quantityAcquired: number | null };
};

type ShortfallGroup = {
  projectId: string;
  _sum: { quantityRequired: number | null; quantityAcquired: number | null };
};

/**
 * Folds one junction's two group reads into a rollup per project.
 *
 * The capped total comes out of the two sums by identity rather than by row inspection:
 * `Σ min(a, r) = Σ r − Σ_{a < r} (r − a)`, so the rows that are already fulfilled need no
 * arithmetic and the shortfall read supplies the rest.
 *
 * `anyAcquired` reads `_max`, not `_sum`: a maximum above zero means some row has been started
 * whatever the other rows hold, which a sum only reproduces while every quantity is non-negative
 * — a rule the write boundary enforces and the database does not.
 */
function foldJunction(
  totals: TotalsGroup[],
  shortfalls: ShortfallGroup[],
): Map<string, SupplyRollup> {
  const shortfallByProject = new Map(shortfalls.map((s) => [s.projectId, s]));

  return new Map(
    totals.map((group) => {
      const required = group._sum.quantityRequired ?? 0;
      const shortfall = shortfallByProject.get(group.projectId);
      const outstanding = shortfall
        ? (shortfall._sum.quantityRequired ?? 0) - (shortfall._sum.quantityAcquired ?? 0)
        : 0;

      return [
        group.projectId,
        {
          count: group._count._all,
          required,
          acquired: required - outstanding,
          allFulfilled: shortfall === undefined,
          anyAcquired: (group._max.quantityAcquired ?? 0) > 0,
        },
      ];
    }),
  );
}

/**
 * The kitting figures for every project matching `project`, one group row per project per
 * junction instead of every junction row.
 *
 * Six reads, not three: each junction needs its totals and — separately — the rows still short,
 * because no single aggregate can both sum a column and count rows against another column.
 * A project with no supply rows at all is absent from the map; callers fall back to
 * `EMPTY_PROJECT_SUPPLIES`, which is what an empty junction array used to mean.
 */
export async function summariseProjectSupplies(
  project: Prisma.ProjectWhereInput,
): Promise<Map<string, ProjectSupplies>> {
  const [
    threadTotals,
    threadShortfalls,
    beadTotals,
    beadShortfalls,
    specialtyTotals,
    specialtyShortfalls,
  ] = await Promise.all([
    prisma.projectThread.groupBy({
      by: ["projectId"],
      where: { project },
      _count: { _all: true },
      _sum: { quantityRequired: true },
      _max: { quantityAcquired: true },
    }),
    prisma.projectThread.groupBy({
      by: ["projectId"],
      where: { project, quantityAcquired: { lt: prisma.projectThread.fields.quantityRequired } },
      _sum: { quantityRequired: true, quantityAcquired: true },
    }),
    prisma.projectBead.groupBy({
      by: ["projectId"],
      where: { project },
      _count: { _all: true },
      _sum: { quantityRequired: true },
      _max: { quantityAcquired: true },
    }),
    prisma.projectBead.groupBy({
      by: ["projectId"],
      where: { project, quantityAcquired: { lt: prisma.projectBead.fields.quantityRequired } },
      _sum: { quantityRequired: true, quantityAcquired: true },
    }),
    prisma.projectSpecialty.groupBy({
      by: ["projectId"],
      where: { project },
      _count: { _all: true },
      _sum: { quantityRequired: true },
      _max: { quantityAcquired: true },
    }),
    prisma.projectSpecialty.groupBy({
      by: ["projectId"],
      where: {
        project,
        quantityAcquired: { lt: prisma.projectSpecialty.fields.quantityRequired },
      },
      _sum: { quantityRequired: true, quantityAcquired: true },
    }),
  ]);

  const threads = foldJunction(threadTotals, threadShortfalls);
  const beads = foldJunction(beadTotals, beadShortfalls);
  const specialty = foldJunction(specialtyTotals, specialtyShortfalls);

  const supplies = new Map<string, ProjectSupplies>();
  for (const projectId of new Set([...threads.keys(), ...beads.keys(), ...specialty.keys()])) {
    supplies.set(projectId, {
      threads: threads.get(projectId) ?? EMPTY_ROLLUP,
      beads: beads.get(projectId) ?? EMPTY_ROLLUP,
      specialty: specialty.get(projectId) ?? EMPTY_ROLLUP,
    });
  }
  return supplies;
}

/** The three junctions as one supply list, which is how the kitting percentage counts them. */
export function totalSupplyRollup(supplies: ProjectSupplies): SupplyRollup {
  const parts = [supplies.threads, supplies.beads, supplies.specialty];

  return {
    count: parts.reduce((sum, p) => sum + p.count, 0),
    required: parts.reduce((sum, p) => sum + p.required, 0),
    acquired: parts.reduce((sum, p) => sum + p.acquired, 0),
    allFulfilled: parts.every((p) => p.allFulfilled),
    anyAcquired: parts.some((p) => p.anyAcquired),
  };
}
