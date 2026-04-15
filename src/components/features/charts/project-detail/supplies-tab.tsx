"use client";

import { useState, useMemo, useCallback, useTransition } from "react";
import { toast } from "sonner";
import { CalculatorSettingsBar } from "./calculator-settings-bar";
import { SupplySection } from "./supply-section";
import { SupplyFooterTotals } from "./supply-footer-totals";
import { calculateSkeins } from "@/lib/utils/skein-calculator";
import {
  removeProjectThread,
  removeProjectBead,
  removeProjectSpecialty,
} from "@/lib/actions/supply-actions";
import type {
  ProjectDetailProps,
  CalculatorSettings,
  SupplyRowData,
  SupplySectionData,
  SupplySortOption,
} from "./types";
import type {
  ProjectThreadWithThread,
  ProjectBeadWithBead,
  ProjectSpecialtyWithItem,
} from "@/types/supply";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SuppliesTabProps {
  chartId: string;
  project: NonNullable<ProjectDetailProps["chart"]["project"]>;
  supplies: NonNullable<ProjectDetailProps["supplies"]>;
}

// ─── Data Transform Helpers ───────────────────────────────────────────────────

function threadToRowData(pt: ProjectThreadWithThread, settings: CalculatorSettings): SupplyRowData {
  const calculatedNeed =
    pt.stitchCount > 0
      ? calculateSkeins({
          stitchCount: pt.stitchCount,
          strandCount: settings.strandCount,
          fabricCount: settings.fabricCount,
          overCount: settings.overCount,
          wastePercent: settings.wastePercent,
        })
      : undefined;

  return {
    id: pt.id,
    type: "thread",
    name: pt.thread.colorName,
    code: pt.thread.colorCode,
    hexColor: pt.thread.hexColor,
    brandName: pt.thread.brand.name,
    stitchCount: pt.stitchCount,
    quantityRequired: pt.quantityRequired,
    quantityAcquired: pt.quantityAcquired,
    isNeedOverridden: pt.isNeedOverridden,
    calculatedNeed,
  };
}

function beadToRowData(pb: ProjectBeadWithBead): SupplyRowData {
  return {
    id: pb.id,
    type: "bead",
    name: pb.bead.colorName,
    code: pb.bead.productCode,
    hexColor: pb.bead.hexColor,
    brandName: pb.bead.brand.name,
    stitchCount: 0,
    quantityRequired: pb.quantityRequired,
    quantityAcquired: pb.quantityAcquired,
    isNeedOverridden: false,
  };
}

function specialtyToRowData(ps: ProjectSpecialtyWithItem): SupplyRowData {
  return {
    id: ps.id,
    type: "specialty",
    name: ps.specialtyItem.description
      ? `${ps.specialtyItem.colorName} — ${ps.specialtyItem.description}`
      : ps.specialtyItem.colorName,
    code: ps.specialtyItem.productCode,
    hexColor: ps.specialtyItem.hexColor,
    brandName: ps.specialtyItem.brand.name,
    stitchCount: 0,
    quantityRequired: ps.quantityRequired,
    quantityAcquired: ps.quantityAcquired,
    isNeedOverridden: false,
  };
}

function sortItems(items: SupplyRowData[], sortOption: SupplySortOption): SupplyRowData[] {
  if (sortOption === "alpha") {
    return [...items].sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
  }
  return items; // "added" = insertion order (already from server)
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SuppliesTab({ chartId, project, supplies }: SuppliesTabProps) {
  const [, startTransition] = useTransition();
  const [sortOption, setSortOption] = useState<SupplySortOption>("added");
  const [settings, setSettings] = useState<CalculatorSettings>({
    strandCount: project.strandCount,
    overCount: project.overCount as 1 | 2,
    fabricCount: project.fabric?.count ?? 14,
    wastePercent: project.wastePercent,
  });

  // Track stitch count changes for live total updates
  const [stitchCountOverrides, setStitchCountOverrides] = useState<Record<string, number>>({});

  // ─── Data Transform (Pitfall 5: useMemo for derived data) ─────────────────

  const sections = useMemo<SupplySectionData[]>(() => {
    const threadRows = supplies.threads.map((pt) => {
      const row = threadToRowData(pt, settings);
      // Apply any local stitch count overrides for live totals
      if (stitchCountOverrides[row.id] !== undefined) {
        return { ...row, stitchCount: stitchCountOverrides[row.id] };
      }
      return row;
    });
    const beadRows = supplies.beads.map(beadToRowData);
    const specialtyRows = supplies.specialty.map(specialtyToRowData);

    return [
      {
        type: "thread" as const,
        label: "Threads",
        unitLabel: "skeins",
        items: sortItems(threadRows, sortOption),
        totalStitchCount: threadRows.reduce((sum, r) => sum + r.stitchCount, 0),
      },
      {
        type: "bead" as const,
        label: "Beads",
        unitLabel: "packages",
        items: sortItems(beadRows, sortOption),
        totalStitchCount: 0,
      },
      {
        type: "specialty" as const,
        label: "Specialty Items",
        unitLabel: "quantity",
        items: sortItems(specialtyRows, sortOption),
        totalStitchCount: 0,
      },
    ];
  }, [supplies, settings, sortOption, stitchCountOverrides]);

  // ─── Totals (Pitfall 5: useMemo) ─────────────────────────────────────────

  const totals = useMemo(() => {
    const threadSection = sections[0];
    return {
      totalStitchCount: threadSection.totalStitchCount,
      totalSkeinsNeeded: threadSection.items.reduce((sum, r) => sum + r.quantityRequired, 0),
      totalAcquired: threadSection.items.reduce((sum, r) => sum + r.quantityAcquired, 0),
    };
  }, [sections]);

  // ─── Settings bar visibility (D-17) ──────────────────────────────────────

  const hasStitchCounts = sections[0].items.some((t) => t.stitchCount > 0);
  const fabricSource = project.fabric ? "linked" : "default";
  const fabricName = project.fabric ? `${project.fabric.brand.name} ${project.fabric.name}` : null;

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleSettingsChange = useCallback((newSettings: CalculatorSettings) => {
    setSettings(newSettings);
  }, []);

  const handleStitchCountChange = useCallback((id: string, newCount: number) => {
    setStitchCountOverrides((prev) => ({ ...prev, [id]: newCount }));
  }, []);

  const handleRemove = useCallback(
    (id: string) => {
      // Find which section the item belongs to
      const threadSection = sections[0];
      const beadSection = sections[1];

      if (threadSection.items.some((item) => item.id === id)) {
        startTransition(async () => {
          try {
            const result = await removeProjectThread(id);
            if (!result.success) {
              toast.error("Couldn't remove this supply. Please try again.");
            }
          } catch {
            toast.error("Couldn't remove this supply. Please try again.");
          }
        });
      } else if (beadSection.items.some((item) => item.id === id)) {
        startTransition(async () => {
          try {
            const result = await removeProjectBead(id);
            if (!result.success) {
              toast.error("Couldn't remove this supply. Please try again.");
            }
          } catch {
            toast.error("Couldn't remove this supply. Please try again.");
          }
        });
      } else {
        startTransition(async () => {
          try {
            const result = await removeProjectSpecialty(id);
            if (!result.success) {
              toast.error("Couldn't remove this supply. Please try again.");
            }
          } catch {
            toast.error("Couldn't remove this supply. Please try again.");
          }
        });
      }
    },
    [sections],
  );

  // Add handler placeholder (SearchToAdd wired in Plan 05)
  const handleAdd = useCallback(() => {
    // Will be wired to SearchToAdd in Plan 05
  }, []);

  // ─── Empty State ──────────────────────────────────────────────────────────

  const totalItems = sections.reduce((sum, s) => sum + s.items.length, 0);

  if (totalItems === 0) {
    return (
      <div className="py-12 text-center">
        <h3 className="font-heading text-xl font-semibold">No supplies added yet</h3>
        <p className="text-muted-foreground mt-2 text-sm">
          Add thread colours, beads, or specialty items to track what you need for this project.
        </p>
      </div>
    );
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Sort toggle */}
      <div className="flex items-center justify-end gap-1">
        <button
          onClick={() => setSortOption("added")}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            sortOption === "added"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          Added
        </button>
        <button
          onClick={() => setSortOption("alpha")}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            sortOption === "alpha"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          A-Z
        </button>
      </div>

      {/* Calculator settings bar */}
      <CalculatorSettingsBar
        chartId={chartId}
        settings={settings}
        fabricName={fabricName}
        fabricSource={fabricSource as "linked" | "default"}
        hasStitchCounts={hasStitchCounts}
        onSettingsChange={handleSettingsChange}
      />

      {/* Supply sections */}
      {sections.map((section) => (
        <div key={section.type}>
          <SupplySection
            data={section}
            settings={settings}
            onRemove={handleRemove}
            onAdd={handleAdd}
            onStitchCountChange={handleStitchCountChange}
          />
        </div>
      ))}

      {/* Footer totals (threads only) */}
      {sections[0].items.length > 0 && (
        <SupplyFooterTotals
          totalStitchCount={totals.totalStitchCount}
          totalSkeinsNeeded={totals.totalSkeinsNeeded}
          totalAcquired={totals.totalAcquired}
        />
      )}
    </div>
  );
}
