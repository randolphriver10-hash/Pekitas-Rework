export type CartItem = {
  key: string;
  productId: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  price: number;
  size: string | null;
  color: string | null;
  quantity: number;
  maxStock: number;
};

export function cartItemKey(productId: string, size: string | null, color: string | null): string {
  return [productId, size ?? "-", color ?? "-"].join("::");
}
