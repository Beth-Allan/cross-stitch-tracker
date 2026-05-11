"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface PatternTypeCardsProps {
  isPaperChart: boolean;
  isFormalKit: boolean;
  isSAL: boolean;
  kitColorCount: number | null;
  onFormatChange: (isPaper: boolean) => void;
  onFormalKitChange: (checked: boolean) => void;
  onSALChange: (checked: boolean) => void;
  onKitColorCountChange: (value: string) => void;
  errors?: { kitColorCount?: string };
}

interface CardConfig {
  key: string;
  title: string;
  description: string;
  role: "radio" | "checkbox";
  isSelected: boolean;
  onClick: () => void;
  accessibleName: string;
}

export function PatternTypeCards({
  isPaperChart,
  isFormalKit,
  isSAL,
  kitColorCount,
  onFormatChange,
  onFormalKitChange,
  onSALChange,
  onKitColorCountChange,
  errors,
}: PatternTypeCardsProps) {
  const radioCards: CardConfig[] = [
    {
      key: "paper",
      title: "Paper Chart",
      description: "Physical printed pattern",
      role: "radio",
      isSelected: isPaperChart,
      onClick: () => onFormatChange(true),
      accessibleName: "Paper Chart",
    },
    {
      key: "digital",
      title: "Digital",
      description: "PDF or app pattern",
      role: "radio",
      isSelected: !isPaperChart,
      onClick: () => onFormatChange(false),
      accessibleName: "Digital",
    },
  ];

  const checkboxCards: CardConfig[] = [
    {
      key: "kit",
      title: "Kit",
      description: "Comes with supplies",
      role: "checkbox",
      isSelected: isFormalKit,
      onClick: () => {
        onFormalKitChange(!isFormalKit);
        if (isFormalKit) onKitColorCountChange("");
      },
      accessibleName: "Kit",
    },
    {
      key: "sal",
      title: "SAL",
      description: "Stitch-Along event",
      role: "checkbox",
      isSelected: isSAL,
      onClick: () => onSALChange(!isSAL),
      accessibleName: "SAL",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      <div role="radiogroup" aria-label="Chart format" className="col-span-2 grid grid-cols-2 gap-3">
        {radioCards.map((card) => (
          <SelectionCard key={card.key} card={card} />
        ))}
      </div>
      {checkboxCards.map((card) => (
        <div key={card.key}>
          <SelectionCard card={card} />
          {card.key === "kit" && (
            <div
              className={cn(
                "overflow-hidden transition-all",
                isFormalKit
                  ? "max-h-20 opacity-100 mt-3 duration-250 ease-in"
                  : "max-h-0 opacity-0 duration-200 ease-out",
              )}
            >
              <label
                htmlFor="kit-color-count"
                className="text-xs text-muted-foreground mb-1 block"
              >
                Colours in kit
              </label>
              <Input
                id="kit-color-count"
                type="number"
                min={1}
                value={kitColorCount ?? ""}
                onChange={(e) => onKitColorCountChange(e.target.value)}
                placeholder="Number of colours"
                className="max-w-[200px]"
              />
              {errors?.kitColorCount && (
                <p className="text-destructive text-xs mt-1">{errors.kitColorCount}</p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function SelectionCard({ card }: { card: CardConfig }) {
  return (
    <button
      type="button"
      role={card.role}
      aria-checked={card.isSelected}
      aria-label={card.accessibleName}
      onClick={card.onClick}
      className={cn(
        "border rounded-md py-3 px-4 bg-card cursor-pointer transition-all duration-150 text-left w-full",
        "hover:border-primary/30",
        card.isSelected
          ? "border-primary bg-primary/[0.03] ring-1 ring-primary"
          : "border-border",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-medium">{card.title}</div>
          <div className="text-xs text-muted-foreground">{card.description}</div>
        </div>
        <div
          className={cn(
            "size-[18px] rounded-full border-2 flex items-center justify-center shrink-0",
            card.isSelected
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border",
          )}
        >
          {card.isSelected && <Check className="size-3" />}
        </div>
      </div>
    </button>
  );
}
