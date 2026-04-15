"use client";

import { useState, useTransition } from "react";
import type { ProjectStatus } from "@/generated/prisma/client";
import { updateChartStatus } from "@/lib/actions/chart-actions";
import { STATUS_CONFIG, PROJECT_STATUSES } from "@/lib/utils/status";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HeroStatusBadgeProps {
  chartId: string;
  currentStatus: ProjectStatus;
  onStatusChange?: (status: ProjectStatus) => void;
}

/**
 * Interactive status badge for the project detail hero.
 * Wraps the status indicator in a Select dropdown with optimistic updates.
 * 44px touch target, chevron-down indicator (via SelectTrigger), and
 * rollback on failure per UI-SPEC status change interaction.
 */
export function HeroStatusBadge({
  chartId,
  currentStatus,
  onStatusChange,
}: HeroStatusBadgeProps) {
  const [status, setStatus] = useState<ProjectStatus>(currentStatus);
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(newStatus: string | null) {
    if (!newStatus) return;
    const validStatus = newStatus as ProjectStatus;
    const previousStatus = status;

    // Optimistic update
    setStatus(validStatus);

    startTransition(async () => {
      try {
        const result = await updateChartStatus(chartId, validStatus);
        if (result.success) {
          toast.success(`Status changed to ${STATUS_CONFIG[validStatus].label}`);
          onStatusChange?.(validStatus);
          return;
        }
        // Rollback on failure
        setStatus(previousStatus);
        toast.error("Couldn't update project status. Please try again.");
      } catch {
        // Rollback on error
        setStatus(previousStatus);
        toast.error("Couldn't update project status. Please try again.");
      }
    });
  }

  const config = STATUS_CONFIG[status];

  return (
    <Select value={status} onValueChange={handleStatusChange} disabled={isPending}>
      <SelectTrigger
        aria-label="Change project status"
        className="min-h-11 w-auto gap-1 border-0 bg-transparent px-2.5 py-1 shadow-none"
      >
        <SelectValue>
          <span className="flex items-center gap-1.5">
            <span
              aria-hidden="true"
              className={`h-2 w-2 rounded-full ${config.dotClass}`}
            />
            <span className={`text-sm font-medium ${config.textClass}`}>
              {config.label}
            </span>
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {PROJECT_STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            <span className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className={`h-2 w-2 rounded-full ${STATUS_CONFIG[s].dotClass}`}
              />
              {STATUS_CONFIG[s].label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
