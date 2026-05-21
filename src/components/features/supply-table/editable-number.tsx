"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Click-to-edit number cell component for the supply table.
 *
 * Read mode: displays value as a button with hover indicator.
 * Edit mode: transforms to a compact number input with keyboard support.
 *
 * Keyboard:
 * - Enter: saves value
 * - Escape: reverts to original value
 * - Blur: saves if valid, reverts if invalid (NaN or negative)
 *
 * Validates parseInt result is non-negative before calling onSave;
 * reverts on invalid input.
 */
export function EditableNumber({
  value,
  onSave,
  ariaLabel,
  className,
}: {
  value: number;
  onSave: (value: number) => void;
  ariaLabel: string;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const [optimistic, setOptimistic] = useState<number | null>(null);
  const [showRejection, setShowRejection] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const rejectionTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    return () => {
      if (rejectionTimerRef.current) clearTimeout(rejectionTimerRef.current);
    };
  }, []);

  // Clear optimistic value once the prop catches up
  useEffect(() => {
    if (optimistic !== null && value === optimistic) {
      setOptimistic(null);
    }
  }, [value, optimistic]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const displayValue = optimistic ?? value;

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="number"
        min={0}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          const num = parseInt(draft);
          if (!isNaN(num) && num >= 0) {
            setOptimistic(num);
            onSave(num);
          } else {
            setDraft(String(displayValue));
            setShowRejection(true);
            if (rejectionTimerRef.current) clearTimeout(rejectionTimerRef.current);
            rejectionTimerRef.current = setTimeout(() => setShowRejection(false), 600);
          }
          setEditing(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          if (e.key === "Escape") {
            setDraft(String(displayValue));
            setEditing(false);
          }
        }}
        aria-label={ariaLabel}
        className="bg-card text-foreground border-primary focus:ring-primary/40 w-12 rounded border px-1.5 py-0.5 text-center text-sm focus:ring-2 focus:outline-none"
      />
    );
  }

  return (
    <button
      onClick={() => {
        setDraft(String(displayValue));
        setEditing(true);
      }}
      className={cn(
        "hover:bg-primary/5 cursor-text rounded px-1.5 py-0.5 [font-variant-numeric:tabular-nums] transition-colors",
        showRejection && "border-destructive bg-destructive/10 animate-shake border",
        className,
      )}
      title="Click to edit"
      aria-label={ariaLabel}
      aria-invalid={showRejection || undefined}
    >
      {displayValue}
    </button>
  );
}
