"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Minus, Plus, Trash2, MessageCircle } from "lucide-react";
import { useCart } from "@/components/site/cart-provider";
import { buildWhatsAppUrl, buildCartOrderMessage } from "@/lib/whatsapp";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";

export function CartSheet({ whatsappNumber }: { whatsappNumber: string | null }) {
  const { items, removeItem, updateQuantity, totalItems, totalPrice, clear } = useCart();
  const [open, setOpen] = useState(false);

  const orderUrl = buildWhatsAppUrl(whatsappNumber, buildCartOrderMessage(items));

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="relative text-stone-600 hover:text-stone-900"
        aria-label="Ver carrito"
      >
        <ShoppingBag className="h-5 w-5" />
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-(--site-blush-deep) px-1 text-[10px] font-medium text-white">
            {totalItems > 9 ? "9+" : totalItems}
          </span>
        )}
      </SheetTrigger>
      <SheetContent className="site-theme flex flex-col gap-0 bg-(--site-cream) p-0 text-(--site-ink)">
        <SheetHeader className="border-b border-stone-200/70">
          <SheetTitle className="font-[family-name:var(--font-fraunces)] text-lg">
            Tu pedido
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
            <ShoppingBag className="h-8 w-8 text-stone-300" />
            <p className="text-sm text-stone-500">Todavía no agregaste productos.</p>
          </div>
        ) : (
          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
            {items.map((item) => (
              <div key={item.key} className="flex gap-3">
                <div className="bg-(--site-beige) relative h-20 w-16 shrink-0 overflow-hidden rounded-xl">
                  {item.imageUrl && (
                    <Image src={item.imageUrl} alt={item.name} fill sizes="64px" className="object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.name}</p>
                  {(item.size || item.color) && (
                    <p className="text-xs text-stone-500">
                      {[item.size, item.color].filter(Boolean).join(" / ")}
                    </p>
                  )}
                  <p className="mt-1 text-sm font-medium text-(--site-ink)">
                    ${item.price.toLocaleString("es-AR")}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      aria-label="Restar cantidad"
                      onClick={() => updateQuantity(item.key, item.quantity - 1)}
                      className="flex h-6 w-6 items-center justify-center rounded-full border border-stone-300 text-stone-600"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-5 text-center text-sm">{item.quantity}</span>
                    <button
                      type="button"
                      aria-label="Sumar cantidad"
                      onClick={() => updateQuantity(item.key, item.quantity + 1)}
                      disabled={item.quantity >= item.maxStock}
                      className="flex h-6 w-6 items-center justify-center rounded-full border border-stone-300 text-stone-600 disabled:opacity-40"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      aria-label="Quitar del carrito"
                      onClick={() => removeItem(item.key)}
                      className="ml-auto text-stone-400 hover:text-rose-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {items.length > 0 && (
          <SheetFooter className="border-t border-stone-200/70 bg-(--site-cream)">
            <div className="flex items-center justify-between text-sm font-medium">
              <span>Total</span>
              <span>${totalPrice.toLocaleString("es-AR")}</span>
            </div>
            {orderUrl && (
              <a
                href={orderUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  setOpen(false);
                  clear();
                }}
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-emerald-500 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
              >
                <MessageCircle className="h-4 w-4" />
                Finalizar pedido por WhatsApp
              </a>
            )}
            <Link
              href="/productos"
              onClick={() => setOpen(false)}
              className="text-center text-xs text-stone-500 underline underline-offset-2"
            >
              Seguir viendo el catálogo
            </Link>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
