"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { Pencil, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface InlineNameEditProps {
  name: string;
  onSave: (newName: string) => Promise<void>;
  variant?: "default" | "heading";
}

export function InlineNameEdit({ name, onSave, variant = "default" }: InlineNameEditProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(name);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  function handleStartEdit() {
    setEditValue(name);
    setIsEditing(true);
  }

  function handleSave() {
    const trimmed = editValue.trim();
    if (trimmed.length > 0) {
      startTransition(async () => {
        await onSave(trimmed);
        setIsEditing(false);
      });
    }
  }

  function handleCancel() {
    setEditValue(name);
    setIsEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      handleCancel();
    }
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleCancel}
          disabled={isPending}
          className={cn(
            "border-border bg-background text-foreground focus:ring-primary/40 rounded-md border focus:ring-2 focus:outline-none",
            variant === "heading"
              ? "font-heading h-10 px-2 text-2xl font-semibold"
              : "h-7 px-2 text-sm font-medium",
          )}
        />
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            handleSave();
          }}
          disabled={isPending}
          className="text-primary hover:bg-primary/10 rounded p-1 transition-colors"
          aria-label="Save name"
        >
          <Check className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            handleCancel();
          }}
          disabled={isPending}
          className="text-muted-foreground hover:text-foreground hover:bg-muted rounded p-1 transition-colors"
          aria-label="Cancel editing"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="group/edit flex items-center gap-2">
      <span
        className={cn(
          variant === "heading" ? "font-heading text-2xl font-semibold" : "text-sm font-medium",
        )}
      >
        {name}
      </span>
      <button
        type="button"
        onClick={handleStartEdit}
        className="text-muted-foreground hover:text-foreground hover:bg-muted rounded p-1 opacity-0 transition-colors group-hover/edit:opacity-100"
        aria-label="Edit name"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
