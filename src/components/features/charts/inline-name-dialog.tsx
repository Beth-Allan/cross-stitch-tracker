"use client";

import { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "./form-primitives/form-field";

interface InlineNameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  initialName?: string;
  placeholder?: string;
  submitLabel?: string;
  requiredError?: string;
  onSubmit: (name: string) => Promise<void>;
}

/**
 * Turns a submit label into the text shown while that submit is in flight —
 * "Add Series" becomes "Adding Series...", so a dialog never reports an action
 * its own button does not offer. It only knows the two spelling rules the
 * current labels need: drop a silent trailing "e" ("Create" to "Creating"),
 * otherwise append. A label whose first word doubles its final consonant
 * ("Set", "Submit") or is not a verb at all ("New Series") would come out
 * misspelt and needs its own text.
 */
function pendingLabelFor(submitLabel: string): string {
  const [verb, ...rest] = submitLabel.split(" ");
  const gerund = /[^aeiou]e$/i.test(verb) ? `${verb.slice(0, -1)}ing` : `${verb}ing`;
  return [gerund, ...rest].join(" ") + "...";
}

export function InlineNameDialog({
  open,
  onOpenChange,
  title,
  initialName = "",
  placeholder = "Enter name",
  submitLabel = "Add",
  requiredError = "Name is required",
  onSubmit,
}: InlineNameDialogProps) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const prevOpenRef = useRef(false);

  useEffect(() => {
    if (open && !prevOpenRef.current) {
      setName(initialName);
    }
    prevOpenRef.current = open;
  }, [open, initialName]);

  const reset = () => {
    setName("");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError(requiredError);
      return;
    }

    setIsPending(true);
    setError(null);
    try {
      await onSubmit(trimmedName);
      reset();
      onOpenChange(false);
    } catch (err) {
      console.error(
        "InlineNameDialog submit failed:",
        err instanceof Error ? err.message : String(err),
      );
      setError(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (!isOpen) reset();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Name" htmlFor="entity-name" required error={error ?? undefined}>
            <Input
              id="entity-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={placeholder}
              autoFocus
            />
          </FormField>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? pendingLabelFor(submitLabel) : submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
