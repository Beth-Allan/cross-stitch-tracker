"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useRejectionFlash } from "@/components/hooks/use-rejection-flash";

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
 *
 * The optimistic value is only ever a promise: when onSave reports failure (resolves false or
 * throws) it is rolled back, so the cell never shows a number the server refused.
 */
export function EditableNumber({
  value,
  onSave,
  ariaLabel,
  className,
}: {
  value: number;
  /** Resolving false (or throwing) rolls the optimistic value back */
  onSave: (value: number) => void | Promise<boolean>;
  ariaLabel: string;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const [optimistic, setOptimistic] = useState<number | null>(null);
  const { showRejection, triggerRejection } = useRejectionFlash();
  const inputRef = useRef<HTMLInputElement>(null);

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

  function commit(num: number) {
    setOptimistic(num);
    const outcome = onSave(num);
    if (!(outcome instanceof Promise)) return;
    void outcome.then(
      (saved) => {
        if (saved === false) rollback();
      },
      () => rollback(),
    );
  }

  function rollback() {
    setOptimistic(null);
    setDraft(String(value));
    triggerRejection();
  }

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
            commit(num);
          } else {
            setDraft(String(displayValue));
            triggerRejection();
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
