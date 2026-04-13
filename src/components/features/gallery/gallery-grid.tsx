"use client";

import Link from "next/link";
import { Scissors, ChevronUp, ChevronDown, Check, Circle, Minus } from "lucide-react";
import { LinkButton } from "@/components/ui/link-button";
import { StatusBadge } from "@/components/features/charts/status-badge";
import { STATUS_CONFIG } from "@/lib/utils/status";
import { GalleryCard } from "./gallery-card";
import type {
  GalleryCardData,
  ViewMode,
  SortField,
  SortDir,
  KittingItemStatus,
} from "./gallery-types";

// ─── Props ──────────────────────────────────────────────────────────────────

interface GalleryGridProps {
  cards: GalleryCardData[];
  view: ViewMode;
  sort: SortField;
  dir: SortDir;
  onSortChange: (field: SortField) => void;
  hasProjects: boolean;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// ─── Empty States ───────────────────────────────────────────────────────────

function EmptyFilterState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Scissors className="h-10 w-10 text-stone-300 dark:text-stone-600" />
      <p className="mt-4 text-sm text-muted-foreground">
        No projects match your filters
      </p>
    </div>
  );
}

function EmptyProjectState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Scissors className="h-10 w-10 text-stone-300 dark:text-stone-600" />
      <h2 className="mt-4 font-heading text-lg font-semibold text-foreground">
        No projects yet
      </h2>
      <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
        Add your first cross stitch project to start building your collection.
      </p>
      <LinkButton href="/charts/new" className="mt-6">
        Add Project
      </LinkButton>
    </div>
  );
}

// ─── Gallery View ───────────────────────────────────────────────────────────

function GalleryView({ cards }: { cards: GalleryCardData[] }) {
  return (
    <div
      role="list"
      className="grid gap-6"
      style={{
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 340px))",
      }}
    >
      {cards.map((card) => (
        <div key={card.chartId} role="listitem">
          <GalleryCard card={card} />
        </div>
      ))}
    </div>
  );
}

// ─── List View ──────────────────────────────────────────────────────────────

function ListContextStats({ card }: { card: GalleryCardData }) {
  if (card.statusGroup === "wip") {
    return (
      <div className="text-[11px] text-muted-foreground">
        <p>
          {formatNumber(card.stitchesCompleted)} /{" "}
          {formatNumber(card.stitchCount)} stitches
        </p>
        <p>{card.threadColourCount} colours</p>
      </div>
    );
  }

  if (card.statusGroup === "unstarted") {
    return (
      <div className="text-[11px] text-muted-foreground">
        <p>{formatNumber(card.stitchCount)} stitches</p>
        <p>{card.threadColourCount} colours</p>
      </div>
    );
  }

  // Finished
  return (
    <div className="text-[11px] text-muted-foreground">
      <p>
        {formatNumber(card.stitchCount)} stitches &middot;{" "}
        {card.threadColourCount} colours
      </p>
      {card.finishDate && <p>{formatDate(card.finishDate)}</p>}
    </div>
  );
}

function ListKittingIcons({ card }: { card: GalleryCardData }) {
  const items: { label: string; status: KittingItemStatus }[] = [
    { label: "Fabric", status: card.fabricStatus },
    { label: "Thread", status: card.threadStatus },
    { label: "Beads", status: card.beadsStatus },
    { label: "Specialty", status: card.specialtyStatus },
  ];

  return (
    <div className="flex items-center gap-1">
      {items.map((item) => (
        <span
          key={item.label}
          title={`${item.label}: ${item.status === "fulfilled" ? "Ready" : item.status === "not-applicable" ? "N/A" : "Needed"}`}
        >
          {item.status === "fulfilled" ? (
            <Check
              className="w-3 h-3 text-emerald-500 dark:text-emerald-400"
              strokeWidth={2.5}
            />
          ) : item.status === "not-applicable" ? (
            <Minus
              className="w-3 h-3 text-stone-300 dark:text-stone-600"
              strokeWidth={2}
            />
          ) : (
            <Circle
              className="w-3 h-3 text-stone-400 dark:text-stone-500"
              strokeWidth={2}
            />
          )}
        </span>
      ))}
    </div>
  );
}

function ListProgressCell({ card }: { card: GalleryCardData }) {
  if (card.statusGroup === "wip") {
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full"
            style={{ width: `${card.progressPercent}%` }}
          />
        </div>
        <span className="text-xs text-emerald-600 dark:text-emerald-400 tabular-nums font-mono">
          {card.progressPercent}%
        </span>
      </div>
    );
  }

  if (card.statusGroup === "unstarted") {
    return <ListKittingIcons card={card} />;
  }

  // Finished
  return (
    <div className="text-[11px] text-muted-foreground">
      {card.finishDate && (
        <>
          <span>{formatDate(card.finishDate)}</span>
          <p className="text-[10px]">Finished</p>
        </>
      )}
      {!card.finishDate && <span>&mdash;</span>}
    </div>
  );
}

function ListView({ cards }: { cards: GalleryCardData[] }) {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      {cards.map((card) => (
        <div
          key={card.chartId}
          className="bg-card border-b border-border py-2 px-4 hover:bg-muted/50 transition-colors items-center gap-x-4 grid"
          style={{
            gridTemplateColumns:
              "8px minmax(180px, 2fr) minmax(120px, 1fr) minmax(100px, 120px) 64px 56px",
          }}
        >
          {/* 1. Status dot */}
          <span
            className={`w-2 h-2 rounded-full ${STATUS_CONFIG[card.status].dotClass}`}
          />

          {/* 2. Name + designer */}
          <div className="min-w-0">
            <Link
              href={`/charts/${card.chartId}`}
              className="text-sm font-heading font-semibold text-foreground hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors underline decoration-stone-300 dark:decoration-stone-600 underline-offset-2 hover:decoration-emerald-500 truncate block"
            >
              {card.name}
            </Link>
            <p className="text-xs text-muted-foreground truncate">
              {card.designerName}
            </p>
          </div>

          {/* 3. Context stats */}
          <div className="min-w-0 hidden sm:block">
            <ListContextStats card={card} />
          </div>

          {/* 4. Progress / kitting / finish date */}
          <div className="hidden sm:block">
            <ListProgressCell card={card} />
          </div>

          {/* 5. Status label */}
          <span className="text-xs text-muted-foreground whitespace-nowrap hidden sm:block">
            {STATUS_CONFIG[card.status].label}
          </span>

          {/* 6. Size badge */}
          <span className="text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-center hidden sm:block">
            {card.sizeCategory}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Table View ─────────────────────────────────────────────────────────────

interface TableColumn {
  label: string;
  sortField: SortField | null;
  hideClass?: string;
  align?: "left" | "right";
}

const TABLE_COLUMNS: TableColumn[] = [
  { label: "Project", sortField: "name" },
  { label: "Status", sortField: "status" },
  { label: "Designer", sortField: "designer", hideClass: "max-md:hidden" },
  { label: "Size", sortField: "size", hideClass: "max-sm:hidden" },
  { label: "Progress", sortField: "stitchCount", hideClass: "max-sm:hidden" },
  {
    label: "Stitches",
    sortField: "stitchCount",
    hideClass: "max-lg:hidden",
    align: "right",
  },
  {
    label: "Colours",
    sortField: null,
    hideClass: "max-lg:hidden",
    align: "right",
  },
];

function TableView({
  cards,
  sort,
  dir,
  onSortChange,
}: {
  cards: GalleryCardData[];
  sort: SortField;
  dir: SortDir;
  onSortChange: (field: SortField) => void;
}) {
  function getProgressDisplay(card: GalleryCardData): string {
    if (card.statusGroup === "wip") return `${card.progressPercent}%`;
    if (card.statusGroup === "finished") return "100%";
    return "--";
  }

  return (
    <div className="rounded-xl border border-border overflow-x-auto">
      <table className="w-full border-collapse">
        <caption className="sr-only">
          Your cross-stitch project collection
        </caption>
        <thead>
          <tr className="border-b border-border bg-muted/50">
            {TABLE_COLUMNS.map((col) => {
              const isActive = col.sortField !== null && col.sortField === sort;
              // Map column -> sort field for unique identification
              const fieldForSort = col.sortField;
              return (
                <th
                  key={col.label}
                  className={`px-4 py-2.5 text-left ${col.hideClass ?? ""}`}
                  aria-sort={
                    isActive
                      ? dir === "asc"
                        ? "ascending"
                        : "descending"
                      : undefined
                  }
                  style={col.align === "right" ? { textAlign: "right" } : undefined}
                >
                  {fieldForSort ? (
                    <button
                      type="button"
                      onClick={() => onSortChange(fieldForSort)}
                      className="inline-flex items-center gap-1 text-muted-foreground text-xs font-semibold uppercase tracking-wider cursor-pointer hover:text-foreground transition-colors"
                    >
                      {col.label}
                      {isActive &&
                        (dir === "asc" ? (
                          <ChevronUp className="w-3 h-3" />
                        ) : (
                          <ChevronDown className="w-3 h-3" />
                        ))}
                    </button>
                  ) : (
                    <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
                      {col.label}
                    </span>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {cards.map((card) => (
            <tr
              key={card.chartId}
              className="hover:bg-muted/50 transition-colors border-b border-border/60"
            >
              {/* Project */}
              <td className="px-4 py-2.5">
                <Link
                  href={`/charts/${card.chartId}`}
                  className="text-sm font-heading font-semibold text-foreground hover:text-primary transition-colors"
                >
                  {card.name}
                </Link>
                <p className="text-[11px] text-muted-foreground md:hidden">
                  {card.designerName}
                </p>
              </td>
              {/* Status */}
              <td className="px-4 py-2.5">
                <StatusBadge status={card.status} />
              </td>
              {/* Designer */}
              <td className="px-4 py-2.5 max-md:hidden">
                <span className="text-sm text-muted-foreground">
                  {card.designerName}
                </span>
              </td>
              {/* Size */}
              <td className="px-4 py-2.5 max-sm:hidden">
                <span className="text-xs text-muted-foreground">
                  {card.sizeCategory}
                </span>
              </td>
              {/* Progress */}
              <td className="px-4 py-2.5 max-sm:hidden">
                {card.statusGroup === "wip" ? (
                  <div className="flex items-center gap-2 max-w-[100px]">
                    <div className="flex-1 h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 dark:bg-emerald-400 rounded-full"
                        style={{ width: `${card.progressPercent}%` }}
                      />
                    </div>
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 tabular-nums font-mono">
                      {card.progressPercent}%
                    </span>
                  </div>
                ) : (
                  <span
                    className={`text-xs tabular-nums font-mono ${
                      card.statusGroup === "finished"
                        ? "text-violet-600 dark:text-violet-400"
                        : "text-muted-foreground"
                    }`}
                  >
                    {getProgressDisplay(card)}
                  </span>
                )}
              </td>
              {/* Stitches */}
              <td className="px-4 py-2.5 text-right max-lg:hidden">
                <span className="text-xs text-muted-foreground tabular-nums">
                  {card.statusGroup === "wip"
                    ? `${formatNumber(card.stitchesCompleted)} / ${formatNumber(card.stitchCount)}`
                    : formatNumber(card.stitchCount)}
                </span>
              </td>
              {/* Colours */}
              <td className="px-4 py-2.5 text-right max-lg:hidden">
                <span className="text-xs text-muted-foreground tabular-nums">
                  {card.threadColourCount}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main GalleryGrid ───────────────────────────────────────────────────────

export function GalleryGrid({
  cards,
  view,
  sort,
  dir,
  onSortChange,
  hasProjects,
}: GalleryGridProps) {
  if (cards.length === 0) {
    return hasProjects ? <EmptyFilterState /> : <EmptyProjectState />;
  }

  switch (view) {
    case "gallery":
      return <GalleryView cards={cards} />;
    case "list":
      return <ListView cards={cards} />;
    case "table":
      return (
        <TableView
          cards={cards}
          sort={sort}
          dir={dir}
          onSortChange={onSortChange}
        />
      );
  }
}
