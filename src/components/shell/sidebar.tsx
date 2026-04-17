"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { navigationSections, settingsItem } from "./nav-items";
import { Logo } from "./logo";
import { NavItemLink } from "./nav-item-link";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

const STORAGE_KEY = "sidebar-collapsed";

export function Sidebar() {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(STORAGE_KEY) === "true";
  });

  function handleToggle() {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  }

  return (
    <aside
      className={cn(
        "bg-sidebar border-sidebar-border hidden shrink-0 flex-col border-r transition-[width] duration-200 ease-out motion-reduce:transition-none md:flex",
        mounted ? (collapsed ? "w-16" : "w-60") : "w-60",
      )}
    >
      <TooltipProvider>
        <nav aria-label="Main" className="flex h-full flex-col">
          {/* Logo */}
          <Link
            href="/"
            className="border-sidebar-border hover:bg-muted focus-visible:ring-ring flex h-14 items-center gap-3 border-b px-4 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-inset"
          >
            <Logo />
            {!collapsed && (
              <span className="font-heading text-sidebar-foreground truncate text-base font-semibold">
                Cross Stitch Tracker
              </span>
            )}
          </Link>

          {/* Grouped nav sections */}
          <div className="flex-1 overflow-y-auto px-2 py-3">
            {navigationSections.map((section, sectionIndex) => (
              <div key={section.label}>
                {/* Section divider (between sections, not before first) */}
                {sectionIndex > 0 && <div className="border-sidebar-border mx-2 my-2 border-t" />}

                {/* Section label (hidden when collapsed) */}
                {!collapsed && (
                  <p className="text-muted-foreground/70 mb-1 px-3 pt-1 text-[0.65rem] font-semibold tracking-wider uppercase">
                    {section.label}
                  </p>
                )}

                {/* Section items */}
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    if (collapsed) {
                      return (
                        <Tooltip key={item.href}>
                          <TooltipTrigger render={<div />}>
                            <NavItemLink item={item} collapsed />
                          </TooltipTrigger>
                          <TooltipContent side="right">{item.label}</TooltipContent>
                        </Tooltip>
                      );
                    }

                    return <NavItemLink key={item.href} item={item} />;
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom section: settings + collapse toggle */}
          <div className="border-sidebar-border space-y-0.5 border-t px-2 py-3">
            {collapsed ? (
              <Tooltip>
                <TooltipTrigger render={<div />}>
                  <NavItemLink item={settingsItem} collapsed />
                </TooltipTrigger>
                <TooltipContent side="right">{settingsItem.label}</TooltipContent>
              </Tooltip>
            ) : (
              <NavItemLink item={settingsItem} />
            )}

            {/* Collapse toggle */}
            <button
              onClick={handleToggle}
              className={cn(
                "text-muted-foreground hover:bg-muted hover:text-sidebar-foreground focus-visible:ring-ring flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors outline-none focus-visible:ring-2",
                collapsed && "justify-center",
              )}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <PanelLeftOpen className="h-4 w-4" strokeWidth={1.5} />
              ) : (
                <>
                  <PanelLeftClose className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                  <span className="truncate text-xs">Collapse</span>
                </>
              )}
            </button>
          </div>
        </nav>
      </TooltipProvider>
    </aside>
  );
}
