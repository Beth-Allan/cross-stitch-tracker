"use client";

import { useState, useMemo } from "react";
import { Camera, ChevronUp, ChevronDown, Pencil } from "lucide-react";
import type { StitchSessionRow } from "@/types/session";

// ─── Types ──────────────────────────────────────────────────────────────────

type SortField = "date" | "stitches" | "time";
type SortDir = "asc" | "desc";

interface SessionTableProps {
  sessions: StitchSessionRow[];
  imageUrls: Record<string, string>;
  showProjectName?: boolean;
  onEditSession?: (session: StitchSessionRow) => void;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

// ─── SortHeader ─────────────────────────────────────────────────────────────

function SortHeader({
  field,
  label,
  activeField,
  activeDir,
  onSort,
  align = "left",
}: {
  field: SortField;
  label: string;
  activeField: SortField;
  activeDir: SortDir;
  onSort: (field: SortField) => void;
  align?: "left" | "right";
}) {
  const isActive = activeField === field;
  const ArrowIcon = activeDir === "asc" ? ChevronUp : ChevronDown;

  return (
    <th
      role="columnheader"
      onClick={() => onSort(field)}
      className={`cursor-pointer px-4 py-3 text-xs font-semibold tracking-wider uppercase select-none ${
        align === "right" ? "text-right" : "text-left"
      } text-muted-foreground`}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {isActive && <ArrowIcon className="size-3 text-emerald-500" />}
      </span>
    </th>
  );
}

// ─── Component ──────────────────────────────────────────────────────────────

export function SessionTable({
  sessions,
  imageUrls,
  showProjectName = false,
  onEditSession,
}: SessionTableProps) {
  const [sort, setSort] = useState<{ field: SortField; dir: SortDir }>({
    field: "date",
    dir: "desc",
  });

  const handleSort = (field: SortField) => {
    if (sort.field === field) {
      setSort({ field, dir: sort.dir === "asc" ? "desc" : "asc" });
    } else {
      setSort({ field, dir: "desc" });
    }
  };

  const sortedSessions = useMemo(() => {
    return [...sessions].sort((a, b) => {
      let cmp = 0;
      switch (sort.field) {
        case "date":
          cmp = a.date.getTime() - b.date.getTime();
          break;
        case "stitches":
          cmp = a.stitchCount - b.stitchCount;
          break;
        case "time":
          cmp = (a.timeSpentMinutes ?? 0) - (b.timeSpentMinutes ?? 0);
          break;
      }
      return sort.dir === "desc" ? -cmp : cmp;
    });
  }, [sessions, sort]);

  if (sessions.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground text-sm">No sessions logged yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-card border-border overflow-x-auto rounded-xl border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-border border-b">
            <SortHeader
              field="date"
              label="Date"
              activeField={sort.field}
              activeDir={sort.dir}
              onSort={handleSort}
            />
            {showProjectName && (
              <th
                role="columnheader"
                className="text-muted-foreground px-4 py-3 text-left text-xs font-semibold tracking-wider uppercase"
              >
                Project
              </th>
            )}
            <SortHeader
              field="stitches"
              label="Stitches"
              activeField={sort.field}
              activeDir={sort.dir}
              onSort={handleSort}
            />
            <SortHeader
              field="time"
              label="Time"
              activeField={sort.field}
              activeDir={sort.dir}
              onSort={handleSort}
            />
            <th
              role="columnheader"
              className="text-muted-foreground w-10 px-4 py-3"
              aria-label="Photo"
            >
              <Camera className="size-3.5" />
            </th>
            <th className="w-10" aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {sortedSessions.map((session) => (
            <tr
              key={session.id}
              className="group border-border/50 hover:bg-muted/50 border-b transition-colors last:border-b-0"
            >
              <td className="text-foreground px-4 py-3 whitespace-nowrap tabular-nums">
                {formatDate(session.date)}
              </td>
              {showProjectName && (
                <td className="text-foreground px-4 py-3">{session.projectName}</td>
              )}
              <td className="text-foreground px-4 py-3 whitespace-nowrap tabular-nums">
                {session.stitchCount.toLocaleString()}
              </td>
              <td className="text-muted-foreground px-4 py-3 whitespace-nowrap">
                {session.timeSpentMinutes != null ? formatTime(session.timeSpentMinutes) : "\u2014"}
              </td>
              <td className="px-4 py-3">
                {session.photoKey && (
                  <Camera className="size-3.5 text-emerald-500" strokeWidth={1.5} />
                )}
              </td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => onEditSession?.(session)}
                  className="hover:bg-muted text-muted-foreground rounded-md p-1.5 opacity-0 transition-all group-hover:opacity-100"
                  title="Edit session"
                >
                  <Pencil className="size-3.5" strokeWidth={1.5} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
