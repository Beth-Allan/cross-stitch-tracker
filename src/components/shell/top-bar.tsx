"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, Search, Clock, Plus, Scissors } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet"
import { UserMenu } from "./user-menu"
import { navigationItems } from "./nav-items"

interface TopBarProps {
  user: { name: string; email: string }
}

export function TopBar({ user }: TopBarProps) {
  const pathname = usePathname()
  const [sheetOpen, setSheetOpen] = useState(false)

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
                <div className="w-8 h-8 rounded-lg bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center shrink-0">
                  <Scissors className="w-4 h-4 text-white dark:text-emerald-950" strokeWidth={1.5} />
                </div>
                <span className="font-heading text-base font-semibold text-stone-900 dark:text-stone-100 truncate">
                  Cross Stitch Tracker
                </span>
              </Link>

              {/* Nav items */}
              <div className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
                {navigationItems
                  .filter((item) => item.label !== "Settings")
                  .map((item) => {
                    const isCurrentPage = item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href)

                    const content = (
                      <div
                        className={cn(
                          "w-full flex items-center gap-3 rounded-lg transition-colors text-sm px-3 py-2.5",
                          !item.active && "opacity-50 cursor-not-allowed text-stone-400 dark:text-stone-500",
                          item.active && isCurrentPage &&
                            "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-medium",
                          item.active && !isCurrentPage &&
                            "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                        )}
                      >
                        <item.icon className="w-5 h-5 shrink-0" strokeWidth={1.5} />
                        <span className="truncate">{item.label}</span>
                      </div>
                    )

                    return item.active ? (
                      <Link key={item.href} href={item.href} onClick={() => setSheetOpen(false)}>
                        {content}
                      </Link>
                    ) : (
                      <div key={item.href}>{content}</div>
                    )
                  })}
              </div>

              {/* Settings at bottom */}
              <div className="py-3 px-2 border-t border-stone-200 dark:border-stone-800">
                {navigationItems
                  .filter((item) => item.label === "Settings")
                  .map((item) => {
                    const content = (
                      <div
                        className={cn(
                          "w-full flex items-center gap-3 rounded-lg transition-colors text-sm px-3 py-2.5",
                          !item.active && "opacity-50 cursor-not-allowed text-stone-400 dark:text-stone-500",
                          item.active &&
                            "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
                        )}
                      >
                        <item.icon className="w-5 h-5 shrink-0" strokeWidth={1.5} />
                        <span className="truncate">{item.label}</span>
                      </div>
                    )

                    return item.active ? (
                      <Link key={item.href} href={item.href} onClick={() => setSheetOpen(false)}>
                        {content}
                      </Link>
                    ) : (
                      <div key={item.href}>{content}</div>
                    )
                  })}
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
