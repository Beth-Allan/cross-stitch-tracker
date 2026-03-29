import Link from "next/link";
import { Plus, Scissors, Image } from "lucide-react";
import { getCharts } from "@/lib/actions/chart-actions";
import { getEffectiveStitchCount } from "@/lib/utils/size-category";
import { StatusBadge } from "@/components/features/charts/status-badge";
import { SizeBadge } from "@/components/features/charts/size-badge";
import { Button } from "@/components/ui/button";

export default async function ChartsPage() {
  const charts = await getCharts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">Charts</h1>
        <Button render={<Link href="/charts/new" />}>
          <Plus className="size-4" data-icon="inline-start" />
          Add Chart
        </Button>
      </div>

      {/* Content */}
      {charts.length === 0 ? <EmptyState /> : <ChartsList charts={charts} />}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-800">
        <Scissors className="h-7 w-7 text-stone-400 dark:text-stone-500" strokeWidth={1.5} />
      </div>
      <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">No charts yet</h2>
      <p className="mt-1 max-w-sm text-sm text-stone-500 dark:text-stone-400">
        Add your first chart to start tracking your cross-stitch collection.
      </p>
      <Button
        className="mt-6 bg-emerald-600 text-white hover:bg-emerald-700"
        render={<Link href="/charts/new" />}
      >
        Add Your First Chart
      </Button>
    </div>
  );
}

type ChartWithRelations = Awaited<ReturnType<typeof getCharts>>[number];

function ChartsList({ charts }: { charts: ChartWithRelations[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-stone-100 dark:border-stone-800">
            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-stone-400 uppercase dark:text-stone-500">
              Chart
            </th>
            <th className="hidden px-4 py-3 text-left text-xs font-semibold tracking-wider text-stone-400 uppercase sm:table-cell dark:text-stone-500">
              Designer
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold tracking-wider text-stone-400 uppercase dark:text-stone-500">
              Status
            </th>
            <th className="hidden px-4 py-3 text-left text-xs font-semibold tracking-wider text-stone-400 uppercase md:table-cell dark:text-stone-500">
              Size
            </th>
            <th className="hidden px-4 py-3 text-right text-xs font-semibold tracking-wider text-stone-400 uppercase lg:table-cell dark:text-stone-500">
              Added
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
          {charts.map((chart) => (
            <ChartRow key={chart.id} chart={chart} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ChartRow({ chart }: { chart: ChartWithRelations }) {
  const status = chart.project?.status ?? "UNSTARTED";
  const { count } = getEffectiveStitchCount(
    chart.stitchCount,
    chart.stitchesWide,
    chart.stitchesHigh,
  );
  const stitchDisplay = count > 0 ? `${new Intl.NumberFormat().format(count)} stitches` : null;
  const dateAdded = chart.dateAdded.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <tr className="group transition-colors hover:bg-stone-50 dark:hover:bg-stone-800/50">
      <td className="px-4 py-3">
        <Link href={`/charts/${chart.id}`} className="flex items-center gap-3">
          <CoverThumbnail url={chart.coverThumbnailUrl} name={chart.name} />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-stone-900 dark:text-stone-100">
              {chart.name}
            </p>
            {stitchDisplay && (
              <p className="text-xs text-stone-400 dark:text-stone-500">{stitchDisplay}</p>
            )}
          </div>
        </Link>
      </td>
      <td className="hidden px-4 py-3 sm:table-cell">
        <span className="text-sm text-stone-500 dark:text-stone-400">
          {chart.designer?.name ?? "-"}
        </span>
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={status} />
      </td>
      <td className="hidden px-4 py-3 md:table-cell">
        <SizeBadge
          stitchCount={chart.stitchCount}
          stitchesWide={chart.stitchesWide}
          stitchesHigh={chart.stitchesHigh}
        />
      </td>
      <td className="hidden px-4 py-3 text-right lg:table-cell">
        <span className="text-sm text-stone-500 dark:text-stone-400">{dateAdded}</span>
      </td>
    </tr>
  );
}

function CoverThumbnail({ url, name }: { url: string | null; name: string }) {
  if (url) {
    return (
      <img
        src={url}
        alt={`Cover for ${name}`}
        className="h-10 w-10 shrink-0 rounded-lg object-cover"
      />
    );
  }

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-stone-100 to-stone-200 dark:from-stone-800 dark:to-stone-700">
      <Image className="h-4 w-4 text-stone-400 dark:text-stone-500" strokeWidth={1.5} />
    </div>
  );
}
