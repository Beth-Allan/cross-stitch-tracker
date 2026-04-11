"use client";

import type { ProjectStatus } from "@/generated/prisma/client";
import { SectionHeading } from "../form-primitives/section-heading";
import { FormField } from "../form-primitives/form-field";
import { SearchableSelect } from "../form-primitives/searchable-select";
import { StyledCheckbox } from "../form-primitives/styled-checkbox";
import { PROJECT_STATUSES, STATUS_CONFIG } from "@/lib/utils/status";

interface ProjectSetupSectionProps {
  status: ProjectStatus;
  storageLocationId: string | null;
  stitchingAppId: string | null;
  needsOnionSkinning: boolean;
  onStatusChange: (value: string) => void;
  onStorageLocationChange: (value: string | null) => void;
  onStitchingAppChange: (value: string | null) => void;
  onOnionSkinningChange: (checked: boolean) => void;
  errors?: { status?: string };
}

export function ProjectSetupSection({
  status,
  storageLocationId,
  stitchingAppId,
  needsOnionSkinning,
  onStatusChange,
  onStorageLocationChange,
  onStitchingAppChange,
  onOnionSkinningChange,
  errors,
}: ProjectSetupSectionProps) {
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

        <FormField label="Fabric" hint="Available in Phase 5">
          <SearchableSelect
            options={[]}
            value={null}
            onChange={() => {}}
            placeholder="Not available yet"
            disabled
          />
        </FormField>

        <div className="grid grid-cols-2 gap-4">
          <FormField label="Storage Location" hint="Managed in /storage">
            <SearchableSelect
              options={[]}
              value={storageLocationId}
              onChange={onStorageLocationChange}
              placeholder="Select storage location..."
              disabled
            />
          </FormField>

          <FormField label="Stitching App" hint="Managed in /apps">
            <SearchableSelect
              options={[]}
              value={stitchingAppId}
              onChange={onStitchingAppChange}
              placeholder="Select stitching app..."
              disabled
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
