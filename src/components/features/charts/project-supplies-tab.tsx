"use client";

import { useState, useEffect, useRef, useTransition, useCallback } from "react";
import {
  Check,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  CircleDot,
  Gem,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import {
  removeProjectThread,
  removeProjectBead,
  removeProjectSpecialty,
  updateProjectSupplyQuantity,
} from "@/lib/actions/supply-actions";
import { SearchToAdd } from "@/components/features/supplies/search-to-add";
import type {
  ProjectThreadWithThread,
  ProjectBeadWithBead,
  ProjectSpecialtyWithItem,
} from "@/types/supply";

// ─── Helpers ───────────────────────────────────────────────────────────────

function needsBorder(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.85;
}

// ─── Editable Number ───────────────────────────────────────────────────────

function EditableNumber({
  value,
  onSave,
  className,
}: {
  value: number;
  onSave: (value: number) => void;
  className?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="number"
        min={0}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          const num = parseInt(draft);
          if (!isNaN(num) && num >= 0) onSave(num);
          setEditing(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
          if (e.key === "Escape") {
            setDraft(String(value));
            setEditing(false);
          }
        }}
        className="bg-card text-foreground border-primary focus:ring-primary/40 w-12 rounded border px-1.5 py-0.5 text-center text-sm focus:ring-2 focus:outline-none"
      />
    );
  }

  return (
    <button
      onClick={() => {
        setDraft(String(value));
        setEditing(true);
      }}
      className={`hover:bg-muted cursor-text rounded px-1.5 py-0.5 transition-colors ${className ?? ""}`}
      title="Click to edit"
    >
      {value}
    </button>
  );
}

// ─── Supply Row ────────────────────────────────────────────────────────────

function SupplyRow({
  hex,
  code,
  name,
  brand,
  stitchCount,
  quantityRequired,
  quantityAcquired,
  isFulfilled,
  quantityNeeded,
  onUpdateRequired,
  onUpdateAcquired,
  onRemove,
}: {
  hex: string;
  code: string;
  name: string;
  brand: string;
  stitchCount?: number;
  quantityRequired: number;
  quantityAcquired: number;
  isFulfilled: boolean;
  quantityNeeded: number;
  onUpdateRequired: (value: number) => void;
  onUpdateAcquired: (value: number) => void;
  onRemove: () => void;
}) {
  const isLight = needsBorder(hex);

  return (
    <div className="group border-border flex items-center gap-3 border-b py-3 last:border-b-0">
      {/* Swatch */}
      <div
        className={`h-7 w-7 shrink-0 rounded-full shadow-sm ${
          isLight ? "ring-1 ring-border" : ""
        }`}
        style={{ backgroundColor: hex }}
      />

      {/* Code + Name */}
      <div className="min-w-0 flex-1">
        <p className="text-foreground truncate text-sm">
          <span className="font-medium">
            {brand} {code}
          </span>
          <span className="text-muted-foreground"> — {name}</span>
        </p>
        {stitchCount != null && stitchCount > 0 && (
          <p className="text-muted-foreground text-xs">{stitchCount.toLocaleString()} stitches</p>
        )}
      </div>

      {/* Quantities */}
      <div className="flex shrink-0 items-center gap-3 text-sm">
        <div className="text-muted-foreground flex items-center gap-1">
          <span className="text-xs">Req:</span>
          <EditableNumber
            value={quantityRequired}
            onSave={onUpdateRequired}
            className="text-foreground font-medium"
          />
        </div>
        <div className="text-muted-foreground flex items-center gap-1">
          <span className="text-xs">Have:</span>
          <EditableNumber
            value={quantityAcquired}
            onSave={onUpdateAcquired}
            className={`font-medium ${
              isFulfilled
                ? "text-success"
                : "text-warning"
            }`}
          />
        </div>
        {quantityNeeded > 0 && (
          <span className="text-warning text-xs font-medium whitespace-nowrap">
            Need {quantityNeeded}
          </span>
        )}
      </div>

      {/* Fulfillment indicator */}
      <div className="flex w-5 shrink-0 justify-center">
        {isFulfilled ? (
          <Check className="text-success h-4 w-4" strokeWidth={2} />
        ) : (
          <AlertTriangle className="text-warning h-4 w-4" strokeWidth={1.5} />
        )}
      </div>

      {/* Remove */}
      <button
        onClick={onRemove}
        className="flex w-5 shrink-0 justify-center opacity-40 transition-opacity group-hover:opacity-100 focus:opacity-100"
        title="Remove from project"
        aria-label={`Remove ${brand} ${code} from project`}
      >
        <Trash2
          className="text-muted-foreground hover:text-destructive h-3.5 w-3.5 transition-colors"
          strokeWidth={1.5}
        />
      </button>
    </div>
  );
}

// ─── Collapsible Section ───────────────────────────────────────────────────

function SupplySection({
  title,
  icon: Icon,
  count,
  fulfilledCount,
  defaultOpen,
  children,
  onAddClick,
  addLabel,
  emptyText,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  count: number;
  fulfilledCount: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
  onAddClick: () => void;
  addLabel: string;
  emptyText: string;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen ?? count > 0);
  const allFulfilled = count > 0 && fulfilledCount === count;

  return (
    <div className="border-border bg-card overflow-hidden rounded-xl border">
      {/* Section header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hover:bg-muted/50 flex w-full items-center gap-3 px-5 py-3.5 transition-colors"
      >
        {isOpen ? (
          <ChevronDown className="text-muted-foreground h-4 w-4 shrink-0" strokeWidth={1.5} />
        ) : (
          <ChevronRight className="text-muted-foreground h-4 w-4 shrink-0" strokeWidth={1.5} />
        )}
        <Icon className="text-muted-foreground h-4 w-4 shrink-0" strokeWidth={1.5} />
        <h3 className="font-heading text-foreground flex-1 text-left text-sm font-semibold">
          {title}
        </h3>
        <span className="flex items-center gap-2 text-xs">
          {count === 0 ? (
            <span className="text-muted-foreground">None</span>
          ) : allFulfilled ? (
            <span className="text-success flex items-center gap-1">
              <Check className="h-3.5 w-3.5" strokeWidth={2} />
              {count}/{count}
            </span>
          ) : (
            <span className="text-warning">
              {fulfilledCount}/{count}
            </span>
          )}
        </span>
      </button>

      {/* Section content */}
      {isOpen && (
        <div className="border-border border-t px-5 pb-4">
          {count === 0 ? (
            <div className="py-6 text-center">
              <p className="text-muted-foreground mb-2 text-sm">{emptyText}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddClick();
                }}
                type="button"
                className="mx-auto flex items-center gap-1.5 text-primary hover:text-primary/80 text-sm font-medium transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                {addLabel}
              </button>
            </div>
          ) : (
            <>
              <div className="pt-1">{children}</div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAddClick();
                }}
                type="button"
                className="mt-3 flex items-center gap-1.5 text-primary hover:text-primary/80 text-sm font-medium transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add more
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

interface ProjectSuppliesTabProps {
  projectId: string;
  threads: ProjectThreadWithThread[];
  beads: ProjectBeadWithBead[];
  specialty: ProjectSpecialtyWithItem[];
}

export function ProjectSuppliesTab({
  projectId,
  threads,
  beads,
  specialty,
}: ProjectSuppliesTabProps) {
  const [addingType, setAddingType] = useState<"thread" | "bead" | "specialty" | null>(null);
  const [, startTransition] = useTransition();

  // Kitting summary calculations
  const totalItems = threads.length + beads.length + specialty.length;
  const fulfilledThreads = threads.filter(
    (pt) => pt.quantityAcquired >= pt.quantityRequired,
  ).length;
  const fulfilledBeads = beads.filter((pb) => pb.quantityAcquired >= pb.quantityRequired).length;
  const fulfilledSpecialty = specialty.filter(
    (ps) => ps.quantityAcquired >= ps.quantityRequired,
  ).length;
  const fulfilledTotal = fulfilledThreads + fulfilledBeads + fulfilledSpecialty;
  const overallPercent = totalItems > 0 ? Math.round((fulfilledTotal / totalItems) * 100) : 0;

  // Needs summary
  const needsSummary: string[] = [];
  const unfulfilledThreadCount = threads.length - fulfilledThreads;
  const unfulfilledBeadCount = beads.length - fulfilledBeads;
  const unfulfilledSpecialtyCount = specialty.length - fulfilledSpecialty;
  if (unfulfilledThreadCount > 0)
    needsSummary.push(`${unfulfilledThreadCount} thread${unfulfilledThreadCount > 1 ? "s" : ""}`);
  if (unfulfilledBeadCount > 0)
    needsSummary.push(`${unfulfilledBeadCount} bead${unfulfilledBeadCount > 1 ? "s" : ""}`);
  if (unfulfilledSpecialtyCount > 0)
    needsSummary.push(
      `${unfulfilledSpecialtyCount} specialty item${unfulfilledSpecialtyCount > 1 ? "s" : ""}`,
    );

  // Already-linked IDs for filtering search results
  const linkedThreadIds = threads.map((pt) => pt.threadId);
  const linkedBeadIds = beads.map((pb) => pb.beadId);
  const linkedSpecialtyIds = specialty.map((ps) => ps.specialtyItemId);

  const handleRemoveThread = useCallback((id: string, brandCode: string) => {
    startTransition(async () => {
      try {
        const result = await removeProjectThread(id);
        if (result.success) {
          toast.success(`Removed ${brandCode} from project`);
        } else {
          toast.error(result.error ?? "Something went wrong. Please try again.");
        }
      } catch {
        toast.error("Something went wrong. Please try again.");
      }
    });
  }, []);

  const handleRemoveBead = useCallback((id: string, brandCode: string) => {
    startTransition(async () => {
      try {
        const result = await removeProjectBead(id);
        if (result.success) {
          toast.success(`Removed ${brandCode} from project`);
        } else {
          toast.error(result.error ?? "Something went wrong. Please try again.");
        }
      } catch {
        toast.error("Something went wrong. Please try again.");
      }
    });
  }, []);

  const handleRemoveSpecialty = useCallback((id: string, brandCode: string) => {
    startTransition(async () => {
      try {
        const result = await removeProjectSpecialty(id);
        if (result.success) {
          toast.success(`Removed ${brandCode} from project`);
        } else {
          toast.error(result.error ?? "Something went wrong. Please try again.");
        }
      } catch {
        toast.error("Something went wrong. Please try again.");
      }
    });
  }, []);

  const handleUpdateQuantity = useCallback(
    (
      id: string,
      type: "thread" | "bead" | "specialty",
      field: "quantityRequired" | "quantityAcquired",
      value: number,
    ) => {
      startTransition(async () => {
        try {
          const result = await updateProjectSupplyQuantity(id, type, {
            [field]: value,
          });
          if (!result.success) {
            toast.error(result.error ?? "Something went wrong. Please try again.");
          }
        } catch {
          toast.error("Something went wrong. Please try again.");
        }
      });
    },
    [],
  );

  const handleAdded = useCallback(() => {
    setAddingType(null);
  }, []);

  return (
    <div className="space-y-5">
      {/* Kitting Progress Summary */}
      <div className="border-border bg-card overflow-hidden rounded-xl border">
        <div className="px-5 py-4">
          <h3 className="font-heading text-foreground mb-3 text-sm font-semibold">
            Supply Kitting
          </h3>

          {/* Progress bar */}
          <div className="mb-3 flex items-center gap-3">
            <div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
              <div
                className="bg-success h-full rounded-full transition-[width]"
                style={{ width: `${overallPercent}%` }}
              />
            </div>
            <span
              className={`text-sm font-medium tabular-nums ${
                overallPercent === 100
                  ? "text-success"
                  : "text-foreground"
              }`}
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {overallPercent}%
            </span>
          </div>

          {/* Summary message */}
          {overallPercent === 100 && totalItems > 0 ? (
            <div className="border-success-border/40 bg-success-muted/50 rounded-lg border px-4 py-2.5">
              <p className="text-success-muted-foreground flex items-center gap-2 text-sm font-medium">
                <Check className="h-4 w-4" />
                All supplies acquired
              </p>
            </div>
          ) : needsSummary.length > 0 ? (
            <div className="border-warning-border/40 bg-warning-muted/50 rounded-lg border px-4 py-2.5">
              <p className="text-warning-muted-foreground text-sm">
                <span className="font-medium">Still needs:</span> {needsSummary.join(", ")}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Thread Section */}
      <div className="relative">
        <SupplySection
          title="Thread"
          icon={CircleDot}
          count={threads.length}
          fulfilledCount={fulfilledThreads}
          defaultOpen
          onAddClick={() => setAddingType("thread")}
          addLabel="Add threads"
          emptyText="No threads linked to this project"
        >
          {threads.map((pt) => {
            const thread = pt.thread;
            const isFulfilled = pt.quantityAcquired >= pt.quantityRequired;
            const quantityNeeded = Math.max(0, pt.quantityRequired - pt.quantityAcquired);
            return (
              <SupplyRow
                key={pt.id}
                hex={thread.hexColor}
                code={thread.colorCode}
                name={thread.colorName}
                brand={thread.brand.name}
                stitchCount={pt.stitchCount}
                quantityRequired={pt.quantityRequired}
                quantityAcquired={pt.quantityAcquired}
                isFulfilled={isFulfilled}
                quantityNeeded={quantityNeeded}
                onUpdateRequired={(v) =>
                  handleUpdateQuantity(pt.id, "thread", "quantityRequired", v)
                }
                onUpdateAcquired={(v) =>
                  handleUpdateQuantity(pt.id, "thread", "quantityAcquired", v)
                }
                onRemove={() =>
                  handleRemoveThread(pt.id, `${thread.brand.name} ${thread.colorCode}`)
                }
              />
            );
          })}
        </SupplySection>
        {addingType === "thread" && (
          <SearchToAdd
            supplyType="thread"
            projectId={projectId}
            existingIds={linkedThreadIds}
            onAdded={handleAdded}
            onClose={() => setAddingType(null)}
          />
        )}
      </div>

      {/* Beads Section */}
      <div className="relative">
        <SupplySection
          title="Beads"
          icon={Gem}
          count={beads.length}
          fulfilledCount={fulfilledBeads}
          onAddClick={() => setAddingType("bead")}
          addLabel="Add beads"
          emptyText="No beads linked to this project"
        >
          {beads.map((pb) => {
            const bead = pb.bead;
            const isFulfilled = pb.quantityAcquired >= pb.quantityRequired;
            const quantityNeeded = Math.max(0, pb.quantityRequired - pb.quantityAcquired);
            return (
              <SupplyRow
                key={pb.id}
                hex={bead.hexColor}
                code={bead.productCode}
                name={bead.colorName}
                brand={bead.brand.name}
                quantityRequired={pb.quantityRequired}
                quantityAcquired={pb.quantityAcquired}
                isFulfilled={isFulfilled}
                quantityNeeded={quantityNeeded}
                onUpdateRequired={(v) => handleUpdateQuantity(pb.id, "bead", "quantityRequired", v)}
                onUpdateAcquired={(v) => handleUpdateQuantity(pb.id, "bead", "quantityAcquired", v)}
                onRemove={() => handleRemoveBead(pb.id, `${bead.brand.name} ${bead.productCode}`)}
              />
            );
          })}
        </SupplySection>
        {addingType === "bead" && (
          <SearchToAdd
            supplyType="bead"
            projectId={projectId}
            existingIds={linkedBeadIds}
            onAdded={handleAdded}
            onClose={() => setAddingType(null)}
          />
        )}
      </div>

      {/* Specialty Section */}
      <div className="relative">
        <SupplySection
          title="Specialty"
          icon={Sparkles}
          count={specialty.length}
          fulfilledCount={fulfilledSpecialty}
          onAddClick={() => setAddingType("specialty")}
          addLabel="Add specialty"
          emptyText="No specialty items linked to this project"
        >
          {specialty.map((ps) => {
            const item = ps.specialtyItem;
            const isFulfilled = ps.quantityAcquired >= ps.quantityRequired;
            const quantityNeeded = Math.max(0, ps.quantityRequired - ps.quantityAcquired);
            return (
              <SupplyRow
                key={ps.id}
                hex={item.hexColor}
                code={item.productCode}
                name={`${item.colorName} — ${item.description}`}
                brand={item.brand.name}
                quantityRequired={ps.quantityRequired}
                quantityAcquired={ps.quantityAcquired}
                isFulfilled={isFulfilled}
                quantityNeeded={quantityNeeded}
                onUpdateRequired={(v) =>
                  handleUpdateQuantity(ps.id, "specialty", "quantityRequired", v)
                }
                onUpdateAcquired={(v) =>
                  handleUpdateQuantity(ps.id, "specialty", "quantityAcquired", v)
                }
                onRemove={() =>
                  handleRemoveSpecialty(ps.id, `${item.brand.name} ${item.productCode}`)
                }
              />
            );
          })}
        </SupplySection>
        {addingType === "specialty" && (
          <SearchToAdd
            supplyType="specialty"
            projectId={projectId}
            existingIds={linkedSpecialtyIds}
            onAdded={handleAdded}
            onClose={() => setAddingType(null)}
          />
        )}
      </div>
    </div>
  );
}
