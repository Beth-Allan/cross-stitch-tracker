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
    <header className="h-14 border-b border-border bg-card flex items-center gap-3 px-4 shrink-0 pt-[env(safe-area-inset-top)]">
      {/* Mobile hamburger with Sheet drawer */}
      <div className="md:hidden">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger
            render={
              <Button variant="ghost" size="icon" className="md:hidden min-h-11 min-w-11" />
            }
          >
            <Menu className="w-5 h-5" strokeWidth={1.5} />
            <span className="sr-only">Open navigation</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0" showCloseButton={false}>
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <nav aria-label="Main" className="flex flex-col h-full">
              {/* Logo in drawer */}
              <Link
                href="/"
                onClick={() => setSheetOpen(false)}
                className="px-4 py-5 flex items-center gap-3 border-b border-sidebar-border outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
              >
                <Logo />
                <span className="font-heading text-base font-semibold text-sidebar-foreground truncate">
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
              <div className="py-3 px-2 border-t border-sidebar-border">
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

      {/* Search placeholder (non-interactive until search is built) */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50"
            strokeWidth={1.5}
          />
          <div
            className="w-full pl-9 pr-3 py-2 text-sm bg-muted/50 border border-input/50 rounded-lg text-muted-foreground/60 select-none"
            aria-hidden="true"
          >
            Search coming soon...
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex items-center gap-2 ml-auto">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => toast("Coming soon", { description: "You'll be able to log your stitching sessions here." })}
          className="flex items-center gap-1.5 min-h-11 sm:min-h-0"
        >
          <Clock className="w-3.5 h-3.5" strokeWidth={2} />
          <span className="hidden sm:inline">Log Stitches</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => toast("Coming soon", { description: "You'll be able to add and manage charts here." })}
          className="flex items-center gap-1.5 min-h-11 sm:min-h-0"
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
