"use client";

import { useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/features/charts/status-badge";
import { ColorSwatch } from "@/components/features/supplies/color-swatch";
import { markSupplyAcquired } from "@/lib/actions/shopping-actions";
import type { ShoppingListProject } from "@/lib/actions/shopping-actions";
import type { ProjectStatus } from "@/generated/prisma/client";
import { PackageOpen, ShoppingCart } from "lucide-react";

/* ─── Supply Row ─────────────────────────────────────────────────────────── */

function SupplyRow({
  type,
  junctionId,
  brandName,
  code,
  colorName,
  hexColor,
  need,
}: {
  type: "thread" | "bead" | "specialty";
  junctionId: string;
  brandName: string;
  code: string;
  colorName: string;
  hexColor?: string;
  need: number;
}) {
  const [isPending, startTransition] = useTransition();

  function handleMarkAcquired() {
    startTransition(async () => {
      try {
        const result = await markSupplyAcquired(type, junctionId);
        if (result.success) {
          toast.success(`${brandName} ${code} marked as acquired`);
        } else {
          toast.error(result.error ?? "Something went wrong.");
        }
      } catch {
        toast.error("Something went wrong.");
      }
    });
  }

  return (
    <div className="flex items-center gap-3 py-2">
      {hexColor && <ColorSwatch hexColor={hexColor} size="md" />}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">
          {brandName} {code}
        </p>
        <p className="text-sm text-muted-foreground truncate">{colorName}</p>
      </div>
      <span className="text-sm font-medium text-amber-600 dark:text-amber-500 whitespace-nowrap">
        Need {need}
      </span>
      <Button
        size="sm"
        onClick={handleMarkAcquired}
        disabled={isPending}
      >
        {isPending ? "Marking..." : "Mark Acquired"}
      </Button>
    </div>
  );
}

/* ─── Fabric Row ─────────────────────────────────────────────────────────── */

function FabricRow({
  fabricNeeds,
}: {
  fabricNeeds: { count: number; widthInches: number; heightInches: number };
}) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-amber-600 dark:text-amber-500">
          Needs fabric: {fabricNeeds.count}ct, {fabricNeeds.widthInches}&quot;
          &times; {fabricNeeds.heightInches}&quot;
        </p>
      </div>
    </div>
  );
}

/* ─── Project Group ──────────────────────────────────────────────────────── */

function ProjectGroup({ project }: { project: ShoppingListProject }) {
  return (
    <Card className="p-4 md:p-6">
      <div className="flex items-center gap-3 mb-4">
        <Link
          href={`/charts/${project.projectId}`}
          className="text-lg font-semibold font-heading text-foreground hover:text-primary transition-colors"
        >
          {project.projectName}
        </Link>
        <StatusBadge status={project.projectStatus as ProjectStatus} />
      </div>

      <div className="divide-y divide-border">
        {project.unfulfilledThreads.map((pt) => (
          <SupplyRow
            key={pt.id}
            type="thread"
            junctionId={pt.id}
            brandName={pt.thread.brand.name}
            code={pt.thread.colorCode}
            colorName={pt.thread.colorName}
            hexColor={pt.thread.hexColor}
            need={pt.quantityRequired - pt.quantityAcquired}
          />
        ))}

        {project.unfulfilledBeads.map((pb) => (
          <SupplyRow
            key={pb.id}
            type="bead"
            junctionId={pb.id}
            brandName={pb.bead.brand.name}
            code={pb.bead.productCode}
            colorName={pb.bead.colorName}
            hexColor={pb.bead.hexColor}
            need={pb.quantityRequired - pb.quantityAcquired}
          />
        ))}

        {project.unfulfilledSpecialty.map((ps) => (
          <SupplyRow
            key={ps.id}
            type="specialty"
            junctionId={ps.id}
            brandName={ps.specialtyItem.brand.name}
            code={ps.specialtyItem.productCode}
            colorName={ps.specialtyItem.colorName}
            need={ps.quantityRequired - ps.quantityAcquired}
          />
        ))}

        {project.needsFabric && project.fabricNeeds && (
          <FabricRow fabricNeeds={project.fabricNeeds} />
        )}
      </div>
    </Card>
  );
}

/* ─── Empty States ───────────────────────────────────────────────────────── */

function EmptyAllCaughtUp() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 rounded-full bg-muted p-4">
        <PackageOpen className="h-8 w-8 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-semibold font-heading text-foreground mb-2">
        All caught up!
      </h2>
      <p className="text-sm text-muted-foreground max-w-md">
        Every supply across all your projects is acquired. Time to stitch!
      </p>
    </div>
  );
}

function EmptyNoShoppingNeeds() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 rounded-full bg-muted p-4">
        <ShoppingCart className="h-8 w-8 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-semibold font-heading text-foreground mb-2">
        No shopping needs
      </h2>
      <p className="text-sm text-muted-foreground max-w-md">
        Link supplies to your projects to see what you still need to buy.
      </p>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */

interface ShoppingListProps {
  projects: ShoppingListProject[];
}

export function ShoppingList({ projects }: ShoppingListProps) {
  if (projects.length === 0) {
    return <EmptyAllCaughtUp />;
  }

  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <ProjectGroup key={project.projectId} project={project} />
      ))}
    </div>
  );
}
