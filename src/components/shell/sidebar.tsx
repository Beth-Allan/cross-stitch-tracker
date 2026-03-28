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
        "hidden md:flex flex-col shrink-0 bg-white dark:bg-stone-950 border-r border-stone-200 dark:border-stone-800 transition-[width] duration-200 ease-out",
        mounted ? (collapsed ? "w-16" : "w-60") : "w-60"
      )}
    >
      <TooltipProvider>
        <nav className="flex flex-col h-full">
          {/* Logo */}
          <Link
            href="/"
            className="px-4 py-5 flex items-center gap-3 border-b border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors"
          >
            <Logo />
            {!collapsed && (
              <span className="font-heading text-base font-semibold text-stone-900 dark:text-stone-100 truncate">
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
          <div className="py-3 px-2 border-t border-stone-200 dark:border-stone-800 space-y-0.5">
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
              className="w-full flex items-center gap-3 rounded-lg transition-colors text-sm text-stone-400 dark:text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-600 dark:hover:text-stone-300 px-3 py-2.5 justify-center"
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
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
