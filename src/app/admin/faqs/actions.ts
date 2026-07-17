"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { faqSchema, type FaqInput } from "@/lib/validations/promotions";

export type ActionResult = { error?: string } | undefined;

export async function upsertFaqAction(input: FaqInput): Promise<ActionResult> {
  const parsed = faqSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { id, category, ...rest } = parsed.data;
  const payload = { ...rest, category: category || null, updated_by: user?.id };

  const { error } = id
    ? await supabase.from("faqs").update(payload).eq("id", id)
    : await supabase.from("faqs").insert({ ...payload, created_by: user?.id });

  if (error) return { error: "No se pudo guardar." };
  revalidatePath("/admin/faqs");
  revalidatePath("/");
}

export async function toggleFaqActiveAction(id: string, isActive: boolean): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("faqs").update({ is_active: isActive }).eq("id", id);
  if (error) return { error: "No se pudo actualizar." };
  revalidatePath("/admin/faqs");
  revalidatePath("/");
}

export async function softDeleteFaqAction(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { error } = await supabase
    .from("faqs")
    .update({ deleted_at: new Date().toISOString(), deleted_by: user?.id })
    .eq("id", id);
  if (error) return { error: "No se pudo eliminar." };
  revalidatePath("/admin/faqs");
  revalidatePath("/");
}
