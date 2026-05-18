import { notFound } from "next/navigation";
import { getChart } from "@/lib/actions/chart-actions";
import { getPresignedImageUrls } from "@/lib/actions/upload-actions";
import { getProjectSupplies } from "@/lib/actions/supply-actions";
import {
  getSessionsForProject,
  getProjectSessionStats,
  getActiveProjectsForPicker,
} from "@/lib/actions/session-actions";
import { requireAuth } from "@/lib/auth-guard";
import { getProjectCompletionEstimate } from "@/lib/queries/stats/completion-estimates";
import { ProjectDetailPage } from "@/components/features/charts/project-detail/project-detail-page";
import type {
  StitchSessionRow,
  ProjectSessionStats,
  ActiveProjectForPicker,
} from "@/types/session";

export default async function ChartDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [user, chart] = await Promise.all([requireAuth(), getChart(id)]);
  if (!chart) notFound();

  const [
    projectSupplies,
    imageUrls,
    sessionsResult,
    statsResult,
    projectsResult,
    completionEstimate,
  ] = await Promise.all([
    chart.project ? getProjectSupplies(chart.project.id) : null,
    getPresignedImageUrls([chart.coverImageUrl, chart.coverThumbnailUrl]),
    chart.project
      ? getSessionsForProject(chart.project.id)
      : { success: true as const, sessions: [] as StitchSessionRow[] },
    chart.project
      ? getProjectSessionStats(chart.project.id)
      : {
          success: true as const,
          stats: {
            totalStitches: 0,
            sessionsLogged: 0,
            avgPerSession: 0,
            activeSince: null,
          } as ProjectSessionStats,
        },
    getActiveProjectsForPicker(),
    chart.project
      ? getProjectCompletionEstimate(user.id, chart.project.id).catch(() => null)
      : null,
  ]);

  const sessions =
    sessionsResult.success && "sessions" in sessionsResult ? sessionsResult.sessions : [];
  const sessionStats =
    statsResult.success && "stats" in statsResult
      ? statsResult.stats
      : { totalStitches: 0, sessionsLogged: 0, avgPerSession: 0, activeSince: null };
  const activeProjects: ActiveProjectForPicker[] =
    projectsResult.success && "projects" in projectsResult ? projectsResult.projects : [];

  // Resolve session photo keys to presigned URLs alongside cover images
  const sessionPhotoKeys = sessions.filter((s) => s.photoKey).map((s) => s.photoKey);
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
    />
  );
}
