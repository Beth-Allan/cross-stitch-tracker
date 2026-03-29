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

interface StatusControlProps {
  chartId: string;
  currentStatus: ProjectStatus;
}

export function StatusControl({ chartId, currentStatus }: StatusControlProps) {
  const [status, setStatus] = useState<ProjectStatus>(currentStatus);
  const [isPending, startTransition] = useTransition();

  function handleStatusChange(newStatus: string | null) {
    if (!newStatus) return;
    const validStatus = newStatus as ProjectStatus;
    const previousStatus = status;
    setStatus(validStatus);

    startTransition(async () => {
      const result = await updateChartStatus(chartId, validStatus);
      if (result.success) {
        toast.success(`Status changed to ${STATUS_CONFIG[validStatus].label}`);
      } else {
        setStatus(previousStatus);
        toast.error("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-semibold tracking-wider text-stone-400 uppercase dark:text-stone-500">
        Status
      </span>
      <Select value={status} onValueChange={handleStatusChange} disabled={isPending}>
        <SelectTrigger className="w-[180px]">
          <SelectValue>
            <span className="flex items-center gap-1.5">
              <span
                aria-hidden="true"
                className={`h-1.5 w-1.5 rounded-full ${STATUS_CONFIG[status].dotClass}`}
              />
              {STATUS_CONFIG[status].label}
            </span>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {PROJECT_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              <span className="flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className={`h-1.5 w-1.5 rounded-full ${STATUS_CONFIG[s].dotClass}`}
                />
                {STATUS_CONFIG[s].label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
