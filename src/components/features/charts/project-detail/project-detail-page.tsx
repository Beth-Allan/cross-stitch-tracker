"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ProjectDetailHero } from "./project-detail-hero";
import { ProjectTabs } from "./project-tabs";
import { OverviewTab } from "./overview-tab";
import { SuppliesTab } from "./supplies-tab";
import { ProjectSessionsTab } from "@/components/features/sessions/project-sessions-tab";
import type { ProjectDetailProps } from "./types";
import type { ChartWithProject } from "@/types/chart";
import type { ProjectStatus } from "@/generated/prisma/client";
import type {
  StitchSessionRow,
  ProjectSessionStats,
  ActiveProjectForPicker,
} from "@/types/session";

interface ProjectDetailPageProps {
  chart: ChartWithProject;
  imageUrls: Record<string, string>;
  supplies: ProjectDetailProps["supplies"];
  sessions: StitchSessionRow[];
  sessionStats: ProjectSessionStats;
  activeProjects: ActiveProjectForPicker[];
}

export function ProjectDetailPage({
  chart,
  imageUrls,
  supplies,
  sessions,
  sessionStats,
  activeProjects,
}: ProjectDetailPageProps) {
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
  // Narrow overCount from Prisma's `number` to the domain-valid `1 | 2` at this boundary
  const project = chart.project
    ? { ...chart.project, status: currentStatus, overCount: chart.project.overCount as 1 | 2 }
    : null;

  const chartWithCurrentStatus = { ...chart, project };

  return (
    <div className="space-y-6">
      <ProjectDetailHero chart={chart} imageUrls={imageUrls} onStatusChange={handleStatusChange} />

      <ProjectTabs
        overviewContent={
          <OverviewTab
            chart={chartWithCurrentStatus}
            supplies={supplies}
            sessionCount={sessions.length}
          />
        }
        suppliesContent={
          project && supplies ? (
            <SuppliesTab chartId={chart.id} project={project} supplies={supplies} />
          ) : (
            <div className="text-muted-foreground py-12 text-center">
              <p className="font-heading text-lg font-semibold">No project linked</p>
              <p className="mt-1 text-sm">Create a project to manage supplies.</p>
            </div>
          )
        }
        sessionsContent={
          project ? (
            <ProjectSessionsTab
              sessions={sessions}
              stats={sessionStats}
              imageUrls={imageUrls}
              activeProjects={activeProjects}
              projectId={project.id}
            />
          ) : (
            <div className="text-muted-foreground py-12 text-center">
              <p className="font-heading text-lg font-semibold">No project linked</p>
              <p className="mt-1 text-sm">Create a project to manage sessions.</p>
            </div>
          )
        }
      />
    </div>
  );
}
