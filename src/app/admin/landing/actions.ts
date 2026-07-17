"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sectionSchemas, type SectionType } from "@/lib/validations/landing-sections";

export type ActionResult = { error?: string; conflict?: boolean } | undefined;

export async function updateSectionContentAction(input: {
  id: string;
  type: SectionType;
  content: unknown;
  expectedUpdatedAt: string;
}): Promise<ActionResult> {
  const schema = sectionSchemas[input.type];
  const parsed = schema.safeParse(input.content);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("landing_sections")
    .update({ content: parsed.data, updated_by: user?.id })
    .eq("id", input.id)
    .eq("updated_at", input.expectedUpdatedAt)
    .select("id");

  if (error) return { error: "No se pudo guardar." };
  if (!data || data.length === 0) {
    return {
      error: "Otro usuario modificó esta sección mientras editabas. Recargá la página.",
      conflict: true,
    };
  }

  revalidatePath("/admin/landing");
  revalidatePath("/");
}

export async function toggleSectionStatusAction(
  id: string,
  status: "draft" | "published"
): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("landing_sections").update({ status }).eq("id", id);
  if (error) return { error: "No se pudo actualizar." };
  revalidatePath("/admin/landing");
  revalidatePath("/");
}

export async function toggleSectionActiveAction(id: string, isActive: boolean): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("landing_sections").update({ is_active: isActive }).eq("id", id);
  if (error) return { error: "No se pudo actualizar." };
  revalidatePath("/admin/landing");
  revalidatePath("/");
}
