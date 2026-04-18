"use client";

import type { ProjectDashboardData } from "@/types/dashboard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { HeroStats } from "./hero-stats";
import { ProgressBreakdownTab } from "./progress-breakdown-tab";
import { FinishedTab } from "./finished-tab";

interface ProjectDashboardProps {
  data: ProjectDashboardData;
  imageUrls: Record<string, string>;
}

/**
 * Project Dashboard layout -- "Progress" tab.
 * Hero stats grid + sub-tabs for Progress Breakdown and Finished projects.
 */
export function ProjectDashboard({ data, imageUrls }: ProjectDashboardProps) {
  return (
    <div className="mx-auto max-w-[1200px] space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-bold">Project Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your progress across every project in your collection
        </p>
      </div>

      <HeroStats stats={data.heroStats} />

      {/* Sub-tabs for Progress Breakdown and Finished */}
      <Tabs defaultValue="progress">
        <TabsList variant="line">
          <TabsTrigger value="progress" className="min-h-11">
            Progress Breakdown
          </TabsTrigger>
          <TabsTrigger value="finished" className="min-h-11">
            Finished
            {data.finishedProjects.length > 0 && (
              <Badge variant="secondary" className="ml-1.5">
                {data.finishedProjects.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="progress" className="pt-6">
          <ProgressBreakdownTab
            buckets={data.progressBuckets}
            imageUrls={imageUrls}
          />
        </TabsContent>
        <TabsContent value="finished" className="pt-6">
          <FinishedTab
            projects={data.finishedProjects}
            imageUrls={imageUrls}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
