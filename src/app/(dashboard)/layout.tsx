import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { getActiveProjectsForPicker } from "@/lib/actions/session-actions";
import { getPresignedImageUrls } from "@/lib/actions/upload-actions";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const projectsResult = await getActiveProjectsForPicker();
  const activeProjects = projectsResult.success ? projectsResult.projects : [];
  const thumbnailKeys = activeProjects.map((p) => p.coverThumbnailUrl);
  const imageUrls = await getPresignedImageUrls(thumbnailKeys);

  return (
    <AppShell
      user={{
        name: session.user.name ?? "Stitcher",
        email: session.user.email ?? "",
      }}
      activeProjects={activeProjects}
      imageUrls={imageUrls}
    >
      {children}
    </AppShell>
  );
}
