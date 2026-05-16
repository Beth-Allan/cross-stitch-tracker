"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  onLogStitches?: () => void;
}

interface QuickAddItem {
  label: string;
  icon: typeof Plus;
  iconColor: string;
  href?: string;
  action?: "logStitches";
}

interface QuickAddGroup {
  label: string;
  items: QuickAddItem[];
}

const QUICK_ADD_GROUPS: QuickAddGroup[] = [
  {
    label: "Quick Actions",
    items: [
      {
        label: "Log Stitches",
        icon: Scissors,
        iconColor: "text-progress-foreground",
        action: "logStitches",
      },
    ],
  },
  {
    label: "Create",
    items: [
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
    ],
  },
  {
    label: "Reference",
    items: [
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
    ],
  },
];

const ALL_ITEMS = QUICK_ADD_GROUPS.flatMap((group) => group.items);

export function QuickAddMenu({ onLogStitches }: QuickAddMenuProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const closeMenu = useCallback(() => {
    setOpen(false);
    setFocusedIndex(-1);
    triggerRef.current?.focus();
  }, []);

  useEffect(() => {
    if (open && focusedIndex >= 0) {
      itemRefs.current[focusedIndex]?.focus();
    }
  }, [open, focusedIndex]);

  function handleItemClick(item: QuickAddItem) {
    if (item.action === "logStitches") {
      if (onLogStitches) {
        onLogStitches();
      } else {
        window.dispatchEvent(new CustomEvent("open-log-session-modal"));
      }
    } else if (item.href) {
      router.push(item.href);
    }
    closeMenu();
  }

  function handleTriggerKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
      setFocusedIndex(0);
    }
  }

  function handleMenuKeyDown(e: React.KeyboardEvent) {
    switch (e.key) {
      case "Escape":
        e.preventDefault();
        closeMenu();
        break;
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((i) => (i + 1) % ALL_ITEMS.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((i) => (i <= 0 ? ALL_ITEMS.length - 1 : i - 1));
        break;
      case "Tab":
        setOpen(false);
        setFocusedIndex(-1);
        break;
    }
  }

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        onClick={() => {
          if (open) {
            closeMenu();
          } else {
            setOpen(true);
            setFocusedIndex(0);
          }
        }}
        onKeyDown={handleTriggerKeyDown}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        className={`focus-visible:ring-ring inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
          open
            ? "border-primary bg-primary text-primary-foreground"
            : "border-selected-border bg-selected text-selected-foreground hover:bg-selected/80"
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
          <div className="fixed inset-0 z-40" onClick={closeMenu} />

          <div
            role="menu"
            aria-label="Quick Add"
            onKeyDown={handleMenuKeyDown}
            className="border-border bg-card absolute top-full right-0 z-50 mt-2 min-w-[200px] overflow-hidden rounded-xl border shadow-xl"
          >
            <div className="py-1.5">
              {QUICK_ADD_GROUPS.map((group, groupIndex) => {
                const groupStartIndex = QUICK_ADD_GROUPS.slice(0, groupIndex).reduce(
                  (sum, g) => sum + g.items.length,
                  0,
                );

                return (
                  <div
                    key={group.label}
                    className={groupIndex > 0 ? "border-border mt-1.5 border-t pt-1.5" : ""}
                  >
                    <span className="text-muted-foreground px-3 pb-1 text-[11px] font-semibold tracking-wider uppercase">
                      {group.label}
                    </span>
                    <div className="mt-1 px-1">
                      {group.items.map((item, itemIndex) => {
                        const flatIndex = groupStartIndex + itemIndex;
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.label}
                            ref={(el) => {
                              itemRefs.current[flatIndex] = el;
                            }}
                            type="button"
                            role="menuitem"
                            tabIndex={focusedIndex === flatIndex ? 0 : -1}
                            onClick={() => handleItemClick(item)}
                            className="hover:bg-muted focus-visible:bg-muted focus-visible:ring-ring flex w-full items-center gap-3 rounded-lg px-3 py-1.5 text-sm transition-colors outline-none focus-visible:ring-2"
                          >
                            <Icon className={`h-4 w-4 ${item.iconColor}`} strokeWidth={1.5} />
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
