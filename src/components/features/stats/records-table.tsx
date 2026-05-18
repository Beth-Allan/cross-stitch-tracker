"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Flame, Trophy, TrendingUp, Zap, Timer } from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import type {
  PersonalBestRecord,
  FastestCompletion,
  SizeCategory,
} from "@/types/stats";

const SIZE_CATEGORIES: SizeCategory[] = ["Mini", "Small", "Medium", "Large", "BAP"];

const RECORD_ICONS = {
  bestDay: { icon: Flame, color: "text-warning" },
  bestSession: { icon: Trophy, color: "text-warning" },
  longestStreak: { icon: TrendingUp, color: "text-success" },
  currentStreak: { icon: Zap, color: "text-success" },
} as const;

interface RecordsTableProps {
  personalBests: PersonalBestRecord[];
  fastestCompletions: FastestCompletion[];
  availableYears: number[];
}

function formatRecordValue(value: number, unit: string): string {
  if (unit === "stitches") {
    return value.toLocaleString();
  }
  return String(value);
}

function RecordValueCell({
  record,
  isAllTime,
}: {
  record: PersonalBestRecord | null;
  isAllTime: boolean;
}) {
  if (!record || (record.value === 0 && !record.date)) {
    return (
      <span className="text-muted-foreground font-mono">--</span>
    );
  }

  const valueSize = isAllTime
    ? "text-2xl font-mono font-semibold tabular-nums"
    : "text-base font-mono font-semibold tabular-nums";

  return (
    <div className="flex flex-col gap-0.5">
      <span className={valueSize}>
        {formatRecordValue(record.value, record.unit)}
      </span>
      <span className="text-muted-foreground text-xs">{record.unit}</span>
      {record.date && (
        <span className="text-muted-foreground text-xs">
          {format(new Date(record.date), "MMM d, yyyy")}
        </span>
      )}
      {record.projectName && record.chartId && (
        <Link
          href={`/charts/${record.chartId}`}
          className="text-foreground hover:text-primary decoration-border hover:decoration-primary text-xs underline underline-offset-2 transition-colors"
        >
          {record.projectName}
        </Link>
      )}
    </div>
  );
}

function CompletionValueCell({
  completion,
  isAllTime,
}: {
  completion: FastestCompletion | null;
  isAllTime: boolean;
}) {
  if (!completion) {
    return (
      <span className="text-muted-foreground font-mono">--</span>
    );
  }

  const valueSize = isAllTime
    ? "text-2xl font-mono font-semibold tabular-nums"
    : "text-base font-mono font-semibold tabular-nums";

  return (
    <div className="flex flex-col gap-0.5">
      <span className={valueSize}>{completion.daysToComplete}</span>
      <span className="text-muted-foreground text-xs">days to complete</span>
      <Link
        href={`/charts/${completion.chartId}`}
        className="text-foreground hover:text-primary decoration-border hover:decoration-primary text-xs underline underline-offset-2 transition-colors"
      >
        {completion.projectName}
      </Link>
    </div>
  );
}

export function RecordsTable({
  personalBests,
  fastestCompletions,
  availableYears,
}: RecordsTableProps) {
  const allTimeColClass = "bg-success-muted";

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-[160px]">Record</TableHead>
          <TableHead className={`${allTimeColClass} min-w-[160px] font-semibold`}>
            All-time
          </TableHead>
          {availableYears.map((year) => (
            <TableHead key={year} className="min-w-[140px]">
              {year}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {/* Personal Best rows */}
        {personalBests.map((record) => {
          const iconConfig = RECORD_ICONS[record.type];
          const IconComponent = iconConfig.icon;
          const isCurrentStreak = record.type === "currentStreak";

          return (
            <TableRow key={record.type}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <IconComponent className={`h-4 w-4 ${iconConfig.color}`} />
                  <span className="font-medium">
                    {record.label}
                    {isCurrentStreak && (
                      <span className="text-muted-foreground ml-1 text-xs">(live)</span>
                    )}
                  </span>
                </div>
              </TableCell>
              <TableCell className={allTimeColClass}>
                <RecordValueCell record={record} isAllTime={true} />
              </TableCell>
              {availableYears.map((year) => (
                <TableCell key={year}>
                  {isCurrentStreak ? (
                    <span className="text-muted-foreground font-mono">--</span>
                  ) : (
                    <span className="text-muted-foreground font-mono">--</span>
                  )}
                </TableCell>
              ))}
            </TableRow>
          );
        })}

        {/* Grouped Divider */}
        <TableRow className="hover:bg-transparent">
          <TableCell
            colSpan={2 + availableYears.length}
            className="bg-muted px-3 py-2"
          >
            <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
              Fastest Completions
            </span>
          </TableCell>
        </TableRow>

        {/* Fastest Completion rows */}
        {SIZE_CATEGORIES.map((category) => {
          const completion =
            fastestCompletions.find((c) => c.sizeCategory === category) ?? null;

          return (
            <TableRow key={category}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Timer className="text-muted-foreground h-4 w-4" />
                  <span className="font-medium">Fastest {category}</span>
                </div>
              </TableCell>
              <TableCell className={allTimeColClass}>
                <CompletionValueCell completion={completion} isAllTime={true} />
              </TableCell>
              {availableYears.map((year) => (
                <TableCell key={year}>
                  <span className="text-muted-foreground font-mono">--</span>
                </TableCell>
              ))}
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
