"use client";

import { useQueryState, parseAsInteger, parseAsString, parseAsStringLiteral } from "nuqs";
import Link from "next/link";
import { ArrowUpDown, Camera } from "lucide-react";
import { format } from "date-fns";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatTime } from "@/lib/utils/format-time";
import type { SessionHistoryData } from "@/types/stats";

const SORT_FIELDS = ["date", "stitches", "time"] as const;
const SORT_DIRS = ["asc", "desc"] as const;

type SortField = (typeof SORT_FIELDS)[number];

interface SessionHistoryTableProps {
  data: SessionHistoryData;
  projects: { id: string; name: string }[];
}

export function SessionHistoryTable({ data, projects }: SessionHistoryTableProps) {
  const [page, setPage] = useQueryState("page", parseAsInteger.withDefault(1));
  const [sort, setSort] = useQueryState(
    "sort",
    parseAsStringLiteral([...SORT_FIELDS]).withDefault("date"),
  );
  const [dir, setDir] = useQueryState(
    "dir",
    parseAsStringLiteral([...SORT_DIRS]).withDefault("desc"),
  );
  const [project, setProject] = useQueryState("project", parseAsString.withDefault("all"));

  function handleSort(field: SortField) {
    if (sort === field) {
      void setDir(dir === "asc" ? "desc" : "asc");
    } else {
      void setSort(field);
      void setDir("desc");
    }
    void setPage(1);
  }

  function handleProjectFilter(value: string | null) {
    void setProject(value ?? "all");
    void setPage(1);
  }

  return (
    <div className="space-y-4">
      {/* Header with project filter */}
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-sm font-semibold">Session History</h3>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-xs">Project</span>
          <Select value={project} onValueChange={handleProjectFilter}>
            <SelectTrigger size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="border-border bg-card rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <button onClick={() => handleSort("date")} className="flex items-center gap-1">
                  Date
                  {sort === "date" && <ArrowUpDown className="text-success h-3 w-3" />}
                </button>
              </TableHead>
              <TableHead>Project</TableHead>
              <TableHead>
                <button onClick={() => handleSort("stitches")} className="flex items-center gap-1">
                  Stitches
                  {sort === "stitches" && <ArrowUpDown className="text-success h-3 w-3" />}
                </button>
              </TableHead>
              <TableHead>
                <button onClick={() => handleSort("time")} className="flex items-center gap-1">
                  Time
                  {sort === "time" && <ArrowUpDown className="text-success h-3 w-3" />}
                </button>
              </TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.sessions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center">
                  <span className="text-muted-foreground text-sm">
                    No sessions match your filters
                  </span>
                </TableCell>
              </TableRow>
            ) : (
              data.sessions.map((item) => (
                <TableRow key={item.id} className="hover:bg-accent">
                  <TableCell className="text-muted-foreground whitespace-nowrap tabular-nums">
                    {format(new Date(item.date), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/charts/${item.chartId}`}
                      className="decoration-muted-foreground/50 hover:decoration-foreground inline-block max-w-[200px] truncate underline"
                    >
                      {item.projectName}
                    </Link>
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {item.stitchCount.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.timeSpentMinutes ? formatTime(item.timeSpentMinutes) : "--"}
                  </TableCell>
                  <TableCell className="text-center">
                    {item.hasPhoto && (
                      <Camera data-testid="photo-indicator" className="text-success h-3.5 w-3.5" />
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {data.totalPages > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">
            Page {data.page} of {data.totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void setPage(page - 1)}
              disabled={page <= 1}
              aria-label="Previous"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void setPage(page + 1)}
              disabled={page >= data.totalPages}
              aria-label="Next"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
