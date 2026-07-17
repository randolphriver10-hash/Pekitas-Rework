import Link from "next/link";
import { NavLinks } from "@/components/admin/nav-links";

export function AdminSidebar({ isAdmin }: { isAdmin: boolean }) {
  return (
    <aside className="bg-sidebar hidden w-64 shrink-0 flex-col border-r px-4 py-6 md:flex">
      <Link href="/admin" className="mb-6 px-2 text-lg font-semibold tracking-tight">
        Pekitas <span className="text-primary">Admin</span>
      </Link>
      <div className="flex-1 overflow-y-auto">
        <NavLinks isAdmin={isAdmin} />
      </div>
    </aside>
  );
}
