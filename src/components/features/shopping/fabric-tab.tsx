"use client";

import { Check, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ShoppingFabricNeed } from "@/types/dashboard";

interface FabricTabProps {
  fabrics: ShoppingFabricNeed[];
}

export function FabricTab({ fabrics }: FabricTabProps) {
  if (fabrics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ShoppingBag className="text-muted-foreground/40 mb-3 h-8 w-8" />
        <p className="text-muted-foreground text-sm">
          Select projects on the Projects tab to see fabric needs
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {fabrics.map((fabric) => (
        <FabricRow key={fabric.projectId} fabric={fabric} />
      ))}
    </div>
  );
}

function FabricRow({ fabric }: { fabric: ShoppingFabricNeed }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border p-4",
        fabric.hasFabric
          ? "border-emerald-200 bg-emerald-50/30 dark:border-emerald-800 dark:bg-emerald-950/20"
          : "border-border bg-card",
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-foreground text-sm font-semibold">{fabric.projectName}</span>
          {fabric.hasFabric && (
            <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
              <Check className="h-3 w-3" />
              Has fabric
            </span>
          )}
        </div>
        <p className="text-muted-foreground mt-1 text-xs">
          {fabric.stitchesWide} x {fabric.stitchesHigh} stitches
          {fabric.fabricName && (
            <span>
              {" \u00B7 "}
              {fabric.fabricName}
            </span>
          )}
        </p>
        {!fabric.hasFabric && <p className="mt-1 text-xs text-amber-600">Needs fabric</p>}
      </div>
    </div>
  );
}
