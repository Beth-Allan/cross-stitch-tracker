import Link from "next/link";

export interface RankedItem {
  id: string;
  name: string;
  count: number;
  href?: string;
}

interface RankedListProps {
  items: RankedItem[];
  label: string;
}

export function RankedList({ items, label }: RankedListProps) {
  return (
    <div className="mt-3 space-y-1">
      <h4 className="sr-only">{label}</h4>
      {items.map((item, index) => (
        <div key={item.id} className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground w-5 font-mono text-xs tabular-nums">
              {index + 1}.
            </span>
            {item.href ? (
              <Link
                href={item.href}
                className="text-foreground hover:text-primary decoration-border hover:decoration-primary text-sm underline underline-offset-2 transition-colors"
              >
                {item.name}
              </Link>
            ) : (
              <span className="text-foreground text-sm">{item.name}</span>
            )}
          </div>
          <span className="text-muted-foreground font-mono text-xs tabular-nums">
            {item.count}
          </span>
        </div>
      ))}
    </div>
  );
}
