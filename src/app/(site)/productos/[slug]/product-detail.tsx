"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { MessageCircle, Minus, Plus, ShoppingBag, Check } from "lucide-react";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { useCart } from "@/components/site/cart-provider";
import { useRecordProductView } from "@/components/site/recently-viewed";

type Variant = {
  id: string;
  size: string | null;
  color: string | null;
  stock: number;
  is_active: boolean;
};

type ProductImage = { id: string; url: string; alt_text: string; is_primary: boolean };

export function ProductDetail({
  productId,
  slug,
  name,
  price,
  salePrice,
  images,
  variants,
  stock,
  whatsappNumber,
  messageTemplate,
  productUrl,
}: {
  productId: string;
  slug: string;
  name: string;
  price: number;
  salePrice: number | null;
  images: ProductImage[];
  variants: Variant[];
  stock: number;
  whatsappNumber: string | null;
  messageTemplate: string | null;
  productUrl: string;
}) {
  const sortedImages = images.length > 0 ? images : [];
  const [activeImage, setActiveImage] = useState(0);
  useRecordProductView(slug);

  const sizes = useMemo(
    () => [...new Set(variants.map((v) => v.size).filter(Boolean))] as string[],
    [variants]
  );
  const colors = useMemo(
    () => [...new Set(variants.map((v) => v.color).filter(Boolean))] as string[],
    [variants]
  );

  const [selectedSize, setSelectedSize] = useState<string | null>(sizes[0] ?? null);
  const [selectedColor, setSelectedColor] = useState<string | null>(colors[0] ?? null);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const { addItem } = useCart();

  const selectedVariant = variants.find(
    (v) => (sizes.length === 0 || v.size === selectedSize) && (colors.length === 0 || v.color === selectedColor)
  );
  const effectiveStock = variants.length > 0 ? (selectedVariant?.stock ?? 0) : stock;
  const isOutOfStock = effectiveStock === 0;
  const effectivePrice = salePrice ?? price;

  const handleAddToCart = () => {
    addItem({
      productId,
      slug,
      name,
      imageUrl: sortedImages[0]?.url ?? null,
      price: effectivePrice,
      size: sizes.length > 0 ? selectedSize : null,
      color: colors.length > 0 ? selectedColor : null,
      quantity,
      maxStock: effectiveStock,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const message = (messageTemplate ?? "Hola! Quería consultar por {product_name} ({product_url}).")
    .replace("{product_name}", name)
    .replace("{price}", String(salePrice ?? price))
    .replace("{product_url}", productUrl)
    .concat(
      selectedSize || selectedColor
        ? ` Talle: ${selectedSize ?? "-"}. Color: ${selectedColor ?? "-"}.`
        : ""
    );

  const whatsappUrl = buildWhatsAppUrl(whatsappNumber, message);

  return (
    <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
      <div>
        <div className="bg-(--site-beige) relative aspect-square w-full overflow-hidden rounded-3xl">
          {sortedImages[activeImage] && (
            <Image
              src={sortedImages[activeImage].url}
              alt={sortedImages[activeImage].alt_text}
              fill
              sizes="(min-width: 768px) 45vw, 90vw"
              className="object-cover"
              priority
            />
          )}
        </div>
        {sortedImages.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {sortedImages.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setActiveImage(i)}
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${
                  i === activeImage ? "border-(--site-ink)" : "border-transparent"
                }`}
              >
                <Image src={img.url} alt={img.alt_text} fill sizes="64px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <h1 className="font-[family-name:var(--font-fraunces)] text-3xl font-medium text-(--site-ink)">
          {name}
        </h1>
        <div className="mt-3 flex items-baseline gap-3">
          {salePrice ? (
            <>
              <span className="text-2xl font-semibold text-(--site-ink)">${salePrice}</span>
              <span className="text-lg text-stone-400 line-through">${price}</span>
            </>
          ) : (
            <span className="text-2xl font-semibold text-(--site-ink)">${price}</span>
          )}
        </div>

        {sizes.length > 0 && (
          <div className="mt-6">
            <p className="mb-2 text-sm font-medium text-stone-700">Talle</p>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-medium ${
                    selectedSize === size
                      ? "border-(--site-ink) bg-(--site-ink) text-white"
                      : "border-stone-300 text-stone-700"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {colors.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-sm font-medium text-stone-700">Color</p>
            <div className="flex flex-wrap gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  aria-label={color}
                  className={`h-8 w-8 rounded-full border-2 ${
                    selectedColor === color ? "border-(--site-ink)" : "border-transparent"
                  }`}
                  style={color.startsWith("#") ? { backgroundColor: color } : undefined}
                >
                  {!color.startsWith("#") && <span className="text-xs">{color}</span>}
                </button>
              ))}
            </div>
          </div>
        )}

        <p className={`mt-6 text-sm ${isOutOfStock ? "text-destructive" : "text-emerald-600"}`}>
          {isOutOfStock ? "Sin stock" : "Disponible"}
        </p>

        {!isOutOfStock && (
          <div className="mt-4 flex items-center gap-2">
            <div className="flex items-center rounded-full border border-stone-300">
              <button
                type="button"
                aria-label="Restar cantidad"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-10 w-10 items-center justify-center text-stone-600"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-6 text-center text-sm">{quantity}</span>
              <button
                type="button"
                aria-label="Sumar cantidad"
                onClick={() => setQuantity((q) => Math.min(q + 1, effectiveStock))}
                disabled={quantity >= effectiveStock}
                className="flex h-10 w-10 items-center justify-center text-stone-600 disabled:opacity-40"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-3">
          {!isOutOfStock && (
            <button
              type="button"
              onClick={handleAddToCart}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-(--site-ink) px-6 text-sm font-medium text-white shadow-sm transition-transform hover:-translate-y-0.5"
            >
              {justAdded ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
              {justAdded ? "Agregado" : "Agregar al carrito"}
            </button>
          )}

          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center gap-2 rounded-full border border-emerald-500 px-6 text-sm font-medium text-emerald-600 shadow-sm transition-transform hover:-translate-y-0.5"
            >
              <MessageCircle className="h-4 w-4" />
              Consultar por WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
