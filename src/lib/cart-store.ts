import { cartItemKey, type CartItem } from "@/lib/cart-types";

const STORAGE_KEY = "pekitas-cart";

let items: CartItem[] = [];
let hydrated = false;
const listeners = new Set<() => void>();

function readFromStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist() {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function notify() {
  for (const listener of listeners) listener();
}

function setItems(next: CartItem[]) {
  items = next;
  persist();
  notify();
}

export function subscribe(listener: () => void): () => void {
  if (!hydrated) {
    items = readFromStorage();
    hydrated = true;
  }
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot(): CartItem[] {
  return items;
}

export function getServerSnapshot(): CartItem[] {
  return [];
}

export function addItem(item: Omit<CartItem, "key">) {
  const key = cartItemKey(item.productId, item.size, item.color);
  const existing = items.find((i) => i.key === key);
  if (existing) {
    const nextQty = Math.min(existing.quantity + item.quantity, item.maxStock || Infinity);
    setItems(items.map((i) => (i.key === key ? { ...i, quantity: nextQty } : i)));
  } else {
    setItems([...items, { ...item, key }]);
  }
}

export function removeItem(key: string) {
  setItems(items.filter((i) => i.key !== key));
}

export function updateQuantity(key: string, quantity: number) {
  setItems(
    items
      .map((i) =>
        i.key === key ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxStock || Infinity)) } : i
      )
      .filter((i) => i.quantity > 0)
  );
}

export function clear() {
  setItems([]);
}
