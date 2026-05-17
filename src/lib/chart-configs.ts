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

export const sizeCategoryConfig = {
  Mini: { label: "Mini", color: "var(--chart-1)" },
  Small: { label: "Small", color: "var(--chart-2)" },
  Medium: { label: "Medium", color: "var(--chart-3)" },
  Large: { label: "Large", color: "var(--chart-4)" },
  BAP: { label: "BAP", color: "var(--chart-5)" },
} satisfies ChartConfig;

export const designerBarConfig = {
  count: { label: "Charts", color: "var(--chart-1)" },
} satisfies ChartConfig;

export const genreDistributionConfig = {
  count: { label: "Charts", color: "var(--chart-3)" },
} satisfies ChartConfig;
