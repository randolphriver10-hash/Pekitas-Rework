"use server";

import { createClient } from "@/lib/supabase/server";
import { resetPasswordSchema, type ResetPasswordInput } from "@/lib/validations/auth";
import type { ActionState } from "@/app/login/actions";

export async function updatePasswordAction(
  _prevState: ActionState,
  input: ResetPasswordInput
): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "El link expiró. Pedí uno nuevo desde 'Olvidé mi contraseña'." };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return { error: "No se pudo actualizar la contraseña." };
  }

  return { success: true };
}
