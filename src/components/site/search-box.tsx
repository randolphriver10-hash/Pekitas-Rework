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

  return (
    <form onSubmit={submit} className="flex items-center gap-1.5">
      <input
        autoFocus
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar productos..."
        className="h-9 w-36 rounded-full border border-stone-300 bg-white/70 px-3 text-sm outline-none focus:border-(--site-ink) sm:w-48"
      />
      <button
        type="button"
        onClick={() => setOpen(false)}
        aria-label="Cerrar búsqueda"
        className="text-stone-500"
      >
        <X className="h-4 w-4" />
      </button>
    </form>
  );
}
