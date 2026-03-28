import type { ProjectStatus } from "@/generated/prisma/client";
import { STATUS_CONFIG } from "@/lib/utils/status";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: ProjectStatus;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "sm" }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];
  const sizeClasses =
    size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-2.5 py-1";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        sizeClasses,
        config.bgClass,
        config.textClass,
        config.darkBgClass,
      )}
    >
      <span
        aria-hidden="true"
        className={cn("h-1.5 w-1.5 rounded-full", config.dotClass)}
      />
      {config.label}
    </span>
  );
}
