"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition, useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CategoryRow } from "@/lib/supabase/types";

export function ProductsToolbar({ categories }: { categories: CategoryRow[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    const handle = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query) params.set("q", query);
      else params.delete("q");
      params.delete("page");
      startTransition(() => router.push(`${pathname}?${params.toString()}`));
    }, 350);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const setParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== "all") params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-3">
      <div className="relative min-w-56 flex-1">
        <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-4 w-4 -translate-y-1/2" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre o SKU..."
          className="pl-8"
        />
      </div>

      <Select
        items={{
          all: "Todos los estados",
          draft: "Borrador",
          published: "Publicado",
          hidden: "Oculto",
          agotado: "Agotado",
          archived: "Archivado",
        }}
        defaultValue={searchParams.get("status") ?? "all"}
        onValueChange={(v) => setParam("status", v)}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los estados</SelectItem>
          <SelectItem value="draft">Borrador</SelectItem>
          <SelectItem value="published">Publicado</SelectItem>
          <SelectItem value="hidden">Oculto</SelectItem>
          <SelectItem value="agotado">Agotado</SelectItem>
          <SelectItem value="archived">Archivado</SelectItem>
        </SelectContent>
      </Select>

      <Select
        items={{
          all: "Todas las categorías",
          ...Object.fromEntries(categories.map((c) => [c.id, c.name])),
        }}
        defaultValue={searchParams.get("category") ?? "all"}
        onValueChange={(v) => setParam("category", v)}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Categoría" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las categorías</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
