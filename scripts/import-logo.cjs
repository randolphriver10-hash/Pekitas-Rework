const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");

function loadEnvLocal() {
  const text = fs.readFileSync(path.join(process.cwd(), ".env.local"), "utf8");
  const env = {};
  for (const line of text.split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq === -1) continue;
    let v = t.slice(eq + 1).trim();
    if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    env[t.slice(0, eq).trim()] = v;
  }
  return env;
}

const LOGO_PATH =
  "C:\\Users\\rando\\OneDrive\\Escritorio\\PROYECTOS\\TIENDA PEKITAS\\Logo\\Logotipo sin bordear.png";

async function main() {
  const env = loadEnvLocal();
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  const buffer = fs.readFileSync(LOGO_PATH);
  const storagePath = `logo/${crypto.randomUUID()}.png`;

  const { error: uploadError } = await supabase.storage
    .from("site-assets")
    .upload(storagePath, buffer, { contentType: "image/png", upsert: false });
  if (uploadError) throw new Error(`upload: ${uploadError.message}`);

  const {
    data: { publicUrl },
  } = supabase.storage.from("site-assets").getPublicUrl(storagePath);

  // El logo del header lo lee SiteHeader desde landing_sections (type='header'),
  // content.logo_url — no desde site_settings.logo_url.
  const { data: headerSection, error: fetchError } = await supabase
    .from("landing_sections")
    .select("id, content")
    .eq("type", "header")
    .single();
  if (fetchError) throw new Error(`fetch header section: ${fetchError.message}`);

  const { error: updateError } = await supabase
    .from("landing_sections")
    .update({ content: { ...(headerSection.content ?? {}), logo_url: publicUrl } })
    .eq("id", headerSection.id);
  if (updateError) throw new Error(`update landing_sections: ${updateError.message}`);

  console.log("OK, header logo_url ->", publicUrl);
}

main().catch((err) => {
  console.error("FAILED:", err);
  process.exit(1);
});
