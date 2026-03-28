"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { NavItem } from "./nav-items";

interface NavItemLinkProps {
  item: NavItem;
  collapsed?: boolean;
  onClick?: () => void;
}

export function NavItemLink({ item, collapsed = false, onClick }: NavItemLinkProps) {
  const pathname = usePathname();

  const isCurrentPage = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={isCurrentPage ? "page" : undefined}
      className={cn(
        "focus-visible:ring-ring flex w-full items-center gap-3 rounded-lg text-sm transition-colors outline-none focus-visible:ring-2",
        collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5",
        isCurrentPage && "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
        !isCurrentPage && "text-sidebar-foreground/70 hover:bg-muted hover:text-sidebar-foreground",
      )}
    >
      <item.icon className="h-5 w-5 shrink-0" strokeWidth={1.5} />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
}
