"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  loginSchema,
  forgotPasswordSchema,
  type LoginInput,
  type ForgotPasswordInput,
} from "@/lib/validations/auth";

export type ActionState = { error?: string; success?: boolean } | undefined;

export async function loginAction(
  _prevState: ActionState,
  input: LoginInput & { next?: string }
): Promise<ActionState> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Revisá el email y la contraseña." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "Email o contraseña incorrectos." };
  }

  redirect(input.next?.startsWith("/admin") ? input.next : "/admin");
}

export async function requestPasswordResetAction(
  _prevState: ActionState,
  input: ForgotPasswordInput
): Promise<ActionState> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Ingresá un email válido." };
  }

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl}/auth/confirm?next=/reset-password`,
  });

  // Siempre devolvemos éxito genérico (no revelar si el email existe).
  return { success: true };
}
