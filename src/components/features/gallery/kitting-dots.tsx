import { Check, CircleDot, Circle, Minus } from "lucide-react";
import type { KittingItemStatus } from "./gallery-types";

interface KittingDotsProps {
  fabricStatus: KittingItemStatus;
  threadStatus: KittingItemStatus;
  beadsStatus: KittingItemStatus;
  specialtyStatus: KittingItemStatus;
}

function KittingDotIcon({ status }: { status: KittingItemStatus }) {
  switch (status) {
    case "fulfilled":
      return <Check className="h-3 w-3 text-emerald-500 dark:text-emerald-400" strokeWidth={2.5} />;
    case "partial":
      return <CircleDot className="h-3 w-3 text-amber-500 dark:text-amber-400" strokeWidth={2} />;
    case "needed":
      return <Circle className="h-3 w-3 text-stone-400 dark:text-stone-500" strokeWidth={2} />;
    case "not-applicable":
      return <Minus className="h-3 w-3 text-stone-300 dark:text-stone-600" strokeWidth={2} />;
  }
}

function getTooltipText(label: string, status: KittingItemStatus): string {
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
    <div className="flex items-center gap-2.5">
      {items.map((item) => {
        const tooltip = getTooltipText(item.label, item.status);
        return (
          <div
            key={item.label}
            className="flex items-center gap-1"
            title={tooltip}
            aria-label={tooltip}
          >
            <KittingDotIcon status={item.status} />
            <span
              className={`text-[10px] ${
                item.status === "not-applicable"
                  ? "text-stone-300 line-through dark:text-stone-600"
                  : "text-stone-500 dark:text-stone-400"
              }`}
            >
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
