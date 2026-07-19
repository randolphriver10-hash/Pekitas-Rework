import Image from "next/image";
import Link from "next/link";
import { ImageOff } from "lucide-react";
import type { CategoryRow } from "@/lib/supabase/types";

export function CategoryShowcase({ categories }: { categories: CategoryRow[] }) {
  const topLevel = categories.filter((c) => !c.parent_id);
  // El catálogo tiene una única categoría raíz ("Nenas") que agrupa el resto —
  // los tiles interesantes para navegar son sus hijas, no la raíz en sí.
  const tiles =
    topLevel.length === 1
      ? categories.filter((c) => c.parent_id === topLevel[0].id)
      : topLevel;

  if (tiles.length === 0) return null;

  return (
    <section className="grid grid-cols-2">
      {tiles.map((c) => (
        <Link
          key={c.id}
          href={`/productos?categoria=${c.id}`}
          className="group relative aspect-square overflow-hidden bg-(--site-beige)"
        >
          {c.image_url ? (
            <Image
              src={c.image_url}
              alt={c.name}
              fill
              sizes="50vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <ImageOff className="text-muted-foreground absolute inset-0 m-auto h-8 w-8" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />
          <span className="absolute inset-x-0 bottom-6 text-center text-lg font-bold tracking-wide text-white uppercase sm:text-xl">
            {c.name}
          </span>
        </Link>
      ))}
    </section>
  );
}
