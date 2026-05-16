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
  const hint = canSave
    ? "Ready to save at any point"
    : "Enter a chart name to enable saving";

  return (
    <div
      role="toolbar"
      aria-label="Form actions"
      className="fixed bottom-0 left-0 right-0 z-100 border-t border-border bg-card"
    >
      <div className="max-w-[720px] mx-auto flex items-center py-3 px-4">
        <p className="mr-auto text-xs text-muted-foreground">{hint}</p>
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
          <Button
            type="button"
            disabled={!canSave || isSubmitting}
            onClick={onSubmit}
          >
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
