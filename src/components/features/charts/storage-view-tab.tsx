"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, ChevronDown, Layers, Scissors } from "lucide-react";
import type { StorageGroup, StorageGroupItem } from "@/types/session";
import type { ProjectStatus } from "@/generated/prisma/client";
import { StatusBadge } from "@/components/features/charts/status-badge";

// ─── Status gradient placeholders ───────────────────────────────────────────

const statusGradients: Record<ProjectStatus, [string, string]> = {
  UNSTARTED: ["#e7e5e4", "#d6d3d1"],
  KITTING: ["#fef3c7", "#fde68a"],
  KITTED: ["#d1fae5", "#a7f3d0"],
  IN_PROGRESS: ["#e0f2fe", "#bae6fd"],
  ON_HOLD: ["#ffedd5", "#fed7aa"],
  FINISHED: ["#ede9fe", "#ddd6fe"],
  FFO: ["#ffe4e6", "#fecdd3"],
};

function CoverPlaceholder({ status }: { status: ProjectStatus }) {
  const [from, to] = statusGradients[status] ?? statusGradients.UNSTARTED;
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{ background: `linear-gradient(160deg, ${from} 0%, ${to} 100%)` }}
    >
      <Scissors className="h-4 w-4 text-stone-400/25" strokeWidth={1} />
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function StorageThumbnail({
  item,
  imageUrls,
}: {
  item: StorageGroupItem;
  imageUrls: Record<string, string>;
}) {
  const isProject = item.type === "project";
  const thumbnailUrl = item.coverThumbnailUrl ? imageUrls[item.coverThumbnailUrl] : null;

  if (isProject && thumbnailUrl) {
    return (
      <div className="h-9 w-9 shrink-0 overflow-hidden rounded-md">
        <img src={thumbnailUrl} alt={item.name} className="h-full w-full object-cover" />
      </div>
    );
  }

  if (isProject) {
    return (
      <div className="h-9 w-9 shrink-0 overflow-hidden rounded-md">
        <CoverPlaceholder status={item.status ?? "UNSTARTED"} />
      </div>
    );
  }

  // Fabric item
  return (
    <div className="bg-muted flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-md">
      <Layers
        data-testid={`layers-icon-${item.id}`}
        className="text-muted-foreground h-4 w-4"
        strokeWidth={1.5}
      />
    </div>
  );
}

function StorageItem({
  item,
  imageUrls,
}: {
  item: StorageGroupItem;
  imageUrls: Record<string, string>;
}) {
  const isProject = item.type === "project";

  return (
    <div className="border-border hover:bg-muted/30 flex items-center gap-3 border-t px-5 py-3 pl-11 transition-colors">
      <StorageThumbnail item={item} imageUrls={imageUrls} />

      {isProject ? (
        <Link
          href={`/charts/${item.id}`}
          className="min-w-0 flex-1 truncate text-left text-sm text-emerald-700 underline decoration-emerald-300 underline-offset-2 transition-colors hover:text-emerald-800"
        >
          {item.name}
        </Link>
      ) : (
        <span className="text-foreground min-w-0 flex-1 truncate text-left text-sm">
          {item.name}
        </span>
      )}

      {isProject && item.status && <StatusBadge status={item.status} />}

      {!isProject && (
        <span className="bg-muted text-muted-foreground shrink-0 rounded-full px-2 py-0.5 text-xs">
          {item.brandName} &middot; {item.fabricCount}ct
        </span>
      )}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

interface StorageViewTabProps {
  groups: StorageGroup[];
  imageUrls: Record<string, string>;
}

export function StorageViewTab({ groups, imageUrls }: StorageViewTabProps) {
  const [collapsed, setCollapsed] = useState<Set<string | null>>(new Set());

  function toggleGroup(locationId: string | null) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(locationId)) {
        next.delete(locationId);
      } else {
        next.add(locationId);
      }
      return next;
    });
  }

  const totalItems = groups.reduce((sum, g) => sum + g.items.length, 0);

  if (groups.length === 0) {
    return (
      <div className="text-muted-foreground py-12 text-center text-sm">
        No storage locations set up yet. Add locations in Settings to organize your collection.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Count summary */}
      <p className="text-muted-foreground text-sm">
        {groups.length} location{groups.length !== 1 ? "s" : ""} &middot; {totalItems} item
        {totalItems !== 1 ? "s" : ""}
      </p>

      {/* Location groups */}
      {groups.map((group) => {
        const isCollapsed = collapsed.has(group.locationId);
        const projectCount = group.items.filter((i) => i.type === "project").length;
        const fabricCount = group.items.filter((i) => i.type === "fabric").length;

        return (
          <div
            key={group.locationId ?? "__none__"}
            className="border-border overflow-hidden rounded-xl border"
          >
            {/* Group header */}
            <button
              type="button"
              onClick={() => toggleGroup(group.locationId)}
              className="bg-muted/50 hover:bg-muted flex w-full cursor-pointer items-center gap-3 px-5 py-3.5 transition-colors"
            >
              <MapPin className="text-muted-foreground h-4 w-4 shrink-0" strokeWidth={1.5} />
              <span className="font-heading text-foreground flex-1 text-left text-sm font-bold">
                {group.locationName}
              </span>
              <div className="flex shrink-0 items-center gap-3">
                {projectCount > 0 && (
                  <span className="text-muted-foreground text-xs">
                    {projectCount} project{projectCount !== 1 ? "s" : ""}
                  </span>
                )}
                {fabricCount > 0 && (
                  <span className="text-muted-foreground text-xs">
                    {fabricCount} fabric{fabricCount !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <ChevronDown
                className={`text-muted-foreground h-4 w-4 shrink-0 transition-transform duration-200 ${
                  isCollapsed ? "-rotate-90" : ""
                }`}
                strokeWidth={1.5}
              />
            </button>

            {/* Items */}
            {!isCollapsed && (
              <div className="bg-card">
                {group.items.map((item) => (
                  <StorageItem key={`${item.type}-${item.id}`} item={item} imageUrls={imageUrls} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
