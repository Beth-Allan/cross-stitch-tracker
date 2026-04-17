"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { Sheet, SheetTrigger, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { LogSessionModal } from "@/components/features/sessions/log-session-modal";
import { UserMenu } from "./user-menu";
import { navigationSections, settingsItem } from "./nav-items";
import { Logo } from "./logo";
import { NavItemLink } from "./nav-item-link";
import type { ActiveProjectForPicker } from "@/types/session";

interface TopBarProps {
  user: { name: string; email: string };
  activeProjects: ActiveProjectForPicker[];
  imageUrls: Record<string, string>;
}

export function TopBar({ user, activeProjects, imageUrls }: TopBarProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [logModalOpen, setLogModalOpen] = useState(false);

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

              {/* Grouped nav sections */}
              <div className="flex-1 overflow-y-auto px-2 py-3">
                {navigationSections.map((section, sectionIndex) => (
                  <div key={section.label}>
                    {sectionIndex > 0 && (
                      <div className="border-sidebar-border mx-2 my-2 border-t" />
                    )}
                    <p className="text-muted-foreground/70 mb-1 px-3 pt-1 text-[0.65rem] font-semibold tracking-wider uppercase">
                      {section.label}
                    </p>
                    <div className="space-y-0.5">
                      {section.items.map((item) => (
                        <NavItemLink
                          key={item.href}
                          item={item}
                          onClick={() => setSheetOpen(false)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Settings at bottom */}
              <div className="border-sidebar-border border-t px-2 py-3">
                <NavItemLink item={settingsItem} onClick={() => setSheetOpen(false)} />
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
          size="sm"
          onClick={() => setLogModalOpen(true)}
          className="flex min-h-11 items-center gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700 sm:min-h-0"
          aria-label="Log Stitches"
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

      <LogSessionModal
        isOpen={logModalOpen}
        onOpenChange={setLogModalOpen}
        activeProjects={activeProjects}
        imageUrls={imageUrls}
      />
    </header>
  );
}
