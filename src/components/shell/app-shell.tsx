import { Sidebar } from "./sidebar"
import { TopBar } from "./top-bar"

interface AppShellProps {
  children: React.ReactNode
  user: { name: string; email: string }
}

export function AppShell({ children, user }: AppShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-stone-50 dark:bg-stone-950">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar user={user} />
        <main className="flex-1 overflow-y-auto p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          {children}
        </main>
      </div>
    </div>
  )
}
