import { getStitchingAppsWithStats } from "@/lib/actions/stitching-app-actions";
import { StitchingAppList } from "@/components/features/apps/stitching-app-list";

export default async function StitchingAppsPage() {
  const apps = await getStitchingAppsWithStats();
  return <StitchingAppList apps={apps} />;
}
