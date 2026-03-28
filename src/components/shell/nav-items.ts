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
  active: boolean
  phase: number
}

export const navigationItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard, active: false, phase: 8 },
  { label: "Charts", href: "/charts", icon: Scissors, active: false, phase: 2 },
  { label: "Supplies", href: "/supplies", icon: Package, active: false, phase: 5 },
  { label: "Sessions", href: "/sessions", icon: Clock, active: false, phase: 6 },
  { label: "Statistics", href: "/stats", icon: BarChart3, active: false, phase: 6 },
  { label: "Shopping", href: "/shopping", icon: ShoppingCart, active: false, phase: 5 },
  { label: "Settings", href: "/settings", icon: Settings, active: false, phase: 1 },
]
