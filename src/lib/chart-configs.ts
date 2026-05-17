import type { ProjectStatus } from "@/generated/prisma/client";
import { type ChartConfig } from "@/components/ui/chart";

export const collectionStatusConfig = {
  UNSTARTED: { label: "Unstarted", color: "var(--status-unstarted)" },
  KITTING: { label: "Kitting", color: "var(--status-kitting)" },
  KITTED: { label: "Kitted", color: "var(--status-kitted)" },
  IN_PROGRESS: { label: "In Progress", color: "var(--status-in-progress)" },
  ON_HOLD: { label: "On Hold", color: "var(--status-on-hold)" },
  FINISHED: { label: "Finished", color: "var(--status-finished)" },
  FFO: { label: "FFO", color: "var(--status-ffo)" },
} satisfies Record<ProjectStatus, ChartConfig[string]>;
