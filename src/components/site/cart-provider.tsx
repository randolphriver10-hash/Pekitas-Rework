"use client";

import { useSyncExternalStore, useMemo } from "react";
import * as cartStore from "@/lib/cart-store";
import type { CartItem } from "@/lib/cart-types";

export function useCart() {
  const items = useSyncExternalStore(
    cartStore.subscribe,
    cartStore.getSnapshot,
    cartStore.getServerSnapshot
  );

  const { totalItems, totalPrice } = useMemo(
    () => ({
      totalItems: items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: items.reduce((sum, i) => sum + i.quantity * i.price, 0),
    }),
    [items]
  );

  return {
    items,
    totalItems,
    totalPrice,
    addItem: cartStore.addItem,
    removeItem: cartStore.removeItem,
    updateQuantity: cartStore.updateQuantity,
    clear: cartStore.clear,
  };
}

export type { CartItem };
