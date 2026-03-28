import {
  LayoutDashboard,
  Scissors,
  Package,
  Clock,
  BarChart3,
  ShoppingCart,
  Settings,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'

export interface NavItem {
  label: string
  href: string
  icon: string
  isActive?: boolean
}

interface MainNavProps {
  items: NavItem[]
  collapsed: boolean
  onToggleCollapse: () => void
  onNavigate: (href: string) => void
}

const iconMap: Record<string, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  dashboard: LayoutDashboard,
  charts: Scissors,
  supplies: Package,
  sessions: Clock,
  stats: BarChart3,
  shopping: ShoppingCart,
  settings: Settings,
}

export function MainNav({ items, collapsed, onToggleCollapse, onNavigate }: MainNavProps) {
  const mainItems = items.filter((item) => item.icon !== 'settings')
  const bottomItems = items.filter((item) => item.icon === 'settings')

  return (
    <nav className="flex flex-col h-full">
      {/* Logo area */}
      <div className="px-4 py-5 flex items-center gap-3 border-b border-stone-200 dark:border-stone-800">
        <div className="w-8 h-8 rounded-lg bg-emerald-600 dark:bg-emerald-500 flex items-center justify-center shrink-0">
          <span className="text-white dark:text-emerald-950 text-sm font-bold">X</span>
        </div>
        {!collapsed && (
          <span
            className="text-base font-semibold text-stone-900 dark:text-stone-100 truncate"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Cross Stitch Tracker
          </span>
        )}
      </div>

      {/* Main nav items */}
      <div className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {mainItems.map((item) => {
          const Icon = iconMap[item.icon] || LayoutDashboard
          return (
            <button
              key={item.href}
              onClick={() => onNavigate(item.href)}
              className={`w-full flex items-center gap-3 rounded-lg transition-colors text-sm ${
                collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'
              } ${
                item.isActive
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-medium'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" strokeWidth={1.5} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          )
        })}
      </div>

      {/* Bottom section: settings + collapse toggle */}
      <div className="py-3 px-2 border-t border-stone-200 dark:border-stone-800 space-y-0.5">
        {bottomItems.map((item) => {
          const Icon = iconMap[item.icon] || Settings
          return (
            <button
              key={item.href}
              onClick={() => onNavigate(item.href)}
              className={`w-full flex items-center gap-3 rounded-lg transition-colors text-sm ${
                collapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5'
              } ${
                item.isActive
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-medium'
                  : 'text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" strokeWidth={1.5} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          )
        })}

        {/* Collapse toggle — desktop only */}
        <button
          onClick={onToggleCollapse}
          className="w-full hidden md:flex items-center gap-3 rounded-lg transition-colors text-sm text-stone-400 dark:text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-600 dark:hover:text-stone-300 px-3 py-2.5 justify-center"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronsRight className="w-4 h-4" strokeWidth={1.5} />
          ) : (
            <>
              <ChevronsLeft className="w-4 h-4 shrink-0" strokeWidth={1.5} />
              <span className="truncate text-xs">Collapse</span>
            </>
          )}
        </button>
      </div>
    </nav>
  )
}
