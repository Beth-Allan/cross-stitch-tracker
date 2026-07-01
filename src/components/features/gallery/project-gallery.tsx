"use client";

import { useMemo } from "react";
import { Plus } from "lucide-react";
import { LinkButton } from "@/components/ui/link-button";
import { FilterBar } from "./filter-bar";
import { FilterChips } from "./filter-chips";
import { ViewToggleBar } from "./view-toggle-bar";
import { GalleryGrid } from "./gallery-grid";
import { useGalleryFilters } from "./use-gallery-filters";
import { transformToGalleryCard } from "./gallery-utils";
import type { GalleryChartData } from "@/types/chart";

interface ProjectGalleryProps {
  charts: GalleryChartData[];
  imageUrls: Record<string, string>;
  hideHeader?: boolean;
}

export function ProjectGallery({ charts, imageUrls, hideHeader }: ProjectGalleryProps) {
  // Transform server data to gallery card shape
  const cards = useMemo(
    () => charts.map((c) => transformToGalleryCard(c, imageUrls)),
    [charts, imageUrls],
  );

  // Get all state from URL-synced hook
  const {
    view,
    sort,
    dir,
    search,
    statusFilter,
    sizeFilter,
    seriesFilter,
    setView,
    setSort,
    setSearch,
    toggleStatus,
    toggleSize,
    toggleSeries,
    clearFilters,
    filteredAndSorted,
    seriesOptions,
    totalCount,
    filteredCount,
    hasActiveFilters,
  } = useGalleryFilters(cards);

  const seriesNames = useMemo(() => {
    const map: Record<string, string> = {};
    for (const opt of seriesOptions) {
      map[opt.value] = opt.label;
    }
    return map;
  }, [seriesOptions]);

  return (
    <div className="space-y-6">
      {!hideHeader && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-semibold">Project Gallery</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Browse and filter all your cross stitch projects
            </p>
          </div>
          <LinkButton href="/charts/new" className="self-start sm:self-auto">
            <Plus className="size-4" />
            Add Project
          </LinkButton>
        </div>
      )}

      <FilterBar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusToggle={toggleStatus}
        sizeFilter={sizeFilter}
        onSizeToggle={toggleSize}
        seriesFilter={seriesFilter}
        onSeriesToggle={toggleSeries}
        seriesOptions={seriesOptions}
      />

      <FilterChips
        search={search}
        statusFilter={statusFilter}
        sizeFilter={sizeFilter}
        seriesFilter={seriesFilter}
        seriesNames={seriesNames}
        onRemoveSearch={() => setSearch("")}
        onRemoveStatus={toggleStatus}
        onRemoveSize={toggleSize}
        onRemoveSeries={toggleSeries}
        onClearAll={clearFilters}
      />

      <div className="border-border border-b" />

      <ViewToggleBar
        view={view}
        onViewChange={setView}
        sort={sort}
        dir={dir}
        onSortChange={setSort}
        totalCount={totalCount}
        filteredCount={filteredCount}
        hasActiveFilters={hasActiveFilters}
      />

      <GalleryGrid
        cards={filteredAndSorted}
        view={view}
        sort={sort}
        dir={dir}
        onSortChange={setSort}
        hasProjects={totalCount > 0}
        onClearFilters={clearFilters}
      />
    </div>
  );
}
