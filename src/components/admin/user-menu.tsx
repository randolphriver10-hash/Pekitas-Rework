"use client";

import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { logoutAction } from "@/lib/actions/session";
import type { CurrentStaff } from "@/lib/auth/current-staff";

const roleLabel: Record<CurrentStaff["role"], string> = {
  admin: "Administrador",
  editor: "Editor",
};

export function UserMenu({ staff }: { staff: CurrentStaff }) {
  const initials = (staff.fullName ?? staff.email).slice(0, 2).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus-visible:ring-ring rounded-full outline-none focus-visible:ring-2">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col">
          <span className="truncate text-sm font-medium">
            {staff.fullName || staff.email}
          </span>
          <span className="text-muted-foreground text-xs font-normal">
            {roleLabel[staff.role]}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <form action={logoutAction}>
          <DropdownMenuItem variant="destructive" render={<button type="submit" className="w-full" />}>
            <LogOut />
            Cerrar sesión
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
