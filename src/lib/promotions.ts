import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { PromotionRow } from "@/lib/supabase/types";

export type ActivePromotion = PromotionRow & { productIds: string[] };

export async function getActivePromotions(): Promise<ActivePromotion[]> {
  const supabase = await createClient();
  const nowIso = new Date().toISOString();

  const { data: promotions } = await supabase
    .from("promotions")
    .select("*, promotion_products(product_id)")
    .eq("status", "published")
    .eq("is_active", true)
    .is("deleted_at", null)
    .lte("start_at", nowIso)
    .gte("end_at", nowIso);

  return ((promotions ?? []) as unknown as (PromotionRow & {
    promotion_products: { product_id: string }[];
  })[]).map((p) => ({
    ...p,
    productIds: p.promotion_products.map((pp) => pp.product_id),
  }));
}

export function findPromotionForProduct(
  promotions: ActivePromotion[],
  productId: string,
  categoryId: string | null
): ActivePromotion | undefined {
  return promotions.find(
    (p) => p.productIds.includes(productId) || (p.category_id && p.category_id === categoryId)
  );
}

export async function getActiveBannerPromotion(): Promise<ActivePromotion | null> {
  const promotions = await getActivePromotions();
  return promotions.find((p) => p.banner_enabled) ?? null;
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
