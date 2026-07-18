import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { PromotionRow } from "@/lib/supabase/types";
import { findPromotionForProduct, computeDiscountedPrice, type ActivePromotion } from "@/lib/promotions-logic";

export type { ActivePromotion };
export { findPromotionForProduct, computeDiscountedPrice };

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

export async function getActiveBannerPromotion(): Promise<ActivePromotion | null> {
  const promotions = await getActivePromotions();
  return promotions.find((p) => p.banner_enabled) ?? null;
}
