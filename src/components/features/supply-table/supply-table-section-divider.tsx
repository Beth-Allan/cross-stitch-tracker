import type { ComponentType } from "react";

interface SupplyTableSectionDividerProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  count: number;
}

export function SupplyTableSectionDivider({
  icon: Icon,
  label,
  count,
}: SupplyTableSectionDividerProps) {
  if (count === 0) return null;

  return (
    <tr>
      <td colSpan={7} className="border-b-2 border-border bg-background px-3 pb-2 pt-3">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
          <Icon className="h-3.5 w-3.5" />
          <span>{label}</span>
          <span className="rounded-full bg-muted px-[7px] py-[1px] text-[10px] font-semibold text-muted-foreground">
            {count}
          </span>
        </div>
      </td>
    </tr>
  );
}
