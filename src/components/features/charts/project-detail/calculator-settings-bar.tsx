"use client";

import { useState, useTransition, useCallback } from "react";
import { toast } from "sonner";
import { EditableNumber } from "@/components/features/charts/editable-number";
import { updateProjectSettings } from "@/lib/actions/chart-actions";
import type { CalculatorSettings } from "./types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CalculatorSettingsBarProps {
  chartId: string;
  settings: CalculatorSettings;
  fabricName: string | null;
  fabricSource: "linked" | "default";
  hasStitchCounts: boolean;
  onSettingsChange: (newSettings: CalculatorSettings) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CalculatorSettingsBar({
  chartId,
  settings,
  fabricName,
  fabricSource,
  hasStitchCounts,
  onSettingsChange,
}: CalculatorSettingsBarProps) {
  const [isPending, startTransition] = useTransition();
  const [localSettings, setLocalSettings] = useState(settings);
  const [everShown, setEverShown] = useState(hasStitchCounts);

  // "Show once shown" pattern (Pitfall 6): once visible, stays visible in session
  if (hasStitchCounts && !everShown) {
    setEverShown(true);
  }

  const currentSettings = isPending ? localSettings : settings;

  // ─── Handlers ─────────────────────────────────────────────────────────────
  // All hooks must be declared before any conditional returns (React rules of hooks)

  const handleSettingChange = useCallback(
    (field: keyof CalculatorSettings, value: number) => {
      const newSettings = { ...currentSettings, [field]: value };
      setLocalSettings(newSettings);
      onSettingsChange(newSettings);

      startTransition(async () => {
        try {
          const result = await updateProjectSettings(chartId, { [field]: value });
          if (!result.success) {
            setLocalSettings(settings);
            onSettingsChange(settings);
            toast.error("Couldn't save settings. Please try again.");
          }
        } catch {
          setLocalSettings(settings);
          onSettingsChange(settings);
          toast.error("Couldn't save settings. Please try again.");
        }
      });
    },
    [chartId, currentSettings, settings, onSettingsChange],
  );

  const handleStrandChange = useCallback(
    (value: number) => handleSettingChange("strandCount", value),
    [handleSettingChange],
  );

  const handleOverChange = useCallback(
    (value: 1 | 2) => handleSettingChange("overCount", value),
    [handleSettingChange],
  );

  const handleWasteChange = useCallback(
    (value: number) => handleSettingChange("wastePercent", value),
    [handleSettingChange],
  );

  // ─── Conditional render ────────────────────────────────────────────────────

  if (!everShown) return null;

  // ─── Fabric Display ──────────────────────────────────────────────────────

  const fabricDisplay =
    fabricSource === "linked" && fabricName
      ? `${currentSettings.fabricCount}ct (${fabricName})`
      : `${currentSettings.fabricCount}ct (default)`;

  return (
    <div
      className="bg-muted flex flex-wrap gap-x-6 gap-y-3 rounded-lg px-4 py-3"
      data-testid="settings-bar"
    >
      {/* Strands */}
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
          STRANDS
        </span>
        <EditableNumber
          value={currentSettings.strandCount}
          onSave={handleStrandChange}
          ariaLabel="Strand count"
          min={1}
          max={6}
          className="text-foreground text-sm font-medium"
        />
      </div>

      {/* Over */}
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
          OVER
        </span>
        <div className="flex gap-1">
          <button
            onClick={() => handleOverChange(1)}
            className={`min-h-8 min-w-8 rounded px-2 py-1 text-sm font-medium transition-colors ${
              currentSettings.overCount === 1
                ? "bg-primary text-primary-foreground"
                : "bg-card text-foreground hover:bg-muted"
            }`}
          >
            1
          </button>
          <button
            onClick={() => handleOverChange(2)}
            className={`min-h-8 min-w-8 rounded px-2 py-1 text-sm font-medium transition-colors ${
              currentSettings.overCount === 2
                ? "bg-primary text-primary-foreground"
                : "bg-card text-foreground hover:bg-muted"
            }`}
          >
            2
          </button>
        </div>
      </div>

      {/* Fabric */}
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
          FABRIC
        </span>
        <span className="text-foreground text-sm">{fabricDisplay}</span>
        {fabricSource === "default" && (
          <span className="text-muted-foreground text-xs">link a fabric for accuracy</span>
        )}
      </div>

      {/* Waste */}
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground text-sm font-semibold tracking-wider uppercase">
          WASTE
        </span>
        <EditableNumber
          value={currentSettings.wastePercent}
          onSave={handleWasteChange}
          ariaLabel="Waste factor percentage"
          min={0}
          max={50}
          className="text-foreground text-sm font-medium"
          formatDisplay={(v) => `${v}%`}
        />
      </div>
    </div>
  );
}
