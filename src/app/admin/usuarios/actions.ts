"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertAdmin } from "@/lib/auth/assert-admin";
import {
  inviteUserSchema,
  changeRoleSchema,
  type InviteUserInput,
  type ChangeRoleInput,
} from "@/lib/validations/users";

export type StaffMember = {
  userId: string;
  email: string;
  fullName: string | null;
  role: "admin" | "editor";
  lastSignInAt: string | null;
  grantedAt: string;
};

export async function getStaffList(): Promise<StaffMember[]> {
  await assertAdmin();

  const supabase = await createClient();
  const admin = createAdminClient();

  const { data: roles } = await supabase
    .from("user_roles")
    .select("user_id, role, granted_at")
    .order("granted_at", { ascending: true });

  if (!roles || roles.length === 0) return [];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in(
      "id",
      roles.map((r) => r.user_id)
    );
  const profileByUserId = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));

  const authUsers = await Promise.all(
    roles.map((r) => admin.auth.admin.getUserById(r.user_id))
  );

  return roles.map((r, i) => ({
    userId: r.user_id,
    email: authUsers[i].data.user?.email ?? "—",
    fullName: profileByUserId.get(r.user_id) ?? null,
    role: r.role,
    lastSignInAt: authUsers[i].data.user?.last_sign_in_at ?? null,
    grantedAt: r.granted_at,
  }));
}

export type ActionResult = { error?: string } | undefined;

export async function inviteUserAction(input: InviteUserInput): Promise<ActionResult> {
  const staff = await assertAdmin();
  const parsed = inviteUserSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." };
  }

  const admin = createAdminClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(
    parsed.data.email,
    {
      data: { full_name: parsed.data.fullName },
      redirectTo: `${siteUrl}/auth/confirm?next=/reset-password`,
    }
  );

  if (inviteError || !invited.user) {
    return { error: `No se pudo invitar: ${inviteError?.message ?? "error desconocido"}` };
  }

  const supabase = await createClient();
  const { error: roleError } = await supabase.from("user_roles").insert({
    user_id: invited.user.id,
    role: parsed.data.role,
    granted_by: staff.id,
  });

  if (roleError) {
    return { error: `Usuario invitado pero falló al asignar el rol: ${roleError.message}` };
  }

  revalidatePath("/admin/usuarios");
}

export async function changeRoleAction(input: ChangeRoleInput): Promise<ActionResult> {
  const staff = await assertAdmin();
  const parsed = changeRoleSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Datos inválidos." };
  }

  if (parsed.data.userId === staff.id && parsed.data.role === "editor") {
    return { error: "No podés quitarte tu propio rol de administrador." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("user_roles")
    .update({ role: parsed.data.role })
    .eq("user_id", parsed.data.userId);

  if (error) return { error: "No se pudo cambiar el rol." };

  revalidatePath("/admin/usuarios");
}

export async function revokeAccessAction(userId: string): Promise<ActionResult> {
  const staff = await assertAdmin();

  if (userId === staff.id) {
    return { error: "No podés revocar tu propio acceso." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("user_roles").delete().eq("user_id", userId);

  if (error) return { error: "No se pudo revocar el acceso." };

  revalidatePath("/admin/usuarios");
}
