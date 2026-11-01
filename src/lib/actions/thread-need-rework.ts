import type { Prisma } from "@/generated/prisma/client";
import { projectCalcParams, threadNeed } from "@/components/features/supply-table/thread-need";

/**
 * Works a project's calculated thread needs out again from the fabric and settings it holds now.
 * Every write that changes one of those calls this inside its own transaction, so a saved figure
 * follows the change whichever page made it, and the two commit or fail together.
 *
 * A line marked as typed keeps its figure. So does one the calculator cannot read: a fabric says
 * nothing about a length nobody knows, so a change here never turns a figure into Unknown.
 *
 * Lines reaching the same figure share one write, which keeps a project with a hundred colours
 * well inside the transaction's time limit.
 */
export async function reworkCalculatedNeeds(
  tx: Prisma.TransactionClient,
  projectId: string,
): Promise<void> {
  const project = await tx.project.findUnique({
    where: { id: projectId },
    select: {
      strandCount: true,
      overCount: true,
      wastePercent: true,
      fabric: { select: { count: true } },
      projectThreads: {
        where: { isNeedOverridden: false, stitchCount: { gt: 0 } },
        select: {
          id: true,
          stitchCount: true,
          quantityRequired: true,
          thread: {
            select: {
              line: {
                select: { skeinLengthMm: true, strandStructure: true, cutLengthInches: true },
              },
            },
          },
        },
      },
    },
  });
  if (!project) return;

  const calcParams = projectCalcParams({ ...project, fabricCount: project.fabric?.count });
  const lineIdsByNeed = new Map<number, string[]>();
  for (const line of project.projectThreads) {
    const need = threadNeed(line.stitchCount, calcParams, line.thread.line);
    if (need === null || need === line.quantityRequired) continue;
    lineIdsByNeed.set(need, [...(lineIdsByNeed.get(need) ?? []), line.id]);
  }

  for (const [need, ids] of lineIdsByNeed) {
    await tx.projectThread.updateMany({
      where: { id: { in: ids } },
      data: { quantityRequired: need },
    });
  }
}
