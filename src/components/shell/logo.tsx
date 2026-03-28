import { Scissors } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "lg";
}

export function Logo({ size = "sm" }: LogoProps) {
  return (
    <div
      className={cn(
        "bg-primary flex shrink-0 items-center justify-center",
        size === "sm" && "h-8 w-8 rounded-lg",
        size === "lg" && "h-16 w-16 rounded-2xl",
      )}
    >
      <Scissors
        className={cn(
          "text-primary-foreground",
          size === "sm" && "h-4 w-4",
          size === "lg" && "size-8",
        )}
        strokeWidth={1.5}
      />
    </div>
  );
}
