"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Library, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { SeriesFormModal } from "./series-form-modal";
import { SeriesCard } from "./series-card";
import { SeriesSortPills } from "./series-sort-pills";
import { useSeriesSort } from "./use-series-sort";
import { DeleteConfirmationDialog } from "../designers/delete-confirmation-dialog";
import { deleteSeries } from "@/lib/actions/series-actions";
import type { SeriesWithStats } from "@/types/series";

export function SeriesList({ series }: { series: SeriesWithStats[] }) {
  const router = useRouter();
  const { sort, handleSort, sortedSeries } = useSeriesSort(series);
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
    } catch (error) {
      console.error("SeriesList delete failed:", error);
      toast.error("Something went wrong. Please try again.");
    }
  }

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

      <SeriesSortPills sort={sort} onSort={handleSort} />

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
