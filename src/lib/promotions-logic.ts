import type { PromotionRow } from "@/lib/supabase/types";

export type ActivePromotion = PromotionRow & { productIds: string[] };

export function findPromotionForProduct(
  promotions: ActivePromotion[],
  productId: string,
  categoryId: string | null
): ActivePromotion | undefined {
  return promotions.find(
    (p) => p.productIds.includes(productId) || (p.category_id && p.category_id === categoryId)
  );
}

export function computeDiscountedPrice(price: number, promotion: ActivePromotion): number {
  if (promotion.discount_type === "fixed_price" && promotion.fixed_price != null) {
    return promotion.fixed_price;
  }
  if (promotion.discount_type === "percentage" && promotion.discount_percentage != null) {
    return Math.round(price * (1 - promotion.discount_percentage / 100) * 100) / 100;
  }
  return price;
}
