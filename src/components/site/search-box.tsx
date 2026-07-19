"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

export function SiteSearchBox() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/productos?q=${encodeURIComponent(query.trim())}`);
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Buscar"
        className="text-stone-600 hover:text-stone-900"
      >
        <Search className="h-5 w-5" />
      </button>
    );
  }

  // A ancho completo, superpuesto sobre el header — un input inline en la
  // columna derecha del header de 3 columnas no entra en pantallas chicas.
  return (
    <form
      onSubmit={submit}
      className="fixed inset-x-0 top-0 z-50 flex h-16 items-center gap-3 bg-(--site-cream) px-4 sm:px-6"
    >
      <Search className="h-5 w-5 shrink-0 text-stone-400" />
      <input
        autoFocus
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar productos..."
        className="h-10 flex-1 border-b border-stone-300 bg-transparent px-1 text-sm outline-none focus:border-(--site-ink)"
      />
      <button
        type="button"
        onClick={() => setOpen(false)}
        aria-label="Cerrar búsqueda"
        className="shrink-0 text-stone-500"
      >
        <X className="h-5 w-5" />
      </button>
    </form>
  );
}
