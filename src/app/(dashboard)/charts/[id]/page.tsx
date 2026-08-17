import { notFound } from "next/navigation";
import { getChart } from "@/lib/actions/chart-actions";
import { getPresignedImageUrls } from "@/lib/actions/upload-actions";
import { getProjectSupplies } from "@/lib/actions/supply-actions";
import { getUnassignedFabrics } from "@/lib/actions/fabric-actions";
import {
  getSessionsForProject,
  getProjectSessionStats,
  getActiveProjectsForPicker,
} from "@/lib/actions/session-actions";
import { requireAuth } from "@/lib/auth-guard";
import { getProjectCompletionEstimate } from "@/lib/queries/stats/completion-estimates";
import { settled } from "@/lib/utils/settled";
import { ProjectDetailPage } from "@/components/features/charts/project-detail/project-detail-page";
import type { FabricOption } from "@/components/features/supply-table";
import type { CompletionEstimate } from "@/types/stats";
import type {
  StitchSessionRow,
  ProjectSessionStats,
  ActiveProjectForPicker,
} from "@/types/session";

const NO_PROJECT_STATS: ProjectSessionStats = {
  totalStitches: 0,
  sessionsLogged: 0,
  avgPerSession: 0,
  activeSince: null,
};

export default async function ChartDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [user, chart] = await Promise.all([requireAuth(), getChart(id)]);
  if (!chart) notFound();

  const project = chart.project;

  const [projectSupplies, imageUrls, projectsResult, projectData] = await Promise.all([
    project ? getProjectSupplies(project.id) : null,
    getPresignedImageUrls([chart.coverImageUrl, chart.coverThumbnailUrl]),
    getActiveProjectsForPicker(),
    project
      ? Promise.allSettled([
          getSessionsForProject(project.id),
          getProjectSessionStats(project.id),
          getUnassignedFabrics(project.id),
          getProjectCompletionEstimate(user.id, project.id),
        ])
      : null,
  ]);

  // A chart with no project has genuinely nothing logged; a chart whose queries failed has
  // null, so the tab says "couldn't load" instead of showing zeros Beth would read as real
  let sessions: StitchSessionRow[] | null = [];
  let sessionStats: ProjectSessionStats | null = NO_PROJECT_STATS;
  let fabricOptions: FabricOption[] | null = [];
  let completionEstimate: CompletionEstimate | null = null;

  if (projectData) {
    const sessionsResult = settled(projectData[0], "projectSessions", "chart-detail");
    sessions =
      sessionsResult?.success && "sessions" in sessionsResult ? sessionsResult.sessions : null;

    const statsResult = settled(projectData[1], "projectSessionStats", "chart-detail");
    sessionStats = statsResult?.success && "stats" in statsResult ? statsResult.stats : null;

    const unassignedFabrics = settled(projectData[2], "unassignedFabrics", "chart-detail");
    fabricOptions =
      unassignedFabrics === null
        ? null
        : unassignedFabrics.map((f) => ({
            value: f.id,
            label: `${f.brand.name} ${f.name} (${f.count}ct)`,
            count: f.count,
          }));

    completionEstimate = settled(projectData[3], "completionEstimate", "chart-detail");
  }

  const activeProjects: ActiveProjectForPicker[] =
    projectsResult.success && "projects" in projectsResult ? projectsResult.projects : [];

  // Resolve session photo keys to presigned URLs alongside cover images
  const sessionPhotoKeys = (sessions ?? []).filter((s) => s.photoKey).map((s) => s.photoKey);
  const allImageUrls =
    sessionPhotoKeys.length > 0
      ? { ...imageUrls, ...(await getPresignedImageUrls(sessionPhotoKeys)) }
      : imageUrls;

  return (
    <ProjectDetailPage
      chart={chart}
      imageUrls={allImageUrls}
      supplies={projectSupplies}
      sessions={sessions}
      sessionStats={sessionStats}
      activeProjects={activeProjects}
      completionEstimate={completionEstimate}
      fabricOptions={fabricOptions}
    />
  );
}
