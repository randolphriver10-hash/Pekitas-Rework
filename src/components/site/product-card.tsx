import Image from "next/image";
import Link from "next/link";
import { ImageOff } from "lucide-react";
import type { PublicProductCard } from "@/lib/catalog-data";

export function ProductCard({ product }: { product: PublicProductCard }) {
  return (
    <Link
      href={`/productos/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white/60"
    >
      <div className="bg-(--site-beige) relative aspect-[4/5] w-full overflow-hidden rounded-2xl">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 22vw, (min-width: 640px) 40vw, 90vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <ImageOff className="text-muted-foreground absolute inset-0 m-auto h-8 w-8" />
        )}

        <div className="absolute top-2 left-2 flex gap-1.5">
          {product.is_new && (
            <span className="rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-stone-700">
              Nuevo
            </span>
          )}
          {product.is_on_sale && (
            <span className="bg-(--site-blush-deep) rounded-full px-2.5 py-1 text-[11px] font-medium text-white">
              Oferta
            </span>
          )}
          {product.stock === 0 && (
            <span className="rounded-full bg-stone-800/90 px-2.5 py-1 text-[11px] font-medium text-white">
              Agotado
            </span>
          )}
        </div>
      </div>

      <div className="pt-3">
        <h3 className="text-sm font-medium text-(--site-ink)">{product.name}</h3>
        <div className="mt-1 flex items-baseline gap-2">
          {product.sale_price ? (
            <>
              <span className="text-sm font-semibold text-(--site-ink)">${product.sale_price}</span>
              <span className="text-xs text-stone-400 line-through">${product.price}</span>
            </>
          ) : (
            <span className="text-sm font-semibold text-(--site-ink)">${product.price}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
