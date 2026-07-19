"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import * as recentlyViewedStore from "@/lib/recently-viewed-store";

type RecentProduct = {
  slug: string;
  name: string;
  price: number;
  imageUrl: string | null;
};

export function RecentlyViewed({ currentSlug }: { currentSlug: string }) {
  const slugs = useSyncExternalStore(
    recentlyViewedStore.subscribe,
    recentlyViewedStore.getSnapshot,
    recentlyViewedStore.getServerSnapshot
  ).filter((s) => s !== currentSlug);

  const [products, setProducts] = useState<RecentProduct[]>([]);

  useEffect(() => {
    type Row = {
      slug: string;
      name: string;
      price: number;
      sale_price: number | null;
      product_images: { url: string; is_primary: boolean }[];
    };

    const query: PromiseLike<{ data: Row[] | null }> =
      slugs.length === 0
        ? Promise.resolve({ data: [] })
        : createClient()
            .from("products")
            .select("slug, name, price, sale_price, product_images(url, is_primary)")
            .in("slug", slugs)
            .eq("status", "published")
            .is("deleted_at", null);

    query.then(({ data }) => {
      const bySlug = new Map(
        (data ?? []).map((p) => {
          const primary = p.product_images.find((i) => i.is_primary) ?? p.product_images[0];
          const entry: RecentProduct = {
            slug: p.slug,
            name: p.name,
            price: p.sale_price ?? p.price,
            imageUrl: primary?.url ?? null,
          };
          return [p.slug, entry] as [string, RecentProduct];
        })
      );
      setProducts(slugs.map((s) => bySlug.get(s)).filter((p): p is RecentProduct => !!p));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slugs.join(",")]);

  if (products.length === 0) return null;

  return (
    <div className="mt-12 border-t border-stone-200 pt-8">
      <h2 className="mb-4 text-sm font-medium tracking-wide text-stone-500 uppercase">
        Lo último que viste
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {products.map((p) => (
          <Link key={p.slug} href={`/productos/${p.slug}`} className="w-20 shrink-0">
            <div className="bg-(--site-beige) relative aspect-square w-20 overflow-hidden">
              {p.imageUrl && (
                <Image src={p.imageUrl} alt={p.name} fill sizes="80px" className="object-cover" />
              )}
            </div>
            <p className="mt-1 truncate text-[11px] text-stone-600">{p.name}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function useRecordProductView(slug: string) {
  useEffect(() => {
    recentlyViewedStore.recordView(slug);
  }, [slug]);
}
