"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { categorySchema, type CategoryInput } from "@/lib/validations/catalog";

export type ActionResult = { error?: string; conflict?: boolean } | undefined;

export async function upsertCategoryAction(
  input: CategoryInput & { expectedUpdatedAt?: string }
): Promise<ActionResult> {
  const { expectedUpdatedAt, ...rest0 } = input;
  const parsed = categorySchema.safeParse(rest0);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { id, parent_id, image_url, description, ...rest } = parsed.data;

  const payload = {
    ...rest,
    parent_id: parent_id || null,
    image_url: image_url || null,
    description: description || null,
    updated_by: user?.id ?? null,
  };

  if (id) {
    let query = supabase.from("categories").update(payload).eq("id", id);
    if (expectedUpdatedAt) query = query.eq("updated_at", expectedUpdatedAt);
    const { data, error } = await query.select("id");
    if (error) {
      if (error.code === "23505") return { error: "Ya existe una categoría con ese slug." };
      return { error: "No se pudo guardar." };
    }
    if (expectedUpdatedAt && (!data || data.length === 0)) {
      return { error: "Otro usuario modificó esta categoría mientras editabas. Recargá la página.", conflict: true };
    }
  } else {
    const { error } = await supabase.from("categories").insert({ ...payload, created_by: user?.id ?? null });
    if (error) {
      if (error.code === "23505") return { error: "Ya existe una categoría con ese slug." };
      return { error: "No se pudo guardar." };
    }
  }

  revalidatePath("/admin/categorias");
  revalidatePath("/");
}

export async function toggleCategoryActiveAction(id: string, isActive: boolean): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").update({ is_active: isActive }).eq("id", id);
  if (error) return { error: "No se pudo actualizar." };
  revalidatePath("/admin/categorias");
  revalidatePath("/");
}

export async function softDeleteCategoryAction(id: string): Promise<ActionResult> {
  const supabase = await createClient();

  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id)
    .is("deleted_at", null);

  if (count && count > 0) {
    return {
      error: `Esta categoría tiene ${count} producto(s) asociado(s). Reasigná esos productos a otra categoría antes de eliminarla.`,
    };
  }

  const { count: childCount } = await supabase
    .from("categories")
    .select("id", { count: "exact", head: true })
    .eq("parent_id", id)
    .is("deleted_at", null);

  if (childCount && childCount > 0) {
    return { error: `Esta categoría tiene ${childCount} subcategoría(s). Eliminalas primero.` };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("categories")
    .update({ deleted_at: new Date().toISOString(), deleted_by: user?.id })
    .eq("id", id);

  if (error) return { error: "No se pudo eliminar." };
  revalidatePath("/admin/categorias");
  revalidatePath("/");
}
