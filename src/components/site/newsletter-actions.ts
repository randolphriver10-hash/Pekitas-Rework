"use server";

import { createClient } from "@/lib/supabase/server";
import { newsletterSignupSchema } from "@/lib/validations/newsletter";

export type NewsletterActionResult = { error?: string; success?: boolean };

export async function subscribeNewsletterAction(
  _prev: NewsletterActionResult | undefined,
  formData: FormData
): Promise<NewsletterActionResult> {
  const parsed = newsletterSignupSchema.safeParse({
    email: formData.get("email"),
    segment: formData.get("segment") ?? "general",
  });
  if (!parsed.success) {
    return { error: "Ingresá un email válido." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("newsletter_subscribers").insert(parsed.data);

  if (error) {
    if (error.code === "23505") return { success: true }; // ya suscripto, no revelar
    return { error: "No se pudo suscribir. Intentá de nuevo." };
  }

  return { success: true };
}
