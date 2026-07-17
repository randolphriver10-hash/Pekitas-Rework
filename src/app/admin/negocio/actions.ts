"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { businessInfoSchema, emptyToNull, type BusinessInfoInput } from "@/lib/validations/site";

export type ActionResult = { error?: string; conflict?: boolean } | undefined;

export async function updateBusinessInfoAction(
  input: BusinessInfoInput & { expectedUpdatedAt: string }
): Promise<ActionResult> {
  const { expectedUpdatedAt, ...rest } = input;
  const parsed = businessInfoSchema.safeParse(rest);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("site_settings")
    .update({ ...emptyToNull(parsed.data), updated_by: user?.id })
    .eq("id", true)
    .eq("updated_at", expectedUpdatedAt)
    .select("id");

  if (error) return { error: "No se pudo guardar." };
  if (!data || data.length === 0) {
    return {
      error: "Otro usuario modificó esta información mientras editabas. Recargá la página.",
      conflict: true,
    };
  }

  revalidatePath("/admin/negocio");
  revalidatePath("/");
}
