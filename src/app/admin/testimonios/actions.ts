"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { testimonialSchema, type TestimonialInput } from "@/lib/validations/promotions";

export type ActionResult = { error?: string } | undefined;

export async function upsertTestimonialAction(input: TestimonialInput): Promise<ActionResult> {
  const parsed = testimonialSchema.safeParse(input);
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

  const { error } = id
    ? await supabase.from("testimonials").update(payload).eq("id", id)
    : await supabase.from("testimonials").insert({ ...payload, created_by: user?.id });

  if (error) return { error: "No se pudo guardar." };
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
