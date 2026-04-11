"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, Pencil, Trash2 } from "lucide-react";
import { ColorSwatch } from "./color-swatch";

/* ─── Types ─────────────────────────────────────────────────────────────────── */

interface TableItem {
  id: string;
  colorCode?: string;
  productCode?: string;
  colorName: string;
  hexColor: string;
  brand: { name: string };
  description?: string;
  colorFamily?: string;
}

interface ColumnConfig {
  key: string;
  label: string;
  sortable?: boolean;
  accessor: (item: TableItem) => string;
}

interface SupplyTableViewProps {
  items: TableItem[];
  columns: ColumnConfig[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

/* ─── Sortable Header ───────────────────────────────────────────────────────── */

function SortableHeader({
  label,
  sortKey,
  currentSort,
  onSort,
  sortable = true,
}: {
  label: string;
  sortKey: string;
  currentSort: { key: string; dir: "asc" | "desc" };
  onSort: (key: string) => void;
  sortable?: boolean;
}) {
  const isActive = currentSort.key === sortKey;

  if (!sortable) {
    return (
      <th className="px-4 py-2.5 text-left">
        <span className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
          {label}
        </span>
      </th>
    );
  }

  return (
    <th
      className="cursor-pointer select-none px-4 py-2.5 text-left"
      onClick={() => onSort(sortKey)}
      aria-sort={isActive ? (currentSort.dir === "asc" ? "ascending" : "descending") : "none"}
    >
      <span
        className={`inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider transition-colors ${
          isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        {label}
        {isActive &&
          (currentSort.dir === "asc" ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          ))}
      </span>
    </th>
  );
}

/* ─── Component ─────────────────────────────────────────────────────────────── */

export function SupplyTableView({ items, columns, onEdit, onDelete }: SupplyTableViewProps) {
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" }>({
    key: columns[0]?.key ?? "code",
    dir: "asc",
  });

  function handleSort(key: string) {
    setSort((prev) =>
      prev.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" },
    );
  }

  const sortedItems = [...items].sort((a, b) => {
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return 0;
    const aVal = col.accessor(a);
    const bVal = col.accessor(b);
    const dir = sort.dir === "asc" ? 1 : -1;

    // Attempt numeric sort for codes
    const aNum = parseFloat(aVal.replace(/[^0-9.]/g, ""));
    const bNum = parseFloat(bVal.replace(/[^0-9.]/g, ""));
    if (!isNaN(aNum) && !isNaN(bNum)) return dir * (aNum - bNum);

    return dir * aVal.localeCompare(bVal);
  });

  return (
    <div className="border-border bg-card overflow-x-auto rounded-xl border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-border border-b">
            <th className="w-12 px-4 py-2.5">
              <span className="sr-only">Color</span>
            </th>
            {columns.map((col) => (
              <SortableHeader
                key={col.key}
                label={col.label}
                sortKey={col.key}
                currentSort={sort}
                onSort={handleSort}
                sortable={col.sortable !== false}
              />
            ))}
            <th className="w-20 px-4 py-2.5">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-border/60 divide-y">
          {sortedItems.map((item) => (
            <tr key={item.id} className="group transition-colors hover:bg-muted/50">
              <td className="px-4 py-3">
                <ColorSwatch hexColor={item.hexColor} size="sm" />
              </td>
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3">
                  <span className="text-foreground text-sm">{col.accessor(item)}</span>
                </td>
              ))}
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                  <button
                    type="button"
                    onClick={() => onEdit(item.id)}
                    className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-md p-1.5 transition-colors"
                    title="Edit supply"
                    aria-label={`Edit ${item.colorCode ?? item.productCode ?? item.colorName}`}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(item.id)}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md p-1.5 transition-colors"
                    title="Delete supply"
                    aria-label={`Delete ${item.colorCode ?? item.productCode ?? item.colorName}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {sortedItems.length === 0 && (
            <tr>
              <td colSpan={columns.length + 2} className="py-12 text-center">
                <p className="text-muted-foreground text-sm">No items to display</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
