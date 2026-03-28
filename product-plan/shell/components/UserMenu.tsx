import { LogOut, Settings } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

interface UserMenuProps {
  user: {
    name: string
    avatarUrl?: string
  }
  onLogout?: () => void
  onSettings?: () => void
}

export function UserMenu({ user, onLogout, onSettings }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-stone-100 dark:hover:bg-stone-800"
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-7 h-7 rounded-full object-cover"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
            <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
              {initials}
            </span>
          </div>
        )}
        <span className="text-sm text-stone-700 dark:text-stone-300 hidden sm:block">
          {user.name}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg shadow-lg py-1 z-50">
          <div className="px-3 py-2 border-b border-stone-100 dark:border-stone-800">
            <p className="text-sm font-medium text-stone-900 dark:text-stone-100">{user.name}</p>
          </div>
          {onSettings && (
            <button
              onClick={() => {
                setOpen(false)
                onSettings()
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-200 transition-colors"
            >
              <Settings className="w-4 h-4" strokeWidth={1.5} />
              Settings
            </button>
          )}
          {onLogout && (
            <button
              onClick={() => {
                setOpen(false)
                onLogout()
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-200 transition-colors"
            >
              <LogOut className="w-4 h-4" strokeWidth={1.5} />
              Log out
            </button>
          )}
        </div>
      )}
    </div>
  )
}
