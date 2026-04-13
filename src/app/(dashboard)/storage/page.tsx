import { getStorageLocationsWithStats } from "@/lib/actions/storage-location-actions";
import { StorageLocationList } from "@/components/features/storage/storage-location-list";

export default async function StorageLocationsPage() {
  const locations = await getStorageLocationsWithStats();
  return <StorageLocationList locations={locations} />;
}
