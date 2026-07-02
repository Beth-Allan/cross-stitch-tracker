"use client";

import { useState, useMemo, useCallback, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { SupplyTable } from "@/components/features/supply-table";
import type { SupplyRow, CalcParams, FabricOption } from "@/components/features/supply-table";
import { ServerActionAdapter } from "@/components/features/supply-table/server-action-adapter";
import { CalculatorCard } from "@/components/features/charts/form-primitives/calculator-card";
import { updateProjectSettings } from "@/lib/actions/chart-actions";
import { isStrandCount } from "@/types/supply";
import type { ProjectDetailProps, SupplySortOption } from "./types";
import type {
  ProjectThreadWithThread,
  ProjectBeadWithBead,
  ProjectSpecialtyWithItem,
} from "@/types/supply";

interface SuppliesTabProps {
  project: NonNullable<ProjectDetailProps["chart"]["project"]>;
  supplies: NonNullable<ProjectDetailProps["supplies"]>;
  calculator?: { fabricOptions: FabricOption[]; chartId: string };
}

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

export function SuppliesTab({ project, supplies, calculator }: SuppliesTabProps) {
  const router = useRouter();
  const [sortOption, setSortOption] = useState<SupplySortOption>("added");
  const [isPending, startTransition] = useTransition();

  // Stabilize router.refresh reference to prevent adapter recreation
  const stableRefresh = useCallback(() => router.refresh(), [router]);

  // Instantiate ServerActionAdapter with project.id and stable refresh
  const adapter = useMemo(
    () => new ServerActionAdapter(project.id, stableRefresh),
    [project.id, stableRefresh],
  );

  // Server-authoritative calc params (source of truth for rollback)
  const serverCalcParams: CalcParams = useMemo(
    () => ({
      fabricCount: project.fabric?.count ?? 14,
      strandCount: isStrandCount(project.strandCount) ? project.strandCount : 2,
      overCount: project.overCount,
      wastePercent: project.wastePercent,
    }),
    [project.fabric?.count, project.strandCount, project.overCount, project.wastePercent],
  );

  const [calcParams, setCalcParams] = useState<CalcParams>(serverCalcParams);
  const [localFabricId, setLocalFabricId] = useState<string | null>(project.fabric?.id ?? null);

  const serverParamsRef = useRef(serverCalcParams);
  useEffect(() => {
    serverParamsRef.current = serverCalcParams;
  }, [serverCalcParams]);

  // Sync local state from server when server data changes (after successful save)
  useEffect(() => {
    if (!isPending) {
      setCalcParams(serverCalcParams);
    }
  }, [serverCalcParams, isPending]);

  const chartId = calculator?.chartId;
  const handleCalcParamsChange = useCallback(
    (newParams: CalcParams) => {
      if (!chartId) return;
      setCalcParams(newParams);

      const persistFields: Partial<Pick<CalcParams, "strandCount" | "overCount" | "wastePercent">> =
        {};
      if (newParams.strandCount !== serverParamsRef.current.strandCount) {
        persistFields.strandCount = newParams.strandCount;
      }
      if (newParams.overCount !== serverParamsRef.current.overCount) {
        persistFields.overCount = newParams.overCount;
      }
      if (newParams.wastePercent !== serverParamsRef.current.wastePercent) {
        persistFields.wastePercent = newParams.wastePercent;
      }

      if (Object.keys(persistFields).length === 0) return;

      startTransition(async () => {
        try {
          const result = await updateProjectSettings(chartId, persistFields);
          if (result.success) return;
        } catch (error) {
          console.error("SuppliesTab calc param save failed:", error);
        }
        setCalcParams(serverParamsRef.current);
        toast.error("Couldn't save settings. Please try again.");
      });
    },
    [chartId],
  );

  const handleFabricChange = useCallback((fabricId: string | null, fabricCount?: number) => {
    setLocalFabricId(fabricId);
    if (fabricCount != null) {
      setCalcParams((prev) => ({ ...prev, fabricCount }));
    }
  }, []);

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
      {calculator && (
        <CalculatorCard
          calcParams={calcParams}
          onCalcParamsChange={handleCalcParamsChange}
          fabricId={localFabricId}
          onFabricChange={handleFabricChange}
          fabricOptions={calculator.fabricOptions}
        />
      )}

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
