"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { LinkButton } from "@/components/ui/link-button";
import { ListRowKebabMenu } from "./list-row-kebab-menu";
import { CoverThumbnail } from "./cover-thumbnail";
import { StatusBadge } from "./status-badge";
import { SizeBadge } from "./size-badge";
import { getEffectiveStitchCount } from "@/lib/utils/size-category";
import type { ChartWithProject } from "@/types/chart";
import type { Designer, Genre } from "@/generated/prisma/client";

/* ---- Types ---- */

interface ChartListProps {
  charts: ChartWithProject[];
  designers: Designer[];
  genres: Genre[];
  imageUrls?: Record<string, string>;
}

/* ---- Main Component ---- */

export function ChartList({
  charts,
  designers,
  genres,
  imageUrls = {},
}: ChartListProps) {
  // No charts at all — empty state
  if (charts.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-2xl font-semibold">Charts</h1>
          <LinkButton href="/charts/new">
            <Plus className="size-4" data-icon="inline-start" />
            Add Chart
          </LinkButton>
        </div>

        <div className="flex flex-col items-center justify-center py-24 text-center">
          {/* Cross-stitch inspired grid pattern */}
          <div className="mb-6 grid grid-cols-5 gap-1">
            {[
              "bg-primary/20",
              "bg-transparent",
              "bg-secondary/25",
              "bg-transparent",
              "bg-primary/20",
              "bg-transparent",
              "bg-primary/30",
              "bg-transparent",
              "bg-primary/30",
              "bg-transparent",
              "bg-secondary/25",
              "bg-transparent",
              "bg-primary/40",
              "bg-transparent",
              "bg-secondary/25",
              "bg-transparent",
              "bg-primary/30",
              "bg-transparent",
              "bg-primary/30",
              "bg-transparent",
              "bg-primary/20",
              "bg-transparent",
              "bg-secondary/25",
              "bg-transparent",
              "bg-primary/20",
            ].map((color, i) => (
              <div key={i} className={`h-3 w-3 rounded-sm ${color}`} />
            ))}
          </div>
          <h2 className="font-heading text-foreground text-lg font-semibold">
            Your collection awaits
          </h2>
          <p className="text-muted-foreground mt-1.5 max-w-xs text-sm">
            Every great stash starts with one chart. Add your first and start tracking your
            stitching journey.
          </p>
          <LinkButton href="/charts/new" className="mt-6">
            Add Your First Chart
          </LinkButton>
        </div>
      </div>
    );
  }

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

      {/* Desktop table */}
      <div className="border-border bg-card hidden overflow-x-auto rounded-xl border md:block">
        <table className="w-full text-sm">
          <caption className="sr-only">Your cross-stitch chart collection</caption>
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
              <th className="w-20" />
            </tr>
          </thead>
          <tbody className="divide-border/60 divide-y">
            {charts.map((chart) => (
              <ChartRow
                key={chart.id}
                chart={chart}
                imageUrl={
                  (chart.coverThumbnailUrl ? (imageUrls[chart.coverThumbnailUrl] ?? null) : null) ??
                  (chart.coverImageUrl ? (imageUrls[chart.coverImageUrl] ?? null) : null)
                }
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {charts.map((chart) => (
          <ChartCard key={chart.id} chart={chart} />
        ))}
      </div>
    </div>
  );
}

/* ---- Chart Row (Desktop) ---- */

function ChartRow({
  chart,
  imageUrl,
}: {
  chart: ChartWithProject;
  imageUrl: string | null;
}) {
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
          <CoverThumbnail url={imageUrl} name={chart.name} />
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
      <td className="px-4 py-3">
        <div className="flex items-center justify-end transition-opacity group-focus-within:opacity-100 md:opacity-40 md:group-hover:opacity-100">
          <ListRowKebabMenu chartId={chart.id} chartName={chart.name} />
        </div>
      </td>
    </tr>
  );
}

/* ---- Chart Card (Mobile) ---- */

function ChartCard({ chart }: { chart: ChartWithProject }) {
  const status = chart.project?.status ?? "UNSTARTED";
  const { count } = getEffectiveStitchCount(
    chart.stitchCount,
    chart.stitchesWide,
    chart.stitchesHigh,
  );
  const stitchDisplay = count > 0 ? `${new Intl.NumberFormat().format(count)} stitches` : null;

  return (
    <div className="border-border bg-card rounded-xl border p-4 shadow-sm">
      <div className="mb-2 flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <Link
            href={`/charts/${chart.id}`}
            className="text-foreground hover:text-primary block truncate text-sm font-semibold transition-colors"
          >
            {chart.name}
          </Link>
        </div>
        <div className="ml-2 shrink-0">
          <ListRowKebabMenu chartId={chart.id} chartName={chart.name} />
        </div>
      </div>
      <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-xs">
        {chart.designer && <span>{chart.designer.name}</span>}
        <StatusBadge status={status} />
        {stitchDisplay && <span>{stitchDisplay}</span>}
      </div>
    </div>
  );
}
