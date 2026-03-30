import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  showBorder?: boolean;
}

export function SectionHeading({ title, showBorder = true }: SectionHeadingProps) {
  return (
    <h2
      className={cn(
        "text-muted-foreground pt-5 pb-3 text-xs font-semibold tracking-widest uppercase",
        showBorder && "border-border/60 border-t",
      )}
    >
      {title}
    </h2>
  );
}
