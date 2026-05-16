"use client";

import { ArrowLeft } from "lucide-react";

interface SummaryBarProps {
  name: string;
  designerName: string | null;
  statusLabel: string;
  stitchCount: number;
  onDetailsClick: () => void;
}

export function SummaryBar({
  name,
  designerName,
  statusLabel,
  stitchCount,
  onDetailsClick,
}: SummaryBarProps) {
  const tokens = [
    name,
    designerName,
    statusLabel,
    stitchCount > 0 ? `${stitchCount.toLocaleString()} stitches` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div
      role="banner"
      aria-label="Project summary"
      className="border-border bg-card sticky top-14 z-[90] border-b"
    >
      <div className="mx-auto flex max-w-[720px] items-center gap-3 px-4 py-3">
        <button
          type="button"
          onClick={onDetailsClick}
          aria-label="Return to form details"
          className="text-primary flex shrink-0 items-center gap-1 text-sm font-semibold hover:underline"
        >
          <ArrowLeft className="size-4" />
          Details
        </button>
        <p className="text-foreground truncate text-sm">{tokens}</p>
      </div>
    </div>
  );
}
