"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Clock, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { Sheet, SheetTrigger, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { UserMenu } from "./user-menu";
import { navigationItems } from "./nav-items";
import { Logo } from "./logo";
import { NavItemLink } from "./nav-item-link";

interface TopBarProps {
  user: { name: string; email: string };
}

export function TopBar({ user }: TopBarProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const mainItems = navigationItems.filter((item) => item.label !== "Settings");
  const settingsItems = navigationItems.filter((item) => item.label === "Settings");

  return (
    <header className="border-border bg-card flex h-14 shrink-0 items-center gap-3 border-b px-4 pt-[env(safe-area-inset-top)]">
      {/* Mobile hamburger with Sheet drawer */}
      <div className="md:hidden">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger
            render={<Button variant="ghost" size="icon" className="min-h-11 min-w-11 md:hidden" />}
          >
            <Menu className="h-5 w-5" strokeWidth={1.5} />
            <span className="sr-only">Open navigation</span>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0" showCloseButton={false}>
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <nav aria-label="Main" className="flex h-full flex-col">
              {/* Logo in drawer */}
              <Link
                href="/"
                onClick={() => setSheetOpen(false)}
                className="border-sidebar-border focus-visible:ring-ring flex items-center gap-3 border-b px-4 py-5 outline-none focus-visible:ring-2 focus-visible:ring-inset"
              >
                <Logo />
                <span className="font-heading text-sidebar-foreground truncate text-base font-semibold">
                  Cross Stitch Tracker
                </span>
              </Link>

              {/* Nav items */}
              <div className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
                {mainItems.map((item) => (
                  <NavItemLink key={item.href} item={item} onClick={() => setSheetOpen(false)} />
                ))}
              </div>

              {/* Settings at bottom */}
              <div className="border-sidebar-border border-t px-2 py-3">
                {settingsItems.map((item) => (
                  <NavItemLink key={item.href} item={item} onClick={() => setSheetOpen(false)} />
                ))}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Quick actions */}
      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() =>
            toast("Coming soon", {
              description: "You'll be able to log your stitching sessions here.",
            })
          }
          className="flex min-h-11 items-center gap-1.5 sm:min-h-0"
        >
          <Clock className="h-3.5 w-3.5" strokeWidth={2} />
          <span className="hidden sm:inline">Log Stitches</span>
        </Button>
        <LinkButton
          href="/charts/new"
          variant="outline"
          size="sm"
          className="flex min-h-11 items-center gap-1.5 sm:min-h-0"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2} />
          <span className="hidden sm:inline">Add Chart</span>
        </LinkButton>

        {/* User menu */}
        <div className="ml-1">
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  );
}
