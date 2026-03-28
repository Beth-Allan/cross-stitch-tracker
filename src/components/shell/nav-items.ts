import {
  LayoutDashboard,
  Scissors,
  Package,
  Clock,
  BarChart3,
  ShoppingCart,
  Settings,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
}

export const navigationItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Charts", href: "/charts", icon: Scissors },
  { label: "Supplies", href: "/supplies", icon: Package },
  { label: "Sessions", href: "/sessions", icon: Clock },
  { label: "Statistics", href: "/stats", icon: BarChart3 },
  { label: "Shopping", href: "/shopping", icon: ShoppingCart },
  { label: "Settings", href: "/settings", icon: Settings },
]
