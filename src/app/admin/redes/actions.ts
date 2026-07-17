"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { socialLinkSchema, type SocialLinkInput } from "@/lib/validations/site";

export type ActionResult = { error?: string } | undefined;

export async function upsertSocialLinkAction(input: SocialLinkInput): Promise<ActionResult> {
  const parsed = socialLinkSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const supabase = await createClient();
  const { id, ...rest } = parsed.data;

  const { error } = id
    ? await supabase.from("social_links").update(rest).eq("id", id)
    : await supabase.from("social_links").insert(rest);

  if (error) return { error: "No se pudo guardar." };
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
