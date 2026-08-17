import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { getActiveProjectsForPicker } from "@/lib/actions/session-actions";
import { getPresignedImageUrls } from "@/lib/actions/upload-actions";
import { settled } from "@/lib/utils/settled";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // The picker is how Beth logs stitches at all, so a failed load must say so rather than
  // present itself as an empty project list she cannot act on
  const [projectsResult] = await Promise.allSettled([getActiveProjectsForPicker()]);
  const projects = settled(projectsResult, "activeProjects", "shell");
  const projectsUnavailable = projects === null || !projects.success;
  const activeProjects = projects?.success ? projects.projects : [];

  const thumbnailKeys = activeProjects.map((p) => p.coverThumbnailUrl);
  const imageUrls = await getPresignedImageUrls(thumbnailKeys);

  return (
    <AppShell
      user={{
        name: session.user.name ?? "Stitcher",
        email: session.user.email ?? "",
      }}
      activeProjects={activeProjects}
      projectsUnavailable={projectsUnavailable}
      imageUrls={imageUrls}
    >
      {children}
    </AppShell>
  );
}
