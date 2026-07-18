// Uso puntual: registra en `_migrations` una migración que ya se aplicó a mano
// (fuera de `npm run db:migrate`), para que el runner oficial no intente
// volver a correrla y choque con objetos que ya existen.
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

function loadEnvLocal() {
  const envPath = path.join(process.cwd(), ".env.local");
  const text = fs.readFileSync(envPath, "utf8");
  const env = {};
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    env[key] = value;
  }
  return env;
}

async function main() {
  const file = process.argv[2];
  if (!file) throw new Error("Uso: node scripts/apply-migration.cjs <nombre-de-archivo.sql>");
  const env = loadEnvLocal();
  const connectionString = env.POSTGRES_URL_NON_POOLING.replace(/[?&]sslmode=[^&]*/, "");
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    await client.query(
      `create table if not exists public._migrations (
         name text primary key,
         applied_at timestamptz not null default now()
       );`
    );
    await client.query(
      "insert into public._migrations (name) values ($1) on conflict do nothing",
      [file]
    );
    console.log("OK: registrada en _migrations -", file);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("FAILED:", err.message);
  process.exit(1);
});
