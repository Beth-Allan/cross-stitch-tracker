"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SupplyTable } from "@/components/features/supply-table";
import type { SupplyRow, CalcParams } from "@/components/features/supply-table";
import { ServerActionAdapter } from "@/components/features/supply-table/server-action-adapter";
import type { ProjectDetailProps, SupplySortOption } from "./types";
import type {
  ProjectThreadWithThread,
  ProjectBeadWithBead,
  ProjectSpecialtyWithItem,
} from "@/types/supply";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SuppliesTabProps {
  project: NonNullable<ProjectDetailProps["chart"]["project"]>;
  supplies: NonNullable<ProjectDetailProps["supplies"]>;
}

// ─── Data Transform Helpers ───────────────────────────────────────────────────

function threadToSupplyRow(pt: ProjectThreadWithThread): SupplyRow {
  return {
    id: pt.id,
    supplyId: pt.threadId,
    type: "THREAD",
    code: pt.thread.colorCode,
    name: pt.thread.colorName,
    brandName: pt.thread.brand.name,
    hexColor: pt.thread.hexColor,
    stitchCount: pt.stitchCount,
    need: pt.quantityRequired,
    have: pt.quantityAcquired,
    isNeedOverridden: pt.isNeedOverridden,
  };
}

function beadToSupplyRow(pb: ProjectBeadWithBead): SupplyRow {
  return {
    id: pb.id,
    supplyId: pb.beadId,
    type: "BEAD",
    code: pb.bead.productCode,
    name: pb.bead.colorName,
    brandName: pb.bead.brand.name,
    hexColor: pb.bead.hexColor,
    stitchCount: 0,
    need: pb.quantityRequired,
    have: pb.quantityAcquired,
    isNeedOverridden: false,
  };
}

function specialtyToSupplyRow(ps: ProjectSpecialtyWithItem): SupplyRow {
  return {
    id: ps.id,
    supplyId: ps.specialtyItemId,
    type: "SPECIALTY",
    code: ps.specialtyItem.productCode,
    name: ps.specialtyItem.description
      ? `${ps.specialtyItem.colorName} — ${ps.specialtyItem.description}`
      : ps.specialtyItem.colorName,
    brandName: ps.specialtyItem.brand.name,
    hexColor: ps.specialtyItem.hexColor,
    stitchCount: 0,
    need: ps.quantityRequired,
    have: ps.quantityAcquired,
    isNeedOverridden: false,
  };
}

function sortSupplyRows(items: SupplyRow[], sortOption: SupplySortOption): SupplyRow[] {
  if (sortOption === "alpha") {
    return [...items].sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
  }
  return items; // "added" = insertion order (already from server)
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SuppliesTab({ project, supplies }: SuppliesTabProps) {
  const router = useRouter();
  const [sortOption, setSortOption] = useState<SupplySortOption>("added");

  // Stabilize router.refresh reference to prevent adapter recreation
  const stableRefresh = useCallback(() => router.refresh(), [router]);

  // Instantiate ServerActionAdapter with project.id and stable refresh
  const adapter = useMemo(
    () => new ServerActionAdapter(project.id, stableRefresh),
    [project.id, stableRefresh],
  );

  // CalcParams derived from project fields
  const calcParams: Partial<CalcParams> = useMemo(
    () => ({
      fabricCount: project.fabric?.count ?? 14,
      strandCount: project.strandCount,
      overCount: project.overCount,
      wastePercent: project.wastePercent,
    }),
    [project.fabric?.count, project.strandCount, project.overCount, project.wastePercent],
  );

  // Transform + sort supply rows (parent pre-sorts, table is sort-unaware)
  const threads = useMemo(
    () => sortSupplyRows(supplies.threads.map(threadToSupplyRow), sortOption),
    [supplies.threads, sortOption],
  );
  const beads = useMemo(
    () => sortSupplyRows(supplies.beads.map(beadToSupplyRow), sortOption),
    [supplies.beads, sortOption],
  );
  const specialty = useMemo(
    () => sortSupplyRows(supplies.specialty.map(specialtyToSupplyRow), sortOption),
    [supplies.specialty, sortOption],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-1">
        <button
          onClick={() => setSortOption("added")}
          aria-pressed={sortOption === "added"}
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
          aria-pressed={sortOption === "alpha"}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            sortOption === "alpha"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted"
          }`}
        >
          A-Z
        </button>
      </div>

      <SupplyTable
        threads={threads}
        beads={beads}
        specialty={specialty}
        adapter={adapter}
        calcParams={calcParams}
      />
    </div>
  );
}
