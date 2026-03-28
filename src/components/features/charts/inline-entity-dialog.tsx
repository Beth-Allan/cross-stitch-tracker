"use client";

import { useCallback, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InlineEntityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  fieldLabel: string;
  fieldPlaceholder: string;
  onSubmit: (name: string, website?: string) => Promise<void>;
  submitLabel?: string;
}

export function InlineEntityDialog({
  open,
  onOpenChange,
  title,
  fieldLabel,
  fieldPlaceholder,
  onSubmit,
  submitLabel = "Add",
}: InlineEntityDialogProps) {
  const [name, setName] = useState("");
  const [website, setWebsite] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isDesignerDialog = title.toLowerCase().includes("designer");

  const handleSubmit = useCallback(async () => {
    if (!name.trim()) {
      setError(`${fieldLabel} is required`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(name.trim(), isDesignerDialog ? website.trim() : undefined);
      setName("");
      setWebsite("");
      onOpenChange(false);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [name, website, isDesignerDialog, fieldLabel, onSubmit, onOpenChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !isSubmitting) {
        e.preventDefault();
        void handleSubmit();
      }
    },
    [handleSubmit, isSubmitting],
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setName("");
          setWebsite("");
          setError(null);
        }
        onOpenChange(isOpen);
      }}
    >
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="entity-name">{fieldLabel}</Label>
            <Input
              id="entity-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={fieldPlaceholder}
              onKeyDown={handleKeyDown}
              autoFocus
            />
          </div>

          {isDesignerDialog && (
            <div className="space-y-1.5">
              <Label htmlFor="entity-website">Website (optional)</Label>
              <Input
                id="entity-website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://..."
                onKeyDown={handleKeyDown}
              />
            </div>
          )}

          {error && <p className="text-destructive text-xs">{error}</p>}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Keep Chart
          </Button>
          <Button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={isSubmitting}
            className="bg-emerald-600 text-white hover:bg-emerald-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Adding...
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
