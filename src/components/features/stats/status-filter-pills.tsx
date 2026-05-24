"use client";

import { useQueryState, parseAsArrayOf, parseAsStringLiteral } from "nuqs";
import { STATUS_GROUPS, type StatusGroup } from "@/lib/utils/status-groups";

const PILL_OPTIONS = [
  { value: "not-started" as const, label: "Not Started" },
  { value: "in-progress" as const, label: "In Progress" },
  { value: "complete" as const, label: "Complete" },
];

export function StatusFilterPills() {
  const [statusFilter, setStatusFilter] = useQueryState(
    "status",
    parseAsArrayOf(parseAsStringLiteral([...STATUS_GROUPS]), ",").withDefault([]),
  );

  const isAllActive = statusFilter.length === 0;

  function toggleGroup(group: StatusGroup) {
    void setStatusFilter((prev) => {
      const current = prev ?? [];
      return current.includes(group)
        ? (current.filter((v) => v !== group) as StatusGroup[])
        : [...current, group];
    });
  }

  return (
    <div
      role="group"
      aria-label="Filter by status"
      className="bg-muted inline-flex gap-1 rounded-xl p-1"
    >
      <button
        type="button"
        aria-pressed={isAllActive}
        onClick={() => void setStatusFilter(null)}
        className={
          isAllActive
            ? "bg-selected text-selected-foreground border-selected-border rounded-lg border px-3 py-1.5 text-sm font-medium shadow-sm"
            : "text-muted-foreground hover:text-foreground rounded-lg px-3 py-1.5 text-sm font-medium"
        }
      >
        All
      </button>
      {PILL_OPTIONS.map(({ value, label }) => {
        const isActive = statusFilter.includes(value);
        return (
          <button
            key={value}
            type="button"
            aria-pressed={isActive}
            onClick={() => toggleGroup(value)}
            className={
              isActive
                ? "bg-selected text-selected-foreground border-selected-border rounded-lg border px-3 py-1.5 text-sm font-medium shadow-sm"
                : "text-muted-foreground hover:text-foreground rounded-lg px-3 py-1.5 text-sm font-medium"
            }
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
