import Link from "next/link";
import { ProductCard } from "@/components/site/product-card";
import type { PublicProductCard } from "@/lib/catalog-data";

export function FeaturedProducts({ products }: { products: PublicProductCard[] }) {
  if (products.length === 0) return null;

  return (
    <section id="productos" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 md:py-24">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-xs font-medium tracking-[0.2em] text-(--site-blush-deep) uppercase">
            Catálogo
          </p>
          <h2 className="font-[family-name:var(--font-fraunces)] mt-2 text-3xl font-medium text-(--site-ink)">
            Productos destacados
          </h2>
        </div>
        <Link href="/productos" className="text-sm font-medium text-stone-600 hover:text-stone-900">
          Ver todo →
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
