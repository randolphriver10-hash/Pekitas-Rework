"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import type { CategoryRow } from "@/lib/supabase/types";

export function SiteMobileNav({ categories }: { categories: CategoryRow[] }) {
  const [open, setOpen] = useState(false);
  const roots = categories.filter((c) => !c.parent_id);
  // Con una única categoría raíz ("Nenas") que agrupa todo, lo navegable son sus
  // hijas directamente — mostrar solo la raíz sería un ítem inútil de un solo hijo.
  const topLevel = roots.length === 1 ? categories.filter((c) => c.parent_id === roots[0].id) : roots;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-stone-700"
        aria-label="Abrir menú"
      >
        <Menu className="h-6 w-6" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="bg-(--site-cream) absolute inset-y-0 left-0 w-72 overflow-y-auto p-5">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Cerrar menú"
              className="mb-6 text-stone-700"
            >
              <X className="h-6 w-6" />
            </button>

            <nav className="flex flex-col gap-4">
              <Link
                href="/productos"
                onClick={() => setOpen(false)}
                className="text-base font-medium text-(--site-ink)"
              >
                Todos los productos
              </Link>
              {topLevel.map((parent) => (
                <div key={parent.id}>
                  <Link
                    href={`/productos?categoria=${parent.id}`}
                    onClick={() => setOpen(false)}
                    className="text-base font-medium text-(--site-ink)"
                  >
                    {parent.name}
                  </Link>
                  <div className="mt-2 ml-3 flex flex-col gap-2">
                    {categories
                      .filter((c) => c.parent_id === parent.id)
                      .map((child) => (
                        <Link
                          key={child.id}
                          href={`/productos?categoria=${child.id}`}
                          onClick={() => setOpen(false)}
                          className="text-sm text-stone-600"
                        >
                          {child.name}
                        </Link>
                      ))}
                  </div>
                </div>
              ))}
              <div className="mt-4 border-t border-stone-200 pt-4">
                <Link href="/#nosotros" onClick={() => setOpen(false)} className="block py-1.5 text-sm text-stone-600">
                  Nosotros
                </Link>
                <Link href="/#contacto" onClick={() => setOpen(false)} className="block py-1.5 text-sm text-stone-600">
                  Contacto
                </Link>
                <Link href="/#faqs" onClick={() => setOpen(false)} className="block py-1.5 text-sm text-stone-600">
                  Preguntas frecuentes
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
