"use client";

import Image from "next/image";
import Link from "next/link";
import { ImageOff, ShoppingBag } from "lucide-react";
import type { PublicProductCard } from "@/lib/catalog-data";
import { useCart } from "@/components/site/cart-provider";

export function ProductCard({
  product,
  className,
}: {
  product: PublicProductCard;
  className?: string;
}) {
  const { addItem } = useCart();
  const effectivePrice = product.sale_price ?? product.price;
  const maxStock = product.defaultVariant?.stock ?? product.stock;
  const isOutOfStock = maxStock === 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      imageUrl: product.imageUrl,
      price: effectivePrice,
      size: product.defaultVariant?.size ?? null,
      color: product.defaultVariant?.color ?? null,
      quantity: 1,
      maxStock,
    });
  };

  return (
    <div className={className ?? "flex flex-col"}>
      <Link href={`/productos/${product.slug}`} className="group flex flex-col">
        <div className="bg-(--site-beige) relative aspect-[4/5] w-full overflow-hidden">
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
              <span className="bg-white px-2.5 py-1 text-[11px] font-medium text-stone-700">
                Nuevo
              </span>
            )}
            {product.is_on_sale && (
              <span className="bg-(--site-blush-deep) px-2.5 py-1 text-[11px] font-medium text-white">
                Oferta
              </span>
            )}
            {isOutOfStock && (
              <span className="bg-stone-800/90 px-2.5 py-1 text-[11px] font-medium text-white">
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

      <button
        type="button"
        onClick={handleAddToCart}
        disabled={isOutOfStock}
        className="mt-2.5 flex h-10 items-center justify-center gap-1.5 bg-(--site-ink) text-xs font-medium tracking-wide text-white uppercase transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ShoppingBag className="h-3.5 w-3.5" />
        {isOutOfStock ? "Sin stock" : "Agregar"}
      </button>
    </div>
  );
}
