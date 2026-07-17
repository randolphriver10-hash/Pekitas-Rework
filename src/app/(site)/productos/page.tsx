import type { Metadata } from "next";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/site/product-card";
import { getPublishedProducts, getActiveCategories } from "@/lib/catalog-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Productos — Pekitas" };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { categoria } = await searchParams;
  const [products, categories] = await Promise.all([
    getPublishedProducts(categoria),
    getActiveCategories(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
      <h1 className="font-[family-name:var(--font-fraunces)] text-3xl font-medium text-(--site-ink)">
        Catálogo
      </h1>

      {categories.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/productos"
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm",
              !categoria ? "border-(--site-ink) bg-(--site-ink) text-white" : "border-stone-300 text-stone-600"
            )}
          >
            Todos
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/productos?categoria=${c.id}`}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm",
                categoria === c.id
                  ? "border-(--site-ink) bg-(--site-ink) text-white"
                  : "border-stone-300 text-stone-600"
              )}
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}

      {products.length === 0 ? (
        <p className="text-muted-foreground mt-12 text-center">
          Todavía no hay productos publicados en esta categoría.
        </p>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
