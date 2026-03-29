"use client";

import { useState } from "react";
import type { ProjectStatus } from "@/generated/prisma/client";
import { SectionHeading } from "../form-primitives/section-heading";
import { FormField } from "../form-primitives/form-field";
import { SearchableSelect } from "../form-primitives/searchable-select";
import { StyledCheckbox } from "../form-primitives/styled-checkbox";
import { PROJECT_STATUSES, STATUS_CONFIG } from "@/lib/utils/status";

const DEFAULT_BIN_OPTIONS = ["Bin A", "Bin B", "Bin C", "Bin D"];
const DEFAULT_APP_OPTIONS = ["Markup R-XP", "Saga", "MacStitch"];

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
  const [binOptions, setBinOptions] = useState(() => {
    const opts = [...DEFAULT_BIN_OPTIONS];
    if (projectBin && !opts.includes(projectBin)) opts.push(projectBin);
    return opts;
  });
  const [appOptions, setAppOptions] = useState(() => {
    const opts = [...DEFAULT_APP_OPTIONS];
    if (ipadApp && !opts.includes(ipadApp)) opts.push(ipadApp);
    return opts;
  });

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
          <FormField label="Project Bin">
            <SearchableSelect
              options={binOptions.map((b) => ({ value: b, label: b }))}
              value={projectBin}
              onChange={onBinChange}
              placeholder="Select storage location..."
              onAddNew={(searchTerm) => {
                const name = searchTerm.trim() || "New Location";
                if (!binOptions.includes(name)) {
                  setBinOptions((prev) => [...prev, name]);
                }
                onBinChange(name);
              }}
            />
          </FormField>

          <FormField label="iPad App">
            <SearchableSelect
              options={appOptions.map((a) => ({ value: a, label: a }))}
              value={ipadApp}
              onChange={onAppChange}
              placeholder="Select stitching app..."
              onAddNew={(searchTerm) => {
                const name = searchTerm.trim() || "New App";
                if (!appOptions.includes(name)) {
                  setAppOptions((prev) => [...prev, name]);
                }
                onAppChange(name);
              }}
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
