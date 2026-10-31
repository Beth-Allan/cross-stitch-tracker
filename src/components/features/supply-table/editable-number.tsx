"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useRejectionFlash } from "@/components/hooks/use-rejection-flash";

/**
 * Click-to-edit number cell component for the supply table.
 *
 * Read mode: displays value as a button with hover indicator. A null value is a figure nobody
 * can work out yet and reads "Unknown", never a 0 that would pass for a real one.
 * Edit mode: transforms to a compact number input with keyboard support.
 *
 * Keyboard:
 * - Enter: saves value
 * - Escape: reverts to original value
 * - Blur: saves if changed and valid, reverts if invalid (NaN or below `min`)
 *
 * Validates parseInt result is at least `min` (default 0) before calling onSave;
 * reverts on invalid input.
 *
 * A number left as it was never reaches onSave: a save is what marks a thread's need as typed by
 * hand, so merely opening the cell must not count as one.
 *
 * The optimistic value is provisional: when onSave reports failure (resolves false or throws) it
 * is rolled back, so the cell never shows a number the server refused. Only the newest save may
 * roll back -- a slow failure from a superseded edit must not undo the one that was accepted.
 */
export function EditableNumber({
  value,
  onSave,
  ariaLabel,
  className,
  min = 0,
}: {
  value: number | null;
  /** Resolving false (or throwing) rolls the optimistic value back */
  onSave: (value: number) => void | Promise<boolean>;
  ariaLabel: string;
  className?: string;
  min?: number;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(toDraft(value));
  const [optimistic, setOptimistic] = useState<number | null>(null);
  const { showRejection, triggerRejection } = useRejectionFlash();
  const inputRef = useRef<HTMLInputElement>(null);
  const latestSaveRef = useRef(0);

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
    const saveId = ++latestSaveRef.current;
    setOptimistic(num);
    const outcome = onSave(num);
    if (!(outcome instanceof Promise)) return;
    void outcome.then(
      (saved) => {
        if (saved === false) rollback(saveId);
      },
      () => rollback(saveId),
    );
  }

  function rollback(saveId: number) {
    if (saveId !== latestSaveRef.current) return;
    setOptimistic(null);
    setDraft(toDraft(value));
    triggerRejection();
  }

  if (editing) {
    return (
      <>
        <input
          ref={inputRef}
          type="number"
          min={min}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => {
            const num = parseInt(draft);
            const unchanged = displayValue === null ? draft.trim() === "" : num === displayValue;
            if (unchanged) {
              // A figure left as it was is no edit, not a refused one
            } else if (!isNaN(num) && num >= min) {
              commit(num);
            } else {
              setDraft(toDraft(displayValue));
              triggerRejection();
            }
            setEditing(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            if (e.key === "Escape") {
              setDraft(toDraft(displayValue));
              setEditing(false);
            }
          }}
          aria-label={ariaLabel}
          className="bg-card text-foreground border-primary focus:ring-primary/40 w-12 rounded border px-1.5 py-0.5 text-center text-sm focus:ring-2 focus:outline-none"
        />
        <span role="status" aria-live="polite" className="sr-only">
          {showRejection ? "Value not saved" : ""}
        </span>
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => {
          setDraft(toDraft(displayValue));
          setEditing(true);
        }}
        className={cn(
          "hover:bg-primary/5 cursor-text rounded px-1.5 py-0.5 [font-variant-numeric:tabular-nums] transition-colors",
          showRejection && "border-destructive bg-destructive/10 animate-shake border",
          className,
        )}
        title="Click to edit"
        aria-label={ariaLabel}
      >
        {displayValue ?? <span className="text-muted-foreground">Unknown</span>}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {showRejection ? "Value not saved" : ""}
      </span>
    </>
  );
}

function toDraft(value: number | null): string {
  return value === null ? "" : String(value);
}
