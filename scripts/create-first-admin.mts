import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import path from "node:path";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: path.join(process.cwd(), ".env.local") });

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secretKey) {
    throw new Error("Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY en .env.local");
  }

  let email = process.env.ADMIN_EMAIL?.trim();
  let password = process.env.ADMIN_PASSWORD;
  let fullName = process.env.ADMIN_NAME?.trim();

  if (!email || !password) {
    const rl = createInterface({ input: stdin, output: stdout });
    email ??= (await rl.question("Email del primer administrador: ")).trim();
    password ??= await rl.question("Contraseña (mínimo 8 caracteres): ");
    fullName ??= (await rl.question("Nombre a mostrar: ")).trim();
    rl.close();
  }

  if (!email || password.length < 8) {
    throw new Error("Email vacío o contraseña muy corta.");
  }

  const admin = createClient(url, secretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: userData, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName || undefined },
  });

  if (createError || !userData.user) {
    throw new Error(`No se pudo crear el usuario: ${createError?.message}`);
  }

  const { error: roleError } = await admin
    .from("user_roles")
    .upsert({ user_id: userData.user.id, role: "admin" });

  if (roleError) {
    throw new Error(`Usuario creado pero falló al asignar el rol admin: ${roleError.message}`);
  }

  console.log(`Listo. ${email} ya puede entrar a /login como admin.`);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
