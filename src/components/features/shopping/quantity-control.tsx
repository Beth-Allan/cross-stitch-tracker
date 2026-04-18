"use client";

import { Check, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuantityControlProps {
  acquired: number;
  required: number;
  isPending: boolean;
  onChange: (newValue: number) => void;
}

export function QuantityControl({
  acquired,
  required,
  isPending,
  onChange,
}: QuantityControlProps) {
  const isFulfilled = acquired >= required;

  function handleDirectInput() {
    const val = window.prompt(
      `Enter acquired quantity (of ${required}):`,
      String(acquired),
    );
    if (val !== null) {
      const n = parseInt(val, 10);
      if (!isNaN(n) && n >= 0) {
        onChange(Math.min(required, Math.max(0, n)));
      }
    }
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1",
        isFulfilled && "bg-emerald-100 rounded-lg px-2",
      )}
    >
      <button
        type="button"
        onClick={() => onChange(acquired - 1)}
        disabled={acquired <= 0 || isPending}
        aria-label="Decrement quantity"
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded transition-colors",
          "text-muted-foreground hover:text-foreground",
          "disabled:opacity-50 disabled:cursor-not-allowed",
        )}
      >
        <Minus className="h-4 w-4" />
      </button>

      <button
        type="button"
        onClick={handleDirectInput}
        disabled={isPending}
        className={cn(
          "font-mono text-sm tabular-nums min-w-[3ch] text-center px-1.5 py-0.5 rounded transition-colors",
          isFulfilled
            ? "text-emerald-700"
            : "text-foreground hover:bg-muted",
        )}
      >
        {acquired}/{required}
      </button>

      <button
        type="button"
        onClick={() => onChange(acquired + 1)}
        disabled={acquired >= required || isPending}
        aria-label="Increment quantity"
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded transition-colors",
          "text-muted-foreground hover:text-emerald-600",
          "disabled:opacity-50 disabled:cursor-not-allowed",
        )}
      >
        <Plus className="h-4 w-4" />
      </button>

      {isFulfilled && <Check className="h-3.5 w-3.5 text-emerald-600" />}
    </div>
  );
}
