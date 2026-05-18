"use client";

import { useQueryState, parseAsString } from "nuqs";

interface YearScopeToggleProps {
  availableYears: number[];
}

export function YearScopeToggle({ availableYears }: YearScopeToggleProps) {
  const [scope, setScope] = useQueryState("scope", parseAsString.withDefault("all"));

  const options: { value: string; label: string }[] = [
    { value: "all", label: "All-time" },
    ...availableYears.map((year) => ({
      value: String(year),
      label: String(year),
    })),
  ];

  return (
    <div role="group" aria-label="Time scope" className="bg-muted inline-flex gap-1 rounded-xl p-1">
      {options.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          aria-pressed={scope === value}
          onClick={() => void setScope(value === "all" ? null : value)}
          className={
            scope === value
              ? "bg-selected text-selected-foreground border-selected-border rounded-lg border px-3 py-1.5 text-sm font-medium shadow-sm"
              : "text-muted-foreground hover:text-foreground rounded-lg px-3 py-1.5 text-sm font-medium"
          }
        >
          {label}
        </button>
      ))}
    </div>
  );
}
