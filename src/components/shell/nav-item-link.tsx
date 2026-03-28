"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import type { NavItem } from "./nav-items"

interface NavItemLinkProps {
  item: NavItem
  collapsed?: boolean
  onClick?: () => void
}

export function NavItemLink({ item, collapsed = false, onClick }: NavItemLinkProps) {
  const pathname = usePathname()

  const isCurrentPage = item.href === "/"
    ? pathname === "/"
    : pathname.startsWith(item.href)

  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={isCurrentPage ? "page" : undefined}
      className={cn(
        "w-full flex items-center gap-3 rounded-lg transition-colors text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring",
        collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5",
        isCurrentPage &&
          "bg-sidebar-accent text-sidebar-accent-foreground font-medium",
        !isCurrentPage &&
          "text-sidebar-foreground/70 hover:bg-muted hover:text-sidebar-foreground"
      )}
    >
      <item.icon className="w-5 h-5 shrink-0" strokeWidth={1.5} />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  )
}
