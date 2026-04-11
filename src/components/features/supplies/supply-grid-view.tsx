"use client";

import { Pencil } from "lucide-react";
import { ColorSwatch } from "./color-swatch";

/* ─── Types ─────────────────────────────────────────────────────────────────── */

interface GridItem {
  id: string;
  colorCode?: string;
  productCode?: string;
  colorName: string;
  hexColor: string;
  brand: { name: string };
}

interface SupplyGridViewProps {
  items: GridItem[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

/* ─── Component ─────────────────────────────────────────────────────────────── */

export function SupplyGridView({ items, onEdit }: SupplyGridViewProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => {
        const code = item.colorCode ?? item.productCode ?? "";
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onEdit(item.id)}
            aria-label={`Edit ${code ? `${code} — ` : ""}${item.colorName}`}
            className="group bg-card border-border hover:border-primary/30 relative flex flex-col items-center gap-2 rounded-xl border p-4 shadow-sm transition-[shadow,border-color] hover:shadow-md"
          >
            <div className="bg-primary/10 text-primary absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full opacity-40 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
              <Pencil className="h-3 w-3" />
            </div>
            <ColorSwatch hexColor={item.hexColor} size="lg" />
            <span className="text-foreground text-sm font-medium">{code}</span>
            <span className="text-muted-foreground line-clamp-1 text-xs">{item.colorName}</span>
            <span className="text-muted-foreground/70 text-xs">{item.brand.name}</span>
          </button>
        );
      })}
    </div>
  );
}
