import { Scissors } from "lucide-react";
import { STATUS_GRADIENT_CLASSES } from "./gallery-utils";
import type { ProjectStatus } from "@/generated/prisma/client";

interface CoverPlaceholderProps {
  status: ProjectStatus;
}

export function CoverPlaceholder({ status }: CoverPlaceholderProps) {
  return (
    <div
      className={`flex h-full w-full items-center justify-center ${STATUS_GRADIENT_CLASSES[status]}`}
    >
      <Scissors className="text-muted-foreground/15 h-8 w-8" strokeWidth={1} />
    </div>
  );
}
