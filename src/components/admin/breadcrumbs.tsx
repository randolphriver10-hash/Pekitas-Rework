"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { adminNavItems } from "@/lib/admin-nav";

export function AdminBreadcrumbs() {
  const pathname = usePathname();
  const current = adminNavItems.find((item) =>
    item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href)
  );

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink render={<Link href="/admin" />}>Panel</BreadcrumbLink>
        </BreadcrumbItem>
        {current && current.href !== "/admin" && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{current.label}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
