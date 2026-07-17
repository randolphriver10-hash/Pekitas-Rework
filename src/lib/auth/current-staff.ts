import "server-only";
import { createClient } from "@/lib/supabase/server";

export type CurrentStaff = {
  id: string;
  email: string;
  fullName: string | null;
  role: "admin" | "editor";
};

/**
 * El proxy ya garantiza que quien llega hasta acá tiene sesión y una fila en
 * user_roles, así que esto no debería devolver null en la práctica dentro de
 * /admin — pero lo tipamos como nullable para no asumirlo ciegamente.
 */
export async function getCurrentStaff(): Promise<CurrentStaff | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: roleRow }, { data: profile }] = await Promise.all([
    supabase.from("user_roles").select("role").eq("user_id", user.id).maybeSingle(),
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
  ]);

  if (!roleRow) return null;

  return {
    id: user.id,
    email: user.email ?? "",
    fullName: profile?.full_name ?? null,
    role: roleRow.role,
  };
}
