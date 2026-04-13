"use client";

import { LogOut } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { logoutAction } from "./logout-action";

interface UserMenuProps {
  user: { name: string; email: string };
}

export function UserMenu({ user }: UserMenuProps) {
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  async function handleLogout() {
    const result = await logoutAction();
    if (!result.success) {
      toast.error(result.error);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="User menu"
        className="hover:bg-accent focus-visible:ring-ring flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg px-2 py-1.5 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      >
        <Avatar size="sm">
          <AvatarFallback className="bg-primary/10 text-primary dark:bg-primary/20 text-xs font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="w-56">
        <div className="px-1.5 py-1.5">
          <p className="text-foreground text-sm font-medium">{user.name}</p>
          <p className="text-muted-foreground text-xs">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="h-4 w-4" strokeWidth={1.5} />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
