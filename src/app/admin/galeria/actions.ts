"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { galleryItemSchema, type GalleryItemInput } from "@/lib/validations/promotions";

export type ActionResult = { error?: string; conflict?: boolean } | undefined;

export async function upsertGalleryItemAction(
  input: GalleryItemInput & { expectedUpdatedAt?: string }
): Promise<ActionResult> {
  const { expectedUpdatedAt, ...rest0 } = input;
  const parsed = galleryItemSchema.safeParse(rest0);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { id, title, description, ...rest } = parsed.data;
  const payload = { ...rest, title: title || null, description: description || null, updated_by: user?.id };

  if (id) {
    let query = supabase.from("gallery_items").update(payload).eq("id", id);
    if (expectedUpdatedAt) query = query.eq("updated_at", expectedUpdatedAt);
    const { data, error } = await query.select("id");
    if (error) return { error: "No se pudo guardar." };
    if (expectedUpdatedAt && (!data || data.length === 0)) {
      return { error: "Otro usuario modificó esta imagen mientras editabas. Recargá la página.", conflict: true };
    }
  } else {
    const { error } = await supabase.from("gallery_items").insert({ ...payload, created_by: user?.id });
    if (error) return { error: "No se pudo guardar." };
  }

  revalidatePath("/admin/galeria");
  revalidatePath("/");
}

export async function toggleGalleryItemActiveAction(id: string, isActive: boolean): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("gallery_items").update({ is_active: isActive }).eq("id", id);
  if (error) return { error: "No se pudo actualizar." };
  revalidatePath("/admin/galeria");
  revalidatePath("/");
}

export async function softDeleteGalleryItemAction(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: item } = await supabase.from("gallery_items").select("image_url").eq("id", id).single();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("gallery_items")
    .update({ deleted_at: new Date().toISOString(), deleted_by: user?.id })
    .eq("id", id);
  if (error) return { error: "No se pudo eliminar." };

  if (item?.image_url) {
    const path = item.image_url.split("/site-assets/")[1];
    if (path) {
      const admin = createAdminClient();
      await admin.storage.from("site-assets").remove([path]);
    }
  }

  revalidatePath("/admin/galeria");
  revalidatePath("/");
}
