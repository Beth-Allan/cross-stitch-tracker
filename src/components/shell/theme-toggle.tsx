"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle({ collapsed }: { collapsed?: boolean }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  function toggle() {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }

  if (!mounted) return null;

  return (
    <button
      onClick={toggle}
      className={cn(
        "text-muted-foreground hover:bg-muted hover:text-sidebar-foreground focus-visible:ring-ring flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors outline-none focus-visible:ring-2",
        collapsed && "justify-center",
      )}
      aria-label={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      {resolvedTheme === "dark" ? (
        <>
          <Sun className="h-4 w-4 shrink-0" strokeWidth={1.5} />
          {!collapsed && <span className="truncate text-xs">Light mode</span>}
        </>
      ) : (
        <>
          <Moon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
          {!collapsed && <span className="truncate text-xs">Dark mode</span>}
        </>
      )}
    </button>
  );
}
