import {
  LayoutDashboard,
  Scissors,
  Paintbrush,
  Tags,
  Package,
  Ruler,
  Clock,
  BarChart3,
  ShoppingCart,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const navigationItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Charts", href: "/charts", icon: Scissors },
  { label: "Designers", href: "/designers", icon: Paintbrush },
  { label: "Genres", href: "/genres", icon: Tags },
  { label: "Supplies", href: "/supplies", icon: Package },
  { label: "Fabric", href: "/fabric", icon: Ruler },
  { label: "Sessions", href: "/sessions", icon: Clock },
  { label: "Statistics", href: "/stats", icon: BarChart3 },
  { label: "Shopping", href: "/shopping", icon: ShoppingCart },
  { label: "Settings", href: "/settings", icon: Settings },
];
