"use client";

import { ShoppingBag, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ShoppingCartProject } from "@/types/dashboard";

interface ShoppingForBarProps {
  selectedProjects: ShoppingCartProject[];
  onRemove: (projectId: string) => void;
  onClearAll: () => void;
}

export function ShoppingForBar({
  selectedProjects,
  onRemove,
  onClearAll,
}: ShoppingForBarProps) {
  return (
    <div
      className={cn(
        "sticky top-0 z-20 backdrop-blur-sm bg-background/80",
        "border-b border-border py-2 px-4",
      )}
    >
      {selectedProjects.length === 0 ? (
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            No projects selected — choose projects below to start your shopping
            trip
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mr-0.5">
            Shopping for:
          </span>
          {selectedProjects.map((project) => (
            <span
              key={project.projectId}
              className="bg-emerald-100 text-emerald-800 rounded-full px-3 py-1 text-sm flex items-center gap-1"
            >
              {project.projectName}
              <button
                type="button"
                onClick={() => onRemove(project.projectId)}
                className="text-emerald-600 hover:text-emerald-800 transition-colors"
                aria-label={`Remove ${project.projectName}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={onClearAll}
            className="text-sm text-muted-foreground underline hover:text-foreground transition-colors ml-1"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
