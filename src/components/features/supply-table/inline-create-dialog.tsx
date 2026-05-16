"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { SupplyType, CreateSupplyData } from "./types";

interface InlineCreateDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateSupplyData) => void;
  supplyType: SupplyType;
  defaultCode?: string;
}

export function InlineCreateDialog({
  open,
  onClose,
  onSubmit,
  supplyType,
  defaultCode,
}: InlineCreateDialogProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState(defaultCode ?? "");
  const [error, setError] = useState("");

  // Reset form fields when dialog opens
  useEffect(() => {
    if (open) {
      setName("");
      setCode(defaultCode ?? "");
      setError("");
    }
  }, [open, defaultCode]);

  function handleSubmit() {
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Name is required");
      return;
    }

    setError("");
    onSubmit({
      name: trimmedName,
      code: code.trim() || undefined,
      brandId: "default",
      hexColor: "#808080",
    });
  }

  const typeLabel =
    supplyType === "THREAD" ? "thread" : supplyType === "BEAD" ? "bead" : "specialty item";

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Create Supply</DialogTitle>
          <DialogDescription>Create a new {typeLabel} and add it to the table.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div>
            <label
              htmlFor="inline-create-name"
              className="text-foreground mb-1 block text-sm font-medium"
            >
              Name
            </label>
            <Input
              id="inline-create-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError("");
              }}
              placeholder="Supply name"
              aria-invalid={!!error}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
            {error && <p className="text-destructive mt-1 text-xs">{error}</p>}
          </div>

          <div>
            <label
              htmlFor="inline-create-code"
              className="text-foreground mb-1 block text-sm font-medium"
            >
              Code
            </label>
            <Input
              id="inline-create-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Product code (optional)"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit}>
            Create &amp; Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
