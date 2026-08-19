"use client";

import { Pencil, Trash2 } from "lucide-react";
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

export function SupplyGridView({ items, onEdit, onDelete }: SupplyGridViewProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => {
        const code = item.colorCode ?? item.productCode ?? "";
        const label = `${code ? `${code} — ` : ""}${item.colorName}`;
        return (
          <div key={item.id} className="group relative">
            <button
              type="button"
              onClick={() => onEdit(item.id)}
              aria-label={`Edit ${label}`}
              className="bg-card border-border hover:border-primary/30 flex w-full flex-col items-center gap-2 rounded-xl border p-4 shadow-sm transition-[shadow,border-color] hover:shadow-md"
            >
              <ColorSwatch hexColor={item.hexColor} size="lg" />
              <span className="text-foreground text-sm font-medium">{code}</span>
              <span className="text-muted-foreground line-clamp-1 text-xs">{item.colorName}</span>
              <span className="text-muted-foreground/70 text-xs">{item.brand.name}</span>
            </button>
            <span
              aria-hidden="true"
              className="bg-primary/10 text-primary pointer-events-none absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-full opacity-40 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
            >
              <Pencil className="h-3 w-3" />
            </span>
            <button
              type="button"
              onClick={() => onDelete(item.id)}
              aria-label={`Delete ${label}`}
              className="absolute top-0 right-0 flex min-h-11 min-w-11 items-center justify-center opacity-40 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
            >
              <span className="bg-destructive/10 text-destructive hover:bg-destructive/20 flex h-6 w-6 items-center justify-center rounded-full transition-colors">
                <Trash2 className="h-3 w-3" />
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
