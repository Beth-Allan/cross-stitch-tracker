import { Scissors } from "lucide-react";
import { STATUS_GRADIENTS } from "./gallery-utils";
import type { ProjectStatus } from "@/generated/prisma/client";

interface CoverPlaceholderProps {
  status: ProjectStatus;
}

export function CoverPlaceholder({ status }: CoverPlaceholderProps) {
  const [from, to] = STATUS_GRADIENTS[status];
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{
        background: `linear-gradient(160deg, ${from} 0%, ${to} 100%)`,
      }}
    >
      <Scissors className="h-8 w-8 text-stone-400/25" strokeWidth={1} />
    </div>
  );
}
