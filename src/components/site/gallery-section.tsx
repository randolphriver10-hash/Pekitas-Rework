import Image from "next/image";
import type { GalleryItemRow } from "@/lib/supabase/types";

export function GallerySection({ items }: { items: GalleryItemRow[] }) {
  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
      <p className="text-xs font-medium tracking-[0.2em] text-(--site-blush-deep) uppercase">
        Lookbook
      </p>
      <h2 className="font-[family-name:var(--font-fraunces)] mt-2 text-3xl font-medium text-(--site-ink)">
        Galería
      </h2>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {items.map((item) => (
          <div key={item.id} className="relative aspect-square overflow-hidden rounded-2xl bg-(--site-beige)">
            <Image
              src={item.image_url}
              alt={item.alt_text}
              fill
              sizes="(min-width: 768px) 22vw, 45vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
