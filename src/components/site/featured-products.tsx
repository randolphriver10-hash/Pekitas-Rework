import Link from "next/link";
import { ProductCard } from "@/components/site/product-card";
import type { PublicProductCard } from "@/lib/catalog-data";

export function FeaturedProducts({ products }: { products: PublicProductCard[] }) {
  if (products.length === 0) return null;

  return (
    <section id="productos" className="py-12 sm:py-16">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 sm:px-6">
        <h2 className="text-xl font-bold tracking-tight text-(--site-ink) uppercase sm:text-2xl">
          Destacados
        </h2>
        <Link href="/productos" className="text-sm font-medium text-stone-600 hover:text-stone-900">
          Ver todo →
        </Link>
      </div>

      <div className="mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:px-6 [&::-webkit-scrollbar]:hidden">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            className="w-[45vw] shrink-0 snap-start sm:w-56"
          />
        ))}
      </div>
    </section>
  );
}
