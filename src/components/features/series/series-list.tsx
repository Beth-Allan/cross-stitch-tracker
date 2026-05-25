"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronUp, ChevronDown, Library, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SeriesFormModal } from "./series-form-modal";
import { DeleteConfirmationDialog } from "../designers/delete-confirmation-dialog";
import { deleteSeries } from "@/lib/actions/series-actions";
import type { SeriesWithStats } from "@/types/series";

type SortKey = "name" | "completion" | "charts";
type SortDir = "asc" | "desc";

function getCompletionPercent(series: SeriesWithStats): number {
  if (series.progress.ownedCount === 0) return 0;
  return Math.round((series.progress.finishedCount / series.progress.ownedCount) * 100);
}

export function SeriesList({ series }: { series: SeriesWithStats[] }) {
  const router = useRouter();
  const [sort, setSort] = useState<{ key: SortKey; dir: SortDir }>({ key: "name", dir: "asc" });
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [deletingSeries, setDeletingSeries] = useState<SeriesWithStats | null>(null);

  async function handleDelete() {
    if (!deletingSeries) return;
    try {
      const result = await deleteSeries(deletingSeries.id);
      if (result.success) {
        toast.success("Series deleted");
        router.refresh();
      } else {
        toast.error(result.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    }
  }

  function handleSort(key: SortKey) {
    setSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" },
    );
  }

  const sortedSeries = useMemo(() => {
    const result = [...series];
    result.sort((a, b) => {
      const dir = sort.dir === "asc" ? 1 : -1;
      switch (sort.key) {
        case "name":
          return dir * a.name.localeCompare(b.name);
        case "completion": {
          const aOwned = a.progress.ownedCount;
          const bOwned = b.progress.ownedCount;
          // 0-chart series sort to bottom regardless of direction
          if (aOwned === 0 && bOwned === 0) return 0;
          if (aOwned === 0) return 1;
          if (bOwned === 0) return -1;
          const aRatio = a.progress.finishedCount / aOwned;
          const bRatio = b.progress.finishedCount / bOwned;
          return dir * (aRatio - bRatio);
        }
        case "charts":
          return dir * (a.progress.ownedCount - b.progress.ownedCount);
        default:
          return 0;
      }
    });
    return result;
  }, [series, sort]);

  if (series.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between">
          <h1 className="font-heading text-2xl font-semibold">Series</h1>
        </div>
        <EmptyState
          icon={Library}
          title="No series created yet"
          description="Add your first series to start organizing your collection."
          heading
        >
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="h-4 w-4" data-icon="inline-start" />
            Add Series
          </Button>
        </EmptyState>
        <SeriesFormModal open={createModalOpen} onOpenChange={setCreateModalOpen} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-semibold">Series</h1>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="h-4 w-4" data-icon="inline-start" />
          Add Series
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-muted-foreground mr-2 text-xs font-semibold tracking-widest uppercase">
          Sort by
        </span>
        {(
          [
            { key: "name" as SortKey, label: "Name" },
            { key: "completion" as SortKey, label: "Completion" },
            { key: "charts" as SortKey, label: "Charts" },
          ] as const
        ).map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => handleSort(opt.key)}
            className={`rounded-full px-3 py-1 text-xs transition-colors ${
              sort.key === opt.key
                ? "bg-success-muted text-success-muted-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {opt.label}
            {sort.key === opt.key &&
              (sort.dir === "asc" ? (
                <ChevronUp className="ml-0.5 inline h-3 w-3" />
              ) : (
                <ChevronDown className="ml-0.5 inline h-3 w-3" />
              ))}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sortedSeries.map((s) => (
          <SeriesCard key={s.id} series={s} onDelete={() => setDeletingSeries(s)} />
        ))}
      </div>

      <SeriesFormModal open={createModalOpen} onOpenChange={setCreateModalOpen} />

      <DeleteConfirmationDialog
        open={!!deletingSeries}
        onOpenChange={(open) => {
          if (!open) setDeletingSeries(null);
        }}
        title="Delete Series?"
        entityName={deletingSeries?.name ?? ""}
        chartCount={deletingSeries?.progress.ownedCount ?? 0}
        entityType="series"
        onConfirm={handleDelete}
      />
    </div>
  );
}

function SeriesCard({ series, onDelete }: { series: SeriesWithStats; onDelete: () => void }) {
  const percent = getCompletionPercent(series);
  const { ownedCount, finishedCount, totalCount } = series.progress;

  return (
    <Link
      href={`/series/${series.id}`}
      className="border-border bg-card hover:border-border/80 block rounded-xl border p-5 transition-all hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="font-heading text-foreground text-sm font-semibold">{series.name}</p>
          {series.designerName && (
            <p className="text-muted-foreground mt-0.5 text-xs">by {series.designerName}</p>
          )}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete();
          }}
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md p-1.5 transition-colors"
          aria-label={`Delete ${series.name}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="bg-muted mt-3 h-2 overflow-hidden rounded-full">
        {ownedCount > 0 && (
          <div className="bg-primary h-full rounded-full" style={{ width: `${percent}%` }} />
        )}
      </div>

      <div className="mt-2 flex items-center justify-between">
        <div className="text-muted-foreground text-xs">
          {totalCount !== null ? (
            <span>
              {finishedCount} of {ownedCount} finished
            </span>
          ) : (
            <span>
              {finishedCount} finished <span aria-hidden="true">&middot;</span> {ownedCount} charts
            </span>
          )}
        </div>
        <span className="text-primary text-sm font-semibold">{percent}%</span>
      </div>
    </Link>
  );
}
