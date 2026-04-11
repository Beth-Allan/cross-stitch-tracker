"use client";

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
            className="bg-card border-border hover:border-primary/30 flex flex-col items-center gap-2 rounded-xl border p-4 shadow-sm transition-colors"
          >
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
