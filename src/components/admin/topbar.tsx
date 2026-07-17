import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminMobileNav } from "@/components/admin/mobile-nav";
import { AdminBreadcrumbs } from "@/components/admin/breadcrumbs";
import { UserMenu } from "@/components/admin/user-menu";
import type { CurrentStaff } from "@/lib/auth/current-staff";

export function AdminTopbar({ staff }: { staff: CurrentStaff }) {
  return (
    <header className="bg-background/80 sticky top-0 z-10 flex items-center gap-3 border-b px-4 py-3 backdrop-blur">
      <AdminMobileNav isAdmin={staff.role === "admin"} />
      <div className="hidden md:block">
        <AdminBreadcrumbs />
      </div>

      <div className="ml-auto flex items-center gap-3">
        <Badge variant="outline" className="hidden gap-1.5 sm:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Sistema en línea
        </Badge>

        <Button
          variant="outline"
          size="sm"
          nativeButton={false}
          render={<Link href="/" target="_blank" rel="noopener noreferrer" />}
        >
          Ver landing
          <ExternalLink className="h-3.5 w-3.5" />
        </Button>

        <UserMenu staff={staff} />
      </div>
    </header>
  );
}
