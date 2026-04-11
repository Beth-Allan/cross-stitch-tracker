import { notFound } from "next/navigation";
import { getStorageLocationDetail } from "@/lib/actions/storage-location-actions";
import { StorageLocationDetail } from "@/components/features/storage/storage-location-detail";

export default async function StorageLocationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const location = await getStorageLocationDetail(id);
  if (!location) notFound();
  return <StorageLocationDetail location={location} />;
}
