"use client";

import { Fragment, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/features/charts/status-badge";
import { ColorSwatch } from "@/components/features/supplies/color-swatch";
import { markSupplyAcquired } from "@/lib/actions/shopping-actions";
import type { ShoppingListProject } from "@/lib/actions/shopping-actions";
import type { ProjectStatus } from "@/generated/prisma/client";
import { PackageOpen } from "lucide-react";

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
      <div className="min-w-0 flex-1">
        <p className="text-foreground text-sm font-medium">
          {brandName} {code}
        </p>
        <p className="text-muted-foreground truncate text-sm">{colorName}</p>
      </div>
      <span className="text-sm font-medium whitespace-nowrap text-amber-600 dark:text-amber-500">
        Need {need}
      </span>
      <Button size="sm" onClick={handleMarkAcquired} disabled={isPending}>
        {isPending ? "Marking..." : "Mark Acquired"}
      </Button>
    </div>
  );
}

/* ─── Fabric Row ─────────────────────────────────────────────────────────── */

function FabricRow({
  fabricNeeds,
}: {
  fabricNeeds: Array<{ label: string; count: number; widthInches: number; heightInches: number }>;
}) {
  return (
    <div className="py-3">
      <p className="mb-2 text-sm font-medium text-amber-600 dark:text-amber-500">
        Needs fabric (includes 3&quot; margin per side):
      </p>
      <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-sm">
        <span className="text-muted-foreground text-xs font-medium">Count</span>
        <span className="text-muted-foreground text-xs font-medium">Width</span>
        <span className="text-muted-foreground text-xs font-medium">Height</span>
        {fabricNeeds.map((f) => (
          <Fragment key={f.count}>
            <span className="text-foreground">{f.label}</span>
            <span className="text-muted-foreground">{f.widthInches}&quot;</span>
            <span className="text-muted-foreground">{f.heightInches}&quot;</span>
          </Fragment>
        ))}
      </div>
    </div>
  );
}

/* ─── Project Group ──────────────────────────────────────────────────────── */

function ProjectGroup({ project }: { project: ShoppingListProject }) {
  return (
    <Card className="p-4 md:p-6">
      <div className="mb-4 flex items-center gap-3">
        <Link
          href={`/charts/${project.chartId}`}
          className="font-heading text-foreground hover:text-primary text-lg font-semibold transition-colors"
        >
          {project.projectName}
        </Link>
        <StatusBadge status={project.projectStatus as ProjectStatus} />
      </div>

      <div className="divide-border divide-y">
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
      <div className="bg-muted mb-4 rounded-full p-4">
        <PackageOpen className="text-muted-foreground h-8 w-8" />
      </div>
      <h2 className="font-heading text-foreground mb-2 text-lg font-semibold">All caught up!</h2>
      <p className="text-muted-foreground max-w-md text-sm">
        Every supply across all your projects is acquired. Time to stitch!
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
