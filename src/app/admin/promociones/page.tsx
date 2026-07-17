import { createClient } from "@/lib/supabase/server";
import { PromotionsList } from "@/app/admin/promociones/promotions-list";

export default async function PromotionsPage() {
  const supabase = await createClient();
  const [{ data: promotions }, { data: categories }, { data: products }, { data: links }] =
    await Promise.all([
      supabase.from("promotions").select("*").is("deleted_at", null).order("created_at", { ascending: false }),
      supabase.from("categories").select("*").is("deleted_at", null).order("name"),
      supabase.from("products").select("id, name").is("deleted_at", null).order("name"),
      supabase.from("promotion_products").select("promotion_id, product_id"),
    ]);

  const productIdsByPromotion = new Map<string, string[]>();
  for (const link of links ?? []) {
    productIdsByPromotion.set(link.promotion_id, [
      ...(productIdsByPromotion.get(link.promotion_id) ?? []),
      link.product_id,
    ]);
  }

  const withProducts = (promotions ?? []).map((p) => ({
    ...p,
    productIds: productIdsByPromotion.get(p.id) ?? [],
  }));

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Promociones</h1>
        <p className="text-muted-foreground text-sm">
          Se activan y vencen solas según la fecha (hora de Argentina).
        </p>
      </div>
      <PromotionsList promotions={withProducts} categories={categories ?? []} products={products ?? []} />
    </div>
  );
}
