import { getAllSessions, getActiveProjectsForPicker } from "@/lib/actions/session-actions";
import { getPresignedImageUrls } from "@/lib/actions/upload-actions";
import { SessionsPageClient } from "@/components/features/sessions/sessions-page-client";

export default async function SessionsPage() {
  const [sessionsResult, projectsResult] = await Promise.all([
    getAllSessions(),
    getActiveProjectsForPicker(),
  ]);

  const sessions =
    sessionsResult.success && "sessions" in sessionsResult ? sessionsResult.sessions : [];
  const activeProjects =
    projectsResult.success && "projects" in projectsResult ? projectsResult.projects : [];

  // Resolve photo keys and project thumbnail keys to presigned URLs
  const photoKeys = sessions.filter((s) => s.photoKey).map((s) => s.photoKey);
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
        imageUrls={imageUrls}
      />
    </div>
  );
}
