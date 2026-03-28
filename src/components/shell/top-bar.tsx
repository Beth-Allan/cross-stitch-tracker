"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, Search, Clock, Plus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet"
import { UserMenu } from "./user-menu"
import { navigationItems } from "./nav-items"
import { Logo } from "./logo"
import { NavItemLink } from "./nav-item-link"

interface TopBarProps {
  user: { name: string; email: string }
}

export function TopBar({ user }: TopBarProps) {
  const [sheetOpen, setSheetOpen] = useState(false)

  const mainItems = navigationItems.filter((item) => item.label !== "Settings")
  const settingsItems = navigationItems.filter((item) => item.label === "Settings")

  return (
    <header className="h-14 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 flex items-center gap-3 px-4 shrink-0 pt-[env(safe-area-inset-top)]">
      {/* Mobile hamburger with Sheet drawer */}
      <div className="md:hidden">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="md:hidden" />
            }
          >
            <Menu className="w-5 h-5" strokeWidth={1.5} />
            <span className="sr-only">Open navigation</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0" showCloseButton={false}>
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <nav className="flex flex-col h-full">
              {/* Logo in drawer */}
              <Link
                href="/"
                onClick={() => setSheetOpen(false)}
                className="px-4 py-5 flex items-center gap-3 border-b border-stone-200 dark:border-stone-800"
              >
                <Logo />
                <span className="font-heading text-base font-semibold text-stone-900 dark:text-stone-100 truncate">
                  Cross Stitch Tracker
                </span>
              </Link>

              {/* Nav items */}
              <div className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
                {mainItems.map((item) => (
                  <NavItemLink
                    key={item.href}
                    item={item}
                    onClick={() => setSheetOpen(false)}
                  />
                ))}
              </div>

              {/* Settings at bottom */}
              <div className="py-3 px-2 border-t border-stone-200 dark:border-stone-800">
                {settingsItems.map((item) => (
                  <NavItemLink
                    key={item.href}
                    item={item}
                    onClick={() => setSheetOpen(false)}
                  />
                ))}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      {/* Search placeholder */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500"
            strokeWidth={1.5}
          />
          <input
            type="text"
            placeholder="Search charts, projects, supplies..."
            readOnly
            onFocus={() => toast("Coming soon", { description: "Search will be available in a future phase." })}
            className="w-full pl-9 pr-3 py-2 text-sm bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 dark:focus:border-emerald-500 transition-colors cursor-default"
          />
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex items-center gap-2 ml-auto">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toast("Coming in Phase 6", { description: "Stitch session logging is being built." })}
          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-amber-950"
        >
          <Clock className="w-3.5 h-3.5" strokeWidth={2} />
          <span className="hidden sm:inline">Log Stitches</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => toast("Coming in Phase 2", { description: "Chart management is being built." })}
          className="flex items-center gap-1.5 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2} />
          <span className="hidden sm:inline">Add Chart</span>
        </Button>

        {/* User menu */}
        <div className="ml-1">
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  )
}
