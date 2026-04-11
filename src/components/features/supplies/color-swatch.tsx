import { cn } from "@/lib/utils";

/* ─── Luminance Check ───────────────────────────────────────────────────────── */

export function needsBorder(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.85;
}

/* ─── Size Config ───────────────────────────────────────────────────────────── */

const sizeConfig = {
  sm: { classes: "h-5 w-5 rounded-full", label: "20px" },
  md: { classes: "h-7 w-7 rounded-full", label: "28px" },
  lg: { classes: "h-12 w-12 rounded-lg", label: "48px" },
} as const;

/* ─── Component ─────────────────────────────────────────────────────────────── */

interface ColorSwatchProps {
  hexColor: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ColorSwatch({ hexColor, size = "md", className }: ColorSwatchProps) {
  const config = sizeConfig[size];
  const border = needsBorder(hexColor);

  return (
    <div
      className={cn(
        config.classes,
        "shadow-sm shrink-0",
        border && "ring-1 ring-stone-200 dark:ring-stone-600",
        className,
      )}
      style={{ backgroundColor: hexColor }}
      aria-hidden="true"
    />
  );
}
