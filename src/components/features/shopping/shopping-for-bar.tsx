"use client";

import { ShoppingBag, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ShoppingCartProject } from "@/types/dashboard";

interface ShoppingForBarProps {
  selectedProjects: ShoppingCartProject[];
  onRemove: (projectId: string) => void;
  onClearAll: () => void;
}

export function ShoppingForBar({ selectedProjects, onRemove, onClearAll }: ShoppingForBarProps) {
  return (
    <div
      className={cn(
        "bg-background/80 sticky top-0 z-20 backdrop-blur-sm",
        "border-border border-b px-4 py-2",
      )}
    >
      {selectedProjects.length === 0 ? (
        <div className="flex items-center gap-2">
          <ShoppingBag className="text-muted-foreground h-4 w-4" />
          <span className="text-muted-foreground text-sm">
            No projects selected — choose projects below to start your shopping trip
          </span>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="text-muted-foreground mr-0.5 text-xs font-medium tracking-wider uppercase">
            Shopping for:
          </span>
          {selectedProjects.map((project) => (
            <span
              key={project.projectId}
              className="bg-selected text-selected-foreground flex items-center gap-1 rounded-full px-3 py-1 text-sm"
            >
              {project.projectName}
              <button
                type="button"
                onClick={() => onRemove(project.projectId)}
                className="text-selected-foreground hover:text-foreground focus-visible:ring-ring rounded-full transition-colors outline-none focus-visible:ring-2"
                aria-label={`Remove ${project.projectName}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={onClearAll}
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring ml-1 rounded-sm text-sm underline transition-colors outline-none focus-visible:ring-2"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
