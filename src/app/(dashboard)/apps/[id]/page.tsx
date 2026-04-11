import { notFound } from "next/navigation";
import { getStitchingAppDetail } from "@/lib/actions/stitching-app-actions";
import { StitchingAppDetail } from "@/components/features/apps/stitching-app-detail";

export default async function StitchingAppDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const app = await getStitchingAppDetail(id);
  if (!app) notFound();
  return <StitchingAppDetail app={app} />;
}
