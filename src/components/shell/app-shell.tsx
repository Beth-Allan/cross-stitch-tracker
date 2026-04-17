import type { ActiveProjectForPicker } from "@/types/session";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";

interface AppShellProps {
  children: React.ReactNode;
  user: { name: string; email: string };
  activeProjects: ActiveProjectForPicker[];
  imageUrls: Record<string, string>;
}

export function AppShell({ children, user, activeProjects, imageUrls }: AppShellProps) {
  return (
    <div className="bg-background flex h-screen overflow-hidden">
      <a
        href="#main-content"
        className="focus:bg-primary focus:text-primary-foreground sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-lg focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:shadow-lg"
      >
        Skip to content
      </a>
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar user={user} activeProjects={activeProjects} imageUrls={imageUrls} />
        <main
          id="main-content"
          className="flex-1 overflow-y-auto p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
        >
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
