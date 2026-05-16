"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Loader2, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuantityControlProps {
  acquired: number;
  required: number;
  isPending: boolean;
  hasError?: boolean;
  onChange: (newValue: number) => void;
}

export function QuantityControl({
  acquired,
  required,
  isPending,
  hasError = false,
  onChange,
}: QuantityControlProps) {
  const isFulfilled = acquired >= required;
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
      onChange(Math.min(required, Math.max(0, n)));
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
          max={required}
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
          aria-label={`Acquired quantity out of ${required}`}
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
          aria-label={`${acquired} of ${required} acquired, click to edit`}
        >
          {acquired}/{required}
        </button>
      )}

      <button
        type="button"
        onClick={() => onChange(acquired + 1)}
        disabled={acquired >= required || isPending}
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
