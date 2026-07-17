"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { NavLinks } from "@/components/admin/nav-links";

export function AdminMobileNav({ isAdmin }: { isAdmin: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">Abrir menú</span>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 px-4 py-6">
        <SheetTitle className="mb-4 px-2 text-lg font-semibold tracking-tight">
          Pekitas <span className="text-primary">Admin</span>
        </SheetTitle>
        <NavLinks isAdmin={isAdmin} onNavigate={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}
