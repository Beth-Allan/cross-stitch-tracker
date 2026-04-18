"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  ChevronDown,
  Scissors,
  BookOpen,
  Palette,
  Gem,
  Star,
  Package,
  PenTool,
  Hash,
} from "lucide-react";

interface QuickAddMenuProps {
  onLogStitches: () => void;
}

interface QuickAddItem {
  label: string;
  icon: typeof Plus;
  iconColor: string;
  href?: string;
  action?: "logStitches";
  separator?: boolean;
}

const QUICK_ADD_ITEMS: QuickAddItem[] = [
  {
    label: "Log Stitches",
    icon: Scissors,
    iconColor: "text-emerald-600 dark:text-emerald-400",
    action: "logStitches",
    separator: true,
  },
  {
    label: "New Chart",
    icon: BookOpen,
    iconColor: "text-muted-foreground",
    href: "/charts/new",
  },
  {
    label: "New Thread",
    icon: Palette,
    iconColor: "text-muted-foreground",
    href: "/supplies?tab=threads&add=true",
  },
  {
    label: "New Bead",
    icon: Gem,
    iconColor: "text-muted-foreground",
    href: "/supplies?tab=beads&add=true",
  },
  {
    label: "New Specialty",
    icon: Star,
    iconColor: "text-muted-foreground",
    href: "/supplies?tab=specialty&add=true",
  },
  {
    label: "New Fabric",
    icon: Package,
    iconColor: "text-muted-foreground",
    href: "/supplies?tab=fabric&add=true",
  },
  {
    label: "New Designer",
    icon: PenTool,
    iconColor: "text-muted-foreground",
    href: "/designers",
  },
  {
    label: "New Genre",
    icon: Hash,
    iconColor: "text-muted-foreground",
    href: "/genres",
  },
];

/**
 * Quick Add dropdown menu with 8 action items.
 * "Log Stitches" dispatches a custom event to open the LogSessionModal.
 * Other items navigate to their respective add forms.
 */
export function QuickAddMenu({ onLogStitches }: QuickAddMenuProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  function handleItemClick(item: QuickAddItem) {
    if (item.action === "logStitches") {
      onLogStitches();
    } else if (item.href) {
      router.push(item.href);
    }
    setOpen(false);
  }

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        type="button"
        className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all duration-200 ${
          open
            ? "border-emerald-600 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-500"
            : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800/50 dark:bg-emerald-950/30 dark:text-emerald-300 dark:hover:bg-emerald-950/50"
        }`}
      >
        <Plus
          className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-45" : ""}`}
          strokeWidth={2.5}
        />
        Quick Add
        <ChevronDown
          className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          strokeWidth={2}
        />
      </button>

      {open && (
        <>
          {/* Backdrop to capture outside clicks */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />

          {/* Dropdown panel */}
          <div className="absolute right-0 top-full z-50 mt-2 min-w-[200px] overflow-hidden rounded-xl border border-border bg-card shadow-xl">
            <div className="p-1">
              {QUICK_ADD_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => handleItemClick(item)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted ${
                      item.separator ? "border-b border-border" : ""
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${item.iconColor}`} strokeWidth={1.5} />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
