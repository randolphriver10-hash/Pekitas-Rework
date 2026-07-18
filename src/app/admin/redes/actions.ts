"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { socialLinkSchema, type SocialLinkInput } from "@/lib/validations/site";

export type ActionResult = { error?: string; conflict?: boolean } | undefined;

export async function upsertSocialLinkAction(
  input: SocialLinkInput & { expectedUpdatedAt?: string }
): Promise<ActionResult> {
  const { expectedUpdatedAt, ...rest0 } = input;
  const parsed = socialLinkSchema.safeParse(rest0);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const supabase = await createClient();
  const { id, ...rest } = parsed.data;

  if (id) {
    let query = supabase.from("social_links").update(rest).eq("id", id);
    if (expectedUpdatedAt) query = query.eq("updated_at", expectedUpdatedAt);
    const { data, error } = await query.select("id");
    if (error) return { error: "No se pudo guardar." };
    if (expectedUpdatedAt && (!data || data.length === 0)) {
      return { error: "Otro usuario modificó esta red mientras editabas. Recargá la página.", conflict: true };
    }
  } else {
    const { error } = await supabase.from("social_links").insert(rest);
    if (error) return { error: "No se pudo guardar." };
  }

  revalidatePath("/admin/redes");
  revalidatePath("/");
}

export async function toggleSocialLinkAction(id: string, isActive: boolean): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("social_links").update({ is_active: isActive }).eq("id", id);
  if (error) return { error: "No se pudo actualizar." };
  revalidatePath("/admin/redes");
  revalidatePath("/");
}

export async function deleteSocialLinkAction(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("social_links").delete().eq("id", id);
  if (error) return { error: "No se pudo eliminar." };
  revalidatePath("/admin/redes");
  revalidatePath("/");
}
