import {
  LayoutDashboard,
  Scissors,
  Paintbrush,
  Tags,
  Package,
  Ruler,
  MapPin,
  Tablet,
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

export interface NavSection {
  label: string;
  items: NavItem[];
}

export const navigationSections: NavSection[] = [
  {
    label: "Projects",
    items: [
      { label: "Dashboard", href: "/", icon: LayoutDashboard },
      { label: "Projects", href: "/charts", icon: Scissors },
      { label: "Shopping", href: "/shopping", icon: ShoppingCart },
    ],
  },
  {
    label: "Track",
    items: [
      { label: "Sessions", href: "/sessions", icon: Clock },
      { label: "Statistics", href: "/stats", icon: BarChart3 },
    ],
  },
  {
    label: "Reference",
    items: [
      { label: "Designers", href: "/designers", icon: Paintbrush },
      { label: "Genres", href: "/genres", icon: Tags },
      { label: "Supplies", href: "/supplies", icon: Package },
      { label: "Fabric", href: "/fabric", icon: Ruler },
      { label: "Storage", href: "/storage", icon: MapPin },
      { label: "Apps", href: "/apps", icon: Tablet },
    ],
  },
];

export const settingsItem: NavItem = {
  label: "Settings",
  href: "/settings",
  icon: Settings,
};

/** Flat list for backward compatibility (e.g. mobile nav) */
export const navigationItems: NavItem[] = [
  ...navigationSections.flatMap((s) => s.items),
  settingsItem,
];
