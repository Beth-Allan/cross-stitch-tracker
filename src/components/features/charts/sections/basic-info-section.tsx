"use client";

import { Input } from "@/components/ui/input";
import { SectionHeading } from "../form-primitives/section-heading";
import { FormField } from "../form-primitives/form-field";
import { SearchableSelect } from "../form-primitives/searchable-select";
import { CoverImageUpload } from "../form-primitives/cover-image-upload";
import { FileUpload } from "../form-primitives/file-upload";
import { InlineDesignerDialog } from "../inline-designer-dialog";
import type { Designer } from "@/generated/prisma/client";

interface BasicInfoSectionProps {
  name: string;
  designerId: string | null;
  coverImageUrl: string | null;
  digitalFileUrl: string | null;
  designers: Designer[];
  onNameChange: (value: string) => void;
  onDesignerChange: (value: string | null) => void;
  onCoverImageChange: (key: string) => void;
  onCoverImageRemove: () => void;
  onDigitalFileChange: (key: string, fileName: string) => void;
  onDigitalFileRemove: () => void;
  onAddDesigner: (name: string, website?: string) => Promise<void>;
  errors?: { name?: string };
}

export function BasicInfoSection({
  name,
  designerId,
  coverImageUrl,
  digitalFileUrl,
  designers,
  onNameChange,
  onDesignerChange,
  onCoverImageChange,
  onCoverImageRemove,
  onDigitalFileChange,
  onDigitalFileRemove,
  onAddDesigner,
  errors,
}: BasicInfoSectionProps) {
  const designerOptions = designers.map((d) => ({
    value: d.id,
    label: d.name,
  }));

  return (
    <div>
      <SectionHeading title="Basic Info" showBorder={false} />
      <div className="space-y-4">
        <FormField label="Chart Name" htmlFor="chart-name" required error={errors?.name}>
          <Input
            id="chart-name"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="e.g. Enchanted Forest Sampler"
            aria-required="true"
            aria-invalid={!!errors?.name}
          />
        </FormField>

        <FormField label="Designer" htmlFor="designer">
          <SearchableSelect
            options={designerOptions}
            value={designerId}
            onChange={onDesignerChange}
            placeholder="Select designer..."
          />
          <InlineDesignerDialog
            trigger={
              <button type="button" className="text-primary mt-1 text-xs hover:underline">
                + Add new designer
              </button>
            }
            onSubmit={onAddDesigner}
          />
        </FormField>

        <FormField label="Cover Image">
          <CoverImageUpload
            currentImageUrl={coverImageUrl}
            onUploadComplete={onCoverImageChange}
            onRemove={onCoverImageRemove}
          />
        </FormField>

        <FormField label="Digital Working Copy">
          <FileUpload
            currentFileName={digitalFileUrl ? digitalFileUrl.split("/").pop() : null}
            onUploadComplete={onDigitalFileChange}
            onRemove={onDigitalFileRemove}
          />
        </FormField>
      </div>
    </div>
  );
}
