import { useState, useCallback } from 'react'
import { MainNav } from './MainNav'
import { TopBar } from './TopBar'
import { X } from 'lucide-react'
import type { NavItem } from './MainNav'

interface AppShellProps {
  children: React.ReactNode
  navigationItems: NavItem[]
  user: { name: string; avatarUrl?: string }
  onNavigate?: (href: string) => void
  onLogout?: () => void
  onLogStitches?: () => void
  onAddChart?: () => void
  onSettings?: () => void
}

export default function AppShell({
  children,
  navigationItems,
  user,
  onNavigate = () => {},
  onLogout,
  onLogStitches,
  onAddChart,
  onSettings,
}: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleNavigate = useCallback(
    (href: string) => {
      onNavigate(href)
      setMobileOpen(false)
    },
    [onNavigate]
  )

  return (
    <div className="h-screen flex bg-stone-50 dark:bg-stone-950 overflow-hidden">
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col shrink-0 bg-white dark:bg-stone-950 border-r border-stone-200 dark:border-stone-800 transition-[width] duration-200 ease-out ${
          collapsed ? 'w-16' : 'w-60'
        }`}
      >
        <MainNav
          items={navigationItems}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          onNavigate={handleNavigate}
        />
      </aside>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 dark:bg-black/50 z-40 transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`md:hidden fixed inset-y-0 left-0 w-64 bg-white dark:bg-stone-950 border-r border-stone-200 dark:border-stone-800 z-50 transition-transform duration-200 ease-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="absolute top-3 right-3">
          <button
            onClick={() => setMobileOpen(false)}
            className="w-7 h-7 flex items-center justify-center rounded-md text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
        <MainNav
          items={navigationItems}
          collapsed={false}
          onToggleCollapse={() => {}}
          onNavigate={handleNavigate}
        />
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar
          user={user}
          onLogStitches={onLogStitches}
          onAddChart={onAddChart}
          onLogout={onLogout}
          onSettings={onSettings}
          onOpenMobileMenu={() => setMobileOpen(true)}
          showMenuButton
        />

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
