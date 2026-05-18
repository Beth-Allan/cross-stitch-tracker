"use client";

import { Trophy, X } from "lucide-react";
import { toast } from "sonner";
import type { BrokenRecord } from "@/types/stats";

interface CelebrationToastProps {
  record: BrokenRecord;
  onDismiss: () => void;
}

export function CelebrationToast({ record, onDismiss }: CelebrationToastProps) {
  return (
    <div className="bg-warning-muted border-warning-border flex items-start gap-3 rounded-xl border p-4 shadow-lg">
      <Trophy className="text-warning mt-0.5 h-5 w-5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="font-heading text-foreground text-sm font-semibold">New Record!</p>
        <p className="text-foreground text-sm">
          {record.label}:{" "}
          <span className="font-mono font-semibold">{record.newValue.toLocaleString()}</span>{" "}
          {record.unit}
        </p>
        <p className="text-muted-foreground text-xs">
          Previous: {record.oldValue.toLocaleString()}
        </p>
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
  brokenRecords.forEach((record, index) => {
    setTimeout(async () => {
      const confetti = (await import("canvas-confetti")).default;
      confetti({
        particleCount: 120,
        spread: 80,
        startVelocity: 45,
        origin: { x: 0.5, y: 0.3 },
        colors: ["#34d399", "#fbbf24", "#f59e0b", "#6ee7b7"],
        ticks: 100,
      });

      toast.custom(
        (toastId) => (
          <CelebrationToast record={record} onDismiss={() => toast.dismiss(toastId)} />
        ),
        { duration: 5000 },
      );
    }, index * 500);
  });
}
