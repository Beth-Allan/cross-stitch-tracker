"use client";

import { CircleDot, Gem, Sparkles } from "lucide-react";
import type { SupplyType } from "./types";

interface SegmentedTypeToggleProps {
  value: SupplyType;
  onChange: (type: SupplyType) => void;
}

const SEGMENTS: { type: SupplyType; label: string; icon: typeof CircleDot }[] = [
  { type: "THREAD", label: "Thread", icon: CircleDot },
  { type: "BEAD", label: "Beads", icon: Gem },
  { type: "SPECIALTY", label: "Specialty", icon: Sparkles },
];

export function SegmentedTypeToggle({ value, onChange }: SegmentedTypeToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Supply type"
      className="border-border inline-flex w-fit overflow-hidden rounded-md border"
    >
      {SEGMENTS.map(({ type, label, icon: Icon }, index) => {
        const isActive = value === type;
        const isLast = index === SEGMENTS.length - 1;

        return (
          <button
            key={type}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(type)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold transition-colors ${
              !isLast ? "border-border border-r" : ""
            } ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
