import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { Client } from "pg";
import { config } from "dotenv";

config({ path: path.join(process.cwd(), ".env.local") });

const MIGRATIONS_DIR = path.join(process.cwd(), "supabase", "migrations");

async function main() {
  const rawConnectionString = process.env.POSTGRES_URL_NON_POOLING;
  if (!rawConnectionString) {
    throw new Error(
      "Falta POSTGRES_URL_NON_POOLING. Corré `vercel env pull .env.local` primero."
    );
  }
  // `sslmode=require` se trata como verify-full en pg-connection-string reciente y
  // choca con proxies/AV locales que inyectan un certificado propio en la cadena.
  // `no-verify` es el valor que efectivamente mapea a rejectUnauthorized: false.
  const connectionString = rawConnectionString.replace(
    /sslmode=[^&]+/,
    "sslmode=no-verify"
  );

  const files = (await readdir(MIGRATIONS_DIR))
    .filter((f) => f.endsWith(".sql"))
    .sort();

  if (files.length === 0) {
    console.log("No hay migraciones en supabase/migrations/.");
    return;
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });
  await client.connect();

  try {
    await client.query(
      `create table if not exists public._migrations (
         name text primary key,
         applied_at timestamptz not null default now()
       );`
    );

    const { rows: applied } = await client.query<{ name: string }>(
      "select name from public._migrations"
    );
    const appliedNames = new Set(applied.map((r) => r.name));

    for (const file of files) {
      if (appliedNames.has(file)) {
        console.log(`- ${file} (ya aplicada)`);
        continue;
      }

      const sql = await readFile(path.join(MIGRATIONS_DIR, file), "utf8");
      console.log(`> Aplicando ${file}...`);
      await client.query("begin");
      try {
        await client.query(sql);
        await client.query("insert into public._migrations (name) values ($1)", [
          file,
        ]);
        await client.query("commit");
        console.log(`  OK`);
      } catch (err) {
        await client.query("rollback");
        throw new Error(`Fallo aplicando ${file}: ${(err as Error).message}`);
      }
    }
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
