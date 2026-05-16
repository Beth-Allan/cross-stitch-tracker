"use client";

import { Button } from "@/components/ui/button";

interface StickySaveBarProps {
  chartName: string;
  onSaveDraft?: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  isSavingDraft?: boolean;
  saveDraftLabel?: string;
  mode?: "create" | "edit";
}

export function StickySaveBar({
  chartName,
  onSaveDraft,
  onSubmit,
  isSubmitting,
  isSavingDraft,
  saveDraftLabel,
  mode,
}: StickySaveBarProps) {
  const isEdit = mode === "edit";
  const canSave = !!chartName.trim();
  const hint = canSave ? "Ready to save at any point" : "Enter a chart name to enable saving";

  return (
    <div
      role="toolbar"
      aria-label="Form actions"
      className="border-border bg-card fixed right-0 bottom-0 left-0 z-100 border-t"
    >
      <div className="mx-auto flex max-w-[720px] items-center px-4 py-3">
        <p className="text-muted-foreground mr-auto text-xs">{hint}</p>
        <div className="flex items-center gap-3">
          {!isEdit && onSaveDraft && (
            <Button
              type="button"
              variant="ghost"
              disabled={!canSave || !!isSavingDraft}
              onClick={onSaveDraft}
            >
              {saveDraftLabel}
            </Button>
          )}
          <Button type="button" disabled={!canSave || isSubmitting} onClick={onSubmit}>
            {isEdit
              ? isSubmitting
                ? "Saving..."
                : "Save Changes"
              : isSubmitting
                ? "Creating..."
                : "Create"}
          </Button>
        </div>
      </div>
    </div>
  );
}
