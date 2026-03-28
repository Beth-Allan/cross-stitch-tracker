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
      className={cn(
        "w-full flex items-center gap-3 rounded-lg transition-colors text-sm",
        collapsed ? "justify-center px-2 py-2.5" : "px-3 py-2.5",
        isCurrentPage &&
          "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-medium",
        !isCurrentPage &&
          "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-200"
      )}
    >
      <item.icon className="w-5 h-5 shrink-0" strokeWidth={1.5} />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  )
}
