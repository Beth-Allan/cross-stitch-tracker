"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  Image as ImageIcon,
  Pencil,
  Trash2,
  Check,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/features/charts/status-badge";
import { SizeBadge } from "@/components/features/charts/size-badge";
import { DeleteConfirmationDialog } from "../designers/delete-confirmation-dialog";
import { updateSeries, deleteSeries } from "@/lib/actions/series-actions";
import { getEffectiveStitchCount } from "@/lib/utils/size-category";
import { getObjectPositionStyle } from "@/lib/utils/focal-point";
import type { SeriesDetail as SeriesDetailType, SeriesChart } from "@/types/series";

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

function formatNumber(n: number): string {
  return new Intl.NumberFormat().format(n);
}

interface SeriesDetailProps {
  series: SeriesDetailType;
}

export function SeriesDetail({ series }: SeriesDetailProps) {
  const router = useRouter();

  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(series.name);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chartSort, setChartSort] = useState<{ key: ChartSortKey; dir: SortDir }>({
    key: "name",
    dir: "asc",
  });
  const nameInputRef = useRef<HTMLInputElement>(null);
  const isSavingRef = useRef(false);

  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus();
      nameInputRef.current.select();
    }
  }, [isEditingName]);

  function handleSort(key: ChartSortKey) {
    setChartSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" },
    );
  }

  const sortedCharts = useMemo(() => {
    const result = [...series.charts];
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
  }, [series.charts, chartSort]);

  async function handleSaveName() {
    if (isSavingRef.current) return;
    const trimmed = editName.trim();
    if (!trimmed || trimmed === series.name) {
      setIsEditingName(false);
      setEditName(series.name);
      return;
    }

    isSavingRef.current = true;
    try {
      const result = await updateSeries(series.id, {
        name: trimmed,
        totalCount: series.totalCount,
        designerId: series.designerId,
        notes: series.notes,
      });
      if (result.success) {
        toast.success("Series updated");
        router.refresh();
      } else {
        toast.error(result.error ?? "Couldn't update series. Please try again.");
      }
    } catch {
      toast.error("Couldn't update series. Please try again.");
    }
    setIsEditingName(false);
    isSavingRef.current = false;
  }

  function handleCancelEdit() {
    setIsEditingName(false);
    setEditName(series.name);
  }

  function handleNameKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSaveName();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancelEdit();
    }
  }

  async function handleDelete() {
    try {
      const result = await deleteSeries(series.id);
      if (result.success) {
        toast.success("Series deleted");
        router.push("/series");
      } else {
        toast.error(result.error ?? "Couldn't delete series. Please try again.");
      }
    } catch {
      toast.error("Couldn't delete series. Please try again.");
    }
  }

  const { progress } = series;
  const progressPercent =
    progress.ownedCount > 0 ? Math.round((progress.finishedCount / progress.ownedCount) * 100) : 0;

  return (
    <div className="space-y-6">
      <Link
        href="/series"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        Back to Series
      </Link>

      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <input
                ref={nameInputRef}
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={handleNameKeyDown}
                onBlur={handleSaveName}
                className="font-heading border-primary border-b-2 bg-transparent text-xl font-semibold focus:outline-none"
                aria-label="Series name"
              />
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleSaveName}
                className="text-primary hover:text-primary/80 rounded-md p-1 transition-colors"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleCancelEdit}
                className="text-muted-foreground hover:text-foreground rounded-md p-1 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <h1 className="font-heading text-2xl font-semibold">{series.name}</h1>
          )}

          {series.designerId && series.designerName && (
            <p className="text-muted-foreground mt-0.5 text-sm">
              by{" "}
              <Link
                href={`/designers/${series.designerId}`}
                className="text-primary hover:text-primary/80 transition-colors"
              >
                {series.designerName}
              </Link>
            </p>
          )}
        </div>

        <div className="ml-4 flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setEditName(series.name);
              setIsEditingName(true);
            }}
            className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-md p-1.5 transition-colors"
            aria-label="Edit series name"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setDeleteDialogOpen(true)}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md p-1.5 transition-colors"
            aria-label="Delete series"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
            <div
              className="bg-primary h-full rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-muted-foreground shrink-0 text-sm">
            {progress.finishedCount} of {progress.ownedCount} finished
          </span>
        </div>
        {progress.totalCount !== null && (
          <p className="text-muted-foreground text-sm">
            {progress.ownedCount} of {progress.totalCount} owned
          </p>
        )}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <span className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
            Charts ({series.charts.length})
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

        {sortedCharts.length > 0 ? (
          <div className="space-y-2">
            {sortedCharts.map((chart) => (
              <ChartRow key={chart.id} chart={chart} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={ImageIcon}
            title="No charts in this series yet"
            description="Charts can be assigned from the chart form."
          />
        )}
      </div>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Series?"
        entityName={series.name}
        chartCount={series.charts.length}
        entityType="series"
        onConfirm={handleDelete}
      />
    </div>
  );
}

function ChartRow({ chart }: { chart: SeriesChart }) {
  const { count: effectiveCount } = getEffectiveStitchCount(
    chart.stitchCount,
    chart.stitchesWide,
    chart.stitchesHigh,
  );

  const progressPercent =
    chart.status === "IN_PROGRESS" && effectiveCount > 0
      ? Math.round((chart.stitchesCompleted / effectiveCount) * 100)
      : null;

  const thumbnailSrc = chart.coverThumbnailUrl ?? chart.coverImageUrl;

  return (
    <Link
      href={`/charts/${chart.id}`}
      className="border-border hover:bg-muted/50 flex items-center gap-3 rounded-lg border p-3 transition-colors"
    >
      {thumbnailSrc ? (
        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnailSrc}
            alt={chart.name}
            className="h-full w-full object-cover"
            style={getObjectPositionStyle(chart.focalPointX, chart.focalPointY)}
          />
        </div>
      ) : (
        <div className="bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
          <ImageIcon className="text-muted-foreground/40 h-4 w-4" />
        </div>
      )}

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
