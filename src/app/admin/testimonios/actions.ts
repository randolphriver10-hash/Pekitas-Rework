"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { testimonialSchema, type TestimonialInput } from "@/lib/validations/promotions";

export type ActionResult = { error?: string; conflict?: boolean } | undefined;

export async function upsertTestimonialAction(
  input: TestimonialInput & { expectedUpdatedAt?: string }
): Promise<ActionResult> {
  const { expectedUpdatedAt, ...rest0 } = input;
  const parsed = testimonialSchema.safeParse(rest0);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { id, rating, photo_url, ...rest } = parsed.data;

  const payload = {
    ...rest,
    rating: typeof rating === "number" && !Number.isNaN(rating) ? rating : null,
    photo_url: photo_url || null,
    updated_by: user?.id,
  };

  if (id) {
    let query = supabase.from("testimonials").update(payload).eq("id", id);
    if (expectedUpdatedAt) query = query.eq("updated_at", expectedUpdatedAt);
    const { data, error } = await query.select("id");
    if (error) return { error: "No se pudo guardar." };
    if (expectedUpdatedAt && (!data || data.length === 0)) {
      return { error: "Otro usuario modificó este testimonio mientras editabas. Recargá la página.", conflict: true };
    }
  } else {
    const { error } = await supabase.from("testimonials").insert({ ...payload, created_by: user?.id });
    if (error) return { error: "No se pudo guardar." };
  }

  revalidatePath("/admin/testimonios");
  revalidatePath("/");
}

export async function softDeleteTestimonialAction(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { error } = await supabase
    .from("testimonials")
    .update({ deleted_at: new Date().toISOString(), deleted_by: user?.id })
    .eq("id", id);
  if (error) return { error: "No se pudo eliminar." };
  revalidatePath("/admin/testimonios");
  revalidatePath("/");
}
