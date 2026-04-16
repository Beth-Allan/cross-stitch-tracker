"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { SupplyRow } from "./supply-row";
import type { CalculatorSettings, SupplySectionData } from "./types";

// ─── Number Formatter ─────────────────────────────────────────────────────────

const numberFormatter = new Intl.NumberFormat();

// ─── Types ────────────────────────────────────────────────────────────────────

interface SupplySectionProps {
  data: SupplySectionData;
  settings: CalculatorSettings;
  onRemove: (id: string) => void;
  onAdd: () => void;
  onStitchCountChange: (id: string, newCount: number) => void;
  addComponent?: React.ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SupplySection({
  data,
  settings,
  onRemove,
  onAdd,
  onStitchCountChange,
  addComponent,
}: SupplySectionProps) {
  const [isOpen, setIsOpen] = useState(data.items.length > 0);
  const hasItems = data.items.length > 0;

  return (
    <div className="border-border bg-card overflow-visible rounded-xl border">
      {/* Section header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hover:bg-muted/50 flex w-full items-center gap-3 px-5 py-3.5 transition-colors"
      >
        {isOpen ? (
          <ChevronDown className="text-muted-foreground size-4 shrink-0" />
        ) : (
          <ChevronRight className="text-muted-foreground size-4 shrink-0" />
        )}
        <h3 className="font-heading flex-1 text-left text-xl font-semibold">
          {data.label}
          <span className="text-muted-foreground ml-2 text-sm font-normal">
            ({data.items.length} {data.items.length === 1 ? "colour" : "colours"})
          </span>
        </h3>
        {hasItems && data.type === "thread" && data.totalStitchCount > 0 && (
          <span className="text-muted-foreground text-sm tabular-nums">
            {numberFormatter.format(data.totalStitchCount)} stitches total
          </span>
        )}
      </button>

      {/* Section content */}
      {isOpen && (
        <div className="border-border border-t px-5 pb-4">
          {hasItems ? (
            <>
              <div className="pt-1" role="list">
                {data.items.map((item) => (
                  <div key={item.id} role="listitem">
                    <SupplyRow
                      data={item}
                      settings={settings}
                      onRemove={onRemove}
                      onStitchCountChange={onStitchCountChange}
                    />
                  </div>
                ))}
              </div>
              <div className="relative mt-3">
                {addComponent ?? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAdd();
                    }}
                    type="button"
                    className="text-primary hover:text-primary/80 flex items-center gap-1.5 text-sm font-medium transition-colors"
                  >
                    <Plus className="size-3.5" />
                    Add {data.label.toLowerCase()}
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="py-6 text-center">
              <p className="text-muted-foreground mb-2 text-sm">
                No {data.label.toLowerCase()} linked to this project
              </p>
              <div className="relative mt-3">
                {addComponent ?? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onAdd();
                    }}
                    type="button"
                    className="text-primary hover:text-primary/80 flex items-center gap-1.5 text-sm font-medium transition-colors"
                  >
                    <Plus className="size-3.5" />
                    Add {data.label.toLowerCase()}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
