"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { promotionSchema, type PromotionInput } from "@/lib/validations/promotions";
import { arDatetimeLocalToUtcIso } from "@/lib/timezone";

export type ActionResult = { error?: string; conflict?: boolean } | undefined;

export async function upsertPromotionAction(
  input: PromotionInput & { expectedUpdatedAt?: string }
): Promise<ActionResult> {
  const { expectedUpdatedAt, ...rest0 } = input;
  const parsed = promotionSchema.safeParse(rest0);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { id, productIds, category_id, discount_percentage, fixed_price, description, cta_text, cta_url, ...rest } =
    parsed.data;

  const payload = {
    ...rest,
    category_id: category_id || null,
    discount_percentage:
      rest.discount_type === "percentage" && typeof discount_percentage === "number" && !Number.isNaN(discount_percentage)
        ? discount_percentage
        : null,
    fixed_price:
      rest.discount_type === "fixed_price" && typeof fixed_price === "number" && !Number.isNaN(fixed_price)
        ? fixed_price
        : null,
    description: description || null,
    cta_text: cta_text || null,
    cta_url: cta_url || null,
    updated_by: user?.id,
  };

  const startAt = arDatetimeLocalToUtcIso(rest.start_at);
  const endAt = arDatetimeLocalToUtcIso(rest.end_at);
  if (!startAt || !endAt) {
    return { error: "Las fechas de inicio y fin son obligatorias." };
  }
  payload.start_at = startAt;
  payload.end_at = endAt;

  let promotionId = id;

  if (id) {
    let query = supabase.from("promotions").update(payload).eq("id", id);
    if (expectedUpdatedAt) query = query.eq("updated_at", expectedUpdatedAt);
    const { data, error } = await query.select("id");
    if (error) return { error: "No se pudo guardar." };
    if (expectedUpdatedAt && (!data || data.length === 0)) {
      return { error: "Otro usuario modificó esta promoción mientras editabas. Recargá la página.", conflict: true };
    }
  } else {
    const { data, error } = await supabase
      .from("promotions")
      .insert({ ...payload, created_by: user?.id })
      .select("id")
      .single();
    if (error || !data) return { error: "No se pudo crear." };
    promotionId = data.id;
  }

  if (promotionId) {
    await supabase.from("promotion_products").delete().eq("promotion_id", promotionId);
    if (productIds.length > 0) {
      await supabase
        .from("promotion_products")
        .insert(productIds.map((product_id) => ({ promotion_id: promotionId, product_id })));
    }
  }

  revalidatePath("/admin/promociones");
  revalidatePath("/");
}

export async function toggleStatusAction(
  id: string,
  status: "draft" | "published" | "archived"
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("promotions").update({ status }).eq("id", id);
  if (error) return { error: "No se pudo actualizar." };
  revalidatePath("/admin/promociones");
  revalidatePath("/");
}

export async function softDeletePromotionAction(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { error } = await supabase
    .from("promotions")
    .update({ deleted_at: new Date().toISOString(), deleted_by: user?.id })
    .eq("id", id);
  if (error) return { error: "No se pudo eliminar." };
  revalidatePath("/admin/promociones");
  revalidatePath("/");
}
