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
      <td colSpan={7} className="border-border bg-background border-b-2 px-3 pt-3 pb-2">
        <div className="text-muted-foreground flex items-center gap-2 text-[11px] font-semibold tracking-[0.05em] uppercase">
          <Icon className="h-3.5 w-3.5" />
          <span>{label}</span>
          <span className="bg-muted text-muted-foreground rounded-full px-[7px] py-[1px] text-[10px] font-semibold">
            {count}
          </span>
        </div>
      </td>
    </tr>
  );
}
