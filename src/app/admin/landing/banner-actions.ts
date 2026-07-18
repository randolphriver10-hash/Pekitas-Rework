"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { bannerSchema, type BannerInput } from "@/lib/validations/promotions";
import { arDatetimeLocalToUtcIso } from "@/lib/timezone";

export type ActionResult = { error?: string; conflict?: boolean } | undefined;

export async function upsertBannerAction(
  input: BannerInput & { expectedUpdatedAt?: string }
): Promise<ActionResult> {
  const { expectedUpdatedAt, ...rest0 } = input;
  const parsed = bannerSchema.safeParse(rest0);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { id, title, cta_text, cta_url, image_url, start_at, end_at, ...rest } = parsed.data;

  const payload = {
    ...rest,
    title: title || null,
    cta_text: cta_text || null,
    cta_url: cta_url || null,
    image_url: image_url || null,
    start_at: arDatetimeLocalToUtcIso(start_at),
    end_at: arDatetimeLocalToUtcIso(end_at),
    updated_by: user?.id,
  };

  if (id) {
    let query = supabase.from("banners").update(payload).eq("id", id);
    if (expectedUpdatedAt) query = query.eq("updated_at", expectedUpdatedAt);
    const { data, error } = await query.select("id");
    if (error) return { error: "No se pudo guardar." };
    if (expectedUpdatedAt && (!data || data.length === 0)) {
      return { error: "Otro usuario modificó este banner mientras editabas. Recargá la página.", conflict: true };
    }
  } else {
    const { error } = await supabase.from("banners").insert({ ...payload, created_by: user?.id });
    if (error) return { error: "No se pudo guardar." };
  }

  revalidatePath("/admin/landing");
  revalidatePath("/");
}

export async function toggleBannerStatusAction(
  id: string,
  status: "draft" | "published"
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("banners").update({ status }).eq("id", id);
  if (error) return { error: "No se pudo actualizar." };
  revalidatePath("/admin/landing");
  revalidatePath("/");
}

export async function softDeleteBannerAction(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { error } = await supabase
    .from("banners")
    .update({ deleted_at: new Date().toISOString(), deleted_by: user?.id })
    .eq("id", id);
  if (error) return { error: "No se pudo eliminar." };
  revalidatePath("/admin/landing");
  revalidatePath("/");
}
