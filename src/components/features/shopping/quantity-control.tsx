"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuantityControlProps {
  acquired: number;
  /** `null` when no figure is known at all — a thread line whose need is unknown (THR-011). */
  required: number | null;
  /** The known `required` total also covers lines whose need is unknown: shown "N + unknown". */
  plusUnknown?: boolean;
  isPending: boolean;
  hasError?: boolean;
  onChange: (newValue: number) => void;
}

export function QuantityControl({
  acquired,
  required,
  plusUnknown = false,
  isPending,
  hasError = false,
  onChange,
}: QuantityControlProps) {
  // An unknown need is still to buy and has no ceiling, so it is never fulfilled and never
  // clamped. The null check comes first because JS calls `acquired >= null` true.
  const ceiling = required === null || plusUnknown ? null : required;
  const isFulfilled = ceiling !== null && acquired >= ceiling;
  const needLabel =
    required === null ? "unknown" : plusUnknown ? `${required} + unknown` : String(required);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const [shaking, setShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (hasError) {
      setShaking(true);
      const timer = setTimeout(() => setShaking(false), 400);
      return () => clearTimeout(timer);
    }
  }, [hasError]);

  function startEditing() {
    if (isPending) return;
    cancelledRef.current = false;
    setEditValue(String(acquired));
    setIsEditing(true);
  }

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  function commitEdit() {
    if (cancelledRef.current) return;
    setIsEditing(false);
    const n = parseInt(editValue, 10);
    if (!isNaN(n) && n >= 0) {
      onChange(ceiling === null ? n : Math.min(ceiling, n));
    }
  }

  function cancelEdit() {
    cancelledRef.current = true;
    setIsEditing(false);
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1",
        isFulfilled && "bg-selected rounded-lg px-2",
        hasError && "rounded-lg ring-2 ring-red-300 dark:ring-red-700",
        shaking && "animate-shake",
      )}
    >
      <button
        type="button"
        onClick={() => onChange(acquired - 1)}
        disabled={acquired <= 0 || isPending}
        aria-label="Decrement quantity"
        className={cn(
          "flex h-7 min-h-[44px] w-7 min-w-[44px] items-center justify-center rounded transition-colors outline-none",
          "text-muted-foreground hover:text-foreground",
          "focus-visible:ring-ring focus-visible:ring-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        <Minus className="h-4 w-4" />
      </button>

      {isEditing ? (
        <input
          ref={inputRef}
          type="number"
          min={0}
          max={ceiling ?? undefined}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commitEdit();
            if (e.key === "Escape") cancelEdit();
          }}
          className={cn(
            "border-border bg-card text-foreground w-10 rounded border px-1 py-0.5 text-center font-mono text-sm tabular-nums outline-none",
            "focus:border-ring focus:ring-ring/30 focus:ring-1",
            "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
          )}
          aria-label={`Acquired quantity out of ${needLabel}`}
        />
      ) : (
        <button
          type="button"
          onClick={startEditing}
          disabled={isPending}
          className={cn(
            "min-w-[3ch] rounded border border-transparent px-1.5 py-0.5 text-center font-mono text-sm tabular-nums transition-all",
            isFulfilled
              ? "text-selected-foreground hover:border-selected-border"
              : "text-foreground hover:border-border hover:bg-muted",
          )}
          aria-label={`${acquired} of ${needLabel} acquired, click to edit`}
        >
          {acquired}/
          {required === null ? <span className="text-muted-foreground">Unknown</span> : required}
          {required !== null && plusUnknown && (
            <span className="text-muted-foreground"> + unknown</span>
          )}
        </button>
      )}

      <button
        type="button"
        onClick={() => onChange(acquired + 1)}
        disabled={isFulfilled || isPending}
        aria-label="Increment quantity"
        className={cn(
          "flex h-7 min-h-[44px] w-7 min-w-[44px] items-center justify-center rounded transition-colors outline-none",
          "text-muted-foreground hover:text-progress-foreground",
          "focus-visible:ring-ring focus-visible:ring-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
        )}
      >
        <Plus className="h-4 w-4" />
      </button>

      {isPending && <Loader2 className="text-muted-foreground h-3.5 w-3.5 animate-spin" />}
      {!isPending && isFulfilled && <Check className="text-progress-foreground h-3.5 w-3.5" />}
    </div>
  );
}
