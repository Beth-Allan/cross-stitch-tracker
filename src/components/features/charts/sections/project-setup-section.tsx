"use client";

import Link from "next/link";
import type { Fabric, FabricBrand, ProjectStatus } from "@/generated/prisma/client";
import type { StorageLocationWithStats, StitchingAppWithStats } from "@/types/storage";
import { SectionHeading } from "../form-primitives/section-heading";
import { FormField } from "../form-primitives/form-field";
import { SearchableSelect } from "../form-primitives/searchable-select";
import { StyledCheckbox } from "../form-primitives/styled-checkbox";
import { PROJECT_STATUSES, STATUS_CONFIG } from "@/lib/utils/status";

interface ProjectSetupSectionProps {
  status: ProjectStatus;
  storageLocationId: string | null;
  stitchingAppId: string | null;
  fabricId: string | null;
  storageLocations: StorageLocationWithStats[];
  stitchingApps: StitchingAppWithStats[];
  unassignedFabrics: (Fabric & { brand: FabricBrand })[];
  needsOnionSkinning: boolean;
  onStatusChange: (value: string) => void;
  onStorageLocationChange: (value: string | null) => void;
  onStitchingAppChange: (value: string | null) => void;
  onFabricChange: (value: string | null) => void;
  onOnionSkinningChange: (checked: boolean) => void;
  onAddStorageLocation?: (name: string) => void;
  onAddStitchingApp?: (name: string) => void;
  errors?: { status?: string };
}

export function ProjectSetupSection({
  status,
  storageLocationId,
  stitchingAppId,
  fabricId,
  storageLocations,
  stitchingApps,
  unassignedFabrics,
  needsOnionSkinning,
  onStatusChange,
  onStorageLocationChange,
  onStitchingAppChange,
  onFabricChange,
  onOnionSkinningChange,
  onAddStorageLocation,
  onAddStitchingApp,
  errors,
}: ProjectSetupSectionProps) {
  const fabricOptions = unassignedFabrics.map((f) => ({
    value: f.id,
    label: `${f.name} - ${f.count}ct ${f.type} (${f.brand.name})`,
  }));

  const storageOptions = storageLocations.map((sl) => ({
    value: sl.id,
    label: sl.name,
  }));

  const appOptions = stitchingApps.map((sa) => ({
    value: sa.id,
    label: sa.name,
  }));

  return (
    <div>
      <SectionHeading title="Project Setup" />
      <div className="space-y-4">
        <FormField label="Status" htmlFor="status" error={errors?.status}>
          <select
            id="status"
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="border-border bg-background text-foreground focus:border-primary focus:ring-ring h-9 w-full rounded-lg border px-3 text-sm focus:ring-2 focus:outline-none"
          >
            {PROJECT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]?.label ?? s}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Fabric">
          <SearchableSelect
            options={fabricOptions}
            value={fabricId}
            onChange={onFabricChange}
            placeholder={
              unassignedFabrics.length === 0 ? "No unassigned fabrics" : "Select fabric..."
            }
            disabled={unassignedFabrics.length === 0}
          />
          {unassignedFabrics.length === 0 && (
            <p className="text-muted-foreground mt-1 text-xs">
              <Link href="/fabric" className="text-primary hover:underline">
                Add fabric
              </Link>{" "}
              to assign to this project
            </p>
          )}
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Storage Location">
            <SearchableSelect
              options={storageOptions}
              value={storageLocationId}
              onChange={onStorageLocationChange}
              onAddNew={onAddStorageLocation}
              placeholder="Select storage location..."
            />
          </FormField>

          <FormField label="Stitching App">
            <SearchableSelect
              options={appOptions}
              value={stitchingAppId}
              onChange={onStitchingAppChange}
              onAddNew={onAddStitchingApp}
              placeholder="Select stitching app..."
            />
          </FormField>
        </div>

        <StyledCheckbox
          checked={needsOnionSkinning}
          onChange={onOnionSkinningChange}
          label="Needs Onion Skinning"
        />
      </div>
    </div>
  );
}
