"use client";

import type { ProjectStatus } from "@/generated/prisma/client";
import { SectionHeading } from "../form-primitives/section-heading";
import { FormField } from "../form-primitives/form-field";
import { SearchableSelect } from "../form-primitives/searchable-select";
import { StyledCheckbox } from "../form-primitives/styled-checkbox";
import { PROJECT_STATUSES, STATUS_CONFIG } from "@/lib/utils/status";

const BIN_OPTIONS = ["Bin A", "Bin B", "Bin C", "Bin D"];
const APP_OPTIONS = ["Markup R-XP", "Saga", "MacStitch"];

interface ProjectSetupSectionProps {
  status: ProjectStatus;
  projectBin: string | null;
  ipadApp: string | null;
  needsOnionSkinning: boolean;
  onStatusChange: (value: string) => void;
  onBinChange: (value: string | null) => void;
  onAppChange: (value: string | null) => void;
  onOnionSkinningChange: (checked: boolean) => void;
  errors?: { status?: string };
}

export function ProjectSetupSection({
  status,
  projectBin,
  ipadApp,
  needsOnionSkinning,
  onStatusChange,
  onBinChange,
  onAppChange,
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
          <FormField label="Project Bin" htmlFor="project-bin">
            <select
              id="project-bin"
              value={projectBin ?? ""}
              onChange={(e) => onBinChange(e.target.value || null)}
              className="border-border bg-background text-foreground focus:border-primary focus:ring-ring h-9 w-full rounded-lg border px-3 text-sm focus:ring-2 focus:outline-none"
            >
              <option value="">None</option>
              {BIN_OPTIONS.map((bin) => (
                <option key={bin} value={bin}>
                  {bin}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="iPad App" htmlFor="ipad-app">
            <select
              id="ipad-app"
              value={ipadApp ?? ""}
              onChange={(e) => onAppChange(e.target.value || null)}
              className="border-border bg-background text-foreground focus:border-primary focus:ring-ring h-9 w-full rounded-lg border px-3 text-sm focus:ring-2 focus:outline-none"
            >
              <option value="">None</option>
              {APP_OPTIONS.map((app) => (
                <option key={app} value={app}>
                  {app}
                </option>
              ))}
            </select>
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
