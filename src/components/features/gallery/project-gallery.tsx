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
import type { GalleryChartWithProject } from "./gallery-types";

interface ProjectGalleryProps {
  charts: GalleryChartData[];
  imageUrls: Record<string, string>;
}

export function ProjectGallery({ charts, imageUrls }: ProjectGalleryProps) {
  // Transform server data to gallery card shape
  const cards = useMemo(
    () =>
      charts.map((c) => transformToGalleryCard(c as unknown as GalleryChartWithProject, imageUrls)),
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
    setView,
    setSort,
    setSearch,
    toggleStatus,
    toggleSize,
    clearFilters,
    filteredAndSorted,
    totalCount,
    filteredCount,
    hasActiveFilters,
  } = useGalleryFilters(cards);

  return (
    <div className="space-y-6">
      {/* Page header */}
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

      {/* Filter bar */}
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusToggle={toggleStatus}
        sizeFilter={sizeFilter}
        onSizeToggle={toggleSize}
      />

      {/* Filter chips */}
      <FilterChips
        search={search}
        statusFilter={statusFilter}
        sizeFilter={sizeFilter}
        onRemoveSearch={() => setSearch("")}
        onRemoveStatus={toggleStatus}
        onRemoveSize={toggleSize}
        onClearAll={clearFilters}
      />

      {/* Separator */}
      <div className="border-border border-b" />

      {/* Toggle bar: count + sort + view */}
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

      {/* Gallery grid */}
      <GalleryGrid
        cards={filteredAndSorted}
        view={view}
        sort={sort}
        dir={dir}
        onSortChange={setSort}
        hasProjects={totalCount > 0}
      />
    </div>
  );
}
