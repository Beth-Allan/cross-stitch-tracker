"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { deleteChart } from "@/lib/actions/chart-actions";

interface HeroKebabMenuProps {
  chartId: string;
  chartName: string;
}

/**
 * Kebab overflow menu for the project detail hero.
 * Contains "Delete Project" action with confirmation dialog.
 * 44px touch target on trigger per UI-SPEC.
 */
export function HeroKebabMenu({ chartId, chartName }: HeroKebabMenuProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      try {
        const result = await deleteChart(chartId);
        if (result.success) {
          toast.success("Project deleted");
          setDialogOpen(false);
          router.push("/charts");
        } else {
          // Dialog stays open on failure (retry-able)
          toast.error("Something went wrong. Please try again.");
        }
      } catch {
        // Dialog stays open on failure (retry-able)
        toast.error("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label="Project actions"
          className="hover:bg-accent focus-visible:ring-ring flex min-h-11 min-w-11 items-center justify-center rounded-lg transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        >
          <MoreHorizontal className="size-5 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={8} className="w-48">
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setDialogOpen(true)}
          >
            <Trash2 className="size-4" />
            Delete Project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {chartName}?</DialogTitle>
            <DialogDescription>
              This will permanently delete this project and all its supplies.
              This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? "Deleting..." : "Delete Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
