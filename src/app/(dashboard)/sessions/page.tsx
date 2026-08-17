import { getAllSessions, getActiveProjectsForPicker } from "@/lib/actions/session-actions";
import { getPresignedImageUrls } from "@/lib/actions/upload-actions";
import { settled } from "@/lib/utils/settled";
import { SessionsPageClient } from "@/components/features/sessions/sessions-page-client";

export default async function SessionsPage() {
  const [sessionsSettled, projectsSettled] = await Promise.allSettled([
    getAllSessions(),
    getActiveProjectsForPicker(),
  ]);

  const sessionsResult = settled(sessionsSettled, "allSessions", "sessions");
  const projectsResult = settled(projectsSettled, "activeProjects", "sessions");

  // null, not [] -- a failed query must not read as "you have not logged any sessions"
  const sessions =
    sessionsResult?.success && "sessions" in sessionsResult ? sessionsResult.sessions : null;
  const projectsUnavailable = !(projectsResult?.success && "projects" in projectsResult);
  const activeProjects = projectsUnavailable ? [] : projectsResult.projects;

  // Resolve photo keys and project thumbnail keys to presigned URLs
  const photoKeys = (sessions ?? []).filter((s) => s.photoKey).map((s) => s.photoKey);
  const thumbnailKeys = activeProjects.map((p) => p.coverThumbnailUrl).filter(Boolean);
  const imageUrls = await getPresignedImageUrls([...photoKeys, ...thumbnailKeys]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Sessions</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Your stitching session log across all projects.
        </p>
      </div>
      <SessionsPageClient
        sessions={sessions}
        activeProjects={activeProjects}
        projectsUnavailable={projectsUnavailable}
        imageUrls={imageUrls}
      />
    </div>
  );
}
