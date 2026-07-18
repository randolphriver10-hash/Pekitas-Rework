"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { CategoryRow } from "@/lib/supabase/types";

export function CategoryMegaMenu({ categories }: { categories: CategoryRow[] }) {
  const [open, setOpen] = useState(false);
  const topLevel = categories.filter((c) => !c.parent_id);

  if (topLevel.length === 0) return null;

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <Link
        href="/productos"
        className="flex items-center gap-1 text-sm font-medium text-stone-600 transition-colors hover:text-stone-900"
      >
        Productos
        <ChevronDown className="h-3.5 w-3.5" />
      </Link>

      {open && (
        <div className="absolute top-full left-1/2 z-40 w-max min-w-[560px] -translate-x-1/2 pt-3">
          <div className="bg-(--site-cream) flex gap-8 rounded-2xl border border-stone-200/70 p-6 shadow-lg">
            {topLevel.map((parent) => {
              const children = categories.filter((c) => c.parent_id === parent.id);
              return (
                <div key={parent.id} className="min-w-40">
                  <Link
                    href={`/productos?categoria=${parent.id}`}
                    className="text-sm font-semibold text-(--site-ink) hover:underline"
                  >
                    {parent.name}
                  </Link>
                  {children.length > 0 && (
                    <ul className="mt-2 space-y-1.5">
                      {children.map((child) => (
                        <li key={child.id}>
                          <Link
                            href={`/productos?categoria=${child.id}`}
                            className="text-sm text-stone-600 hover:text-(--site-ink)"
                          >
                            {child.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
