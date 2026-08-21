import { CoverOptimizationCard } from "@/components/features/settings/cover-optimization-card";
import { getCoversNeedingOptimization } from "@/lib/actions/cover-backfill-actions";

export default async function SettingsPage() {
  const result = await getCoversNeedingOptimization();
  // A read this page cannot do is a page it cannot draw honestly: an empty list
  // would tell Beth every cover is already shrunk.
  if (!result.success) throw new Error(result.error);

  return (
    <div className="px-6 pt-6 pb-4">
      <h1 className="font-heading mb-5 text-2xl font-semibold">Settings</h1>
      <div className="max-w-2xl">
        <CoverOptimizationCard charts={result.charts} />
      </div>
    </div>
  );
}
