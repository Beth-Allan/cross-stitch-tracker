"use client"

import { useState, useSyncExternalStore } from "react"
import Link from "next/link"
import { PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { navigationItems } from "./nav-items"
import { Logo } from "./logo"
import { NavItemLink } from "./nav-item-link"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip"

const STORAGE_KEY = "sidebar-collapsed"

export function Sidebar() {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false
    return localStorage.getItem(STORAGE_KEY) === "true"
  })

  function handleToggle() {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem(STORAGE_KEY, String(next))
  }

  const mainItems = navigationItems.filter((item) => item.label !== "Settings")
  const bottomItems = navigationItems.filter((item) => item.label === "Settings")

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col shrink-0 bg-sidebar border-r border-sidebar-border transition-[width] duration-200 ease-out motion-reduce:transition-none",
        mounted ? (collapsed ? "w-16" : "w-60") : "w-60"
      )}
    >
      <TooltipProvider>
        <nav aria-label="Main" className="flex flex-col h-full">
          {/* Logo */}
          <Link
            href="/"
            className="px-4 py-5 flex items-center gap-3 border-b border-sidebar-border hover:bg-muted transition-colors outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
          >
            <Logo />
            {!collapsed && (
              <span className="font-heading text-base font-semibold text-sidebar-foreground truncate">
                Cross Stitch Tracker
              </span>
            )}
          </Link>

          {/* Main nav items */}
          <div className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
            {mainItems.map((item) => {
              if (collapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger render={<div />}>
                      <NavItemLink item={item} collapsed />
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                )
              }

              return <NavItemLink key={item.href} item={item} />
            })}
          </div>

          {/* Bottom section: settings + collapse toggle */}
          <div className="py-3 px-2 border-t border-sidebar-border space-y-0.5">
            {bottomItems.map((item) => {
              if (collapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger render={<div />}>
                      <NavItemLink item={item} collapsed />
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                )
              }

              return <NavItemLink key={item.href} item={item} />
            })}

            {/* Collapse toggle */}
            <button
              onClick={handleToggle}
              className={cn(
                "w-full flex items-center gap-3 rounded-lg transition-colors text-sm text-muted-foreground hover:bg-muted hover:text-sidebar-foreground px-3 py-2.5 outline-none focus-visible:ring-2 focus-visible:ring-ring",
                collapsed && "justify-center"
              )}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? (
                <PanelLeftOpen className="w-4 h-4" strokeWidth={1.5} />
              ) : (
                <>
                  <PanelLeftClose className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                  <span className="truncate text-xs">Collapse</span>
                </>
              )}
            </button>
          </div>
        </nav>
      </TooltipProvider>
    </aside>
  )
}
