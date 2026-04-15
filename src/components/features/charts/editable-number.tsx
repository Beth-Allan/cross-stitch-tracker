"use client";

import { useState, useEffect, useRef } from "react";

interface EditableNumberProps {
  value: number;
  onSave: (value: number) => void;
  className?: string;
  ariaLabel?: string;
  min?: number;
  max?: number;
  /** Custom display format for the button (e.g., locale-formatted numbers) */
  formatDisplay?: (value: number) => string;
}

export function EditableNumber({
  value,
  onSave,
  className,
  ariaLabel,
  min = 0,
  max,
  formatDisplay,
}: EditableNumberProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="number"
        min={min}
        max={max}
        value={draft}
        aria-label={ariaLabel}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          const num = parseInt(draft);
          if (!isNaN(num) && num >= min && (max === undefined || num <= max)) {
            onSave(num);
          }
          setEditing(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          if (e.key === "Escape") {
            setDraft(String(value));
            setEditing(false);
          }
        }}
        className="bg-card text-foreground border-primary focus:ring-primary/40 w-14 rounded border px-1.5 py-0.5 text-center font-mono text-sm tabular-nums focus:ring-2 focus:outline-none"
      />
    );
  }

  return (
    <button
      onClick={() => {
        setDraft(String(value));
        setEditing(true);
      }}
      className={`hover:bg-muted min-h-11 min-w-11 cursor-text rounded px-1.5 py-0.5 font-mono tabular-nums transition-colors ${className ?? ""}`}
      title="Click to edit"
    >
      {formatDisplay ? formatDisplay(value) : value}
    </button>
  );
}
