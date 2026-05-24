import type { ProjectStatus } from "@/generated/prisma/client";

export const STATUS_GROUPS = ["not-started", "in-progress", "complete"] as const;

export type StatusGroup = (typeof STATUS_GROUPS)[number];

const STATUS_GROUP_MAP: Record<StatusGroup, ProjectStatus[]> = {
  "not-started": ["UNSTARTED"],
  "in-progress": ["KITTING", "KITTED", "IN_PROGRESS", "ON_HOLD"],
  complete: ["FINISHED", "FFO"],
};

/**
 * Resolves an array of status group names to their corresponding ProjectStatus values.
 */
export function resolveStatusFilter(groups: StatusGroup[]): ProjectStatus[] {
  return groups.flatMap((group) => STATUS_GROUP_MAP[group] ?? []);
}
