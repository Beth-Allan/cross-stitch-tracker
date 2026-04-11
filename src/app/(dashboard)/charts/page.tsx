import Link from "next/link";
import { Plus, Image as ImageIcon } from "lucide-react";
import { getCharts } from "@/lib/actions/chart-actions";
import { getEffectiveStitchCount } from "@/lib/utils/size-category";
import { StatusBadge } from "@/components/features/charts/status-badge";
import { SizeBadge } from "@/components/features/charts/size-badge";
import { LinkButton } from "@/components/ui/link-button";

export default async function ChartsPage() {
  const charts = await getCharts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">Charts</h1>
        <LinkButton href="/charts/new">
          <Plus className="size-4" data-icon="inline-start" />
          Add Chart
        </LinkButton>
      </div>

      {/* Content */}
      {charts.length === 0 ? <EmptyState /> : <ChartsList charts={charts} />}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      {/* Cross-stitch inspired grid pattern */}
      <div className="mb-6 grid grid-cols-5 gap-1">
        {[
          "bg-emerald-200 dark:bg-emerald-800/40",
          "bg-transparent",
          "bg-amber-200 dark:bg-amber-800/40",
          "bg-transparent",
          "bg-emerald-200 dark:bg-emerald-800/40",
          "bg-transparent",
          "bg-emerald-300 dark:bg-emerald-700/40",
          "bg-transparent",
          "bg-emerald-300 dark:bg-emerald-700/40",
          "bg-transparent",
          "bg-amber-200 dark:bg-amber-800/40",
          "bg-transparent",
          "bg-emerald-400 dark:bg-emerald-600/40",
          "bg-transparent",
          "bg-amber-200 dark:bg-amber-800/40",
          "bg-transparent",
          "bg-emerald-300 dark:bg-emerald-700/40",
          "bg-transparent",
          "bg-emerald-300 dark:bg-emerald-700/40",
          "bg-transparent",
          "bg-emerald-200 dark:bg-emerald-800/40",
          "bg-transparent",
          "bg-amber-200 dark:bg-amber-800/40",
          "bg-transparent",
          "bg-emerald-200 dark:bg-emerald-800/40",
        ].map((color, i) => (
          <div key={i} className={`h-3 w-3 rounded-sm ${color}`} />
        ))}
      </div>
      <h2 className="font-heading text-foreground text-lg font-semibold">Your collection awaits</h2>
      <p className="text-muted-foreground mt-1.5 max-w-xs text-sm">
        Every great stash starts with one chart. Add your first and start tracking your stitching
        journey.
      </p>
      <LinkButton href="/charts/new" className="mt-6">
        Add Your First Chart
      </LinkButton>
    </div>
  );
}

type ChartWithRelations = Awaited<ReturnType<typeof getCharts>>[number];

function ChartsList({ charts }: { charts: ChartWithRelations[] }) {
  return (
    <div className="border-border bg-card overflow-hidden rounded-xl border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-border/60 border-b">
            <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
              Chart
            </th>
            <th className="text-muted-foreground hidden px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase sm:table-cell">
              Designer
            </th>
            <th className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase">
              Status
            </th>
            <th className="text-muted-foreground hidden px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase md:table-cell">
              Size
            </th>
            <th className="text-muted-foreground hidden px-4 py-3 text-right text-xs font-semibold tracking-wider uppercase lg:table-cell">
              Added
            </th>
          </tr>
        </thead>
        <tbody className="divide-border/60 divide-y">
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
    <tr className="group hover:bg-muted/50 transition-colors">
      <td className="px-4 py-3">
        <Link href={`/charts/${chart.id}`} className="flex items-center gap-3">
          <CoverThumbnail url={chart.coverThumbnailUrl} name={chart.name} />
          <div className="min-w-0">
            <p className="text-foreground truncate text-sm font-semibold">{chart.name}</p>
            {stitchDisplay && <p className="text-muted-foreground/70 text-xs">{stitchDisplay}</p>}
          </div>
        </Link>
      </td>
      <td className="hidden px-4 py-3 sm:table-cell">
        <span className="text-muted-foreground text-sm">{chart.designer?.name ?? "-"}</span>
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
        <span className="text-muted-foreground text-sm">{dateAdded}</span>
      </td>
    </tr>
  );
}

function CoverThumbnail({ url, name }: { url: string | null; name: string }) {
  if (url) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={url}
        alt={`Cover for ${name}`}
        className="h-10 w-10 shrink-0 rounded-lg object-cover"
      />
    );
  }

  return (
    <div className="bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
      <ImageIcon className="text-muted-foreground/60 h-4 w-4" strokeWidth={1.5} />
    </div>
  );
}
