import { Scissors } from "lucide-react"
import { cn } from "@/lib/utils"

interface LogoProps {
  size?: "sm" | "lg"
}

export function Logo({ size = "sm" }: LogoProps) {
  return (
    <div
      className={cn(
        "bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center shrink-0",
        size === "sm" && "w-8 h-8 rounded-lg",
        size === "lg" && "h-16 w-16 rounded-2xl"
      )}
    >
      <Scissors
        className={cn(
          "text-white dark:text-emerald-950",
          size === "sm" && "w-4 h-4",
          size === "lg" && "size-8"
        )}
        strokeWidth={1.5}
      />
    </div>
  )
}
