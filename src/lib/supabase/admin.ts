import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

/**
 * Cliente con la secret key: bypassa RLS. Solo para operaciones administrativas
 * puntuales desde el servidor (invitar usuarios, limpieza de storage, etc.).
 * Nunca importar desde un componente cliente ni desde código que corra en el browser.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
