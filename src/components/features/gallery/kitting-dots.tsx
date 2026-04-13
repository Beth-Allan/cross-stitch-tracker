"use client";

import { Check, CircleDot, Circle, Minus } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";
import type { KittingItemStatus } from "./gallery-types";

interface KittingDotsProps {
  fabricStatus: KittingItemStatus;
  threadStatus: KittingItemStatus;
  beadsStatus: KittingItemStatus;
  specialtyStatus: KittingItemStatus;
}

export function KittingDotIcon({ status }: { status: KittingItemStatus }) {
  switch (status) {
    case "fulfilled":
      return <Check className="h-3 w-3 text-emerald-500 dark:text-emerald-400" strokeWidth={2.5} />;
    case "partial":
      return <CircleDot className="h-3 w-3 text-amber-500 dark:text-amber-400" strokeWidth={2} />;
    case "needed":
      return <Circle className="text-muted-foreground h-3 w-3" strokeWidth={2} />;
    case "not-applicable":
      return <Minus className="text-muted-foreground/30 h-3 w-3" strokeWidth={2} />;
  }
}

export function getKittingTooltipText(label: string, status: KittingItemStatus): string {
  switch (status) {
    case "fulfilled":
      return `${label}: Ready`;
    case "partial":
      return `${label}: In progress`;
    case "needed":
      return `${label}: Still needed`;
    case "not-applicable":
      return `${label}: Not needed for this project`;
  }
}

export function KittingDots({
  fabricStatus,
  threadStatus,
  beadsStatus,
  specialtyStatus,
}: KittingDotsProps) {
  const items: { label: string; status: KittingItemStatus }[] = [
    { label: "Fabric", status: fabricStatus },
    { label: "Thread", status: threadStatus },
    { label: "Beads", status: beadsStatus },
    { label: "Specialty", status: specialtyStatus },
  ];

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2.5">
        {items.map((item) => {
          const tooltipText = getKittingTooltipText(item.label, item.status);
          return (
            <Tooltip key={item.label}>
              <TooltipTrigger className="flex items-center gap-1" aria-label={tooltipText}>
                <KittingDotIcon status={item.status} />
                <span
                  className={`text-[10px] ${
                    item.status === "not-applicable"
                      ? "text-muted-foreground/30 line-through"
                      : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </span>
              </TooltipTrigger>
              <TooltipContent>{tooltipText}</TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
