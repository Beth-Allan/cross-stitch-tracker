import { Search, Plus, Menu } from 'lucide-react'
import { UserMenu } from './UserMenu'

interface TopBarProps {
  user: { name: string; avatarUrl?: string }
  onLogStitches?: () => void
  onAddChart?: () => void
  onLogout?: () => void
  onSettings?: () => void
  onOpenMobileMenu?: () => void
  showMenuButton?: boolean
}

export function TopBar({
  user,
  onLogStitches,
  onAddChart,
  onLogout,
  onSettings,
  onOpenMobileMenu,
  showMenuButton = false,
}: TopBarProps) {
  return (
    <header className="h-14 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 flex items-center gap-3 px-4 shrink-0">
      {/* Mobile hamburger */}
      {showMenuButton && (
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden flex items-center justify-center w-8 h-8 rounded-lg text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
        >
          <Menu className="w-5 h-5" strokeWidth={1.5} />
        </button>
      )}

      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 dark:text-stone-500" strokeWidth={1.5} />
          <input
            type="text"
            placeholder="Search charts, projects, supplies..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 dark:focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      {/* Quick actions */}
      <div className="flex items-center gap-2 ml-auto">
        <button
          onClick={onLogStitches}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-amber-500 hover:bg-amber-600 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-amber-950 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2} />
          <span className="hidden sm:inline">Log Stitches</span>
        </button>
        <button
          onClick={onAddChart}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" strokeWidth={2} />
          <span className="hidden sm:inline">Add Chart</span>
        </button>

        {/* User menu */}
        <div className="ml-1">
          <UserMenu user={user} onLogout={onLogout} onSettings={onSettings} />
        </div>
      </div>
    </header>
  )
}
