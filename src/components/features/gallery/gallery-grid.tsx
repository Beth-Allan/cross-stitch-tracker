"use client";

import { useState } from "react";
import Link from "next/link";
import { Scissors, ChevronUp, ChevronDown } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import { LinkButton } from "@/components/ui/link-button";
import { ListRowKebabMenu } from "@/components/features/charts/list-row-kebab-menu";
import { StatusBadge } from "@/components/features/charts/status-badge";
import { STATUS_CONFIG } from "@/lib/utils/status";
import { SIZE_COLORS } from "@/lib/utils/size-category";
import { STATUS_GRADIENT_CLASSES } from "./gallery-utils";
import { KittingDotIcon, getKittingTooltipText } from "./kitting-dots";
import { GalleryCard } from "./gallery-card";
import { formatNumber, formatDate, SIZE_TOOLTIP_TEXT } from "./gallery-format";
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
  onClearFilters?: () => void;
}

// ─── Small Thumbnail ────────────────────────────────────────────────────────

function SmallThumbnail({ card }: { card: GalleryCardData }) {
  const [imgFailed, setImgFailed] = useState(false);
  const url = card.coverThumbnailUrl ?? card.coverImageUrl;

  if (url && !imgFailed) {
    return (
      <img
        src={url}
        alt=""
        loading="lazy"
        decoding="async"
        className="h-10 w-10 rounded-md object-cover"
        onError={() => setImgFailed(true)}
      />
    );
  }

  return (
    <div
      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${STATUS_GRADIENT_CLASSES[card.status]}`}
    >
      <Scissors className="text-muted-foreground/15 h-4 w-4" strokeWidth={1} />
    </div>
  );
}

// ─── Empty States ───────────────────────────────────────────────────────────

function EmptyFilterState({ onClearFilters }: { onClearFilters?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Scissors className="text-muted-foreground/30 h-10 w-10" />
      <p className="text-muted-foreground mt-4 text-sm">No projects match your filters</p>
      <p className="text-muted-foreground/60 mt-1 text-xs">Try adjusting your search or filters</p>
      {onClearFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="text-progress-foreground hover:text-selected-foreground mt-4 text-sm font-medium transition-colors"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}

function EmptyProjectState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Scissors className="text-muted-foreground/30 h-10 w-10" />
      <h2 className="font-heading text-foreground mt-4 text-lg font-semibold">No projects yet</h2>
      <p className="text-muted-foreground mt-1.5 max-w-xs text-sm">
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
      className="grid justify-center gap-6"
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
      <div className="text-muted-foreground text-[11px]">
        <p>
          {formatNumber(card.stitchesCompleted)} / {formatNumber(card.stitchCount)} stitches
        </p>
        <p>
          {card.threadColourCount} {card.threadColourCount === 1 ? "colour" : "colours"}
        </p>
      </div>
    );
  }

  if (card.statusGroup === "unstarted") {
    return (
      <div className="text-muted-foreground text-[11px]">
        <p>{formatNumber(card.stitchCount)} stitches</p>
        <p>
          {card.threadColourCount} {card.threadColourCount === 1 ? "colour" : "colours"}
        </p>
      </div>
    );
  }

  // Finished
  return (
    <div className="text-muted-foreground text-[11px]">
      <p>
        {formatNumber(card.stitchCount)} stitches &middot; {card.threadColourCount}{" "}
        {card.threadColourCount === 1 ? "colour" : "colours"}
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
    <TooltipProvider>
      <div className="flex items-center gap-1">
        {items.map((item) => {
          const text = getKittingTooltipText(item.label, item.status);
          return (
            <Tooltip key={item.label}>
              <TooltipTrigger render={<span />} aria-label={text} className="cursor-default">
                <KittingDotIcon status={item.status} />
              </TooltipTrigger>
              <TooltipContent>{text}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}

function ListProgressCell({ card }: { card: GalleryCardData }) {
  if (card.statusGroup === "wip") {
    return (
      <div className="flex items-center gap-2">
        <div className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full">
          <div
            className="bg-progress h-full rounded-full"
            style={{ width: `${card.progressPercent}%` }}
          />
        </div>
        <span className="text-progress-foreground font-mono text-xs tabular-nums">
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
    <div className="text-muted-foreground text-[11px]">
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

function ListMobileStat({ card }: { card: GalleryCardData }) {
  if (card.statusGroup === "wip") {
    return (
      <span className="text-muted-foreground text-[11px] sm:hidden">
        {card.progressPercent}% &middot; {formatNumber(card.stitchCount)} stitches
      </span>
    );
  }
  if (card.statusGroup === "finished" && card.finishDate) {
    return (
      <span className="text-muted-foreground text-[11px] sm:hidden">
        Finished {formatDate(card.finishDate)}
      </span>
    );
  }
  return (
    <span className="text-muted-foreground text-[11px] sm:hidden">
      {formatNumber(card.stitchCount)} stitches &middot; {card.threadColourCount}{" "}
      {card.threadColourCount === 1 ? "colour" : "colours"}
    </span>
  );
}

function ListView({ cards }: { cards: GalleryCardData[] }) {
  return (
    <div role="list" className="border-border overflow-hidden rounded-xl border">
      {cards.map((card) => (
        <div
          key={card.chartId}
          role="listitem"
          className="group bg-card border-border hover:bg-muted/50 grid grid-cols-[40px_8px_1fr_auto_44px] items-center gap-x-4 border-b px-4 py-2 transition-colors sm:grid-cols-[40px_8px_minmax(180px,2fr)_minmax(120px,1fr)_minmax(100px,120px)_64px_56px_44px]"
        >
          <SmallThumbnail card={card} />

          <span className={`h-2 w-2 rounded-full ${STATUS_CONFIG[card.status].dotClass}`} />

          <div className="min-w-0">
            <Link
              href={`/charts/${card.chartId}`}
              className="font-heading text-foreground decoration-border hover:text-selected-foreground hover:decoration-progress block truncate text-sm font-semibold underline underline-offset-2 transition-colors"
            >
              {card.name}
            </Link>
            <p className="text-muted-foreground truncate text-xs">{card.designerName}</p>
            <ListMobileStat card={card} />
          </div>

          <div className="sm:hidden">
            <StatusBadge status={card.status} />
          </div>
          <div className="hidden min-w-0 sm:block">
            <ListContextStats card={card} />
          </div>

          <div className="hidden sm:block">
            <ListProgressCell card={card} />
          </div>

          <span className="text-muted-foreground hidden text-xs whitespace-nowrap sm:block">
            {STATUS_CONFIG[card.status].label}
          </span>

          <div className="hidden sm:block">
            <Tooltip>
              <TooltipTrigger
                render={<span />}
                className={`${SIZE_COLORS[card.sizeCategory].bg} ${SIZE_COLORS[card.sizeCategory].text} cursor-default rounded-full px-2 py-0.5 text-center text-[10px] font-bold tracking-widest uppercase`}
              >
                {card.sizeCategory}
              </TooltipTrigger>
              <TooltipContent>{SIZE_TOOLTIP_TEXT[card.sizeCategory]}</TooltipContent>
            </Tooltip>
          </div>

          <div className="flex items-center justify-end transition-opacity group-focus-within:opacity-100 sm:opacity-40 sm:group-hover:opacity-100">
            <ListRowKebabMenu chartId={card.chartId} chartName={card.name} />
          </div>
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
  { label: "Progress", sortField: "progress", hideClass: "max-sm:hidden" },
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
    <div className="border-border overflow-x-auto rounded-xl border">
      <table className="w-full border-collapse">
        <caption className="sr-only">Your cross-stitch project collection</caption>
        <thead>
          <tr className="border-border bg-muted/50 border-b">
            {TABLE_COLUMNS.map((col) => {
              const isActive = col.sortField !== null && col.sortField === sort;
              // Map column -> sort field for unique identification
              const fieldForSort = col.sortField;
              return (
                <th
                  key={col.label}
                  className={`px-4 py-2.5 text-left ${col.hideClass ?? ""}`}
                  aria-sort={isActive ? (dir === "asc" ? "ascending" : "descending") : undefined}
                  style={col.align === "right" ? { textAlign: "right" } : undefined}
                >
                  {fieldForSort ? (
                    <button
                      type="button"
                      onClick={() => onSortChange(fieldForSort)}
                      className="text-muted-foreground hover:text-foreground inline-flex cursor-pointer items-center gap-1 text-xs font-semibold tracking-wider uppercase transition-colors"
                    >
                      {col.label}
                      {isActive &&
                        (dir === "asc" ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        ))}
                    </button>
                  ) : (
                    <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                      {col.label}
                    </span>
                  )}
                </th>
              );
            })}
            <th className="w-12" />
          </tr>
        </thead>
        <tbody>
          {cards.map((card) => (
            <tr
              key={card.chartId}
              className="group bg-card hover:bg-muted/50 border-border border-b transition-colors"
            >
              <td className="px-4 py-2.5">
                <div className="flex items-center gap-3">
                  <SmallThumbnail card={card} />
                  <div className="min-w-0">
                    <Link
                      href={`/charts/${card.chartId}`}
                      className="font-heading text-foreground decoration-border hover:text-selected-foreground hover:decoration-progress block truncate text-sm font-semibold underline underline-offset-2 transition-colors"
                    >
                      {card.name}
                    </Link>
                    <p className="text-muted-foreground truncate text-[11px] md:hidden">
                      {card.designerName}
                    </p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-2.5">
                <StatusBadge status={card.status} />
              </td>
              <td className="px-4 py-2.5 max-md:hidden">
                <span className="text-muted-foreground text-sm">{card.designerName}</span>
              </td>
              <td className="px-4 py-2.5 max-sm:hidden">
                <Tooltip>
                  <TooltipTrigger
                    render={<span />}
                    className={`${SIZE_COLORS[card.sizeCategory].bg} ${SIZE_COLORS[card.sizeCategory].text} cursor-default rounded-full px-2 py-0.5 text-xs`}
                  >
                    {card.sizeCategory}
                  </TooltipTrigger>
                  <TooltipContent>{SIZE_TOOLTIP_TEXT[card.sizeCategory]}</TooltipContent>
                </Tooltip>
              </td>
              <td className="px-4 py-2.5 max-sm:hidden">
                {card.statusGroup === "wip" ? (
                  <div className="flex max-w-[100px] items-center gap-2">
                    <div className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full">
                      <div
                        className="bg-progress h-full rounded-full"
                        style={{ width: `${card.progressPercent}%` }}
                      />
                    </div>
                    <span className="text-progress-foreground font-mono text-xs tabular-nums">
                      {card.progressPercent}%
                    </span>
                  </div>
                ) : (
                  <span
                    className={`font-mono text-xs tabular-nums ${
                      card.statusGroup === "finished"
                        ? "text-violet-600 dark:text-violet-400"
                        : "text-muted-foreground"
                    }`}
                  >
                    {getProgressDisplay(card)}
                  </span>
                )}
              </td>
              <td className="px-4 py-2.5 text-right max-lg:hidden">
                <span className="text-muted-foreground text-xs tabular-nums">
                  {card.statusGroup === "wip"
                    ? `${formatNumber(card.stitchesCompleted)} / ${formatNumber(card.stitchCount)}`
                    : formatNumber(card.stitchCount)}
                </span>
              </td>
              <td className="px-4 py-2.5 text-right max-lg:hidden">
                <span className="text-muted-foreground text-xs tabular-nums">
                  {card.threadColourCount}
                </span>
              </td>
              <td className="px-2 py-2.5">
                <div className="flex items-center justify-end opacity-40 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                  <ListRowKebabMenu chartId={card.chartId} chartName={card.name} />
                </div>
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
  onClearFilters,
}: GalleryGridProps) {
  if (cards.length === 0) {
    return hasProjects ? (
      <EmptyFilterState onClearFilters={onClearFilters} />
    ) : (
      <EmptyProjectState />
    );
  }

  switch (view) {
    case "gallery":
      return <GalleryView cards={cards} />;
    case "list":
      return <ListView cards={cards} />;
    case "table":
      return <TableView cards={cards} sort={sort} dir={dir} onSortChange={onSortChange} />;
  }
}
