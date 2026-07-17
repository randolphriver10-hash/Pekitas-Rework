import Image from "next/image";
import Link from "next/link";
import { ImageOff } from "lucide-react";
import type { CategoryRow } from "@/lib/supabase/types";

export function CategoryShowcase({ categories }: { categories: CategoryRow[] }) {
  const topLevel = categories.filter((c) => !c.parent_id);
  if (topLevel.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-20">
      <p className="text-xs font-medium tracking-[0.2em] text-(--site-blush-deep) uppercase">
        Explorá
      </p>
      <h2 className="font-[family-name:var(--font-fraunces)] mt-2 text-3xl font-medium text-(--site-ink)">
        Categorías
      </h2>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {topLevel.map((c) => (
          <Link
            key={c.id}
            href={`/productos?categoria=${c.id}`}
            className="group relative aspect-square overflow-hidden rounded-2xl bg-(--site-beige)"
          >
            {c.image_url ? (
              <Image
                src={c.image_url}
                alt={c.name}
                fill
                sizes="(min-width: 768px) 22vw, 45vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <ImageOff className="text-muted-foreground absolute inset-0 m-auto h-8 w-8" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <span className="absolute bottom-3 left-3 text-sm font-medium text-white">{c.name}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}
