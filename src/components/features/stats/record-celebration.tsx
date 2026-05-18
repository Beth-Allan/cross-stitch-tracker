"use client";

import { Trophy, X } from "lucide-react";
import { toast } from "sonner";
import type { BrokenRecord } from "@/types/stats";

interface CelebrationToastProps {
  records: BrokenRecord[];
  onDismiss: () => void;
}

export function CelebrationToast({ records, onDismiss }: CelebrationToastProps) {
  return (
    <div className="bg-warning-muted border-warning-border flex items-start gap-3 rounded-xl border p-4 shadow-lg">
      <Trophy className="text-warning mt-0.5 h-5 w-5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="font-heading text-foreground text-sm font-semibold">
          {records.length === 1 ? "New Record!" : `${records.length} New Records!`}
        </p>
        <div className="mt-1 space-y-1">
          {records.map((record) => (
            <p key={record.type} className="text-foreground text-sm">
              {record.label}:{" "}
              <span className="font-mono font-semibold">{record.newValue.toLocaleString()}</span>{" "}
              {record.unit}
              <span className="text-muted-foreground ml-1 text-xs">
                (was {record.oldValue.toLocaleString()})
              </span>
            </p>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        className="text-muted-foreground hover:text-foreground shrink-0"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function fireCelebration(brokenRecords: BrokenRecord[]): void {
  toast.custom(
    (toastId) => (
      <CelebrationToast records={brokenRecords} onDismiss={() => toast.dismiss(toastId)} />
    ),
    { duration: 6000 },
  );

  import("canvas-confetti")
    .then((mod) => {
      const confetti = mod.default ?? mod;
      confetti({
        particleCount: 150,
        spread: 80,
        startVelocity: 45,
        origin: { x: 0.5, y: 0.2 },
        colors: ["#34d399", "#fbbf24", "#f59e0b", "#6ee7b7"],
        ticks: 120,
      });
    })
    .catch(() => {});
}
