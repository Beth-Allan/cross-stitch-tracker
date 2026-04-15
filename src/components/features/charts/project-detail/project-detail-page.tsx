"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ProjectDetailHero } from "./project-detail-hero";
import { ProjectTabs } from "./project-tabs";
import { OverviewTab } from "./overview-tab";
import { SuppliesTab } from "./supplies-tab";
import type { ProjectDetailProps } from "./types";
import type { ChartWithProject } from "@/types/chart";
import type { ProjectStatus } from "@/generated/prisma/client";

interface ProjectDetailPageProps {
  chart: ChartWithProject;
  imageUrls: Record<string, string>;
  supplies: ProjectDetailProps["supplies"];
}

export function ProjectDetailPage({ chart, imageUrls, supplies }: ProjectDetailPageProps) {
  const router = useRouter();
  // Track status locally so overview tab reorders sections on status change
  const [currentStatus, setCurrentStatus] = useState<ProjectStatus>(
    chart.project?.status ?? "UNSTARTED",
  );

  const handleStatusChange = useCallback(
    (newStatus: ProjectStatus) => {
      setCurrentStatus(newStatus);
      router.refresh(); // Revalidate server data
    },
    [router],
  );

  // Build chart data with current status for overview tab section ordering
  const chartWithCurrentStatus = {
    ...chart,
    project: chart.project ? { ...chart.project, status: currentStatus } : null,
  };

  return (
    <div className="space-y-6">
      <ProjectDetailHero chart={chart} imageUrls={imageUrls} onStatusChange={handleStatusChange} />

      <ProjectTabs
        overviewContent={<OverviewTab chart={chartWithCurrentStatus} supplies={supplies} />}
        suppliesContent={
          chart.project && supplies ? (
            <SuppliesTab chartId={chart.id} project={chart.project} supplies={supplies} />
          ) : (
            <div className="text-muted-foreground py-12 text-center">
              <p className="font-heading text-lg font-semibold">No project linked</p>
              <p className="mt-1 text-sm">Create a project to manage supplies.</p>
            </div>
          )
        }
      />
    </div>
  );
}
