import type { SizeCategory } from "@/lib/utils/size-category";

const numberFormatter = new Intl.NumberFormat("en-US");

export const SIZE_TOOLTIP_TEXT: Record<SizeCategory, string> = {
  Mini: "Mini: Under 1,000 stitches",
  Small: "Small: 1,000 – 4,999 stitches",
  Medium: "Medium: 5,000 – 24,999 stitches",
  Large: "Large: 25,000 – 49,999 stitches",
  BAP: "BAP: 50,000+ stitches",
};

export function formatNumber(n: number): string {
  return numberFormatter.format(n);
}

export function formatDate(date: Date | string): string {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
