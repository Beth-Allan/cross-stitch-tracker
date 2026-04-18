"use client";

import { useState, useMemo } from "react";
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
        <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
          {label}
        </span>
      </th>
    );
  }

  return (
    <th
      className="cursor-pointer px-4 py-2.5 text-left select-none"
      tabIndex={0}
      role="columnheader"
      onClick={() => onSort(sortKey)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSort(sortKey);
        }
      }}
      aria-sort={isActive ? (currentSort.dir === "asc" ? "ascending" : "descending") : "none"}
    >
      <span
        className={`inline-flex items-center gap-1 text-xs font-semibold tracking-wider uppercase transition-colors ${
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

  const sortedItems = useMemo(() => {
    const col = columns.find((c) => c.key === sort.key);
    if (!col) return items;
    return [...items].sort((a, b) => {
      const aVal = col.accessor(a);
      const bVal = col.accessor(b);
      const dir = sort.dir === "asc" ? 1 : -1;

      // Attempt numeric sort for codes
      const aNum = parseFloat(aVal.replace(/[^0-9.]/g, ""));
      const bNum = parseFloat(bVal.replace(/[^0-9.]/g, ""));
      if (!isNaN(aNum) && !isNaN(bNum)) return dir * (aNum - bNum);

      return dir * aVal.localeCompare(bVal);
    });
  }, [items, sort, columns]);

  const getItemLabel = (item: TableItem) => item.colorCode ?? item.productCode ?? item.colorName;

  return (
    <>
      {/* Desktop table — hidden on mobile */}
      <div className="border-border bg-card hidden overflow-x-auto rounded-xl border md:block">
        <table className="w-full text-sm">
          <caption className="sr-only">Supply catalog items</caption>
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
              <tr key={item.id} className="group hover:bg-muted/50 transition-colors">
                <td className="px-4 py-3">
                  <ColorSwatch hexColor={item.hexColor} size="sm" />
                </td>
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <span className="text-foreground text-sm">{col.accessor(item)}</span>
                  </td>
                ))}
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1 transition-opacity group-focus-within:opacity-100 md:opacity-40 md:group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => onEdit(item.id)}
                      className="text-muted-foreground hover:text-foreground hover:bg-muted flex min-h-11 min-w-11 items-center justify-center rounded-md p-1.5 transition-colors"
                      aria-label={`Edit ${getItemLabel(item)}`}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(item.id)}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex min-h-11 min-w-11 items-center justify-center rounded-md p-1.5 transition-colors"
                      aria-label={`Delete ${getItemLabel(item)}`}
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

      {/* Mobile cards — hidden on md+ */}
      <div className="flex flex-col gap-2 md:hidden">
        {sortedItems.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground text-sm">No items to display</p>
          </div>
        ) : (
          sortedItems.map((item) => (
            <div
              key={item.id}
              className="bg-card border-border flex items-center gap-3 rounded-xl border px-4 py-3"
            >
              <ColorSwatch hexColor={item.hexColor} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-foreground text-sm font-medium">{getItemLabel(item)}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {item.colorName !== getItemLabel(item) && item.colorName}
                  </span>
                </div>
                <p className="text-muted-foreground mt-0.5 truncate text-xs">
                  {item.brand.name}
                  {columns.some((c) => c.key === "family") && item.colorFamily
                    ? ` · ${item.colorFamily}`
                    : columns.some((c) => c.key === "description") && item.description
                      ? ` · ${item.description}`
                      : ""}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => onEdit(item.id)}
                  className="hover:bg-muted text-muted-foreground flex min-h-11 min-w-11 items-center justify-center rounded-md transition-colors"
                  aria-label={`Edit ${getItemLabel(item)}`}
                >
                  <Pencil className="size-4" strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(item.id)}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex min-h-11 min-w-11 items-center justify-center rounded-md transition-colors"
                  aria-label={`Delete ${getItemLabel(item)}`}
                >
                  <Trash2 className="size-4" strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
