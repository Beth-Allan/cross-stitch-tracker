"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  ExternalLink,
  Image as ImageIcon,
  Pencil,
  Trash2,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/features/charts/status-badge";
import { SizeBadge } from "@/components/features/charts/size-badge";
import { DesignerFormModal } from "./designer-form-modal";
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";
import { deleteDesigner } from "@/lib/actions/designer-actions";
import { getEffectiveStitchCount } from "@/lib/utils/size-category";
import type { DesignerDetail as DesignerDetailType, DesignerChart } from "@/types/designer";

/* ---- Types ---- */

type ChartSortKey = "name" | "stitchCount" | "status";
type SortDir = "asc" | "desc";

const STATUS_ORDER: Record<string, number> = {
  IN_PROGRESS: 0,
  KITTING: 1,
  KITTED: 2,
  UNSTARTED: 3,
  ON_HOLD: 4,
  FINISHED: 5,
  FFO: 6,
};

/* ---- Helper ---- */

function formatNumber(n: number): string {
  return new Intl.NumberFormat().format(n);
}

/* ---- Main Component ---- */

interface DesignerDetailProps {
  designer: DesignerDetailType;
}

export function DesignerDetail({ designer }: DesignerDetailProps) {
  const router = useRouter();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chartSort, setChartSort] = useState<{
    key: ChartSortKey;
    dir: SortDir;
  }>({ key: "name", dir: "asc" });

  function handleSort(key: ChartSortKey) {
    setChartSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" },
    );
  }

  const sortedCharts = useMemo(() => {
    const result = [...designer.charts];
    result.sort((a, b) => {
      const dir = chartSort.dir === "asc" ? 1 : -1;
      switch (chartSort.key) {
        case "name":
          return dir * a.name.localeCompare(b.name);
        case "stitchCount": {
          const aCount = getEffectiveStitchCount(
            a.stitchCount,
            a.stitchesWide,
            a.stitchesHigh,
          ).count;
          const bCount = getEffectiveStitchCount(
            b.stitchCount,
            b.stitchesWide,
            b.stitchesHigh,
          ).count;
          return dir * (aCount - bCount);
        }
        case "status": {
          const aOrd = a.status ? (STATUS_ORDER[a.status] ?? 99) : 99;
          const bOrd = b.status ? (STATUS_ORDER[b.status] ?? 99) : 99;
          return dir * (aOrd - bOrd);
        }
        default:
          return 0;
      }
    });
    return result;
  }, [designer.charts, chartSort]);

  async function handleDelete() {
    try {
      const result = await deleteDesigner(designer.id);
      if (result.success) {
        toast.success("Designer deleted");
        router.push("/designers");
      } else {
        toast.error(result.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/designers"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        Back to Designers
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="font-heading text-2xl font-semibold">{designer.name}</h1>

          {/* Website */}
          {designer.website && (
            <a
              href={designer.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 mt-1 inline-flex items-center gap-1.5 text-sm transition-colors"
              aria-label={`Visit ${designer.name} website`}
            >
              {designer.website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
              <ExternalLink className="h-4 w-4" />
            </a>
          )}

          {/* Notes */}
          {designer.notes && (
            <p className="text-muted-foreground mt-2 text-sm">
              <span className="font-semibold">Notes: </span>
              {designer.notes}
            </p>
          )}
        </div>

        {/* Action buttons */}
        <div className="ml-4 flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => setEditModalOpen(true)}
            className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-md p-1.5 transition-colors"
            aria-label={`Edit ${designer.name}`}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeleteDialogOpen(true)}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md p-1.5 transition-colors"
            aria-label={`Delete ${designer.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap gap-6">
        <StatItem label="Charts" value={designer.chartCount} />
        <StatItem label="Started" value={designer.projectsStarted} />
        <StatItem label="Finished" value={designer.projectsFinished} accent />
        <div>
          <p className="text-muted-foreground text-xs tracking-wider uppercase">Top Genre</p>
          {designer.topGenre ? (
            <span className="border-warning-border bg-warning-muted text-warning-muted-foreground mt-0.5 inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold">
              {designer.topGenre}
            </span>
          ) : (
            <p className="text-muted-foreground text-lg font-semibold">&mdash;</p>
          )}
        </div>
      </div>

      {/* Chart list section */}
      <div>
        {/* Section header with sort pills */}
        <div className="mb-3 flex items-center justify-between">
          <span className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
            Charts ({designer.charts.length})
          </span>
          <div className="flex items-center gap-1">
            {(
              [
                { key: "name" as ChartSortKey, label: "Name" },
                { key: "stitchCount" as ChartSortKey, label: "Stitches" },
                { key: "status" as ChartSortKey, label: "Status" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => handleSort(opt.key)}
                className={`rounded-full px-2 py-0.5 text-xs transition-colors ${
                  chartSort.key === opt.key
                    ? "bg-success-muted text-success-muted-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {opt.label}
                {chartSort.key === opt.key &&
                  (chartSort.dir === "asc" ? (
                    <ChevronUp className="ml-0.5 inline h-2.5 w-2.5" />
                  ) : (
                    <ChevronDown className="ml-0.5 inline h-2.5 w-2.5" />
                  ))}
              </button>
            ))}
          </div>
        </div>

        {/* Chart rows */}
        {sortedCharts.length > 0 ? (
          <div className="space-y-2">
            {sortedCharts.map((chart) => (
              <ChartRow key={chart.id} chart={chart} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
            <FileText className="text-muted-foreground/40 mx-auto mb-2 h-8 w-8" />
            <p className="text-muted-foreground text-sm">No charts found for this designer</p>
          </div>
        )}
      </div>

      {/* Edit modal */}
      <DesignerFormModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        designer={{
          id: designer.id,
          name: designer.name,
          website: designer.website,
          notes: designer.notes,
          chartCount: designer.chartCount,
        }}
      />

      {/* Delete confirmation dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Designer?"
        entityName={designer.name}
        chartCount={designer.chartCount}
        entityType="designer"
        onConfirm={handleDelete}
      />
    </div>
  );
}

/* ---- Stat Item ---- */

function StatItem({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs tracking-wider uppercase">{label}</p>
      <p className={`text-lg font-semibold ${accent ? "text-primary" : "text-foreground"}`}>
        {value}
      </p>
    </div>
  );
}

/* ---- Chart Row ---- */

function ChartRow({ chart }: { chart: DesignerChart }) {
  const { count: effectiveCount } = getEffectiveStitchCount(
    chart.stitchCount,
    chart.stitchesWide,
    chart.stitchesHigh,
  );

  const progressPercent =
    chart.status === "IN_PROGRESS" && effectiveCount > 0
      ? Math.round((chart.stitchesCompleted / effectiveCount) * 100)
      : null;

  return (
    <Link
      href={`/charts/${chart.id}`}
      className="border-border hover:bg-muted/50 flex items-center gap-3 rounded-lg border p-3 transition-colors"
    >
      {/* Thumbnail */}
      {chart.coverThumbnailUrl ? (
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={chart.coverThumbnailUrl}
            alt={chart.name}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
          <ImageIcon className="text-muted-foreground/40 h-4 w-4" />
        </div>
      )}

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="text-foreground truncate text-sm font-semibold">{chart.name}</p>
        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <span>{formatNumber(effectiveCount)} stitches</span>
          {effectiveCount > 0 && (
            <SizeBadge
              stitchCount={chart.stitchCount}
              stitchesWide={chart.stitchesWide}
              stitchesHigh={chart.stitchesHigh}
            />
          )}
        </div>
      </div>

      {/* Status + progress */}
      <div className="shrink-0 text-right">
        {chart.status ? (
          <StatusBadge status={chart.status} />
        ) : (
          <span className="text-muted-foreground text-xs">Not started</span>
        )}
        {progressPercent !== null && (
          <div className="mt-1 flex items-center gap-1.5">
            <div className="bg-muted h-1.5 w-16 overflow-hidden rounded-full">
              <div
                className="bg-primary h-full rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-muted-foreground text-xs">{progressPercent}%</span>
          </div>
        )}
      </div>
    </Link>
  );
}
